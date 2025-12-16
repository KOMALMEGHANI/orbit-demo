import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play, Square, Lock, Unlock } from "lucide-react";

interface ControlPanelProps {
  pumpStatus: boolean;
  valveStatus: boolean;
  manualMode: boolean;
  onStartPump: () => void;
  onStopPump: () => void;
  onToggleValve: () => void;
  onToggleMode: () => void;
}

export const ControlPanel = ({
  pumpStatus,
  valveStatus,
  manualMode,
  onStartPump,
  onStopPump,
  onToggleValve,
  onToggleMode,
}: ControlPanelProps) => {
  return (
    <Card className="p-4 bg-card border-border">
      <h3 className="text-lg font-bold text-accent mb-4">Manual Controls</h3>
      
      <div className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex items-center justify-between p-3 bg-secondary rounded">
          <span className="text-sm font-semibold text-foreground">Control Mode:</span>
          <Button
            onClick={onToggleMode}
            variant={manualMode ? "default" : "outline"}
            size="sm"
            className={manualMode ? 'shadow-glow-amber' : ''}
          >
            {manualMode ? (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Manual
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Auto
              </>
            )}
          </Button>
        </div>

        {/* Pump Controls */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-muted-foreground">Pump Control</div>
          <div className="flex gap-2">
            <Button
              onClick={onStartPump}
              disabled={!manualMode || pumpStatus}
              className="flex-1 bg-success hover:bg-success/80 text-success-foreground disabled:opacity-50"
            >
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
            <Button
              onClick={onStopPump}
              disabled={!manualMode || !pumpStatus}
              className="flex-1 bg-destructive hover:bg-destructive/80 text-destructive-foreground disabled:opacity-50"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          </div>
        </div>

        {/* Valve Control */}
        <div className="space-y-2">
          <div className="text-sm font-semibold text-muted-foreground">Valve Control</div>
          <Button
            onClick={onToggleValve}
            disabled={!manualMode}
            className={`w-full ${
              valveStatus 
                ? 'bg-success hover:bg-success/80 text-success-foreground' 
                : 'bg-destructive hover:bg-destructive/80 text-destructive-foreground'
            } disabled:opacity-50`}
          >
            {valveStatus ? 'Close Valve' : 'Open Valve'}
          </Button>
        </div>

        {!manualMode && (
          <div className="text-xs text-warning bg-warning/10 p-2 rounded border border-warning/20">
            ⚠️ Auto mode active. Manual controls disabled.
          </div>
        )}
      </div>
    </Card>
  );
};
