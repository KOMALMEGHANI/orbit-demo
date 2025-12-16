import { LayoutDashboard, Settings, TrendingUp, AlertTriangle, Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'pump-control', icon: Gauge, label: 'Pump Control' },
    { id: 'trends', icon: TrendingUp, label: 'Trends' },
    { id: 'alarms', icon: AlertTriangle, label: 'Alarms' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="w-20 bg-sidebar border-r border-sidebar-border flex flex-col items-center py-6 gap-4">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        
        return (
          <Button
            key={item.id}
            variant="ghost"
            size="icon"
            onClick={() => onViewChange(item.id)}
            className={`
              w-14 h-14 relative group
              ${isActive 
                ? 'bg-sidebar-accent text-accent shadow-glow-cyan' 
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-accent'
              }
            `}
            title={item.label}
          >
            <Icon className="w-6 h-6" />
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-accent rounded-r-full" />
            )}
          </Button>
        );
      })}
    </aside>
  );
};
