interface RealisticEFMProps {
  flowRate: number;
  flowing: boolean;
  label?: string;
  width?: number;
}

// Electromagnetic Flow Meter SVG inspired by the provided reference.
// Shows inline pipe, meter body, glass window, and animated left-to-right flow.
export const RealisticEFM = ({
  flowRate,
  flowing,
  label = "EFM",
  width = 260,
}: RealisticEFMProps) => {
  const height = (width * 0.65) | 0;
  const flowText = `${Math.round(flowRate)} L/S`;
  const statusColor = flowing ? "#22c55e" : "#ef4444";
  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <svg viewBox="0 0 300 190" width={width} height={height}>
        <defs>
          <linearGradient id="efm-pipe" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a079e" />
            <stop offset="100%" stopColor="#06056f" />
          </linearGradient>
          <linearGradient id="efm-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1da1f2" />
            <stop offset="100%" stopColor="#1090e0" />
          </linearGradient>
          <linearGradient id="efm-window" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#083042" />
            <stop offset="100%" stopColor="#0a4b68" />
          </linearGradient>
          <linearGradient id="efm-run" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(34,197,94,0.22)" />
            <stop offset="100%" stopColor="rgba(22,163,74,0.06)" />
          </linearGradient>
          <linearGradient id="efm-stop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(248,113,113,0.22)" />
            <stop offset="100%" stopColor="rgba(239,68,68,0.06)" />
          </linearGradient>
          <filter id="efm-glow" x="-20%" y="-40%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Status glow around pipe + head (soft, no hard outline) */}
        <g pointerEvents="none" opacity="0.8" fill={statusColor} stroke="none">
          <rect x="26" y="73" width="248" height="68" rx="12" filter="url(#efm-glow)" />
          <rect x="112" y="10" width="76" height="50" rx="10" filter="url(#efm-glow)" />
        </g>

        {/* Pipe */}
        <rect x="30" y="77" width="240" height="60" rx="8" fill="url(#efm-pipe)" />
        {/* Pipe flanges */}
        <rect x="30" y="68" width="16" height="74" rx="6" fill="#0a079e" />
        <rect x="254" y="68" width="16" height="74" rx="6" fill="#0a079e" />
        {/* Flow indicator inside pipe */}
        {flowing && (
          <g>
            <rect x="38" y="99" width="224" height="12" fill="#1d4ed8" opacity="0.3" />
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <rect
                key={i}
                x={38 + i * 40}
                y="101"
                width="26"
                height="10"
                rx="5"
                fill="#22d3ee"
                style={{
                  animation: "efm-flow 1.4s linear infinite",
                  animationDelay: `${i * 0.18}s`,
                }}
              />
            ))}
          </g>
        )}

        {/* Meter stem */}
        <rect x="138" y="50" width="24" height="48" rx="4" fill="url(#efm-body)" stroke="#0b5fae" strokeWidth="2" />
        <circle cx="150" cy="102" r="7" fill="#d4d7dc" stroke="#0b5fae" strokeWidth="1.5" />

        {/* Meter body */}
        <rect x="116" y="14" width="68" height="42" rx="8" fill="url(#efm-body)" stroke="#0b5fae" strokeWidth="2" />
        {/* Window */}
        <rect x="134" y="26" width="32" height="18" rx="2" fill="url(#efm-window)" stroke="#0a2b3c" strokeWidth="2" />
        {/* Head circular cap */}
        <circle cx="150" cy="20" r="8" fill="#1da1f2" stroke="#0b5fae" strokeWidth="2" />

        {/* Label on body */}
        <text x="150" y="166" textAnchor="middle" fontSize="24" fontWeight="700" fill="#0b1220">
          {label}
        </text>
        <text x="150" y="191" textAnchor="middle" fontSize="26" fontWeight="700" fill="#0b5fae">
          {flowText}
        </text>
      </svg>
      <style>{`
        @keyframes efm-flow {
          from { transform: translateX(0); opacity: 0.6; }
          to { transform: translateX(46px); opacity: 0.1; }
        }
      `}</style>
    </div>
  );
};

