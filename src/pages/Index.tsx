import { useState } from "react";
import { ScadaHeader } from "@/components/ScadaHeader";
import { Sidebar } from "@/components/Sidebar";
import { DashboardView } from "@/components/views/DashboardView";
import { PumpControlView } from "@/components/views/PumpControlView";
import { TrendsView } from "@/components/views/TrendsView";
import { AlarmsView } from "@/components/views/AlarmsView";
import { SettingsView } from "@/components/views/SettingsView";
import { ControlPopup } from "@/components/ControlPopup";
import { useScadaSimulation } from "@/hooks/useScadaSimulation";

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [showControlPopup, setShowControlPopup] = useState(false);
  
  const {
    sumpLevel,
    pumpStatuses,
    valveStatuses,
    flowRate,
    alarms,
    lastSync,
    isConnected,
    cloudLogging,
    pumpCurrents,
    pumpPowers,
    branchPressures,
    handleStartPumpControl,
    handleStopPumpControl,
    handleOpenValve,
    handleCloseValve,
  } = useScadaSimulation();

  const anyPumpRunning = pumpStatuses.some((p, i) => p && valveStatuses[i]);
  const pt05Value = anyPumpRunning ? 4.2 : 0.0;

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return (
          <DashboardView
            sumpLevel={sumpLevel}
            pumpStatuses={pumpStatuses}
            valveStatuses={valveStatuses}
            flowRate={flowRate}
            branchPressures={branchPressures}
            onPumpClick={() => setShowControlPopup(true)}
          />
        );
      case 'pump-control':
        return (
          <PumpControlView
            pumpStatus={pumpStatuses}
            valveStatus={valveStatuses}
            pumpCurrent={pumpCurrents}
            pumpPower={pumpPowers}
            onStartPump={handleStartPumpControl}
            onStopPump={handleStopPumpControl}
            onOpenValve={handleOpenValve}
            onCloseValve={handleCloseValve}
          />
        );
      case 'trends':
        return (
          <TrendsView
            sumpLevel={sumpLevel}
            flowRate={flowRate}
            pressure={pt05Value}
          />
        );
      case 'alarms':
        return <AlarmsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <ScadaHeader 
        isConnected={isConnected}
        lastSync={lastSync}
        cloudLogging={cloudLogging}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        
        <main className="flex-1 overflow-auto">
          {renderView()}
        </main>
      </div>

      {/* Control Popup - Hidden for now since we have individual controls */}
      {showControlPopup && (
        <ControlPopup
          title="MBFV-01"
          isOpen={showControlPopup}
          onClose={() => setShowControlPopup(false)}
          manualMode={false}
          onModeToggle={() => {}}
          valveOpen={valveStatuses[0]}
          onOpen={() => handleOpenValve(0)}
          onCloseValve={() => handleCloseValve(0)}
          onStop={() => handleStopPumpControl(0)}
          onAck={() => {}}
          feedbackStatus={{
            limitSwitchOpen: valveStatuses[0],
            limitSwitchClose: !valveStatuses[0],
            remoteSelected: true,
            tripJam: false,
            position: true,
          }}
          positionSetpoint={valveStatuses[0] ? 100 : 0}
        />
      )}
    </div>
  );
};

export default Index;
