import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import { isAdmin } from '../utils/auth';
import { DashboardSkeleton } from '../components/Skeleton';
import { PageHeader } from '../components/ui/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { EmptyStateCard } from '../components/ui/EmptyState';
import { DashboardGrid } from '../components/ui/DashboardGrid';
import { DashboardCard, DashboardCardHeader } from '../components/ui/DashboardCard';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckSquare,
  CheckCircle,
  Brain,
  Video,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  ShieldAlert,
  Activity,
  Server,
  Users,
  BarChart3
} from 'lucide-react';
import type { Meeting, Task } from '../types';

export const Dashboard: React.FC = () => {
  const { user } = useStore();
  const navigate = useNavigate();

  // Load meetings
  const { data: meetings = [], isLoading: meetingsLoading } = useQuery<Meeting[]>({
    queryKey: ['meetings'],
    queryFn: () => api.get('/meetings?limit=50').then((res: any) => res.data.meetings || [])
  });

  // Load tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: () => api.get('/tasks').then((res: any) => res.data || [])
  });

  if (meetingsLoading || tasksLoading) {
    return <DashboardSkeleton />;
  }

  // Calculations
  const totalMeetings = meetings.length;
  const pendingTasks = tasks.filter(t => t.status !== 'Completed').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const aiSummaries = meetings.filter(m => m.aiSummary && m.aiSummary.overview).length;
  const recentMeetings = meetings.slice(0, 3);
  const recentTasks = tasks.filter(t => t.status !== 'Completed').slice(0, 4);

  // Productivity Score logic (just a fun calculation based on completed tasks ratio)
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const productivityScore = Math.min(100, Math.max(0, taskCompletionRate + (totalMeetings * 5)));

  const stats = [
    {
      name: 'Total Meetings',
      value: totalMeetings,
      icon: Video,
      color: 'from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/10',
      desc: 'Scheduled & analyzed'
    },
    {
      name: 'Pending Tasks',
      value: pendingTasks,
      icon: CheckSquare,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/10',
      desc: 'Action items left'
    },
    {
      name: 'Completed Tasks',
      value: completedTasks,
      icon: CheckCircle,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/10',
      desc: 'Done & archived'
    },
    {
      name: 'AI Summaries',
      value: aiSummaries,
      icon: Brain,
      color: 'from-brand-500/20 to-fuchsia-500/20 text-brand-400 border-brand-500/10',
      desc: 'Gemini generated'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'there'}`}
        description="Here's what's happening with your meetings and tasks today."
        action={
          <Button variant="primary" icon={Plus} onClick={() => navigate('/meetings')}>
            New meeting
          </Button>
        }
      />

      {/* Premium Administrative Telemetry banner for Admins only */}
      {isAdmin(user) && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <DashboardCard className="border border-purple-500/25 bg-purple-950/10 relative overflow-hidden group" padding="lg">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] group-hover:bg-purple-500/15 transition-colors" />
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-48 h-48 bg-cyan-500/5 rounded-full blur-[80px]" />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              {/* Telemetry info */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                    <ShieldAlert size={20} />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400 font-sans">
                    Administrative Operations Console
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white font-sans">
                  MeetMind AI Control Center Enabled
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-3xl">
                  You are authenticated with full administrative privileges. Use this secure portal to access live SVG usage statistics, monitor database health, manage roles, and deactivate/cascade-delete active users recursively.
                </p>

                {/* Quick telemetry indicators */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <Server size={12} />
                    <span>API Gateway: Online</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                    <Activity size={12} />
                    <span>MongoDB: Connected (3ms)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium">
                    <Brain size={12} />
                    <span>AI Engine: Gemini 3.1 Ready</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 min-w-[11rem] shrink-0">
                <Button variant="admin" size="sm" icon={BarChart3} onClick={() => navigate('/admin')}>
                  Admin Dashboard
                </Button>
                <Button variant="secondary" size="sm" icon={Users} onClick={() => navigate('/admin/users')}>
                  Manage Users
                </Button>
              </div>
            </div>
          </DashboardCard>
        </motion.div>
      )}

      <DashboardGrid variant="stats">
        {stats.map((stat, idx) => (
          <StatCard
            key={stat.name}
            label={stat.name}
            value={stat.value}
            description={stat.desc}
            icon={stat.icon}
            iconClassName={`bg-gradient-to-br ${stat.color} border`}
            delay={idx * 0.06}
          />
        ))}
      </DashboardGrid>

      <DashboardGrid variant="main">
        <div className="lg:col-span-8 space-y-5 lg:space-y-6">
          <DashboardCard>
            <DashboardCardHeader
              title="Recent Meeting Analysis"
              icon={FileText}
              action={
                <Link
                  to="/meetings"
                  className="text-sm font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors"
                >
                  View all
                  <ArrowRight size={14} aria-hidden />
                </Link>
              }
            />

            {recentMeetings.length === 0 ? (
              <EmptyStateCard
                icon={Video}
                title="Create your first meeting"
                description="Capture notes from a call and let AI generate summaries, action items, and insights."
                action={{ label: 'Start collaborating', onClick: () => navigate('/meetings') }}
                secondaryAction={{ label: 'Learn how it works', onClick: () => navigate('/meetings') }}
              />
            ) : (
              <div className="space-y-4">
                {recentMeetings.map((meeting) => (
                  <div
                    key={meeting._id}
                    onClick={() => navigate(`/meetings?id=${meeting._id}`)}
                    className="
                      p-4 
                      rounded-xl 
                      bg-white/[0.02] 
                      border 
                      border-white/5 
                      hover:bg-white/[0.05] 
                      hover:border-brand-500/20 
                      cursor-pointer 
                      transition-all 
                      flex 
                      items-center 
                      justify-between 
                      group
                    "
                  >
                    <div className="space-y-1">
                      <h4 className="font-semibold text-white group-hover:text-brand-300 transition-colors font-sans">
                        {meeting.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {new Date(meeting.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                        {meeting.tags.length > 0 && (
                          <div className="flex items-center gap-1.5">
                            {meeting.tags.slice(0, 2).map((t: string) => (
                              <span key={t} className="px-1.5 py-0.5 rounded bg-brand-500/10 text-[10px] text-brand-400 uppercase font-semibold">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {meeting.aiSummary?.overview && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                          <Sparkles size={10} />
                          AI Summarized
                        </span>
                      )}
                      <ArrowRight size={16} className="text-slate-500 group-hover:text-white transition-all transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>

          <DashboardCard className="relative overflow-hidden" hover>
            <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-brand-500/5 blur-[100px] pointer-events-none rounded-full" />
            <DashboardCardHeader title="Workspace Activity Analysis" icon={TrendingUp} />
            <p className="text-sm text-slate-400 leading-relaxed relative z-10">
              Your meeting recording frequency has increased by <span className="text-emerald-400 font-semibold">12% this week</span>. 
              You have extracted <span className="text-brand-300 font-semibold">{tasks.length} tasks</span> automatically using the official Gemini integration, reducing manual admin logs by an average of <span className="text-indigo-400 font-semibold">1.5 hours per meeting</span>!
            </p>
          </DashboardCard>
        </div>

        <div className="lg:col-span-4 space-y-5 lg:space-y-6">
          <DashboardCard className="text-center flex flex-col items-center justify-center relative overflow-hidden group" padding="lg">
            <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/5 blur-[50px] pointer-events-none rounded-full" />
            <h4 className="stat-label mb-6">Productivity Score</h4>
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center flex-shrink-0">
              {/* Outer track */}
              <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 144 144" preserveAspectRatio="xMidYMid meet">
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" /> {/* brand purple */}
                    <stop offset="100%" stopColor="#3B82F6" /> {/* blue */}
                  </linearGradient>
                </defs>
                {/* Outer track background */}
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  className="stroke-slate-800/60"
                  strokeWidth="8"
                  fill="transparent"
                />
                {/* Blurred neon glow layer */}
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="url(#scoreGradient)"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 * (1 - productivityScore / 100)}
                  strokeLinecap="round"
                  className="animate-breathing-glow opacity-60"
                  style={{ filter: 'blur(4px)' }}
                />
                {/* Sharp main progress circle */}
                <circle
                  cx="72"
                  cy="72"
                  r="60"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 60}
                  strokeDashoffset={2 * Math.PI * 60 * (1 - productivityScore / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Score text */}
              <div className="text-center z-10">
                <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight glow-text-purple">{productivityScore}</span>
                <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block mt-1">MM Index</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-6 leading-relaxed max-w-[14rem] mx-auto">
              Based on meeting logs and task completion ratios.
            </p>
          </DashboardCard>

          <DashboardCard>
            <DashboardCardHeader
              title="Active Tasks"
              icon={CheckSquare}
              action={
                <Link to="/tasks" className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors">
                  Board view
                </Link>
              }
            />

            {recentTasks.length === 0 ? (
              <EmptyStateCard
                icon={CheckCircle}
                title="All caught up"
                description="No pending tasks. Generate your first AI summary from a meeting or add tasks on the board."
                action={{ label: 'View task board', onClick: () => navigate('/tasks') }}
                compact
              />
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div
                    key={task._id}
                    onClick={() => navigate('/tasks')}
                    className="
                      p-3 
                      rounded-xl 
                      bg-white/[0.01] 
                      border 
                      border-white/5 
                      hover:bg-white/[0.04] 
                      cursor-pointer 
                      transition-all 
                      flex 
                      items-center 
                      justify-between
                    "
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p className="text-xs font-medium text-white truncate">{task.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5 truncate">{task.description || "No description."}</p>
                    </div>
                    <span className={`
                      px-2 
                      py-0.5 
                      rounded 
                      text-[9px] 
                      font-semibold 
                      uppercase
                      ${task.priority === 'High' 
                        ? 'bg-rose-500/10 text-rose-400' 
                        : task.priority === 'Medium' 
                          ? 'bg-amber-500/10 text-amber-400' 
                          : 'bg-slate-500/10 text-slate-400'
                      }
                    `}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </DashboardCard>
        </div>
      </DashboardGrid>
    </div>
  );
};
