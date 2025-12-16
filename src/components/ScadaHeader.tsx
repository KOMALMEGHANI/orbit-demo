import { Activity, Wifi, WifiOff, Database, AlertTriangle } from "lucide-react";

interface ScadaHeaderProps {
  isConnected: boolean;
  isStale?: boolean;
  lastSync: Date;
  cloudLogging: boolean;
}

export const ScadaHeader = ({ 
  isConnected, 
  isStale = false, 
  lastSync, 
  cloudLogging 
}: ScadaHeaderProps) => {
  // Determine connection status
  const getConnectionStatus = () => {
    if (!isConnected) {
      return {
        icon: <WifiOff className="w-4 h-4 text-destructive" />,
        text: 'Disconnected',
        className: 'text-destructive',
      };
    }
    if (isStale) {
      return {
        icon: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
        text: 'Stale Data',
        className: 'text-yellow-500',
      };
    }
    return {
      icon: <Wifi className="w-4 h-4 text-success" />,
      text: 'Connected',
      className: 'text-success',
    };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8 text-accent" />
          <h1 className="text-2xl font-bold text-foreground tracking-wide">
            WTP INTAKE SCADA - REALTIME MONITORING
          </h1>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            {connectionStatus.icon}
            <span className={connectionStatus.className}>
              {connectionStatus.text}
            </span>
          </div>
          
          {/* Last Sync */}
          <div className="text-muted-foreground">
            Last Sync: {lastSync.toLocaleTimeString()}
          </div>
          
          {/* Cloud Logging */}
          <div className="flex items-center gap-2">
            <Database className={`w-4 h-4 ${cloudLogging ? 'text-success' : 'text-muted'}`} />
            <span className="text-muted-foreground">
              Cloud: {cloudLogging ? 'ON' : 'OFF'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
