import { IntakeSump } from "@/components/IntakeSump";
import { BranchTrain } from "@/components/BranchTrain";
interface DashboardViewProps {
  sumpLevel: number;
  pumpStatuses: boolean[];
  valveStatuses: boolean[];
  flowRate: number;
  branchPressures: number[];
  onPumpClick: () => void;
}
export const DashboardView = ({
  sumpLevel,
  pumpStatuses,
  valveStatuses,
  flowRate,
  branchPressures,
  onPumpClick
}: DashboardViewProps) => {
  const anyPumpRunning = pumpStatuses.some((p, i) => p && valveStatuses[i]);
  const pt05Value = anyPumpRunning ? (4.0 + Math.random() * 0.4).toFixed(1) : "0.0";
  return <div className="h-full w-full bg-gray-100 relative overflow-hidden">
      {/* Legend at Top Left */}
      <div className="absolute top-4 left-4 bg-white/90 p-3 rounded border-2 border-gray-300 shadow-lg">
        <div className="text-xs font-bold text-gray-900 space-y-1">
          <div>EMF - Electromagnetic Flow Meter</div>
          <div>PT - Pressure Transmitter</div>
          <div>VT - Vertical Turbine</div>
          <div>MBFV - Motorised Butterfly Valve</div>
          <div>LT - Level Transmitter</div>
        </div>
      </div>

      {/* Main Header - Slightly adjusted position */}
      <div className="absolute top-20 left-[20%] right-16 flex items-center">
        {/* Main Header Title */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          <h1 className="text-xl font-bold text-gray-900">Main Header</h1>
        </div>

        {/* Left rounded cap for main header pipe */}
        <div className="absolute left-0 w-4 h-8 bg-gradient-to-b from-gray-500 via-gray-400 to-gray-500 border-y-2 border-l-2 border-gray-700 rounded-l-full -ml-4"></div>

        {/* Horizontal Main Header Pipe - Enhanced flow animation with cyan dots */}
        <div className="relative w-full h-8 bg-gradient-to-b from-gray-500 via-gray-400 to-gray-500 border-y-2 border-gray-700 overflow-hidden shadow-lg">
          {anyPumpRunning && <>
              {/* Cyan water flow base */}
              <div className="absolute inset-0 bg-cyan-400/60" />
              {/* Animated cyan dots moving right */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <div key={i} className="absolute w-2 h-2 bg-cyan-300 rounded-full top-1/2 -translate-y-1/2" style={{
            animation: `moveRight 3s ease-in-out infinite`,
            animationDelay: `${i * 0.375}s`,
            left: '-8px'
          }} />)}
            </>}
        </div>
        
        <style>{`
          @keyframes moveRight {
            0% {
              left: -8px;
              opacity: 0;
            }
            10% {
              opacity: 1;
            }
            90% {
              opacity: 1;
            }
            100% {
              left: 100%;
              opacity: 0;
            }
          }
        `}</style>

        {/* PT-05 on header */}
        <div className="absolute -top-16 right-40 flex flex-col items-center gap-1">
          <div className="w-8 h-12 bg-gray-700 border-2 border-gray-900 flex items-center justify-center">
            <div className="text-white text-[10px] font-bold">PT-05</div>
          </div>
          <div className="text-xs font-semibold text-gray-900">{pt05Value} Bar</div>
          <div className="w-0.5 h-6 bg-gray-600" />
        </div>

        {/* EFM (Electro Magnetic Flow) */}
        <div className="absolute -right-4 -top-8 flex flex-col items-center gap-2">
          <div className="w-20 h-16 bg-gray-800 border-4 border-gray-900 flex flex-col items-center justify-center">
            <div className="text-white text-sm font-bold">EFM</div>
            <div className="text-green-400 text-xs font-semibold">{Math.round(flowRate)} L/S</div>
          </div>
          <div className="text-[10px] font-bold text-gray-900 text-center max-w-[80px]">
            Electro Magnetic Flow (EFM)
          </div>
        </div>
      </div>

      {/* 4 Branch Trains - Adjusted positioning for larger sump */}
      <div className="absolute bottom-36 left-1/2 -translate-x-1/2 grid grid-cols-4 gap-16" style={{
      width: '900px'
    }}>
        {[1, 2, 3, 4].map(i => <BranchTrain key={i} pumpLabel={`VT 0${i}`} mbfvLabel={`MBFV 0${i}`} ptLabel={`PT 0${i}`} ptValue={branchPressures[i - 1] || 0} isFlowing={pumpStatuses[i - 1] && valveStatuses[i - 1]} pumpRunning={pumpStatuses[i - 1]} valveOpen={valveStatuses[i - 1]} onPumpClick={i === 1 ? onPumpClick : undefined} />)}
      </div>

      {/* LT-01 Level Transmitter (Right Side) */}
      <div className="absolute bottom-36 right-12 flex flex-col items-center gap-2">
        <div className="bg-white border-2 border-gray-900 px-4 py-2 text-center">
          <div className="text-xs font-bold text-gray-900 mb-1">LT 01</div>
          <div className="text-2xl font-bold text-gray-900">{Math.round(sumpLevel)}%</div>
        </div>
        <div className="w-16 h-32 border-2 border-gray-900 relative overflow-hidden" style={{
        background: 'linear-gradient(to bottom, #3b82f6 0%, #1e40af 100%)'
      }}>
          <div className="absolute bottom-0 left-0 right-0 transition-all duration-500" style={{
          height: `${sumpLevel}%`,
          background: 'linear-gradient(to bottom, #60a5fa 0%, #2563eb 100%)'
        }} />
        </div>
        <div className="text-sm font-bold text-gray-900">Level</div>
      </div>

      {/* Intake Sump at Bottom */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
        <IntakeSump level={sumpLevel} />
      </div>
    </div>;
};
