import { useState, useEffect, useCallback } from 'react';
import { useMqttConnection } from './useMqttConnection';
import { supabase } from '@/integrations/supabase/client';

interface Alarm {
  id: string;
  message: string;
  level: 'info' | 'warning' | 'high' | 'critical';
  timestamp: Date;
}

export const useScadaSimulation = () => {
  const { isConnected, lastSync, publishTelemetry } = useMqttConnection();
  const [sumpLevel, setSumpLevel] = useState(50);
  const [pumpStatuses, setPumpStatuses] = useState([false, false, false, false]);
  const [valveStatuses, setValveStatuses] = useState([false, false, false, false]);
  const [flowRate, setFlowRate] = useState(0);
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [pumpCurrents, setPumpCurrents] = useState([0, 0, 0, 0]);
  const [pumpPowers, setPumpPowers] = useState([0, 0, 0, 0]);
  const [branchPressures, setBranchPressures] = useState([0, 0, 0, 0]);
  const [cloudLogging] = useState(true);

  // Simulate water level changes with optimized publishing
  useEffect(() => {
    const interval = setInterval(() => {
      setSumpLevel((prev) => {
        let newLevel = prev;

        // Calculate total active pumps
        const activePumps = pumpStatuses.filter((p, i) => p && valveStatuses[i]).length;
        
        // If pumps are running, decrease level
        if (activePumps > 0) {
          newLevel = Math.max(0, prev - (0.5 * activePumps));
        } else {
          // Otherwise, increase level (water intake)
          newLevel = Math.min(100, prev + 0.3);
        }

        // Publish telemetry to MQTT and cloud (optimized)
        const anyPumpRunning = pumpStatuses.some((p, i) => p && valveStatuses[i]);
        const pt05Value = anyPumpRunning ? 4.2 + (Math.random() * 0.2 - 0.1) : 0.0;
        publishTelemetry({
          sumpLevel: newLevel,
          pumpStatus: anyPumpRunning,
          valveStatus: valveStatuses.some(v => v),
          flowRate,
          pressure: pt05Value,
          pumpStatuses,
          pumpCurrents,
        });

        return newLevel;
      });
      
      // Update pump currents and powers
      setPumpCurrents(prev => prev.map((_, i) => 
        pumpStatuses[i] ? 44 + Math.random() * 3 : 0
      ));
      
      setPumpPowers(prev => prev.map((_, i) => 
        pumpStatuses[i] ? 22 + Math.random() * 2 : 0
      ));
    }, 500);

    return () => clearInterval(interval);
  }, [pumpStatuses, valveStatuses, flowRate, pumpCurrents, publishTelemetry]);

  // Auto control logic - removed as we now have individual controls

  // Update flow rate based on pump status
  useEffect(() => {
    const activePumps = pumpStatuses.filter((p, i) => p && valveStatuses[i]).length;
    if (activePumps > 0) {
      setFlowRate((120 + Math.random() * 10) * activePumps); // Simulate flow rate variation
    } else {
      setFlowRate(0);
    }
  }, [pumpStatuses, valveStatuses]);

  // Update branch pressures dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      setBranchPressures(prev => 
        prev.map((_, idx) => {
          const isRunning = pumpStatuses[idx] && valveStatuses[idx];
          return isRunning ? 2.3 + (Math.random() * 0.4) : 0.0;
        })
      );
    }, 500);
    return () => clearInterval(interval);
  }, [pumpStatuses, valveStatuses]);

  // Alarm management with database logging
  useEffect(() => {
    const newAlarms: Alarm[] = [];
    const prevAlarmsRef = new Set(alarms.map(a => a.id));

    if (sumpLevel >= 90) {
      newAlarms.push({
        id: 'high-level',
        message: 'High Water Level Alarm',
        level: 'critical',
        timestamp: new Date(),
      });
    } else if (sumpLevel >= 80) {
      newAlarms.push({
        id: 'high-level-warn',
        message: 'High Water Level Warning',
        level: 'high',
        timestamp: new Date(),
      });
    }

    if (sumpLevel <= 20) {
      newAlarms.push({
        id: 'low-level',
        message: 'Low Water Level Alarm',
        level: 'high',
        timestamp: new Date(),
      });
    }

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

    // Log new alarms to database
    newAlarms.forEach(async (alarm) => {
      if (!prevAlarmsRef.has(alarm.id)) {
        await supabase.from('alarm_history').insert({
          alarm_id: alarm.id,
          message: alarm.message,
          severity: alarm.level,
          timestamp: alarm.timestamp.toISOString(),
        });
      }
    });

    // Mark cleared alarms in database
    alarms.forEach(async (oldAlarm) => {
      const stillActive = newAlarms.some(a => a.id === oldAlarm.id);
      if (!stillActive) {
        await supabase
          .from('alarm_history')
          .update({ cleared: true, cleared_at: new Date().toISOString() })
          .eq('alarm_id', oldAlarm.id)
          .eq('cleared', false);
      }
    });

    setAlarms(newAlarms);
  }, [sumpLevel, pumpStatuses, valveStatuses]);

  const handleStartPumpControl = useCallback((index: number) => {
    // Only start pump if corresponding valve is open
    if (valveStatuses[index]) {
      setPumpStatuses(prev => {
        const newStatuses = [...prev];
        newStatuses[index] = true;
        return newStatuses;
      });
    }
    // If valve is closed, we could add a notification here
  }, [valveStatuses]);

  const handleStopPumpControl = useCallback((index: number) => {
    setPumpStatuses(prev => {
      const newStatuses = [...prev];
      newStatuses[index] = false;
      return newStatuses;
    });
  }, []);

  const handleOpenValve = useCallback((index: number) => {
    setValveStatuses(prev => {
      const newStatuses = [...prev];
      newStatuses[index] = true;
      return newStatuses;
    });
  }, []);

  const handleCloseValve = useCallback((index: number) => {
    // Only close valve if corresponding pump is not running
    if (!pumpStatuses[index]) {
      setValveStatuses(prev => {
        const newStatuses = [...prev];
        newStatuses[index] = false;
        return newStatuses;
      });
    }
    // If pump is running, we could add a notification here
  }, [pumpStatuses]);

  return {
    sumpLevel,
    pumpStatuses,
    valveStatuses,
    flowRate,
    alarms,
    lastSync,
    isConnected,
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
