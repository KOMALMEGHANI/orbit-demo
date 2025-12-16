import { useState, useEffect, useCallback, useRef } from 'react';
import { useMqttConnection } from './useMqttConnection';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============= CONSTANTS =============
const SIMULATION_INTERVAL_MS = 500;
const LEVEL_DECREASE_PER_PUMP = 0.5;
const LEVEL_INCREASE_RATE = 0.3;
const BASE_FLOW_RATE = 120;
const BASE_PRESSURE = 2.3;
const BASE_CURRENT = 44;
const BASE_POWER = 22;

// ============= TYPES =============
interface Alarm {
  id: string;
  message: string;
  level: 'info' | 'warning' | 'high' | 'critical';
  timestamp: Date;
}

interface AlarmThresholds {
  levelCriticalHigh: number;
  levelWarningHigh: number;
  levelWarningLow: number;
}

const ALARM_THRESHOLDS: AlarmThresholds = {
  levelCriticalHigh: 90,
  levelWarningHigh: 80,
  levelWarningLow: 20,
};

// ============= MAIN HOOK =============
export const useScadaSimulation = () => {
  const { isConnected, isStale, lastSync, publishTelemetry } = useMqttConnection();
  
  // State
  const [sumpLevel, setSumpLevel] = useState(50);
  const [pumpStatuses, setPumpStatuses] = useState([false, false, false, false]);
  const [valveStatuses, setValveStatuses] = useState([false, false, false, false]);
  const [flowRate, setFlowRate] = useState(0);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [pumpCurrents, setPumpCurrents] = useState([0, 0, 0, 0]);
  const [pumpPowers, setPumpPowers] = useState([0, 0, 0, 0]);
  const [branchPressures, setBranchPressures] = useState([0, 0, 0, 0]);
  const [cloudLogging] = useState(true);

  // Refs for tracking previous alarm states (avoids duplicate DB entries)
  const previousAlarmsRef = useRef<Set<string>>(new Set());
  const pendingDbOperations = useRef<Promise<void>[]>([]);

  // ============= SIMULATION LOGIC =============
  useEffect(() => {
    const interval = setInterval(() => {
      setSumpLevel((prev) => {
        // Calculate active pumps (pump + valve both must be on)
        const activePumps = pumpStatuses.filter((p, i) => p && valveStatuses[i]).length;

        let newLevel: number;
        if (activePumps > 0) {
          newLevel = Math.max(0, prev - (LEVEL_DECREASE_PER_PUMP * activePumps));
        } else {
          newLevel = Math.min(100, prev + LEVEL_INCREASE_RATE);
        }

        // Round to 2 decimal places for consistency
        return Math.round(newLevel * 100) / 100;
      });

      // Update pump electrical values
      setPumpCurrents(pumpStatuses.map((running) =>
        running ? BASE_CURRENT + (Math.random() * 3) : 0
      ));

      setPumpPowers(pumpStatuses.map((running) =>
        running ? BASE_POWER + (Math.random() * 2) : 0
      ));
    }, SIMULATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [pumpStatuses, valveStatuses]);

  // ============= TELEMETRY PUBLISHING =============
  useEffect(() => {
    const publishInterval = setInterval(() => {
      const anyPumpRunning = pumpStatuses.some((p, i) => p && valveStatuses[i]);
      const pt05Value = anyPumpRunning ? 4.2 + (Math.random() * 0.2 - 0.1) : 0.0;

      publishTelemetry({
        sumpLevel,
        pumpStatus: anyPumpRunning,
        valveStatus: valveStatuses.some(v => v),
        flowRate,
        pressure: pt05Value,
        pumpStatuses,
        pumpCurrents,
      });
    }, SIMULATION_INTERVAL_MS);

    return () => clearInterval(publishInterval);
  }, [sumpLevel, pumpStatuses, valveStatuses, flowRate, pumpCurrents, publishTelemetry]);

  // ============= FLOW RATE CALCULATION =============
  useEffect(() => {
    const activePumps = pumpStatuses.filter((p, i) => p && valveStatuses[i]).length;
    if (activePumps > 0) {
      const baseFlow = BASE_FLOW_RATE * activePumps;
      const variation = (Math.random() * 10) - 5;
      setFlowRate(Math.round((baseFlow + variation) * 10) / 10);
    } else {
      setFlowRate(0);
    }
  }, [pumpStatuses, valveStatuses]);

  // ============= BRANCH PRESSURES =============
  useEffect(() => {
    const interval = setInterval(() => {
      setBranchPressures(
        pumpStatuses.map((pump, idx) => {
          const isRunning = pump && valveStatuses[idx];
          if (isRunning) {
            return Math.round((BASE_PRESSURE + (Math.random() * 0.4)) * 100) / 100;
          }
          return 0;
        })
      );
    }, SIMULATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [pumpStatuses, valveStatuses]);

  // ============= ALARM MANAGEMENT =============
  useEffect(() => {
    const generateAlarms = (): Alarm[] => {
      const newAlarms: Alarm[] = [];

      // Level alarms
      if (sumpLevel >= ALARM_THRESHOLDS.levelCriticalHigh) {
        newAlarms.push({
          id: 'high-level',
          message: 'High Water Level Alarm',
          level: 'critical',
          timestamp: new Date(),
        });
      } else if (sumpLevel >= ALARM_THRESHOLDS.levelWarningHigh) {
        newAlarms.push({
          id: 'high-level-warn',
          message: 'High Water Level Warning',
          level: 'high',
          timestamp: new Date(),
        });
      }

      if (sumpLevel <= ALARM_THRESHOLDS.levelWarningLow) {
        newAlarms.push({
          id: 'low-level',
          message: 'Low Water Level Alarm',
          level: 'high',
          timestamp: new Date(),
        });
      }

      // Pump running with closed valve alarms
      pumpStatuses.forEach((pump, i) => {
        if (pump && !valveStatuses[i]) {
          newAlarms.push({
            id: `valve-closed-${i}`,
            message: `VT-0${i + 1} Running with Closed MBFV-0${i + 1}`,
            level: 'critical',
            timestamp: new Date(),
          });
        }
      });

      return newAlarms;
    };

    const newAlarms = generateAlarms();
    const newAlarmIds = new Set(newAlarms.map(a => a.id));
    const prevAlarmIds = previousAlarmsRef.current;

    // Log NEW alarms to database (not previously active)
    const alarmsToLog = newAlarms.filter(alarm => !prevAlarmIds.has(alarm.id));

    // Find CLEARED alarms (were active, now not)
    const clearedAlarmIds = [...prevAlarmIds].filter(id => !newAlarmIds.has(id));

    // Execute database operations with proper error handling
    const executeDbOperations = async () => {
      // Insert new alarms
      for (const alarm of alarmsToLog) {
        try {
          const { error } = await supabase.from('alarm_history').insert({
            alarm_id: alarm.id,
            message: alarm.message,
            severity: alarm.level,
            timestamp: alarm.timestamp.toISOString(),
          });

          if (error) {
            console.error('Failed to log alarm:', error);
          } else {
            console.log('📢 Alarm logged:', alarm.message);
          }
        } catch (err) {
          console.error('Alarm insert error:', err);
        }
      }

      // Mark cleared alarms
      for (const alarmId of clearedAlarmIds) {
        try {
          const { error } = await supabase
            .from('alarm_history')
            .update({
              cleared: true,
              cleared_at: new Date().toISOString(),
            })
            .eq('alarm_id', alarmId)
            .eq('cleared', false);

          if (error) {
            console.error('Failed to clear alarm:', error);
          } else {
            console.log('✅ Alarm cleared:', alarmId);
          }
        } catch (err) {
          console.error('Alarm clear error:', err);
        }
      }
    };

    // Only execute if there are changes
    if (alarmsToLog.length > 0 || clearedAlarmIds.length > 0) {
      executeDbOperations();
    }

    // Update refs and state
    previousAlarmsRef.current = newAlarmIds;
    setAlarms(newAlarms);
  }, [sumpLevel, pumpStatuses, valveStatuses]);

  // ============= CONTROL HANDLERS =============
  const handleStartPumpControl = useCallback((index: number) => {
    if (index < 0 || index > 3) {
      console.error('Invalid pump index:', index);
      return;
    }

    setPumpStatuses(prev => {
      const newStatuses = [...prev];
      newStatuses[index] = true;
      console.log(`🟢 Pump VT-0${index + 1} STARTED`);
      toast.success(`Pump VT-0${index + 1} started`);
      return newStatuses;
    });
  }, []);

  const handleStopPumpControl = useCallback((index: number) => {
    if (index < 0 || index > 3) {
      console.error('Invalid pump index:', index);
      return;
    }

    setPumpStatuses(prev => {
      const newStatuses = [...prev];
      newStatuses[index] = false;
      console.log(`🔴 Pump VT-0${index + 1} STOPPED`);
      toast.info(`Pump VT-0${index + 1} stopped`);
      return newStatuses;
    });
  }, []);

  const handleOpenValve = useCallback((index: number) => {
    if (index < 0 || index > 3) {
      console.error('Invalid valve index:', index);
      return;
    }

    setValveStatuses(prev => {
      const newStatuses = [...prev];
      newStatuses[index] = true;
      console.log(`🟢 Valve MBFV-0${index + 1} OPENED`);
      toast.success(`Valve MBFV-0${index + 1} opened`);
      return newStatuses;
    });
  }, []);

  const handleCloseValve = useCallback((index: number) => {
    if (index < 0 || index > 3) {
      console.error('Invalid valve index:', index);
      return;
    }

    setValveStatuses(prev => {
      const newStatuses = [...prev];
      newStatuses[index] = false;
      console.log(`🔴 Valve MBFV-0${index + 1} CLOSED`);
      toast.info(`Valve MBFV-0${index + 1} closed`);
      return newStatuses;
    });
  }, []);

  return {
    sumpLevel,
    pumpStatuses,
    valveStatuses,
    flowRate,
    alarms,
    lastSync,
    isConnected,
    isStale,
    cloudLogging,
    pumpCurrents,
    pumpPowers,
    branchPressures,
    handleStartPumpControl,
    handleStopPumpControl,
    handleOpenValve,
    handleCloseValve,
  };
};
