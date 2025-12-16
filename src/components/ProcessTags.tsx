import { Card } from "@/components/ui/card";

interface ProcessTagsProps {
  sumpLevel: number;
  pumpStatus: boolean;
  valveStatus: boolean;
  flowRate: number;
}

export const ProcessTags = ({ sumpLevel, pumpStatus, valveStatus, flowRate }: ProcessTagsProps) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Card className="p-3 bg-card border-accent/30">
        <div className="text-xs text-muted-foreground mb-1">SUMP_LEVEL</div>
        <div className="text-2xl font-bold text-accent">{sumpLevel.toFixed(1)}%</div>
      </Card>

      <Card className="p-3 bg-card border-accent/30">
        <div className="text-xs text-muted-foreground mb-1">PUMP_STATUS</div>
        <div className={`text-lg font-bold ${pumpStatus ? 'text-success' : 'text-destructive'}`}>
          {pumpStatus ? 'ON' : 'OFF'}
        </div>
      </Card>

      <Card className="p-3 bg-card border-accent/30">
        <div className="text-xs text-muted-foreground mb-1">VALVE_STATUS</div>
        <div className={`text-lg font-bold ${valveStatus ? 'text-success' : 'text-destructive'}`}>
          {valveStatus ? 'OPEN' : 'CLOSED'}
        </div>
      </Card>

      <Card className="p-3 bg-card border-accent/30">
        <div className="text-xs text-muted-foreground mb-1">FLOW_RATE</div>
        <div className="text-2xl font-bold text-accent">{flowRate.toFixed(1)}</div>
        <div className="text-xs text-muted-foreground">m³/hr</div>
      </Card>
    </div>
  );
};
