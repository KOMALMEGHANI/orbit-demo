-- Add indexes for optimized queries on scada_telemetry table
CREATE INDEX IF NOT EXISTS idx_scada_telemetry_timestamp 
ON public.scada_telemetry(timestamp DESC);

-- Add index for alarm_history queries
CREATE INDEX IF NOT EXISTS idx_alarm_history_timestamp 
ON public.alarm_history(timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_alarm_history_alarm_id_cleared 
ON public.alarm_history(alarm_id, cleared);

CREATE INDEX IF NOT EXISTS idx_alarm_history_severity 
ON public.alarm_history(severity);

-- Enable realtime for alarm_history table
ALTER PUBLICATION supabase_realtime ADD TABLE public.alarm_history;