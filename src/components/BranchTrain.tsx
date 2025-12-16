interface BranchTrainProps {
  pumpLabel: string;
  mbfvLabel: string;
  ptLabel: string;
  ptValue: number;
  isFlowing: boolean;
  pumpRunning: boolean;
  valveOpen: boolean;
  onPumpClick?: () => void;
}

export const BranchTrain = ({
  pumpLabel,
  mbfvLabel,
  ptLabel,
  ptValue,
  isFlowing,
  pumpRunning,
  valveOpen,
  onPumpClick,
}: BranchTrainProps) => {
  return (
    <div className="flex flex-col items-center">
      {/* 90-degree elbow from main header going down */}
      <div className="relative w-4 h-3">
        {/* Vertical part coming down from header - increased height */}
        <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 border-x-2 border-gray-700 overflow-hidden">
          {isFlowing && (
            <>
              <div className="absolute inset-0 bg-cyan-400/60" />
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-cyan-300 rounded-full left-1/2 -translate-x-1/2"
                  style={{
                    animation: `moveDown 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.75}s`,
                    top: '-8px'
                  }}
                />
              ))}
            </>
          )}
        </div>
        {/* Elbow removed */}
      </div>

      {/* Short pipe to MBFV - adjusted positioning */}
      <div className="w-4 h-6 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 border-x-2 border-gray-700 relative overflow-hidden">
        {isFlowing && (
          <>
            <div className="absolute inset-0 bg-cyan-400/60" />
            <div className="absolute w-2 h-2 bg-cyan-300 rounded-full left-1/2 -translate-x-1/2"
              style={{
                animation: `moveDown 1.5s ease-in-out infinite`,
                top: '-8px'
              }}
            />
          </>
        )}
      </div>

      {/* MBFV (Motorized Butterfly Valve) - Below main header */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-[10px] font-bold text-gray-900">{mbfvLabel}</div>
        <div
          className={`w-12 h-12 rotate-45 flex items-center justify-center border-4 transition-all duration-300 ${
            valveOpen
              ? "bg-green-500 border-green-700 shadow-lg shadow-green-500/50"
              : "bg-red-500 border-red-700 shadow-lg shadow-red-500/50"
          }`}
        >
          <div
            className={`w-8 h-1 bg-gray-900 transform transition-transform duration-500 ${
              valveOpen ? "rotate-90" : "rotate-0"
            }`}
          />
        </div>
      </div>

      {/* Pipe from MBFV to PT */}
      <div className="w-4 h-12 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 border-x-2 border-gray-700 relative overflow-hidden">
        {isFlowing && (
          <>
            <div className="absolute inset-0 bg-cyan-400/60" />
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-cyan-300 rounded-full left-1/2 -translate-x-1/2"
                style={{
                  animation: `moveDown 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                  top: '-8px'
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* PT (Pressure Transmitter) */}
      <div className="flex items-center justify-center w-full">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-blue-200 border-2 border-gray-400 rounded-full flex items-center justify-center">
              <div className="text-gray-900 text-[10px] font-bold">{ptLabel}</div>
            </div>
          </div>
          <div className="w-10 h-0.5 bg-gray-600" />
          <div className="text-[10px] font-semibold text-gray-900 bg-white px-2 py-1 border border-gray-400">
            {ptValue.toFixed(1)} Bar
          </div>
        </div>
      </div>

      {/* Pipe from PT to VT */}
      <div className="w-4 h-12 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 border-x-2 border-gray-700 relative overflow-hidden">
        {isFlowing && (
          <>
            <div className="absolute inset-0 bg-cyan-400/60" />
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-cyan-300 rounded-full left-1/2 -translate-x-1/2"
                style={{
                  animation: `moveDown 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                  top: '-8px'
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* VT Pump (Vertical Turbine) - Near bottom */}
      <div className="flex flex-col items-center gap-1">
        <div className="text-[10px] font-bold text-gray-900">{pumpLabel}</div>
        <div 
          className="relative w-20 h-20 cursor-pointer hover-scale"
          onClick={onPumpClick}
          role="button"
          aria-label={`${pumpLabel} controls`}
        >
          <div
            className={`absolute inset-0 flex items-center justify-center border-4 transition-all duration-300 ${
              pumpRunning
                ? "bg-green-500 border-green-700 shadow-lg shadow-green-500/50"
                : "bg-red-500 border-red-700 shadow-lg shadow-red-500/50"
            }`}
          >
            <div className={`relative w-12 h-12 ${pumpRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '1s' }}>
              {[0, 45, 90, 135].map((rotation) => (
                <div
                  key={rotation}
                  className="absolute top-1/2 left-1/2 w-10 h-1 bg-white/80 -translate-x-1/2 -translate-y-1/2"
                  style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
                />
              ))}
              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-gray-800 rounded-full -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Final pipe to sump */}
      <div className="w-4 h-16 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 border-x-2 border-gray-700 relative overflow-hidden">
        {isFlowing && (
          <>
            <div className="absolute inset-0 bg-cyan-400/60" />
            {[0, 1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-cyan-300 rounded-full left-1/2 -translate-x-1/2"
                style={{
                  animation: `moveUp 2s ease-in-out infinite`,
                  animationDelay: `${i * 0.4}s`,
                  bottom: '-8px'
                }}
              />
            ))}
          </>
        )}
      </div>
      
      <style>{`
        @keyframes moveDown {
          0% {
            top: -8px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
