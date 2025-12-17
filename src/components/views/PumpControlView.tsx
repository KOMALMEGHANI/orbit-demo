import { Button } from "@/components/ui/button";

interface PumpControlViewProps {
  pumpStatus: boolean[];
  valveStatus: boolean[];
  pumpCurrent: number[];
  pumpPower: number[];
  onStartPump: (index: number) => void;
  onStopPump: (index: number) => void;
  onOpenValve: (index: number) => void;
  onCloseValve: (index: number) => void;
}

export const PumpControlView = ({
  pumpStatus,
  valveStatus,
  pumpCurrent,
  pumpPower,
  onStartPump,
  onStopPump,
  onOpenValve,
  onCloseValve,
}: PumpControlViewProps) => {
  return (
    <div className="h-full p-6 bg-background">
      <div className="bg-card p-6 rounded-lg border-2 border-border mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-6">VT PUMP CONTROL</h2>
        
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/80 p-4 rounded border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">VT-0{i}</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Status:</span>
                  <span className={`text-sm font-bold ${pumpStatus[i-1] ? 'text-green-600' : 'text-red-600'}`}>
                    {pumpStatus[i-1] ? 'RUNNING' : 'STOPPED'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Mode:</span>
                  <span className="text-sm font-bold text-foreground">MANUAL</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Current:</span>
                  <span className="text-sm font-bold text-foreground">
                    {pumpStatus[i-1] ? pumpCurrent[i-1].toFixed(1) : '0.0'} A
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Power:</span>
                  <span className="text-sm font-bold text-foreground">
                    {pumpStatus[i-1] ? pumpPower[i-1].toFixed(1) : '0.0'} kW
                  </span>
                </div>
                
                {!valveStatus[i-1] && !pumpStatus[i-1] && (
                  <div className="text-xs text-yellow-600 font-medium">
                    Open MBFV-{i.toString().padStart(2, '0')} to enable pump start
                  </div>
                )}
                
                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onStartPump(i-1)}
                    disabled={pumpStatus[i-1] || !valveStatus[i-1]}
                  >
                    START
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => onStopPump(i-1)}
                    disabled={!pumpStatus[i-1]}
                  >
                    STOP
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border-2 border-border">
        <h2 className="text-2xl font-bold text-foreground mb-6">MBFV VALVE CONTROL</h2>
        
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/80 p-4 rounded border border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">MBFV-0{i}</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Status:</span>
                  <span className={`text-sm font-bold ${valveStatus[i-1] ? 'text-green-600' : 'text-red-600'}`}>
                    {valveStatus[i-1] ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Mode:</span>
                  <span className="text-sm font-bold text-foreground">MANUAL</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-muted-foreground">Position:</span>
                  <span className="text-sm font-bold text-foreground">
                    {valveStatus[i-1] ? '100' : '0'} %
                  </span>
                </div>
                
                {pumpStatus[i-1] && !valveStatus[i-1] && (
                  <div className="text-xs text-yellow-600 font-medium">
                    Stop VT-{i.toString().padStart(2, '0')} to enable valve close
                  </div>
                )}
                
                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => onOpenValve(i-1)}
                    disabled={valveStatus[i-1]}
                  >
                    OPEN
                  </Button>
                  <Button
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => onCloseValve(i-1)}
                    disabled={!valveStatus[i-1] || pumpStatus[i-1]}
                  >
                    CLOSE
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};