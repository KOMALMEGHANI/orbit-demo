export const SettingsView = () => {
  return (
    <div className="h-full p-6 bg-background">
      <div className="bg-card p-6 rounded-lg border-2 border-border">
        <h2 className="text-2xl font-bold text-foreground mb-6">SETTINGS</h2>
        
        <div className="space-y-6">
          <div className="bg-white/80 p-4 rounded border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">System Configuration</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground">Auto Start Level:</span>
                <input
                  type="number"
                  defaultValue={80}
                  className="w-20 px-2 py-1 border border-border rounded text-sm text-center"
                />
                <span className="text-sm">%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground">Auto Stop Level:</span>
                <input
                  type="number"
                  defaultValue={30}
                  className="w-20 px-2 py-1 border border-border rounded text-sm text-center"
                />
                <span className="text-sm">%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground">High Level Alarm:</span>
                <input
                  type="number"
                  defaultValue={90}
                  className="w-20 px-2 py-1 border border-border rounded text-sm text-center"
                />
                <span className="text-sm">%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground">Low Level Alarm:</span>
                <input
                  type="number"
                  defaultValue={20}
                  className="w-20 px-2 py-1 border border-border rounded text-sm text-center"
                />
                <span className="text-sm">%</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/80 p-4 rounded border border-border">
            <h3 className="text-lg font-bold text-foreground mb-4">Communication Settings</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground">MQTT Server:</span>
                <input
                  type="text"
                  defaultValue="mqtt.example.com"
                  className="flex-1 ml-4 px-2 py-1 border border-border rounded text-sm"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground">Port:</span>
                <input
                  type="number"
                  defaultValue={1883}
                  className="w-24 px-2 py-1 border border-border rounded text-sm text-center"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-muted-foreground">Update Interval:</span>
                <input
                  type="number"
                  defaultValue={1}
                  className="w-20 px-2 py-1 border border-border rounded text-sm text-center"
                />
                <span className="text-sm">seconds</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="flex-1 bg-success text-white px-4 py-2 text-sm font-bold rounded hover:opacity-90">
              SAVE CHANGES
            </button>
            <button className="flex-1 bg-muted text-foreground px-4 py-2 text-sm font-bold rounded hover:opacity-90">
              RESET TO DEFAULT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
