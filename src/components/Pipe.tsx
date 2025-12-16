interface PipeProps {
  isFlowing: boolean;
  direction?: 'horizontal' | 'vertical';
  length?: number;
}

export const Pipe = ({ isFlowing, direction = 'horizontal', length = 100 }: PipeProps) => {
  const isHorizontal = direction === 'horizontal';
  
  return (
    <svg 
      width={isHorizontal ? length : 20} 
      height={isHorizontal ? 20 : length}
      className="relative"
    >
      {/* Pipe Body */}
      <rect
        x="0"
        y="0"
        width={isHorizontal ? length : 20}
        height={isHorizontal ? 20 : length}
        fill="currentColor"
        className="text-secondary"
        stroke="currentColor"
        strokeWidth="2"
      />
      
      {/* Flow Animation */}
      {isFlowing && (
        <>
          <rect
            x="0"
            y="0"
            width={isHorizontal ? length : 20}
            height={isHorizontal ? 20 : length}
            fill="url(#flowGradient)"
            opacity="0.6"
          />
          <defs>
            <linearGradient 
              id="flowGradient" 
              x1={isHorizontal ? "0%" : "0%"} 
              y1={isHorizontal ? "0%" : "0%"}
              x2={isHorizontal ? "100%" : "0%"}
              y2={isHorizontal ? "0%" : "100%"}
            >
              <stop offset="0%" stopColor="hsl(185 85% 55%)" stopOpacity="0">
                <animate attributeName="offset" values="0;1" dur="1.5s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="hsl(185 85% 55%)" stopOpacity="0.8">
                <animate attributeName="offset" values="0.5;1.5" dur="1.5s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="hsl(185 85% 55%)" stopOpacity="0">
                <animate attributeName="offset" values="1;2" dur="1.5s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
          </defs>
        </>
      )}
    </svg>
  );
};
