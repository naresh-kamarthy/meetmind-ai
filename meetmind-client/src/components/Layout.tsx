import React, { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from './ToastContainer';
import { motion, AnimatePresence } from 'framer-motion';
import { getPageTitle } from '../constants/navigation';
import { DashboardSkeleton } from './Skeleton';
import { SocketProvider } from './SocketProvider';

export const Layout: React.FC = () => {
  const { user, authReady, isSidebarOpen, setSidebarOpen } = useStore();
  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const apply = () => {
      if (mq.matches) setSidebarOpen(false);
    };
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [setSidebarOpen]);

  if (!authReady) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-white dark:bg-[#090D1A]">
        <div className="flex flex-col items-center gap-4 w-full max-w-lg px-6">
          <div className="w-10 h-10 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" aria-hidden />
          <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">Restoring your session…</p>
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SocketProvider>
    <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-[#090D1A] text-slate-800 dark:text-slate-200">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/50 dark:bg-[#04060d]/70 backdrop-blur-sm z-30 md:hidden"
            aria-hidden
          />
        )}
      </AnimatePresence>

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header title={pageTitle} />

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-5 lg:p-7 relative">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-500/5 blur-[150px] pointer-events-none rounded-full" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] pointer-events-none rounded-full" />

          <div className="relative z-10 max-w-7xl mx-auto w-full min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="min-w-0"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <ToastContainer />
    </div>
    </SocketProvider>
  );
};
