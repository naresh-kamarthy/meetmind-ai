import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

export const Unauthorized: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <GlassCard className="max-w-lg w-full p-10 text-center border-rose-500/20">
        <div className="inline-flex p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 mb-6">
          <ShieldOff size={40} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Restricted</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-8">
          This area is reserved for platform administrators. Your account does not have permission to view this page.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all"
          >
            <LayoutDashboard size={16} />
            Go to Dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-300 font-semibold text-sm transition-all"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
