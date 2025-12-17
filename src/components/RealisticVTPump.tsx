interface RealisticVTPumpProps {
  label: string;
  running: boolean;
  flowing?: boolean;
  width?: number;
  onClick?: () => void;
}

// Vertical Turbine Pump (VT) line-art style, inspired by provided reference.
// Base stays blue; when running we overlay a subtle green glow/gradient.
// When off, a soft red tint overlays while keeping the blue base visible.
export const RealisticVTPump = ({
  label,
  running,
  flowing = false,
  width = 110,
  onClick,
}: RealisticVTPumpProps) => {
  const viewW = 140;
  const viewH = 360;
  const scale = width / viewW;

  const bodyStroke = "#0b3c88";
  const bodyFill = "#0d47a1";
  const motorFill = "#0d5fad";
  const nozzleFill = "#0f4d9a";

  const runOverlay = running ? "url(#vt-run)" : "url(#vt-stop)";

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div className="text-xs font-bold text-gray-900" style={{ transform: 'translateY(2px)' }}>{label}</div>
      <svg
        width={width}
        height={viewH * scale}
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="cursor-pointer drop-shadow-sm"
        onClick={onClick}
        role="button"
        aria-label={`${label} controls`}
      >
        <defs>
          <linearGradient id="vt-run" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(34,197,94,0.25)" />
            <stop offset="100%" stopColor="rgba(22,163,74,0.05)" />
          </linearGradient>
          <linearGradient id="vt-stop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(248,113,113,0.25)" />
            <stop offset="100%" stopColor="rgba(239,68,68,0.05)" />
          </linearGradient>
          <linearGradient id="vt-strainer" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f1f4b" />
          </linearGradient>
        </defs>

        {/* Motor */}
        <rect x="34" y="12" width="72" height="60" rx="6" fill={motorFill} stroke={bodyStroke} strokeWidth="2" />
        <rect x="34" y="8" width="72" height="10" rx="4" fill="#0e6ab4" stroke={bodyStroke} strokeWidth="1.5" />
        {[...Array(10)].map((_, i) => (
          <line
            key={i}
            x1={38 + i * 7}
            y1="20"
            x2={38 + i * 7}
            y2="66"
            stroke={bodyStroke}
            strokeWidth="1.5"
          />
        ))}
        <rect x="52" y="28" width="16" height="18" rx="2" fill="#0c274d" opacity="0.8" />
        <circle cx="94" cy="32" r="5" fill="#0c274d" />

        {/* Actuator indicator on motor */}
        <circle
          cx="70"
          cy="20"
          r="5"
          fill={running ? "#22c55e" : "#ef4444"}
          stroke="#0f172a"
          strokeWidth="1"
        />

        {/* Discharge head and flange */}
        <rect x="42" y="80" width="56" height="34" rx="2" fill={bodyFill} stroke={bodyStroke} strokeWidth="2" />
        <rect x="50" y="80" width="40" height="10" rx="2" fill="#0f4d9a" opacity="0.8" />

        {/* Side discharge nozzle */}
        <rect x="90" y="104" width="26" height="20" rx="3" fill={nozzleFill} stroke={bodyStroke} strokeWidth="2" />

        {/* Vertical column */}
        <rect x="56" y="114" width="28" height="110" rx="4" fill={bodyFill} stroke={bodyStroke} strokeWidth="2" />

        {/* Bowl flanges */}
        {[142, 206].map((y) => (
          <rect key={y} x="48" y={y} width="44" height="10" rx="2" fill={bodyFill} stroke={bodyStroke} strokeWidth="2" />
        ))}

        {/* Lower bowl and diffuser */}
        <path
          d="M52 220 Q70 210 88 220 L88 250 Q70 260 52 250 Z"
          fill={bodyFill}
          stroke={bodyStroke}
          strokeWidth="2"
        />
        <path
          d="M56 250 Q70 244 84 250 L84 268 Q70 276 56 268 Z"
          fill={bodyFill}
          stroke={bodyStroke}
          strokeWidth="2"
        />

        {/* Strainer */}
        <rect x="44" y="268" width="52" height="54" fill="url(#vt-strainer)" stroke={bodyStroke} strokeWidth="2" />
        {[...Array(6)].map((_, row) =>
          [...Array(5)].map((__, col) => (
            <rect
              key={`${row}-${col}`}
              x={48 + col * 9}
              y={272 + row * 8}
              width="6"
              height="4"
              fill="#0f1f4b"
              opacity="0.55"
            />
          ))
        )}

        {/* Single impeller centered in strainer box */}
        <g
          style={{
            transformOrigin: "70px 296px",
            animation: running ? "vt-rotor 0.9s linear infinite" : undefined,
          }}
        >
          {[0, 120, 240].map((deg) => (
            <line
              key={deg}
              x1="70"
              y1="296"
              x2={70 + 16 * Math.cos((deg * Math.PI) / 180)}
              y2={296 + 16 * Math.sin((deg * Math.PI) / 180)}
              stroke="#cdd6e2"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          ))}
          <circle cx="70" cy="296" r="4.5" fill="#e5e7eb" stroke="#4b5563" strokeWidth="1" />
        </g>

        {/* Upward flow column hint when flowing */}
        {flowing && (
          <g>
            <path
              d="M70 300 L70 128"
              stroke="#22d3ee"
              strokeWidth="8"
              strokeLinecap="round"
              opacity="0.35"
            />
            <path
              d="M70 300 L70 128"
              stroke="#67e8f9"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="10 12"
              style={{ animation: "vt-flow 1.1s linear infinite" }}
            />
          </g>
        )}

        {/* Running/stop overlay tint without changing base blue */}
        <rect x="0" y="0" width="140" height="360" fill={runOverlay} pointerEvents="none" />

        <style>{`
          @keyframes vt-rotor {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes vt-flow {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: -40; }
          }
        `}</style>
      </svg>
    </div>
  );
};

