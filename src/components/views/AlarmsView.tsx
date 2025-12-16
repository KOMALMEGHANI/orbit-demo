import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface AlarmHistoryRecord {
  id: string;
  alarm_id: string;
  message: string;
  severity: 'info' | 'warning' | 'high' | 'critical';
  timestamp: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
  acknowledged_by: string | null;
  cleared: boolean;
  cleared_at: string | null;
}

export const AlarmsView = () => {
  const [alarms, setAlarms] = useState<AlarmHistoryRecord[]>([]);
  const [filteredAlarms, setFilteredAlarms] = useState<AlarmHistoryRecord[]>([]);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

  // Fetch alarms from database
  const fetchAlarms = async () => {
    try {
      const { data, error } = await supabase
        .from('alarm_history')
        .select('*')
        .order('timestamp', { ascending: sortOrder === 'asc' });

      if (error) throw error;
      setAlarms(data || []);
    } catch (error) {
      console.error('Error fetching alarms:', error);
      toast.error('Failed to load alarm history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlarms();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('alarm_history_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alarm_history'
        },
        () => {
          fetchAlarms();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sortOrder]);

  // Apply filters
  useEffect(() => {
    let filtered = [...alarms];

    // Severity filter
    if (severityFilter !== 'all') {
      filtered = filtered.filter(alarm => alarm.severity === severityFilter);
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(alarm => !alarm.cleared && !alarm.acknowledged);
    } else if (statusFilter === 'acknowledged') {
      filtered = filtered.filter(alarm => alarm.acknowledged);
    } else if (statusFilter === 'cleared') {
      filtered = filtered.filter(alarm => alarm.cleared);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(alarm => 
        alarm.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alarm.alarm_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAlarms(filtered);
  }, [alarms, severityFilter, statusFilter, searchTerm]);

  // Acknowledge alarm
  const handleAcknowledge = async (alarmId: string) => {
    try {
      const { error } = await supabase
        .from('alarm_history')
        .update({
          acknowledged: true,
          acknowledged_at: new Date().toISOString(),
          acknowledged_by: 'Operator'
        })
        .eq('id', alarmId);

      if (error) throw error;
      toast.success('Alarm acknowledged');
      fetchAlarms();
    } catch (error) {
      console.error('Error acknowledging alarm:', error);
      toast.error('Failed to acknowledge alarm');
    }
  };

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-600 text-white hover:bg-red-700';
      case 'high':
        return 'bg-orange-500 text-white hover:bg-orange-600';
      case 'warning':
        return 'bg-yellow-500 text-gray-900 hover:bg-yellow-600';
      case 'info':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="h-full p-6 bg-background overflow-auto">
      <div className="bg-card p-6 rounded-lg border-2 border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">ALARM HISTORY</h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            >
              Sort: {sortOrder === 'asc' ? '↑ Oldest First' : '↓ Newest First'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchAlarms}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Search
            </label>
            <Input
              placeholder="Search alarms..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Severity
            </label>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Status
            </label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="cleared">Cleared</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {filteredAlarms.length} of {alarms.length} alarms
        </div>

        {/* Alarms Table */}
        <div className="bg-white/80 rounded border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-foreground text-white">
                  <th className="px-4 py-3 text-left text-sm font-bold">TIMESTAMP</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">SEVERITY</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">MESSAGE</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">STATUS</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">ACTION</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      Loading alarms...
                    </td>
                  </tr>
                ) : filteredAlarms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No alarms found
                    </td>
                  </tr>
                ) : (
                  filteredAlarms.map((alarm) => (
                    <tr 
                      key={alarm.id} 
                      className={`border-t border-border hover:bg-muted/20 transition-colors ${
                        !alarm.cleared && !alarm.acknowledged ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="px-4 py-3 text-xs font-mono">
                        {formatTimestamp(alarm.timestamp)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getSeverityColor(alarm.severity)}>
                          {alarm.severity.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">
                        {alarm.message}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {alarm.cleared && (
                            <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                              ✓ Cleared
                            </Badge>
                          )}
                          {alarm.acknowledged && (
                            <Badge variant="outline" className="text-xs bg-blue-100 text-blue-800 border-blue-300">
                              ✓ ACK
                            </Badge>
                          )}
                          {!alarm.cleared && !alarm.acknowledged && (
                            <Badge variant="outline" className="text-xs bg-red-100 text-red-800 border-red-300">
                              ⚠ Active
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {!alarm.acknowledged && (
                          <Button
                            size="sm"
                            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900"
                            onClick={() => handleAcknowledge(alarm.id)}
                          >
                            ACK
                          </Button>
                        )}
                        {alarm.acknowledged && alarm.acknowledged_at && (
                          <div className="text-xs text-muted-foreground">
                            ACK at {formatTimestamp(alarm.acknowledged_at)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="bg-red-100 border-2 border-red-300 rounded p-3">
            <div className="text-xs font-semibold text-red-800">CRITICAL</div>
            <div className="text-2xl font-bold text-red-900">
              {alarms.filter(a => a.severity === 'critical' && !a.cleared).length}
            </div>
          </div>
          <div className="bg-orange-100 border-2 border-orange-300 rounded p-3">
            <div className="text-xs font-semibold text-orange-800">HIGH</div>
            <div className="text-2xl font-bold text-orange-900">
              {alarms.filter(a => a.severity === 'high' && !a.cleared).length}
            </div>
          </div>
          <div className="bg-yellow-100 border-2 border-yellow-300 rounded p-3">
            <div className="text-xs font-semibold text-yellow-800">WARNING</div>
            <div className="text-2xl font-bold text-yellow-900">
              {alarms.filter(a => a.severity === 'warning' && !a.cleared).length}
            </div>
          </div>
          <div className="bg-blue-100 border-2 border-blue-300 rounded p-3">
            <div className="text-xs font-semibold text-blue-800">ACKNOWLEDGED</div>
            <div className="text-2xl font-bold text-blue-900">
              {alarms.filter(a => a.acknowledged).length}
            </div>
          </div>
          <div className="bg-green-100 border-2 border-green-300 rounded p-3">
            <div className="text-xs font-semibold text-green-800">CLEARED</div>
            <div className="text-2xl font-bold text-green-900">
              {alarms.filter(a => a.cleared).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};