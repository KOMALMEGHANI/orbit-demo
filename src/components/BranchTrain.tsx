import { PressureGauge } from "./PressureGauge";
import { RealisticMBFV } from "./RealisticMBFV";
import { RealisticVTPump } from "./RealisticVTPump";

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
      {/* Improved connection to main header - using negative margin to ensure seamless connection */}
      <div className="relative w-4 h-5 -mt-1">
        {/* Vertical part coming down from header - increased height */}
        <div className="absolute top-0 left-0 w-4 h-full bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 border-x-2 border-gray-700 overflow-hidden">
          {isFlowing && (
            <>
              <div className="absolute inset-0 bg-cyan-400/60" />
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-cyan-300 rounded-full left-1/2 -translate-x-1/2"
                  style={{
                    animation: `moveUp 1.5s ease-in-out infinite`,
                    animationDelay: `${i * 0.5}s`,
                    bottom: '-8px'
                  }}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Short pipe to MBFV - adjusted positioning */}
      <div className="w-4 h-6 bg-gradient-to-r from-gray-500 via-gray-400 to-gray-500 border-x-2 border-gray-700 relative overflow-hidden">
        {isFlowing && (
          <>
            <div className="absolute inset-0 bg-cyan-400/60" />
            <div className="absolute w-2 h-2 bg-cyan-300 rounded-full left-1/2 -translate-x-1/2"
              style={{
                animation: `moveUp 1.5s ease-in-out infinite`,
                bottom: '-8px'
              }}
            />
          </>
        )}
      </div>

      {/* MBFV (Motorized Butterfly Valve) - Below main header */}
      <RealisticMBFV
        label={mbfvLabel}
        isOpen={valveOpen}
        isFlowing={isFlowing}
        width={84}
      />

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
                  animation: `moveUp 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                  bottom: '-8px'
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* PT (Pressure Transmitter) */}
      <div className="flex items-center justify-center w-full">
        <PressureGauge
          label={ptLabel}
          value={ptValue}
          min={0}
          max={6}
          unit="Bar"
          size={86}
          active={isFlowing}
        />
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
                  animation: `moveUp 1.5s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                  bottom: '-8px'
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* VT Pump (Vertical Turbine) - Near bottom */}
      <RealisticVTPump
        label={pumpLabel}
        running={pumpRunning}
        flowing={isFlowing}
        width={110}
        onClick={onPumpClick}
      />

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
        @keyframes moveUp {
          0% {
            bottom: -8px;
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            bottom: 100%;
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}