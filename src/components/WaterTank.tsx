import { useEffect, useState } from "react";

interface WaterTankProps {
  level: number; // 0-100
  label: string;
}

export const WaterTank = ({ level, label }: WaterTankProps) => {
  const [animatedLevel, setAnimatedLevel] = useState(level);

  useEffect(() => {
    setAnimatedLevel(level);
  }, [level]);

  const getColorClass = () => {
    if (level >= 80) return 'fill-destructive';
    if (level >= 60) return 'fill-warning';
    return 'fill-accent';
  };

  const getGlowClass = () => {
    if (level >= 80) return 'drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]';
    if (level >= 60) return 'drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]';
    return 'drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]';
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-40 h-48">
        {/* Tank Container */}
        <svg viewBox="0 0 100 120" className="w-full h-full">
          {/* Tank Body */}
          <rect
            x="20"
            y="20"
            width="60"
            height="80"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-border"
          />
          
          {/* Water Level */}
          <rect
            x="22"
            y={20 + 80 * (1 - animatedLevel / 100)}
            width="56"
            height={80 * (animatedLevel / 100)}
            className={`${getColorClass()} ${getGlowClass()} transition-all duration-500`}
            opacity="0.8"
          >
            <animate
              attributeName="opacity"
              values="0.7;0.9;0.7"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>

          {/* Tank Base */}
          <rect
            x="10"
            y="100"
            width="80"
            height="15"
            fill="currentColor"
            className="text-secondary"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>

        {/* Level Percentage */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-2xl font-bold text-foreground drop-shadow-lg">
            {Math.round(animatedLevel)}%
          </div>
        </div>
      </div>

      <div className="bg-card px-4 py-2 rounded border border-border">
        <div className="text-sm font-semibold text-accent">{label}</div>
      </div>
    </div>
  );
};
