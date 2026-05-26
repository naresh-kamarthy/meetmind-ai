import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { AdminDashboardSkeleton } from '../components/Skeleton';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import {
  TrendingUp,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';

interface Stats {
  totalUsers: number;
  totalMeetings: number;
  totalTasks: number;
  aiRequestsCount: number;
  activeUsers: number;
}

interface ChartItem {
  date: string;
  users: number;
  meetings: number;
  tasks: number;
  aiRequests: number;
}

export const AdminAnalytics: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const res = await api.get('/admin/analytics');
      setStats(res.data.stats);
      setChartData(res.data.chartData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve administrative analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  if (error) {
    return (
      <GlassCard className="max-w-2xl mx-auto mt-12 border-rose-500/20 bg-rose-950/10 p-8 text-center">
        <AlertTriangle className="mx-auto text-rose-400 mb-4 animate-bounce" size={48} />
        <h2 className="text-xl font-bold text-white mb-2">Telemetry Error</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all inline-flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Retry Connection
        </button>
      </GlassCard>
    );
  }



  const hasChartData = chartData.length > 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Analytics"
        description="Deep-dive metrics on adoption, workspace activity, and AI usage."
        badge="Admin"
        action={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className={`btn-secondary ${refreshing ? 'opacity-50 pointer-events-none' : ''}`}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} aria-hidden />
            Sync
          </button>
        }
      />

      {/* Grid: Extended Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Card: Active user percentage */}
        <GlassCard className="border border-emerald-500/10 bg-emerald-950/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-emerald-500/10 rounded-full blur-xl" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-sans">Platform Active Ratio</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-white">
              {stats?.totalUsers ? Math.min(100, Math.round((stats.activeUsers / stats.totalUsers) * 100)) : 0}%
            </span>
            <span className="text-xs text-emerald-400 font-semibold inline-flex items-center gap-0.5 font-sans">
              <TrendingUp size={12} />
              Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-sans">Percentage of members active in the last 30 days.</p>
        </GlassCard>

        {/* Card: Meetings per User */}
        <GlassCard className="border border-blue-500/10 bg-blue-950/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-blue-500/10 rounded-full blur-xl" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-sans">Meetings Velocity</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-white">
              {stats?.totalUsers ? (stats.totalMeetings / stats.totalUsers).toFixed(1) : 0}
            </span>
            <span className="text-xs text-slate-500 font-medium font-sans">notes/user</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-sans">Average number of meetings recorded per individual.</p>
        </GlassCard>

        {/* Card: Task Completion Ratio */}
        <GlassCard className="border border-amber-500/10 bg-amber-950/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-amber-500/10 rounded-full blur-xl" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-sans">Extract Productivity</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-white">
              {stats?.totalMeetings ? (stats.totalTasks / stats.totalMeetings).toFixed(1) : 0}
            </span>
            <span className="text-xs text-slate-500 font-medium font-sans">tasks/meeting</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-sans">Average volume of action items extracted per logging session.</p>
        </GlassCard>

        {/* Card: AI Penetration Ratio */}
        <GlassCard className="border border-purple-500/10 bg-purple-950/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-purple-500/10 rounded-full blur-xl" />
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-sans">AI Leverage Index</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-extrabold text-purple-400">
              {stats?.totalMeetings ? Math.min(100, Math.round((stats.aiRequestsCount / (stats.totalMeetings * 3)) * 100)) : 0}%
            </span>
            <span className="text-xs text-purple-400 font-semibold inline-flex items-center gap-0.5 font-sans">
              <Sparkles size={12} />
              Leveraged
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 font-sans">Percentage of meeting documents using active AI summaries/tasks.</p>
        </GlassCard>
      </div>

      {/* Grid: Charts Visualization Panels */}
      {!hasChartData ? (
        <GlassCard>
          <EmptyState
            icon={BarChart3}
            title="No analytics data yet"
            description="Charts will populate as users register and create meetings and tasks."
          />
        </GlassCard>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        <GlassCard>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white tracking-wide">Member Acquisition Velocity</h3>
            <p className="text-xs text-slate-400">Chronological analysis of registration frequencies over the past 7 days.</p>
          </div>
          <div className="h-[220px] w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
              <defs>
                <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              {[0, 0.5, 1].map((r, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={150 - r * 130 - 10}
                  x2="500"
                  y2={150 - r * 130 - 10}
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1"
                />
              ))}

              {/* Area path */}
              {chartData.length > 0 && (
                <>
                  <path
                    d={`
                      M 0 150
                      ${chartData.map((d, index) => {
                        const x = (index / (chartData.length - 1)) * 500;
                        const y = 150 - (d.users / Math.max(...chartData.map(c => c.users), 2)) * 110 - 15;
                        return `L ${x} ${y}`;
                      }).join(' ')}
                      L 500 150 Z
                    `}
                    fill="url(#areaBlue)"
                  />
                  <path
                    d={chartData.map((d, index) => {
                      const x = (index / (chartData.length - 1)) * 500;
                      const y = 150 - (d.users / Math.max(...chartData.map(c => c.users), 2)) * 110 - 15;
                      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </>
              )}

              {/* Nodes */}
              {chartData.map((d, index) => {
                const x = (index / (chartData.length - 1)) * 500;
                const y = 150 - (d.users / Math.max(...chartData.map(c => c.users), 2)) * 110 - 15;

                return (
                  <g key={index}>
                    <circle
                      cx={x}
                      cy={y}
                      r="4"
                      fill="#3b82f6"
                      stroke="#090d1a"
                      strokeWidth="1.5"
                    />
                    <text
                      x={x}
                      y={y - 8}
                      fill="#94a3b8"
                      fontSize="8"
                      fontWeight="bold"
                      textAnchor="middle"
                      className="font-sans"
                    >
                      {d.users}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <div className="flex justify-between items-center mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-sans px-2">
            {chartData.map((d, i) => <span key={i}>{d.date}</span>)}
          </div>
        </GlassCard>

        {/* Panel 2: Meetings vs Tasks Created (SVG Bar Chart) */}
        <GlassCard>
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white tracking-wide">Workspace Activity Composition</h3>
            <p className="text-xs text-slate-400">Comparison of newly logged meetings notes versus Kanbans created.</p>
          </div>
          <div className="h-[220px] w-full pt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
              {/* Grid Lines */}
              {[0, 0.5, 1].map((r, i) => (
                <line
                  key={i}
                  x1="0"
                  y1={150 - r * 130 - 10}
                  x2="500"
                  y2={150 - r * 130 - 10}
                  stroke="rgba(255,255,255,0.03)"
                  strokeWidth="1"
                />
              ))}

              {/* Grouped Bar render */}
              {chartData.map((d, index) => {
                const groupWidth = 500 / chartData.length;
                const baseX = index * groupWidth + groupWidth / 2 - 15;

                const maxChartVal = Math.max(
                  ...chartData.map(c => Math.max(c.meetings, c.tasks, 2))
                );

                const getBarHeight = (v: number) => (v / maxChartVal) * 110;

                return (
                  <g key={index}>
                    {/* Meeting Bar (Emerald) */}
                    <rect
                      x={baseX}
                      y={150 - getBarHeight(d.meetings) - 15}
                      width="12"
                      height={getBarHeight(d.meetings)}
                      rx="3"
                      fill="#10b981"
                      className="transition-all hover:fill-emerald-400 cursor-pointer"
                    />

                    {/* Task Bar (Orange) */}
                    <rect
                      x={baseX + 15}
                      y={150 - getBarHeight(d.tasks) - 15}
                      width="12"
                      height={getBarHeight(d.tasks)}
                      rx="3"
                      fill="#f97316"
                      className="transition-all hover:fill-orange-400 cursor-pointer"
                    />
                  </g>
                );
              })}
            </svg>
          </div>
          {/* Key & Date labels */}
          <div className="flex justify-between items-center mt-4 px-2">
            <div className="flex gap-4 mt-1 text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-sans">
              {chartData.map((d, i) => <span key={i}>{d.date}</span>)}
            </div>
            <div className="flex gap-4 text-xs font-semibold font-sans">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
                Meetings
              </span>
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="w-3 h-3 rounded bg-orange-500 inline-block" />
                Tasks
              </span>
            </div>
          </div>
        </GlassCard>
      </div>
      )}

      {hasChartData && (
      <div className="mt-2 sm:mt-4">
        <GlassCard>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Artificial Intelligence Processor Performance</h3>
              <p className="text-xs text-slate-400 mt-0.5">Telemetries covering summary processing load, email compilers, and smart task extractions.</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-sans font-bold flex items-center gap-2">
              <Sparkles size={16} />
              AI Core Status: Ready
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Left stats list */}
            <div className="space-y-6">
              <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-sans block">Total AI Operations</span>
                <span className="text-3xl font-extrabold text-white block">{stats?.aiRequestsCount}</span>
                <p className="text-xs text-slate-400 pt-1 font-sans">Aggregated summarizations, emails compiled, and extractions processed.</p>
              </div>

              <div className="p-4 rounded-xl border border-white/5 bg-white/5 space-y-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider font-sans block">Average AI Core load</span>
                <span className="text-3xl font-extrabold text-purple-400 block">Low Latency</span>
                <p className="text-xs text-slate-400 pt-1 font-sans">Fast text-stream compilations on Gemini 3.1 architecture.</p>
              </div>
            </div>

            {/* Central glowing SVG AI requests timeline */}
            <div className="lg:col-span-2 h-[220px]">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaPurple" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#c084fc" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#c084fc" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                {/* Horizontal lines */}
                {[0, 0.5, 1].map((r, i) => (
                  <line
                    key={i}
                    x1="0"
                    y1={150 - r * 130 - 10}
                    x2="500"
                    y2={150 - r * 130 - 10}
                    stroke="rgba(255,255,255,0.03)"
                    strokeWidth="1"
                  />
                ))}

                {/* Area path */}
                {chartData.length > 0 && (
                  <>
                    <path
                      d={`
                        M 0 150
                        ${chartData.map((d, index) => {
                          const x = (index / (chartData.length - 1)) * 500;
                          const y = 150 - (d.aiRequests / Math.max(...chartData.map(c => c.aiRequests), 2)) * 110 - 15;
                          return `L ${x} ${y}`;
                        }).join(' ')}
                        L 500 150 Z
                      `}
                      fill="url(#areaPurple)"
                    />
                    <path
                      d={chartData.map((d, index) => {
                        const x = (index / (chartData.length - 1)) * 500;
                        const y = 150 - (d.aiRequests / Math.max(...chartData.map(c => c.aiRequests), 2)) * 110 - 15;
                        return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#c084fc"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </>
                )}

                {/* Nodes */}
                {chartData.map((d, index) => {
                  const x = (index / (chartData.length - 1)) * 500;
                  const y = 150 - (d.aiRequests / Math.max(...chartData.map(c => c.aiRequests), 2)) * 110 - 15;

                  return (
                    <g key={index}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#c084fc"
                        stroke="#090d1a"
                        strokeWidth="1.5"
                      />
                      <text
                        x={x}
                        y={y - 8}
                        fill="#c084fc"
                        fontSize="8"
                        fontWeight="bold"
                        textAnchor="middle"
                        className="font-sans"
                      >
                        {d.aiRequests}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="flex justify-between items-center mt-4 text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-sans px-2">
                {chartData.map((d, i) => <span key={i}>{d.date}</span>)}
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
      )}
    </div>
  );
};
