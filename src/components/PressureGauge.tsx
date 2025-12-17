import { useId } from "react";

interface PressureGaugeProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  size?: number;
  active?: boolean;
}

// Realistic analog-style pressure gauge with animated needle.
export const PressureGauge = ({
  label,
  value,
  min = 0,
  max = 6,
  unit = "Bar",
  size = 140,
  active = false,
}: PressureGaugeProps) => {
  const safeRange = Math.max(max - min, 1);
  const clamped = Math.min(Math.max(value, min), max);
  const pct = (clamped - min) / safeRange;

  const sweep = 240; // degrees of visible arc
  const startAngle = -120; // left side
  const angle = startAngle + pct * sweep;

  const cx = 100;
  const cy = 100;
  const needleLength = 58;

  const gaugeId = useId();
  const ringGradientId = `${gaugeId}-ring`;
  const faceGradientId = `${gaugeId}-face`;
  const glowId = `${gaugeId}-glow`;
  const statusColor = active ? "#22c55e" : "#ef4444";
  const auraId = `${gaugeId}-aura`;

  const arcColor =
    pct > 0.8 ? "#f97316" : pct > 0.6 ? "#f59e0b" : "#22c55e";

  const ticks = Array.from({ length: 7 }, (_, i) => ({
    value: min + ((max - min) / 6) * i,
    angle: startAngle + (sweep / 6) * i,
  }));

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="text-xs font-bold text-slate-900 uppercase tracking-wide" style={{ transform: 'translateY(2px)' }}>
        {label}
      </div>

      <svg
        viewBox="0 0 200 200"
        style={{ width: size, height: size }}
        className="drop-shadow-sm"
      >
        <defs>
          <radialGradient id={ringGradientId} cx="50%" cy="50%" r="65%">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="45%" stopColor="#cbd5e1" />
            <stop offset="100%" stopColor="#94a3b8" />
          </radialGradient>
          <radialGradient id={faceGradientId} cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="80%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </radialGradient>
          <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#0ea5e9" />
          </filter>
          <radialGradient id={auraId} cx="50%" cy="50%" r="80%">
            <stop offset="0%" stopColor={statusColor} stopOpacity="0.24" />
            <stop offset="55%" stopColor={statusColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={statusColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Status aura behind gauge (hexagon + circular glow, higher visibility) */}
        <polygon
          points={`${cx + 100},${cy} ${cx + 50},${cy + 86} ${cx - 50},${cy + 86} ${cx - 100},${cy} ${cx - 50},${cy - 86} ${cx + 50},${cy - 86}`}
          fill={statusColor}
          opacity="0.22"
          stroke={statusColor}
          strokeWidth="2.2"
          filter={`url(#${glowId})`}
          pointerEvents="none"
        />
        <circle
          cx={cx}
          cy={cy}
          r="108"
          fill={statusColor}
          opacity="0.18"
          stroke={statusColor}
          strokeWidth="1.6"
          filter={`url(#${glowId})`}
          pointerEvents="none"
        />
        <circle cx={cx} cy={cy} r="120" fill={`url(#${auraId})`} pointerEvents="none" />

        {/* Outer metal ring */}
        <circle
          cx={cx}
          cy={cy}
          r="88"
          fill={`url(#${ringGradientId})`}
          stroke="#1f2937"
          strokeWidth="3"
        />

        {/* Gauge face */}
        <circle
          cx={cx}
          cy={cy}
          r="74"
          fill={`url(#${faceGradientId})`}
          stroke="#cbd5e1"
          strokeWidth="2"
        />

        {/* Arc */}
        <path
          d="M 36 138 A 72 72 0 1 1 164 138"
          fill="none"
          stroke={arcColor}
          strokeWidth="8"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
          opacity="0.8"
        />

        {/* Tick marks */}
        {ticks.map((tick) => {
          const tickRad = (tick.angle - 90) * (Math.PI / 180);
          const outer = 74;
          const inner = 64;
          const x1 = cx + Math.cos(tickRad) * outer;
          const y1 = cy + Math.sin(tickRad) * outer;
          const x2 = cx + Math.cos(tickRad) * inner;
          const y2 = cy + Math.sin(tickRad) * inner;

          return (
            <g key={tick.value}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#0f172a"
                strokeWidth={tick.value % 1 === 0 ? 2 : 1}
                opacity="0.8"
              />
              {tick.value % 1 === 0 && (
                <text
                  x={cx + Math.cos(tickRad) * 52}
                  y={cy + Math.sin(tickRad) * 52 + 4}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#0f172a"
                  fontWeight="700"
                >
                  {tick.value.toFixed(0)}
                </text>
              )}
            </g>
          );
        })}

        {/* Needle */}
        <g
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: `${cx}px ${cy}px`,
            transition: "transform 0.35s ease-out",
          }}
        >
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - needleLength}
            stroke="#e11d48"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <polygon
            points={`${cx - 2},${cy - needleLength} ${cx + 2},${
              cy - needleLength
            } ${cx},${cy - needleLength - 8}`}
            fill="#e11d48"
          />
        </g>

        {/* Needle hub */}
        <circle cx={cx} cy={cy} r="7" fill="#0f172a" />
        <circle cx={cx} cy={cy} r="4" fill="#e2e8f0" />

        {/* Glass highlight */}
        <path
          d="M 40 80 C 80 40 120 40 160 80"
          fill="none"
          stroke="#fff"
          strokeWidth="8"
          opacity="0.18"
        />
        {/* Status outline ring */}
        <circle
          cx={cx}
          cy={cy}
          r="92"
          fill="none"
          stroke={statusColor}
          strokeWidth="4.5"
          opacity="0.75"
          pointerEvents="none"
        />
      </svg>

      <div className="text-sm font-semibold text-slate-900 bg-white/90 border border-slate-200 rounded px-3 py-1 shadow-sm">
        {clamped.toFixed(1)} {unit}
      </div>
    </div>
  );
};

