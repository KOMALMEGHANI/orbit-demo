import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ControlPopupProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  manualMode: boolean;
  onModeToggle: () => void;
  valveOpen: boolean;
  onOpen: () => void;
  onCloseValve: () => void;
  onStop: () => void;
  onAck: () => void;
  feedbackStatus: {
    limitSwitchOpen: boolean;
    limitSwitchClose: boolean;
    remoteSelected: boolean;
    tripJam: boolean;
    position: boolean;
  };
  positionSetpoint: number;
}

export const ControlPopup = ({
  title,
  isOpen,
  onClose,
  manualMode,
  onModeToggle,
  valveOpen,
  onOpen,
  onCloseValve,
  onStop,
  onAck,
  feedbackStatus,
  positionSetpoint,
}: ControlPopupProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onClose}>
      <div 
        className="bg-popover border-2 border-primary rounded-lg shadow-2xl w-[500px]"
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}
      >
        {/* Header */}
        <div className="bg-primary text-primary-foreground px-4 py-2 flex items-center justify-between rounded-t-md">
          <h3 className="text-lg font-bold">{title}</h3>
          <button 
            onClick={onClose}
            className="hover:bg-primary-foreground/20 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Mode Selection and Controls Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Mode Selection */}
            <div className="bg-secondary/50 p-3 rounded border border-border">
              <div className="text-xs font-bold text-foreground mb-2">Mode Selection</div>
              <div className="flex gap-2">
                <Button
                  onClick={() => onModeToggle()}
                  className={`flex-1 font-bold ${
                    manualMode 
                      ? 'bg-warning hover:bg-warning/80 text-warning-foreground' 
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                  style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  MANUAL
                </Button>
                <Button
                  onClick={() => onModeToggle()}
                  className={`flex-1 font-bold ${
                    !manualMode 
                      ? 'bg-warning hover:bg-warning/80 text-warning-foreground' 
                      : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                  }`}
                  style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  AUTO
                </Button>
              </div>
            </div>

            {/* Valve and Alarm Controls */}
            <div className="bg-secondary/50 p-3 rounded border border-border">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs font-bold text-foreground">VALVE</div>
                <div className="text-xs font-bold text-foreground">ALARMS</div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <Button
                  onClick={onOpen}
                  disabled={!manualMode}
                  className="bg-success hover:bg-success/80 text-success-foreground font-bold disabled:opacity-40"
                  style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  OPEN
                </Button>
                <Button
                  onClick={onCloseValve}
                  disabled={!manualMode}
                  className="bg-destructive hover:bg-destructive/80 text-destructive-foreground font-bold disabled:opacity-40"
                  style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  CLOSE
                </Button>
                <Button
                  onClick={onStop}
                  disabled={!manualMode}
                  className="bg-info hover:bg-info/80 text-info-foreground font-bold disabled:opacity-40"
                  style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  STOP
                </Button>
                <Button
                  onClick={onAck}
                  className="bg-warning hover:bg-warning/80 text-warning-foreground font-bold"
                  style={{ boxShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  ACK
                </Button>
              </div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="bg-secondary/50 p-3 rounded border border-border">
            <div className="text-xs font-bold text-foreground mb-2">FEEDBACK</div>
            <div className="space-y-1.5">
              <FeedbackRow label="LIMIT SWITCH OPEN FEEDBACK" active={feedbackStatus.limitSwitchOpen} />
              <FeedbackRow label="LIMIT SWITCH CLOSE FEEDBACK" active={feedbackStatus.limitSwitchClose} />
              <FeedbackRow label="REMOTE SELECTED FEEDBACK" active={feedbackStatus.remoteSelected} />
              <FeedbackRow label="TRIP/JAM FEEDBACK" active={feedbackStatus.tripJam} />
              <FeedbackRow label="POSITION FEEDBACK" active={feedbackStatus.position} />
              
              {/* Position Setpoint */}
              <div className="flex items-center justify-between bg-white/50 px-2 py-1 rounded">
                <span className="text-xs font-semibold text-foreground">POSITION SETPOINT</span>
                <input 
                  type="text"
                  value={positionSetpoint}
                  readOnly
                  className="w-20 px-2 py-1 text-xs font-bold text-center bg-white border border-border rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeedbackRow = ({ label, active }: { label: string; active: boolean }) => (
  <div className="flex items-center justify-between bg-white/50 px-2 py-1 rounded">
    <span className="text-xs font-semibold text-foreground">{label}</span>
    <div className={`w-6 h-4 rounded-full ${
      active ? 'bg-success' : 'bg-muted'
    }`} style={{
      boxShadow: active ? '0 0 8px rgba(34,197,94,0.6)' : 'inset 1px 1px 2px rgba(0,0,0,0.2)'
    }} />
  </div>
);
