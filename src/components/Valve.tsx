interface ValveProps {
  isOpen: boolean;
  label: string;
}

export const Valve = ({ isOpen, label }: ValveProps) => {
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="30" height="40" viewBox="0 0 30 40">
        {/* Valve Body */}
        <polygon
          points="15,5 25,20 15,35 5,20"
          fill="currentColor"
          className={isOpen ? 'text-success' : 'text-destructive'}
          stroke="currentColor"
          strokeWidth="2"
        />
        
        {/* Valve Indicator */}
        <line
          x1="15"
          y1={isOpen ? "5" : "20"}
          x2="15"
          y2={isOpen ? "35" : "20"}
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      
      <div className="text-xs font-semibold bg-card px-2 py-0.5 rounded border border-border">
        <span className={isOpen ? 'text-success' : 'text-destructive'}>
          {isOpen ? 'OPEN' : 'CLOSED'}
        </span>
      </div>
    </div>
  );
};
