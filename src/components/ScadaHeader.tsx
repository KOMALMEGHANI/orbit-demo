import { Wifi, Database } from "lucide-react";
import logo from "@/assets/Orbit Enineering Group LOGO.png";

interface ScadaHeaderProps {
  isConnected: boolean;
  lastSync: Date;
  cloudLogging: boolean;
}

export const ScadaHeader = ({ isConnected, lastSync, cloudLogging }: ScadaHeaderProps) => {
  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Orbit Engineering Group" className="h-10 w-auto" />
          <h1 className="text-2xl font-bold text-foreground tracking-wide">
            Orbit Engineering Group WTP Intake Scada - Realtime Monitoring
          </h1>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Wifi className={`w-4 h-4 ${isConnected ? 'text-success' : 'text-destructive'}`} />
            <span className="text-muted-foreground">
              {isConnected ? 'Connected to MQTT Server ✅' : 'Disconnected ❌'}
            </span>
          </div>
          
          <div className="text-muted-foreground">
            Last Sync: {lastSync.toLocaleTimeString()}
          </div>
          
          <div className="flex items-center gap-2">
            <Database className={`w-4 h-4 ${cloudLogging ? 'text-success' : 'text-muted'}`} />
            <span className="text-muted-foreground">
              Cloud Logging: {cloudLogging ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};