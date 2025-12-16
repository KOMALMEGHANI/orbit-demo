interface RealisticValveProps {
  isOpen: boolean;
  label: string;
  type?: 'motorized' | 'manual';
}

export const RealisticValve = ({ isOpen, label, type = 'motorized' }: RealisticValveProps) => {
  return (
    <div className="flex flex-col items-center gap-1 relative">
      <svg width="40" height="50" viewBox="0 0 40 50">
        {/* Valve Body - Diamond Shape with 3D effect */}
        <defs>
          <linearGradient id={`valveGrad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isOpen ? "#4ade80" : "#ef4444"} />
            <stop offset="100%" stopColor={isOpen ? "#16a34a" : "#b91c1c"} />
          </linearGradient>
          <filter id={`shadow-${label}`}>
            <feDropShadow dx="2" dy="2" stdDeviation="2" floodOpacity="0.4"/>
          </filter>
        </defs>

        {/* Valve Body */}
        <polygon
          points="20,8 32,20 20,32 8,20"
          fill={`url(#valveGrad-${label})`}
          stroke="#1e293b"
          strokeWidth="1.5"
          filter={`url(#shadow-${label})`}
        />

        {/* Valve Internal Gate/Indicator */}
        <rect
          x={isOpen ? "10" : "18"}
          y={isOpen ? "18" : "10"}
          width={isOpen ? "20" : "4"}
          height={isOpen ? "4" : "20"}
          fill="#ffffff"
          opacity="0.9"
          rx="1"
        />

        {/* Actuator/Motor on top (for motorized) */}
        {type === 'motorized' && (
          <g>
            <rect
              x="14"
              y="2"
              width="12"
              height="8"
              fill="#64748b"
              stroke="#334155"
              strokeWidth="1"
              rx="1"
            />
            <circle cx="20" cy="6" r="1.5" fill="#fbbf24" />
          </g>
        )}

        {/* Connection Flanges */}
        <rect x="4" y="18" width="4" height="4" fill="#71717a" stroke="#3f3f46" strokeWidth="0.5"/>
        <rect x="32" y="18" width="4" height="4" fill="#71717a" stroke="#3f3f46" strokeWidth="0.5"/>

        {/* Position Indicator Line */}
        <line
          x1="20"
          y1="2"
          x2="20"
          y2={isOpen ? "8" : "5"}
          stroke="#334155"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>

      {/* Label */}
      <div className="text-[10px] font-bold bg-white/80 px-1.5 py-0.5 rounded border border-border/60" style={{
        boxShadow: '1px 1px 2px rgba(0,0,0,0.2)'
      }}>
        {label}
      </div>

      {/* Percentage/Status Display */}
      <div className={`text-[9px] font-semibold px-1 ${
        isOpen ? 'text-success' : 'text-destructive'
      }`}>
        {isOpen ? 'OPEN' : 'CLOSED'}
      </div>
    </div>
  );
};
