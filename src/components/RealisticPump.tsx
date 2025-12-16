interface RealisticPumpProps {
  isRunning: boolean;
  label: string;
}

export const RealisticPump = ({ isRunning, label }: RealisticPumpProps) => {
  return (
    <div className="flex flex-col items-center gap-1">
      {/* Pump Motor Body - 3D Realistic */}
      <div className="relative w-16 h-24 flex flex-col items-center">
        {/* Motor Housing */}
        <div className={`w-12 h-16 rounded-sm relative ${
          isRunning ? 'bg-success' : 'bg-destructive'
        }`} style={{
          boxShadow: '3px 3px 6px rgba(0,0,0,0.4), -1px -1px 3px rgba(255,255,255,0.2), inset 1px 1px 2px rgba(0,0,0,0.2)',
          background: isRunning 
            ? 'linear-gradient(135deg, hsl(var(--success) / 0.95) 0%, hsl(var(--success) / 0.75) 100%)'
            : 'linear-gradient(135deg, hsl(var(--destructive) / 0.9) 0%, hsl(var(--destructive) / 0.7) 100%)'
        }}>
          {/* Motor Ventilation Slots */}
          <div className="absolute inset-x-2 top-2 space-y-1">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-0.5 bg-black/20 rounded" />
            ))}
          </div>

          {/* Status Indicator Light */}
          <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
            isRunning ? 'bg-yellow-300 shadow-[0_0_6px_rgba(253,224,71,0.8)]' : 'bg-gray-600'
          }`} />

          {/* Center Shaft Highlight */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-black/10" />
        </div>

        {/* Pump Base/Foundation */}
        <div className="w-16 h-3 bg-gradient-to-b from-gray-600 to-gray-700 rounded-sm mt-1" style={{
          boxShadow: '2px 2px 4px rgba(0,0,0,0.5)'
        }} />

        {/* Discharge Pipe Connection */}
        <div className="absolute -right-4 top-1/3 w-8 h-2 bg-gray-400 rounded-r" style={{
          boxShadow: '2px 2px 3px rgba(0,0,0,0.3)'
        }} />
      </div>

      {/* Label */}
      <div className="bg-accent/80 px-2 py-0.5 rounded text-xs font-bold text-foreground border border-border/50" style={{
        boxShadow: '1px 1px 2px rgba(0,0,0,0.3)'
      }}>
        {label}
      </div>
    </div>
  );
};
