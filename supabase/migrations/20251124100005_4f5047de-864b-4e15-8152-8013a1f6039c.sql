-- Create enum for alarm severity levels
CREATE TYPE alarm_severity AS ENUM ('info', 'warning', 'high', 'critical');

-- Create alarm_history table
CREATE TABLE public.alarm_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alarm_id TEXT NOT NULL,
  message TEXT NOT NULL,
  severity alarm_severity NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by TEXT,
  cleared BOOLEAN NOT NULL DEFAULT false,
  cleared_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.alarm_history ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is a monitoring system)
CREATE POLICY "Allow public read access to alarm history"
  ON public.alarm_history
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert to alarm history"
  ON public.alarm_history
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update to alarm history"
  ON public.alarm_history
  FOR UPDATE
  USING (true);

-- Create index for better query performance
CREATE INDEX idx_alarm_history_timestamp ON public.alarm_history(timestamp DESC);
CREATE INDEX idx_alarm_history_severity ON public.alarm_history(severity);
CREATE INDEX idx_alarm_history_acknowledged ON public.alarm_history(acknowledged);
CREATE INDEX idx_alarm_history_cleared ON public.alarm_history(cleared);