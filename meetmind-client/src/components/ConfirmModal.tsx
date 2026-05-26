import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Info, Trash2, X, Loader2 } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isPending = false,
  type = 'danger'
}) => {
  const icons = {
    danger: <Trash2 size={24} className="text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.4)]" />,
    warning: <AlertTriangle size={24} className="text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]" />,
    info: <Info size={24} className="text-brand-400 drop-shadow-[0_0_10px_rgba(139,92,246,0.4)]" />
  };

  const colors = {
    danger: {
      bg: 'bg-rose-950/10 border-rose-500/20',
      btn: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/10'
    },
    warning: {
      bg: 'bg-amber-950/10 border-amber-500/20',
      btn: 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-600/10'
    },
    info: {
      bg: 'bg-brand-950/10 border-brand-500/20',
      btn: 'bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-500/10'
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop Layer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={isPending ? undefined : onClose}
            className="fixed inset-0 bg-black/50 dark:bg-[#04060d]/80 backdrop-blur-md"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className={`
              relative 
              w-full 
              max-w-sm 
              overflow-hidden 
              rounded-3xl 
              border 
              glass-panel 
              shadow-2xl 
              z-10
              ${colors[type].bg}
            `}
          >
            {/* Header Toolbar */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
              <div className="flex items-center gap-2.5">
                {icons[type]}
                <h3 className="font-bold text-slate-900 dark:text-white font-sans text-lg tracking-wide">{title}</h3>
              </div>
              <button
                onClick={onClose}
                disabled={isPending}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 p-2 rounded-lg transition-colors disabled:opacity-30"
              >
                <X size={18} />
              </button>
            </div>

            {/* Description Body */}
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans font-medium">
                {message}
              </p>
              {type === 'danger' && (
                <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/10 text-xs text-rose-300 font-sans leading-relaxed">
                  This action is permanent and cannot be undone.
                </div>
              )}
            </div>

            {/* Panel Actions */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5">
              <button
                onClick={onClose}
                disabled={isPending}
                className="
                  px-5 
                  py-2.5 
                  text-sm 
                  font-semibold 
                  rounded-xl 
                  text-slate-600 dark:text-slate-300 
                  hover:text-slate-900 dark:hover:text-white 
                  bg-white dark:bg-white/5 
                  hover:bg-slate-100 dark:hover:bg-white/10 
                  transition-colors 
                  disabled:opacity-30
                "
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={isPending}
                className={`
                  px-6 
                  py-2.5 
                  text-sm 
                  font-semibold 
                  rounded-xl 
                  transition-all 
                  flex 
                  items-center 
                  gap-1.5
                  active:scale-[0.98]
                  disabled:opacity-50
                  ${colors[type].btn}
                `}
              >
                {isPending && <Loader2 size={16} className="animate-spin" />}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
