import React from 'react';
import { Sparkles } from 'lucide-react';

interface AiLoadingIndicatorProps {
  message?: string;
}

export const AiLoadingIndicator: React.FC<AiLoadingIndicatorProps> = ({
  message = 'Generating with AI…',
}) => (
  <div
    className="space-y-3 p-5 bg-slate-900/40 border border-white/5 rounded-2xl relative overflow-hidden"
    role="status"
    aria-live="polite"
  >
    <div className="absolute inset-0 shimmer-overlay pointer-events-none" aria-hidden />
    <div className="flex items-center gap-2 text-xs font-semibold uppercase text-brand-400 tracking-wider relative z-10">
      <Sparkles size={12} className="animate-pulse" aria-hidden />
      <span className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: '300ms' }} />
      </span>
      {message}
    </div>
    <div className="space-y-2 relative z-10">
      <div className="skeleton-shimmer h-4 w-3/4 rounded-lg" />
      <div className="skeleton-shimmer h-4 w-5/6 rounded-lg" />
      <div className="skeleton-shimmer h-4 w-1/2 rounded-lg" />
    </div>
  </div>
);
