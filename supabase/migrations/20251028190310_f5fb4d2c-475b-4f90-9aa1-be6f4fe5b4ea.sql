-- Create table for SCADA telemetry data
CREATE TABLE public.scada_telemetry (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sump_level DECIMAL NOT NULL,
  pump_status BOOLEAN NOT NULL,
  valve_status BOOLEAN NOT NULL,
  flow_rate DECIMAL NOT NULL,
  pressure DECIMAL NOT NULL,
  pump_1_status BOOLEAN NOT NULL DEFAULT false,
  pump_2_status BOOLEAN NOT NULL DEFAULT false,
  pump_3_status BOOLEAN NOT NULL DEFAULT false,
  pump_4_status BOOLEAN NOT NULL DEFAULT false,
  pump_1_current DECIMAL NOT NULL DEFAULT 0,
  pump_2_current DECIMAL NOT NULL DEFAULT 0,
  pump_3_current DECIMAL NOT NULL DEFAULT 0,
  pump_4_current DECIMAL NOT NULL DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.scada_telemetry ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for monitoring)
CREATE POLICY "Allow public read access to telemetry data" 
ON public.scada_telemetry 
FOR SELECT 
USING (true);

-- Create policy to allow public insert (for MQTT client to write data)
CREATE POLICY "Allow public insert to telemetry data" 
ON public.scada_telemetry 
FOR INSERT 
WITH CHECK (true);

-- Create index for timestamp queries
CREATE INDEX idx_scada_telemetry_timestamp ON public.scada_telemetry(timestamp DESC);