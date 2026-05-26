import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  X
} from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  const icons = {
    success: <CheckCircle2 size={18} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />,
    error: <AlertCircle size={18} className="text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]" />,
    warning: <AlertTriangle size={18} className="text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />,
    info: <Info size={18} className="text-brand-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
  };

  const styleClasses = {
    success: 'border-emerald-500/20 bg-emerald-950/30 text-emerald-300 shadow-[0_10px_30px_-10px_rgba(16,185,129,0.15)]',
    error: 'border-rose-500/20 bg-rose-950/30 text-rose-300 shadow-[0_10px_30px_-10px_rgba(244,63,94,0.15)]',
    warning: 'border-amber-500/20 bg-amber-950/30 text-amber-300 shadow-[0_10px_30px_-10px_rgba(245,158,11,0.15)]',
    info: 'border-brand-500/20 bg-brand-950/30 text-brand-300 shadow-[0_10px_30px_-10px_rgba(139,92,246,0.15)]'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 25, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.9, transition: { duration: 0.15 } }}
            transition={{ type: "spring", stiffness: 350, damping: 26 }}
            layout
            className={`
              pointer-events-auto 
              flex 
              items-start 
              gap-3 
              p-4 
              rounded-2xl 
              border 
              glass-panel 
              shadow-lg 
              transition-all 
              duration-200
              ${styleClasses[toast.type]}
            `}
          >
            {/* Status Icon */}
            <div className="mt-0.5 shrink-0">
              {icons[toast.type]}
            </div>

            {/* Notification message */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold font-sans tracking-wide leading-relaxed text-slate-900 dark:text-slate-100">
                {toast.message}
              </p>
            </div>

            {/* Dismiss trigger */}
            <button
              onClick={() => removeToast(toast.id)}
              className="
                p-1.5 
                rounded-lg 
                bg-slate-100 dark:bg-white/5 
                hover:bg-slate-200 dark:hover:bg-white/10 
                text-slate-500 dark:text-slate-400 
                hover:text-slate-900 dark:hover:text-white 
                transition-all 
                duration-150 
                shrink-0
              "
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
