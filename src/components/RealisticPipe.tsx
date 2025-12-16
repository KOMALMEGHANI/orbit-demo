interface RealisticPipeProps {
  isFlowing: boolean;
  direction?: 'horizontal' | 'vertical';
  length?: number;
}

export const RealisticPipe = ({ isFlowing, direction = 'horizontal', length = 100 }: RealisticPipeProps) => {
  const isHorizontal = direction === 'horizontal';
  
  return (
    <div className="relative">
      <svg 
        width={isHorizontal ? length : 24} 
        height={isHorizontal ? 24 : length}
        style={{ filter: 'drop-shadow(2px 2px 3px rgba(0,0,0,0.3))' }}
      >
        <defs>
          <linearGradient id={`pipeGrad-${direction}-${length}`} x1="0%" y1="0%" x2={isHorizontal ? "0%" : "100%"} y2={isHorizontal ? "100%" : "0%"}>
            <stop offset="0%" stopColor="#d4d4d8" />
            <stop offset="50%" stopColor="#f4f4f5" />
            <stop offset="100%" stopColor="#a1a1aa" />
          </linearGradient>

          {isFlowing && (
            <linearGradient 
              id={`flowGrad-${direction}-${length}`}
              x1={isHorizontal ? "0%" : "0%"} 
              y1={isHorizontal ? "0%" : "0%"}
              x2={isHorizontal ? "100%" : "0%"}
              y2={isHorizontal ? "0%" : "100%"}
            >
              <stop offset="0%" stopColor="hsl(190 90% 55%)" stopOpacity="0">
                <animate attributeName="offset" values="-0.5;1" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="30%" stopColor="hsl(190 90% 65%)" stopOpacity="0.7">
                <animate attributeName="offset" values="-0.2;1.3" dur="2s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="hsl(190 90% 55%)" stopOpacity="0">
                <animate attributeName="offset" values="0.5;2" dur="2s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          )}
        </defs>
        
        {/* Pipe Body with 3D gradient */}
        <rect
          x="0"
          y="0"
          width={isHorizontal ? length : 24}
          height={isHorizontal ? 24 : length}
          fill={`url(#pipeGrad-${direction}-${length})`}
          stroke="#71717a"
          strokeWidth="1"
        />

        {/* Top highlight for 3D effect */}
        <rect
          x="2"
          y="2"
          width={isHorizontal ? length - 4 : 20}
          height={isHorizontal ? 4 : length - 4}
          fill="#ffffff"
          opacity="0.3"
        />
        
        {/* Flow Animation */}
        {isFlowing && (
          <rect
            x="0"
            y="0"
            width={isHorizontal ? length : 24}
            height={isHorizontal ? 24 : length}
            fill={`url(#flowGrad-${direction}-${length})`}
            opacity="0.6"
          />
        )}

        {/* Pipe Segments/Joints every 30px */}
        {[...Array(Math.floor(length / 40))].map((_, i) => (
          <line
            key={i}
            x1={isHorizontal ? (i + 1) * 40 : 0}
            y1={isHorizontal ? 0 : (i + 1) * 40}
            x2={isHorizontal ? (i + 1) * 40 : 24}
            y2={isHorizontal ? 24 : (i + 1) * 40}
            stroke="#52525b"
            strokeWidth="1"
            opacity="0.5"
          />
        ))}
      </svg>
    </div>
  );
};
