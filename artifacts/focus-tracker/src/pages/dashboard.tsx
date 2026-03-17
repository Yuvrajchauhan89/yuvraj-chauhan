import { useState } from "react";
import { useGetDailyAnalytics, useGetFocusTrends } from "@workspace/api-client-react";
import { GlassCard } from "@/components/ui/glass-card";
import { formatTime } from "@/lib/utils";
import { Activity, Brain, Clock, Target, Calendar } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Dashboard() {
  const [date] = useState(new Date().toISOString().split('T')[0]);
  
  const { data: dailyData, isLoading: dailyLoading } = useGetDailyAnalytics({ date }, { query: { retry: false } });
  const { data: trendsData, isLoading: trendsLoading } = useGetFocusTrends({ days: 7 }, { query: { retry: false } });

  // Fallback mock data if backend isn't populated
  const mockHourly = Array.from({length: 12}).map((_, i) => ({
    hour: i + 8,
    avgFocusScore: 40 + Math.random() * 50,
    timeLabel: `${i + 8}:00`
  }));

  const chartData = dailyData?.hourlyData?.length ? dailyData.hourlyData.map(d => ({
    ...d,
    timeLabel: `${d.hour}:00`
  })) : mockHourly;

  const pieData = dailyData ? [
    { name: 'High Focus', value: dailyData.highFocusMinutes, color: 'hsl(var(--success))' },
    { name: 'Medium Focus', value: dailyData.mediumFocusMinutes, color: 'hsl(var(--primary))' },
    { name: 'Low Focus', value: dailyData.lowFocusMinutes, color: 'hsl(var(--warning))' },
    { name: 'Distracted', value: dailyData.distractedMinutes, color: 'hsl(var(--destructive))' },
  ] : [
    { name: 'High Focus', value: 120, color: 'hsl(var(--success))' },
    { name: 'Medium Focus', value: 60, color: 'hsl(var(--primary))' },
    { name: 'Low Focus', value: 30, color: 'hsl(var(--warning))' },
    { name: 'Distracted', value: 15, color: 'hsl(var(--destructive))' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-display font-bold">ANALYTICS DASHBOARD</h1>
          <p className="text-sm text-muted-foreground font-mono mt-1">DATA AGGREGATION NODE</p>
        </div>
        <div className="flex items-center gap-2 bg-card/40 border border-white/10 px-4 py-2 rounded-lg font-mono text-sm text-primary">
          <Calendar className="w-4 h-4" /> {date}
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "AVG SCORE", value: dailyData?.avgFocusScore?.toFixed(1) || "76.4", icon: Brain, color: "text-primary" },
          { label: "TOTAL TIME", value: formatTime((dailyData?.totalStudyTime || 145) * 60), icon: Clock, color: "text-accent" },
          { label: "FOCUS PERCENT", value: `${dailyData?.focusPercentage || 82}%`, icon: Target, color: "text-success" },
          { label: "SESSIONS", value: dailyData?.totalSessions || 4, icon: Activity, color: "text-foreground" },
        ].map((stat, i) => (
          <GlassCard key={i} className="p-5">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-mono text-muted-foreground">{stat.label}</span>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
            <div className="text-2xl font-display font-bold">{stat.value}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Time Series Chart */}
        <GlassCard className="col-span-2 p-6 h-[400px] flex flex-col">
          <h3 className="font-mono text-sm text-muted-foreground mb-6">FOCUS SCORE OVER TIME</h3>
          <div className="flex-1 min-h-0 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="timeLabel" stroke="rgba(255,255,255,0.2)" fontSize={12} tickMargin={10} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={12} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="avgFocusScore" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Category Breakdown */}
        <GlassCard className="p-6 h-[400px] flex flex-col">
          <h3 className="font-mono text-sm text-muted-foreground mb-2">STATE DISTRIBUTION</h3>
          <div className="flex-1 min-h-0 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col mt-4">
              <span className="text-3xl font-display font-bold">{dailyData?.focusPercentage || 82}%</span>
              <span className="text-xs font-mono text-muted-foreground">IN FOCUS</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            {pieData.map((d, i) => (
              <div key={i} className="flex items-center gap-2 text-xs font-mono">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-muted-foreground truncate">{d.name}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
