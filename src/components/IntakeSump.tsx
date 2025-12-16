interface IntakeSumpProps {
  level: number; // 0-100
}

export const IntakeSump = ({ level }: IntakeSumpProps) => {
  return (
    <div className="relative" style={{ width: '920px', height: '280px' }}>
      <svg width="920" height="280" viewBox="0 0 920 280">
        <defs>
          {/* Water gradient */}
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#67e8f9" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Sump wall gradient */}
          <linearGradient id="sumpWall" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a16944" />
            <stop offset="50%" stopColor="#8b5a3c" />
            <stop offset="100%" stopColor="#6b4423" />
          </linearGradient>

          {/* Shadow */}
          <filter id="sumpShadow">
            <feDropShadow dx="3" dy="3" stdDeviation="4" floodOpacity="0.5"/>
          </filter>
        </defs>

        {/* Sump Bottom */}
        <rect
          x="50"
          y="230"
          width="820"
          height="40"
          fill="url(#sumpWall)"
          stroke="#3e2723"
          strokeWidth="2"
        />

        {/* Sump Left Wall */}
        <rect
          x="50"
          y="110"
          width="30"
          height="120"
          fill="url(#sumpWall)"
          stroke="#3e2723"
          strokeWidth="2"
        />

        {/* Sump Right Wall */}
        <rect
          x="840"
          y="110"
          width="30"
          height="120"
          fill="url(#sumpWall)"
          stroke="#3e2723"
          strokeWidth="2"
        />

        {/* Water Level */}
        <rect
          x="82"
          y={110 + 120 * (1 - level / 100)}
          width="756"
          height={120 * (level / 100)}
          fill="url(#waterGradient)"
          opacity="0.85"
        >
          <animate
            attributeName="opacity"
            values="0.8;0.9;0.8"
            dur="3s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Water surface reflection */}
        <rect
          x="82"
          y={110 + 120 * (1 - level / 100)}
          width="756"
          height="3"
          fill="#ffffff"
          opacity="0.4"
        />

        {/* Level Scale on Left */}
        <g>
          {[0, 20, 40, 60, 80, 100].map((val) => (
            <g key={val}>
              <line
                x1="30"
                y1={230 - (val * 1.2)}
                x2="45"
                y2={230 - (val * 1.2)}
                stroke="#1e293b"
                strokeWidth="2"
              />
              <text
                x="20"
                y={233 - (val * 1.2)}
                fontSize="12"
                fill="#1e293b"
                fontWeight="bold"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          ))}
        </g>

        {/* INTAKE SUMP Label */}
        <rect
          x="360"
          y="245"
          width="200"
          height="28"
          fill="#1e293b"
          stroke="#0f172a"
          strokeWidth="2"
          rx="2"
        />
        <text
          x="460"
          y="265"
          fontSize="18"
          fill="#ffffff"
          fontWeight="bold"
          textAnchor="middle"
        >
          INTAKE SUMP
        </text>
      </svg>

      {/* Level Switch Indicator (Right side) */}
      <div className="absolute -right-28 bottom-12 px-4 py-3 rounded-lg border-2" style={{
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        boxShadow: '2px 2px 6px rgba(0,0,0,0.3)',
        minWidth: '160px'
      }}>
        <div className="text-xs font-bold text-white text-center">Level Switch</div>
        <div className="text-sm font-bold text-white text-center mt-1">Sump Level 1</div>
        <div className="text-xl font-bold text-white text-center mt-1">50m</div>
      </div>
    </div>
  );
};
