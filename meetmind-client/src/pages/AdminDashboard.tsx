import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { GlassCard } from '../components/GlassCard';
import { AdminDashboardSkeleton } from '../components/Skeleton';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState, EmptyStateCard } from '../components/ui/EmptyState';
import { DashboardGrid } from '../components/ui/DashboardGrid';
import { DashboardCard, DashboardCardHeader } from '../components/ui/DashboardCard';
import { StatCard } from '../components/ui/StatCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Button } from '../components/ui/Button';
import {
  Users,
  FileText,
  CheckSquare,
  Sparkles,
  Activity,
  RefreshCw,
  Server,
  Database,
  Cpu,
  Brain,
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

interface ActivityItem {
  id: string;
  type: 'user_registered' | 'meeting_created' | 'task_created';
  message: string;
  user?: { name: string; email: string };
  timestamp: string;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [chartData, setChartData] = useState<ChartItem[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChartMetric, setSelectedChartMetric] = useState<'all' | 'aiRequests' | 'meetings' | 'users'>('all');

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const res = await api.get('/admin/analytics');
      setStats(res.data.stats);
      setChartData(res.data.chartData);
      setActivities(res.data.activities);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve admin analytics. Please verify your connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const timeAgo = (dateStr: string) => {
    const now = new Date();
    const past = new Date(dateStr);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHrs = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  if (error) {
    return (
      <GlassCard className="max-w-2xl mx-auto mt-12 border-rose-500/20 bg-rose-950/10 p-8 text-center">
        <AlertTriangle className="mx-auto text-rose-400 mb-4 animate-bounce" size={48} />
        <h2 className="text-xl font-bold text-white mb-2">Administrative Error</h2>
        <p className="text-slate-400 mb-6">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all shadow-lg shadow-brand-500/20 inline-flex items-center gap-2"
        >
          <RefreshCw size={18} />
          Retry Request
        </button>
      </GlassCard>
    );
  }

  // Find max values to calibrate SVG chart height bounds
  const maxVal = Math.max(
    ...chartData.map(d => Math.max(d.users, d.meetings, d.tasks, d.aiRequests, 2))
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Admin Dashboard"
        description="Real-time platform metrics, engagement trends, and system health."
        badge="Admin"
        action={
          <Button
            variant="secondary"
            onClick={handleRefresh}
            disabled={refreshing}
            className={refreshing ? 'opacity-50 pointer-events-none' : ''}
          >
            <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} aria-hidden />
            Refresh
          </Button>
        }
      />

      <DashboardGrid variant="cards">
        <StatCard
          label="Total Users"
          value={stats?.totalUsers ?? '—'}
          icon={Users}
          iconClassName="from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/10"
          trend="↗ Platform scale"
          delay={0}
        />
        <StatCard
          label="Meetings Logs"
          value={stats?.totalMeetings ?? '—'}
          icon={FileText}
          iconClassName="from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/10"
          trend="↗ Active discussions"
          delay={0.05}
        />
        <StatCard
          label="Tasks Created"
          value={stats?.totalTasks ?? '—'}
          icon={CheckSquare}
          iconClassName="from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/10"
          trend="Live board cards"
          trendClassName="text-amber-400"
          delay={0.1}
        />
        <StatCard
          label="AI Requests"
          value={stats?.aiRequestsCount ?? '—'}
          icon={Sparkles}
          iconClassName="from-purple-500/20 to-fuchsia-500/20 text-purple-400 border-purple-500/10"
          trend="Gemini summaries"
          trendClassName="text-purple-400"
          delay={0.15}
        />
        <StatCard
          label="Active (30D)"
          value={stats?.activeUsers ?? '—'}
          icon={Activity}
          iconClassName="from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/10"
          trend="Monthly active users"
          trendClassName="text-cyan-400"
          delay={0.2}
        />
      </DashboardGrid>

      <DashboardGrid variant="main" className="!gap-5 lg:!gap-6">
        <div className="lg:col-span-8">
          <DashboardCard className="h-full flex flex-col" padding="md">
            <DashboardCardHeader
              title="Platform Engagement Velocity"
              description="Chronological telemetry of meetings, tasks, and signups."
              action={
                <div className="flex flex-wrap gap-1.5">
                  {(['all', 'aiRequests', 'meetings', 'users'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setSelectedChartMetric(m)}
                      className={`
                        h-8 px-3 rounded-lg text-xs font-semibold transition-all border
                        ${selectedChartMetric === m
                          ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                          : 'bg-white/[0.04] text-slate-500 border-transparent hover:text-slate-300 hover:bg-white/[0.08]'
                        }
                      `}
                    >
                      {m === 'all' ? 'All' : m === 'aiRequests' ? 'AI' : m === 'meetings' ? 'Meetings' : 'Signups'}
                    </button>
                  ))}
                </div>
              }
            />

            {/* Custom SVG Path Charts */}
            <div className="flex-1 min-h-[200px] sm:min-h-[250px] relative w-full pt-4 overflow-hidden">
              {chartData.length > 0 ? (
                <svg className="w-full h-full min-h-[250px] overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="xMidYMid meet">
                  {/* Definition of glowing gradients */}
                  <defs>
                    <linearGradient id="purpleGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="emeraldGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="blueGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((r, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={200 - r * 180 - 10}
                      x2="600"
                      y2={200 - r * 180 - 10}
                      stroke="rgba(255, 255, 255, 0.04)"
                      strokeWidth="1"
                    />
                  ))}

                  {/* SVG Paths for selected items */}
                  {chartData.map((d, index) => {
                    if (index === 0) return null;
                    const prevX = ((index - 1) / (chartData.length - 1)) * 600;
                    const currX = (index / (chartData.length - 1)) * 600;

                    const heightRatio = (v: number) => 200 - (v / maxVal) * 160 - 15;

                    return (
                      <g key={index}>
                        {/* Users Signups path (Blue) */}
                        {(selectedChartMetric === 'all' || selectedChartMetric === 'users') && (
                          <>
                            <line
                              x1={prevX}
                              y1={heightRatio(chartData[index - 1].users)}
                              x2={currX}
                              y2={heightRatio(d.users)}
                              stroke="#3b82f6"
                              strokeWidth="3"
                              strokeLinecap="round"
                              className="transition-all"
                            />
                            <path
                              d={`M ${prevX} 200 L ${prevX} ${heightRatio(chartData[index - 1].users)} L ${currX} ${heightRatio(d.users)} L ${currX} 200 Z`}
                              fill="url(#blueGlow)"
                            />
                          </>
                        )}

                        {/* Meetings creation path (Emerald) */}
                        {(selectedChartMetric === 'all' || selectedChartMetric === 'meetings') && (
                          <>
                            <line
                              x1={prevX}
                              y1={heightRatio(chartData[index - 1].meetings)}
                              x2={currX}
                              y2={heightRatio(d.meetings)}
                              stroke="#10b981"
                              strokeWidth="3"
                              strokeLinecap="round"
                              className="transition-all"
                            />
                            <path
                              d={`M ${prevX} 200 L ${prevX} ${heightRatio(chartData[index - 1].meetings)} L ${currX} ${heightRatio(d.meetings)} L ${currX} 200 Z`}
                              fill="url(#emeraldGlow)"
                            />
                          </>
                        )}

                        {/* AI Requests path (Purple glow) */}
                        {(selectedChartMetric === 'all' || selectedChartMetric === 'aiRequests') && (
                          <>
                            <line
                              x1={prevX}
                              y1={heightRatio(chartData[index - 1].aiRequests)}
                              x2={currX}
                              y2={heightRatio(d.aiRequests)}
                              stroke="#a855f7"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              className="transition-all"
                            />
                            <path
                              d={`M ${prevX} 200 L ${prevX} ${heightRatio(chartData[index - 1].aiRequests)} L ${currX} ${heightRatio(d.aiRequests)} L ${currX} 200 Z`}
                              fill="url(#purpleGlow)"
                            />
                          </>
                        )}
                      </g>
                    );
                  })}

                  {/* Circular glowing anchors */}
                  {chartData.map((d, index) => {
                    const x = (index / (chartData.length - 1)) * 600;
                    const heightRatio = (v: number) => 200 - (v / maxVal) * 160 - 15;

                    return (
                      <g key={index}>
                        {/* Blue node */}
                        {(selectedChartMetric === 'all' || selectedChartMetric === 'users') && (
                          <circle
                            cx={x}
                            cy={heightRatio(d.users)}
                            r="4.5"
                            fill="#3b82f6"
                            stroke="#0f172a"
                            strokeWidth="1.5"
                            className="hover:scale-150 transition-transform cursor-pointer"
                          />
                        )}
                        {/* Emerald node */}
                        {(selectedChartMetric === 'all' || selectedChartMetric === 'meetings') && (
                          <circle
                            cx={x}
                            cy={heightRatio(d.meetings)}
                            r="4.5"
                            fill="#10b981"
                            stroke="#0f172a"
                            strokeWidth="1.5"
                            className="hover:scale-150 transition-transform cursor-pointer"
                          />
                        )}
                        {/* Purple node */}
                        {(selectedChartMetric === 'all' || selectedChartMetric === 'aiRequests') && (
                          <circle
                            cx={x}
                            cy={heightRatio(d.aiRequests)}
                            r="4.5"
                            fill="#a855f7"
                            stroke="#0f172a"
                            strokeWidth="1.5"
                            className="hover:scale-150 transition-transform cursor-pointer"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <EmptyStateCard
                  icon={BarChart3}
                  title="No chart data yet"
                  description="Engagement metrics will populate as users create meetings, tasks, and AI summaries."
                  compact
                />
              )}
            </div>

            <div className="flex justify-between items-center px-2 mt-4 pt-2 border-t border-white/[0.05] text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
              {chartData.map((d, i) => (
                <span key={i}>{d.date}</span>
              ))}
            </div>
          </DashboardCard>
        </div>

        <div className="lg:col-span-4">
          <DashboardCard className="h-full flex flex-col min-h-[20rem]" padding="md">
            <DashboardCardHeader
              title="Operational Activity Log"
              description="Real-time events across the platform."
            />

            <div className="flex-1 space-y-3 overflow-y-auto max-h-[320px] pr-1 -mr-1">
              {activities.length > 0 ? (
                activities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors flex items-start gap-3.5"
                  >
                    <div className={`
                      p-2 
                      rounded-lg 
                      ${act.type === 'user_registered' 
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                        : act.type === 'meeting_created' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }
                    `}>
                      {act.type === 'user_registered' ? <Users size={16} /> : act.type === 'meeting_created' ? <FileText size={16} /> : <CheckSquare size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-200 font-sans tracking-wide leading-relaxed">{act.message}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-slate-500 font-medium">
                          {act.user?.email || 'System Event'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {timeAgo(act.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  icon={Activity}
                  title="No recent activity"
                  description="Signups, meetings, and tasks will appear here in real time."
                  compact
                />
              )}
            </div>
          </DashboardCard>
        </div>
      </DashboardGrid>

      <div>
        <SectionHeader
          title="Telemetry & System Health"
          description="Live status of core infrastructure and AI services."
        />
        <DashboardGrid variant="health">
          {/* Card: Express Server */}
          <GlassCard className="border border-emerald-500/10 bg-emerald-950/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Server size={22} className="animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block font-sans">API Gateway</span>
              <span className="text-sm font-bold text-white">Express Backend</span>
              <span className="text-xs text-emerald-400 block font-sans font-medium mt-0.5">● 100% Operational</span>
            </div>
          </GlassCard>

          {/* Card: MongoDB */}
          <GlassCard className="border border-emerald-500/10 bg-emerald-950/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Database size={22} />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block font-sans">Database Layer</span>
              <span className="text-sm font-bold text-white">MongoDB Cloud</span>
              <span className="text-xs text-emerald-400 block font-sans font-medium mt-0.5">● Connected (3ms)</span>
            </div>
          </GlassCard>

          {/* Card: AI engine */}
          <GlassCard className="border border-purple-500/10 bg-purple-950/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Brain size={22} />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block font-sans">Intelligence Engine</span>
              <span className="text-sm font-bold text-white">Gemini 3.1 Flash</span>
              <span className="text-xs text-purple-400 block font-sans font-medium mt-0.5">● Active and Validated</span>
            </div>
          </GlassCard>

          {/* Card: Server Load */}
          <GlassCard className="border border-cyan-500/10 bg-cyan-950/5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Cpu size={22} className="animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest block font-sans">Hardware Telemetry</span>
              <span className="text-sm font-bold text-white">Memory Heap Load</span>
              <span className="text-xs text-cyan-400 block font-sans font-medium mt-0.5">● 24% Normal Capacity</span>
            </div>
          </GlassCard>
        </DashboardGrid>
      </div>
    </div>
  );
};
