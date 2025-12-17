interface RealisticMBFVProps {
  label: string;
  isOpen: boolean;
  isFlowing?: boolean;
  width?: number;
}

// Motorised Butterfly Valve inspired by provided photo:
// Turquoise actuator, blue body, metallic disc that rotates open/close.
export const RealisticMBFV = ({
  label,
  isOpen,
  isFlowing = false,
  width = 90,
}: RealisticMBFVProps) => {
  const viewW = 140;
  const viewH = 200;
  const scale = width / viewW;
  // For clarity: 0deg = inline with flow (open), 90deg = blocking (closed)
  const discAngle = isOpen ? 0 : 90;
  const bladeScale = isOpen ? 0.18 : 1; // open = thin edge, closed = full face
  const statusColor = isOpen || isFlowing ? "#22c55e" : "#ef4444";

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div className="text-xs font-bold text-gray-900" style={{ transform: 'translateY(2px)' }}>{label}</div>
      <svg
        width={width}
        height={viewH * scale}
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="drop-shadow-sm"
      >
        <defs>
          <linearGradient id="mbfv-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0c3b87" />
            <stop offset="100%" stopColor="#082862" />
          </linearGradient>
          <linearGradient id="mbfv-actuator" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2fb4e8" />
            <stop offset="100%" stopColor="#1c9ed2" />
          </linearGradient>
          <linearGradient id="mbfv-disc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="50%" stopColor="#cbd0d6" />
            <stop offset="100%" stopColor="#9ca3af" />
          </linearGradient>
          <filter id="mbfv-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="mbfv-run" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(34,197,94,0.25)" />
            <stop offset="100%" stopColor="rgba(22,163,74,0.05)" />
          </linearGradient>
          <linearGradient id="mbfv-stop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(248,113,113,0.25)" />
            <stop offset="100%" stopColor="rgba(239,68,68,0.05)" />
          </linearGradient>
        </defs>

        {/* Status aura shaped like valve body (PT-style red/green, but circular) */}
        <circle
          cx="70"
          cy="122"
          r="64"
          fill={statusColor}
          opacity="0.16"
          stroke={statusColor}
          strokeWidth="2"
          filter="url(#mbfv-glow)"
          pointerEvents="none"
        />

        {/* Actuator box */}
        <rect
          x="30"
          y="6"
          width="80"
          height="46"
          rx="6"
          fill="url(#mbfv-actuator)"
          stroke="#0e7490"
          strokeWidth="2"
        />
        {/* Actuator top cap */}
        <rect
          x="30"
          y="6"
          width="80"
          height="10"
          rx="4"
          fill="#25a7db"
          stroke="#0e7490"
          strokeWidth="1.5"
        />
        {/* Actuator detailing */}
        <rect x="36" y="20" width="18" height="16" rx="2" fill="#0d2f4a" opacity="0.8" />
        <circle cx="96" cy="24" r="4" fill="#0d2f4a" />
        <rect x="80" y="38" width="18" height="6" rx="2" fill="#0d2f4a" opacity="0.8" />
        <circle cx="70" cy="12" r="4" fill="#fcd34d" stroke="#0f172a" strokeWidth="1" />

        {/* Actuator indicator light */}
        <circle
          cx="70"
          cy="32"
          r="5"
          fill={isOpen ? "#22c55e" : "#ef4444"}
          stroke="#0f172a"
          strokeWidth="1.2"
        />

        {/* Stem/neck */}
        <rect x="62" y="52" width="16" height="26" rx="3" fill="#0c3b87" stroke="#082862" strokeWidth="2" />

        {/* Valve body outer ring */}
        <circle cx="70" cy="122" r="52" fill="url(#mbfv-body)" stroke="#061b44" strokeWidth="3" />
        {/* Outer bolts */}
        {[0, 60, 120, 180, 240, 300].map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const bx = 70 + Math.cos(rad) * 44;
          const by = 122 + Math.sin(rad) * 44;
          return <circle key={deg} cx={bx} cy={by} r="3" fill="#0b1220" stroke="#94a3b8" strokeWidth="1" />;
        })}
        {/* Inner dark ring */}
        <circle cx="70" cy="122" r="44" fill="#0b1220" opacity="0.55" />
        {/* Seat liner */}
        <circle cx="70" cy="122" r="36" fill="none" stroke="#1e293b" strokeWidth="2" opacity="0.8" />

        {/* Butterfly disc - circular; full face when closed, thin edge when open */}
        <g
          transform={`translate(70 122) rotate(${discAngle}) translate(-70 -122)`}
          style={{ transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)" }}
        >
          <g
            style={{
              transformOrigin: "70px 122px",
              transform: `scaleX(${bladeScale})`,
              transition: "transform 0.9s cubic-bezier(0.22, 1, 0.36, 1)",
            }}
          >
            <circle
              cx="70"
              cy="122"
              r="40"
              fill="url(#mbfv-disc)"
              stroke="#6b7280"
              strokeWidth="2"
              filter={isOpen ? "url(#mbfv-glow)" : undefined}
            />
          </g>
          {/* Hub */}
          <circle cx="70" cy="122" r="6" fill="#0b1220" stroke="#0f172a" strokeWidth="1.4" />
          {/* Axle bolts */}
          <circle cx="70" cy="102" r="3.5" fill="#cbd0d6" stroke="#4b5563" strokeWidth="1" />
          <circle cx="70" cy="142" r="3.5" fill="#cbd0d6" stroke="#4b5563" strokeWidth="1" />
        </g>

        {/* Shaft cover */}
        <circle cx="70" cy="122" r="7" fill="#0b1220" stroke="#0f172a" strokeWidth="1.5" />

        {/* Flow hint when open */}
        {isOpen && isFlowing && (
          <g opacity="0.7">
            {[0, 1, 2].map((i) => (
              <path
                key={i}
                d="M30 122 Q70 118 110 122"
                fill="none"
                stroke="#22d3ee"
                strokeWidth="3"
                strokeLinecap="round"
                style={{
                  animation: "mbfv-flow 1.3s linear infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </g>
        )}

        {/* Status outline on valve body */}
        <circle
          cx="70"
          cy="122"
          r="52"
          fill="none"
          stroke={statusColor}
          strokeWidth="5"
          opacity="0.7"
          pointerEvents="none"
        />

        <style>{`
          @keyframes mbfv-flow {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: -40; }
          }
        `}</style>
      </svg>
    </div>
  );
};

