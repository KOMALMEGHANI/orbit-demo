import { useState, useEffect, useCallback, useRef } from 'react';
import mqtt from 'mqtt';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============= CONSTANTS =============
const VALIDATION_RANGES = {
  sumpLevel: { min: 0, max: 100 },
  flowRate: { min: 0, max: 1000 },
  pressure: { min: 0, max: 10 },
  current: { min: 0, max: 100 },
} as const;

const MQTT_CONFIG = {
  host: 'test.mosquitto.org',
  port: 8081,
  protocol: 'wss' as const, // FIXED: Use secure WebSocket for HTTPS
  clientId: `scada-wtp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  keepalive: 30,
  reconnectPeriod: 3000,
  connectTimeout: 10000,
  clean: true,
} as const;

const TOPICS = {
  TELEMETRY: 'scada/wtp/telemetry',
  CONTROL: 'scada/wtp/control',
  STATUS: 'scada/wtp/status',
} as const;

const BATCH_INTERVAL_MS = 2000;
const WATCHDOG_TIMEOUT_MS = 30000;
const MAX_RETRY_ATTEMPTS = 3;

// ============= TYPES =============
interface TelemetryData {
  sumpLevel: number;
  pumpStatus: boolean;
  valveStatus: boolean;
  flowRate: number;
  pressure: number;
  pumpStatuses: boolean[];
  pumpCurrents: number[];
  timestamp?: string;
  sourceId?: string;
}

interface ValidatedTelemetry extends TelemetryData {
  isValid: boolean;
  validationErrors: string[];
}

interface ConnectionState {
  isConnected: boolean;
  lastMessageTime: Date | null;
  reconnectAttempts: number;
  isStale: boolean;
}

// ============= VALIDATION FUNCTIONS =============
const validateRange = (value: number, range: { min: number; max: number }, fieldName: string): string | null => {
  if (typeof value !== 'number' || isNaN(value)) {
    return `${fieldName}: Invalid number`;
  }
  if (value < range.min || value > range.max) {
    return `${fieldName}: Out of range (${range.min}-${range.max}), got ${value}`;
  }
  return null;
};

const validateTelemetry = (data: TelemetryData): ValidatedTelemetry => {
  const errors: string[] = [];

  // Validate sump level
  const sumpError = validateRange(data.sumpLevel, VALIDATION_RANGES.sumpLevel, 'sumpLevel');
  if (sumpError) errors.push(sumpError);

  // Validate flow rate
  const flowError = validateRange(data.flowRate, VALIDATION_RANGES.flowRate, 'flowRate');
  if (flowError) errors.push(flowError);

  // Validate pressure
  const pressureError = validateRange(data.pressure, VALIDATION_RANGES.pressure, 'pressure');
  if (pressureError) errors.push(pressureError);

  // Validate pump currents
  if (Array.isArray(data.pumpCurrents)) {
    data.pumpCurrents.forEach((current, i) => {
      const currentError = validateRange(current, VALIDATION_RANGES.current, `pumpCurrent[${i}]`);
      if (currentError) errors.push(currentError);
    });
  }

  // Validate pump statuses array
  if (!Array.isArray(data.pumpStatuses) || data.pumpStatuses.length !== 4) {
    errors.push('pumpStatuses: Must be array of 4 booleans');
  }

  return {
    ...data,
    isValid: errors.length === 0,
    validationErrors: errors,
  };
};

// ============= MAIN HOOK =============
export const useMqttConnection = () => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    lastMessageTime: null,
    reconnectAttempts: 0,
    isStale: false,
  });
  const [lastSync, setLastSync] = useState(new Date());

  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const batchBuffer = useRef<TelemetryData[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const watchdogRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef<Map<string, number>>(new Map());

  // Reset watchdog timer on data received
  const resetWatchdog = useCallback(() => {
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
    }

    setConnectionState(prev => ({
      ...prev,
      lastMessageTime: new Date(),
      isStale: false,
    }));

    watchdogRef.current = setTimeout(() => {
      console.warn('⚠️ WATCHDOG: No data received for 30 seconds');
      setConnectionState(prev => ({ ...prev, isStale: true }));
      toast.warning('Communication stale - no data received for 30 seconds');
    }, WATCHDOG_TIMEOUT_MS);
  }, []);

  // Save telemetry with retry logic
  const saveTelemetryToCloud = useCallback(async (data: TelemetryData) => {
    // Validate before storing
    const validated = validateTelemetry(data);
    
    if (!validated.isValid) {
      console.warn('⚠️ Invalid telemetry data:', validated.validationErrors);
      return; // Don't store invalid data
    }

    batchBuffer.current.push(data);

    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }

    batchTimeoutRef.current = setTimeout(async () => {
      if (batchBuffer.current.length === 0) return;

      const batchData = [...batchBuffer.current];
      batchBuffer.current = [];

      const batchId = `batch-${Date.now()}`;
      let attempt = 0;

      const executeBatch = async (): Promise<boolean> => {
        attempt++;
        try {
          const records = batchData.map(d => ({
            sump_level: Math.max(0, Math.min(100, d.sumpLevel)), // Clamp values
            pump_status: d.pumpStatus,
            valve_status: d.valveStatus,
            flow_rate: Math.max(0, d.flowRate),
            pressure: Math.max(0, d.pressure),
            pump_1_status: d.pumpStatuses[0] ?? false,
            pump_2_status: d.pumpStatuses[1] ?? false,
            pump_3_status: d.pumpStatuses[2] ?? false,
            pump_4_status: d.pumpStatuses[3] ?? false,
            pump_1_current: Math.max(0, d.pumpCurrents[0] ?? 0),
            pump_2_current: Math.max(0, d.pumpCurrents[1] ?? 0),
            pump_3_current: Math.max(0, d.pumpCurrents[2] ?? 0),
            pump_4_current: Math.max(0, d.pumpCurrents[3] ?? 0),
            timestamp: new Date().toISOString(),
          }));

          const startTime = performance.now();
          const { error } = await supabase.from('scada_telemetry').insert(records);
          const endTime = performance.now();

          if (error) {
            throw error;
          }

          // Log performance
          const latency = endTime - startTime;
          if (latency > 1000) {
            console.warn(`⚠️ Slow DB write: ${latency.toFixed(0)}ms for ${records.length} records`);
          }

          console.log(`☁️ Saved ${records.length} records (${latency.toFixed(0)}ms)`);
          retryCountRef.current.delete(batchId);
          return true;
        } catch (error) {
          console.error(`❌ DB write failed (attempt ${attempt}):`, error);
          
          if (attempt < MAX_RETRY_ATTEMPTS) {
            console.log(`🔄 Retrying in ${attempt * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            return executeBatch();
          }
          
          console.error('❌ Max retries exceeded, data lost');
          toast.error('Failed to save telemetry data after multiple attempts');
          return false;
        }
      };

      await executeBatch();
    }, BATCH_INTERVAL_MS);
  }, []);

  // Connect to MQTT broker
  const connect = useCallback(() => {
    try {
      // Use secure WebSocket (wss://) for HTTPS pages
      const brokerUrl = `${MQTT_CONFIG.protocol}://${MQTT_CONFIG.host}:${MQTT_CONFIG.port}/mqtt`;

      console.log('🔌 Connecting to MQTT broker:', brokerUrl);

      const client = mqtt.connect(brokerUrl, {
        clientId: MQTT_CONFIG.clientId,
        keepalive: MQTT_CONFIG.keepalive,
        reconnectPeriod: MQTT_CONFIG.reconnectPeriod,
        connectTimeout: MQTT_CONFIG.connectTimeout,
        clean: MQTT_CONFIG.clean,
        protocolVersion: 4,
      });

      client.on('connect', () => {
        console.log('✅ Connected to MQTT broker');
        setConnectionState(prev => ({
          ...prev,
          isConnected: true,
          reconnectAttempts: 0,
        }));
        toast.success('Connected to MQTT broker');

        // Subscribe to topics with QoS 1 for reliability
        client.subscribe(
          [TOPICS.TELEMETRY, TOPICS.CONTROL, TOPICS.STATUS],
          { qos: 1 },
          (err) => {
            if (err) {
              console.error('❌ Subscribe failed:', err);
            } else {
              console.log('📡 Subscribed to MQTT topics');
            }
          }
        );

        resetWatchdog();
      });

      client.on('message', async (topic, message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('📨 MQTT message:', topic);

          resetWatchdog();

          if (topic === TOPICS.TELEMETRY) {
            await saveTelemetryToCloud(data);
            setLastSync(new Date());
          }
        } catch (error) {
          console.error('❌ Error processing MQTT message:', error);
        }
      });

      client.on('error', (error) => {
        console.error('❌ MQTT Error:', error);
        setConnectionState(prev => ({ ...prev, isConnected: false }));
      });

      client.on('close', () => {
        console.log('🔌 MQTT Connection closed');
        setConnectionState(prev => ({ ...prev, isConnected: false }));
      });

      client.on('reconnect', () => {
        setConnectionState(prev => ({
          ...prev,
          reconnectAttempts: prev.reconnectAttempts + 1,
        }));
        console.log('🔄 Reconnecting to MQTT broker...');
      });

      client.on('offline', () => {
        console.log('📴 MQTT client offline');
        setConnectionState(prev => ({ ...prev, isConnected: false }));
      });

      clientRef.current = client;
    } catch (error) {
      console.error('❌ Failed to connect to MQTT:', error);
      setConnectionState(prev => ({ ...prev, isConnected: false }));
      toast.error('Failed to connect to MQTT broker');
    }
  }, [resetWatchdog, saveTelemetryToCloud]);

  // Publish telemetry with validation
  const publishTelemetry = useCallback((data: TelemetryData) => {
    // Validate before publishing
    const validated = validateTelemetry(data);
    
    if (!validated.isValid) {
      console.warn('⚠️ Skipping publish - invalid data:', validated.validationErrors);
      return;
    }

    // Add metadata
    const enrichedData = {
      ...data,
      timestamp: new Date().toISOString(),
      sourceId: MQTT_CONFIG.clientId,
    };

    if (clientRef.current && connectionState.isConnected) {
      const payload = JSON.stringify(enrichedData);
      clientRef.current.publish(TOPICS.TELEMETRY, payload, { qos: 1, retain: false }, (err) => {
        if (err) {
          console.error('❌ Publish failed:', err);
        } else {
          saveTelemetryToCloud(data);
        }
      });
    } else {
      // Still save locally even if MQTT disconnected
      saveTelemetryToCloud(data);
    }
  }, [connectionState.isConnected, saveTelemetryToCloud]);

  // Publish control command with QoS 2 for guaranteed delivery
  const publishControl = useCallback((command: Record<string, unknown>) => {
    if (clientRef.current && connectionState.isConnected) {
      const enrichedCommand = {
        ...command,
        timestamp: new Date().toISOString(),
        sourceId: MQTT_CONFIG.clientId,
      };
      
      const payload = JSON.stringify(enrichedCommand);
      clientRef.current.publish(TOPICS.CONTROL, payload, { qos: 2 }, (err) => {
        if (err) {
          console.error('❌ Control publish failed:', err);
          toast.error('Failed to send control command');
        } else {
          console.log('📤 Control command sent:', command);
        }
      });
    } else {
      console.warn('⚠️ Cannot send control - not connected');
      toast.warning('Cannot send command - not connected');
    }
  }, [connectionState.isConnected]);

  // Disconnect handler
  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end(true);
      clientRef.current = null;
      setConnectionState(prev => ({ ...prev, isConnected: false }));
    }
    if (watchdogRef.current) {
      clearTimeout(watchdogRef.current);
    }
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }
  }, []);

  // Initialize connection
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected: connectionState.isConnected,
    isStale: connectionState.isStale,
    lastSync,
    reconnectAttempts: connectionState.reconnectAttempts,
    publishTelemetry,
    publishControl,
    disconnect,
  };
};
