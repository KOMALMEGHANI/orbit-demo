import { useState, useEffect, useCallback, useRef } from 'react';
import mqtt from 'mqtt';
import { supabase } from '@/integrations/supabase/client';

interface MqttConfig {
  host: string;
  port: number;
  protocol: 'mqtt' | 'mqtts' | 'ws' | 'wss';
  clientId: string;
  username?: string;
  password?: string;
  keepalive: number;
  reconnectPeriod: number;
  connectTimeout: number;
  clean: boolean;
}

interface TelemetryData {
  sumpLevel: number;
  pumpStatus: boolean;
  valveStatus: boolean;
  flowRate: number;
  pressure: number;
  pumpStatuses: boolean[];
  pumpCurrents: number[];
}

const defaultConfig: MqttConfig = {
  host: 'test.mosquitto.org',
  port: 8081,
  protocol: 'ws',
  clientId: `scada-wtp-${Date.now()}`,
  keepalive: 5,
  reconnectPeriod: 500,
  connectTimeout: 500,
  clean: false,
};

export const useMqttConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());
  const clientRef = useRef<mqtt.MqttClient | null>(null);
  const batchBuffer = useRef<TelemetryData[]>([]);
  const batchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // MQTT Topics
  const TOPICS = {
    TELEMETRY: 'scada/wtp/telemetry',
    CONTROL: 'scada/wtp/control',
    STATUS: 'scada/wtp/status',
  };

  const connect = useCallback(() => {
    try {
      const brokerUrl = `${defaultConfig.protocol}://${defaultConfig.host}:${defaultConfig.port}`;
      
      console.log('Connecting to MQTT broker:', brokerUrl);
      
      const client = mqtt.connect(brokerUrl, {
        clientId: defaultConfig.clientId,
        keepalive: defaultConfig.keepalive,
        reconnectPeriod: defaultConfig.reconnectPeriod,
        connectTimeout: defaultConfig.connectTimeout,
        clean: defaultConfig.clean,
      });

      client.on('connect', () => {
        console.log('✅ Connected to MQTT broker');
        setIsConnected(true);
        
        // Subscribe to telemetry and control topics
        client.subscribe([TOPICS.TELEMETRY, TOPICS.CONTROL, TOPICS.STATUS], (err) => {
          if (err) {
            console.error('Failed to subscribe:', err);
          } else {
            console.log('📡 Subscribed to MQTT topics');
          }
        });
      });

      client.on('message', async (topic, message) => {
        try {
          const data = JSON.parse(message.toString());
          console.log('📨 Received MQTT message:', topic, data);
          
          if (topic === TOPICS.TELEMETRY) {
            // Store telemetry data in cloud database
            await saveTelemetryToCloud(data);
            setLastSync(new Date());
          }
        } catch (error) {
          console.error('Error processing MQTT message:', error);
        }
      });

      client.on('error', (error) => {
        console.error('❌ MQTT Error:', error);
        setIsConnected(false);
      });

      client.on('close', () => {
        console.log('🔌 MQTT Connection closed');
        setIsConnected(false);
      });

      client.on('reconnect', () => {
        console.log('🔄 Reconnecting to MQTT broker...');
      });

      clientRef.current = client;
    } catch (error) {
      console.error('Failed to connect to MQTT:', error);
      setIsConnected(false);
    }
  }, []);

  const saveTelemetryToCloud = async (data: TelemetryData) => {
    batchBuffer.current.push(data);
    
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
    }
    
    batchTimeoutRef.current = setTimeout(async () => {
      if (batchBuffer.current.length === 0) return;
      
      const batchData = [...batchBuffer.current];
      batchBuffer.current = [];
      
      try {
        const records = batchData.map(d => ({
          sump_level: d.sumpLevel,
          pump_status: d.pumpStatus,
          valve_status: d.valveStatus,
          flow_rate: d.flowRate,
          pressure: d.pressure,
          pump_1_status: d.pumpStatuses[0] || false,
          pump_2_status: d.pumpStatuses[1] || false,
          pump_3_status: d.pumpStatuses[2] || false,
          pump_4_status: d.pumpStatuses[3] || false,
          pump_1_current: d.pumpCurrents[0] || 0,
          pump_2_current: d.pumpCurrents[1] || 0,
          pump_3_current: d.pumpCurrents[2] || 0,
          pump_4_current: d.pumpCurrents[3] || 0,
          timestamp: new Date().toISOString(),
        }));

        const { error } = await supabase.from('scada_telemetry').insert(records);

        if (error) {
          console.error('Error saving batch to cloud:', error);
        } else {
          console.log(`☁️ Saved ${records.length} records to cloud`);
        }
      } catch (error) {
        console.error('Failed to save telemetry batch:', error);
      }
    }, 2000);
  };

  const publishTelemetry = useCallback((data: TelemetryData) => {
    if (clientRef.current && isConnected) {
      const payload = JSON.stringify(data);
      clientRef.current.publish(TOPICS.TELEMETRY, payload, { qos: 1, retain: false }, (err) => {
        if (!err) {
          saveTelemetryToCloud(data);
        }
      });
    }
  }, [isConnected, TOPICS.TELEMETRY]);

  const publishControl = useCallback((command: any) => {
    if (clientRef.current && isConnected) {
      const payload = JSON.stringify(command);
      clientRef.current.publish(TOPICS.CONTROL, payload, { qos: 0 }, (err) => {
        if (err) {
          console.error('Failed to publish control:', err);
        }
      });
    }
  }, [isConnected, TOPICS.CONTROL]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.end();
      clientRef.current = null;
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
      }
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastSync,
    publishTelemetry,
    publishControl,
    disconnect,
  };
};
