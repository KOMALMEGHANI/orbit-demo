interface PumpProps {
  isRunning: boolean;
  label: string;
}

export const Pump = ({ isRunning, label }: PumpProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Pump Body */}
          <circle
            cx="50"
            cy="50"
            r="35"
            fill="currentColor"
            className="text-secondary"
            stroke="currentColor"
            strokeWidth="3"
          />
          
          {/* Pump Blades - Rotating when running */}
          <g className={isRunning ? 'animate-spin-slow origin-center' : ''} style={{ transformOrigin: '50% 50%' }}>
            <line x1="50" y1="20" x2="50" y2="40" stroke="currentColor" strokeWidth="3" className="text-primary" />
            <line x1="50" y1="60" x2="50" y2="80" stroke="currentColor" strokeWidth="3" className="text-primary" />
            <line x1="20" y1="50" x2="40" y2="50" stroke="currentColor" strokeWidth="3" className="text-primary" />
            <line x1="60" y1="50" x2="80" y2="50" stroke="currentColor" strokeWidth="3" className="text-primary" />
          </g>

          {/* Center Hub */}
          <circle
            cx="50"
            cy="50"
            r="8"
            fill="currentColor"
            className={isRunning ? 'text-success' : 'text-muted'}
          />

          {/* Glow Effect when running */}
          {isRunning && (
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-success opacity-50"
            >
              <animate
                attributeName="r"
                values="35;42;35"
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.5;0;0.5"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </svg>

        {/* Status Indicator */}
        <div className="absolute -top-2 -right-2">
          <div className={`w-4 h-4 rounded-full ${
            isRunning 
              ? 'bg-success shadow-glow-green animate-pulse-slow' 
              : 'bg-destructive'
          }`} />
        </div>
      </div>

      <div className="bg-card px-3 py-1 rounded border border-border">
        <div className="text-xs font-semibold text-foreground">{label}</div>
        <div className={`text-xs font-bold ${isRunning ? 'text-success' : 'text-destructive'}`}>
          {isRunning ? 'RUNNING' : 'STOPPED'}
        </div>
      </div>
    </div>
  );
};
