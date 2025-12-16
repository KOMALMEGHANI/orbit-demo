import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Download } from 'lucide-react';
import { toast } from 'sonner';

interface TrendsViewProps {
  sumpLevel: number;
  flowRate: number;
  pressure: number;
}

export const TrendsView = ({ sumpLevel, flowRate, pressure }: TrendsViewProps) => {
  const [sumpData, setSumpData] = useState<Array<{ time: string; value: number }>>([]);
  const [flowData, setFlowData] = useState<Array<{ time: string; value: number }>>([]);
  const [pressureData, setPressureData] = useState<Array<{ time: string; value: number }>>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [viewMode, setViewMode] = useState<'realtime' | 'historical'>('realtime');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

      setSumpData(prev => [...prev.slice(-29), { time: timeStr, value: sumpLevel }]);
      setFlowData(prev => [...prev.slice(-29), { time: timeStr, value: flowRate }]);
      setPressureData(prev => [...prev.slice(-29), { time: timeStr, value: pressure }]);
    }, 500);

    return () => clearInterval(interval);
  }, [sumpLevel, flowRate, pressure]);

  const fetchHistoricalData = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    toast.info('Loading historical data...');

    try {
      const { data, error } = await supabase
        .from('scada_telemetry')
        .select('*')
        .gte('timestamp', startDate.toISOString())
        .lte('timestamp', endDate.toISOString())
        .order('timestamp', { ascending: true })
        .limit(1000);

      if (error) throw error;

      if (data && data.length > 0) {
        const sampleRate = Math.max(1, Math.floor(data.length / 200));
        const sampledData = data.filter((_, idx) => idx % sampleRate === 0);
        
        const formattedData = sampledData.map(row => ({
          time: format(new Date(row.timestamp), 'HH:mm:ss'),
          sumpLevel: Number(row.sump_level),
          flowRate: Number(row.flow_rate),
          pressure: Number(row.pressure),
          pump1: row.pump_1_status,
          pump2: row.pump_2_status,
          pump3: row.pump_3_status,
          pump4: row.pump_4_status,
        }));
        setHistoricalData(formattedData);
        setViewMode('historical');
        toast.success(`Loaded ${formattedData.length} historical records from ${data.length} total`);
      } else {
        toast.info('No data found for the selected date range');
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
      toast.error('Failed to fetch historical data');
    }
  };

  const exportToCSV = () => {
    const dataToExport = viewMode === 'historical' ? historicalData : 
      sumpData.map((item, idx) => ({
        time: item.time,
        sumpLevel: item.value,
        flowRate: flowData[idx]?.value || 0,
        pressure: pressureData[idx]?.value || 0,
      }));

    if (dataToExport.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = Object.keys(dataToExport[0]).join(',');
    const rows = dataToExport.map(row => Object.values(row).join(',')).join('\n');
    const csv = `${headers}\n${rows}`;
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scada-report-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully');
  };

  const displayData = viewMode === 'historical' ? historicalData : 
    sumpData.map((item, idx) => ({
      time: item.time,
      sumpLevel: item.value,
      flowRate: flowData[idx]?.value || 0,
      pressure: pressureData[idx]?.value || 0,
    }));

  return (
    <div className="h-full p-6 bg-background overflow-auto">
      <div className="bg-card p-6 rounded-lg border-2 border-border">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">TRENDS & REPORTS</h2>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'realtime' ? 'default' : 'outline'}
              onClick={() => setViewMode('realtime')}
            >
              Real-time
            </Button>
            <Button
              variant={viewMode === 'historical' ? 'default' : 'outline'}
              onClick={() => setViewMode('historical')}
            >
              Historical
            </Button>
            <Button variant="outline" onClick={exportToCSV}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {viewMode === 'historical' && (
          <div className="bg-muted/50 p-4 rounded-lg mb-6 flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                </PopoverContent>
              </Popover>
            </div>
            <Button onClick={fetchHistoricalData}>Load Historical Data</Button>
          </div>
        )}
        
        <div className="space-y-6">
          <div className="bg-white/80 p-4 rounded border border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Sump Level Trend (%)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="sumpLevel" stroke="#3b82f6" strokeWidth={2} name="Level %" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white/80 p-4 rounded border border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Flow Rate Trend (L/S)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 150]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="flowRate" stroke="#10b981" strokeWidth={2} name="Flow Rate" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white/80 p-4 rounded border border-border">
            <h3 className="text-lg font-bold text-foreground mb-3">Pressure Trend (Bar)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={displayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={[0, 5]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="pressure" stroke="#f59e0b" strokeWidth={2} name="Pressure" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {viewMode === 'historical' && historicalData.length > 0 && (
            <div className="bg-white/80 p-4 rounded border border-border">
              <h3 className="text-lg font-bold text-foreground mb-3">Data Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm text-muted-foreground">Total Records</p>
                  <p className="text-2xl font-bold">{historicalData.length}</p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm text-muted-foreground">Avg Sump Level</p>
                  <p className="text-2xl font-bold">
                    {(historicalData.reduce((sum, d) => sum + d.sumpLevel, 0) / historicalData.length).toFixed(1)}%
                  </p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm text-muted-foreground">Avg Flow Rate</p>
                  <p className="text-2xl font-bold">
                    {(historicalData.reduce((sum, d) => sum + d.flowRate, 0) / historicalData.length).toFixed(1)} L/S
                  </p>
                </div>
                <div className="p-3 bg-muted rounded">
                  <p className="text-sm text-muted-foreground">Avg Pressure</p>
                  <p className="text-2xl font-bold">
                    {(historicalData.reduce((sum, d) => sum + d.pressure, 0) / historicalData.length).toFixed(2)} Bar
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
