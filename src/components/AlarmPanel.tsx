import { Card } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

interface Alarm {
  id: string;
  message: string;
  level: 'high' | 'low' | 'critical';
  timestamp: Date;
}

interface AlarmPanelProps {
  alarms: Alarm[];
}

export const AlarmPanel = ({ alarms }: AlarmPanelProps) => {
  const activeAlarms = alarms.filter(alarm => alarm.level !== 'critical' || true);

  return (
    <Card className="p-4 bg-card border-border">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h3 className="text-lg font-bold text-accent">Active Alarms</h3>
        <span className={`ml-auto px-2 py-1 rounded text-xs font-bold ${
          activeAlarms.length > 0 ? 'bg-destructive text-destructive-foreground animate-blink' : 'bg-success text-success-foreground'
        }`}>
          {activeAlarms.length}
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {activeAlarms.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-4">
            No active alarms
          </div>
        ) : (
          activeAlarms.map((alarm) => (
            <div
              key={alarm.id}
              className={`p-3 rounded border ${
                alarm.level === 'critical'
                  ? 'bg-destructive/20 border-destructive animate-blink'
                  : alarm.level === 'high'
                  ? 'bg-warning/20 border-warning'
                  : 'bg-muted/20 border-border'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-foreground">{alarm.message}</span>
                <span className="text-xs text-muted-foreground">
                  {alarm.timestamp.toLocaleTimeString()}
                </span>
              </div>
              <div className={`text-xs font-bold ${
                alarm.level === 'critical' ? 'text-destructive' :
                alarm.level === 'high' ? 'text-warning' : 'text-muted-foreground'
              }`}>
                {alarm.level.toUpperCase()}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
