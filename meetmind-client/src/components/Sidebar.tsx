import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { isAdmin } from '../utils/auth';
import { api } from '../services/api';
import { mainNavItems, adminNavItems } from '../constants/navigation';
import {
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar } from './Avatar';

interface NavLinkItemProps {
  item: (typeof mainNavItems)[0];
  isSidebarOpen: boolean;
  onNavigate: () => void;
  variant?: 'main' | 'admin';
}

const NavLinkItem: React.FC<NavLinkItemProps> = ({
  item,
  isSidebarOpen,
  onNavigate,
  variant = 'main',
}) => {
  const isAdminVariant = variant === 'admin';
  const activeClasses = isAdminVariant
    ? 'bg-purple-500/12 text-purple-200 font-semibold border-purple-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_16px_-6px_rgba(168,85,247,0.25)]'
    : 'bg-brand-500/12 text-brand-200 font-semibold border-brand-500/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_4px_16px_-6px_rgba(99,102,241,0.2)]';
  const pillColor = isAdminVariant ? 'bg-purple-500' : 'bg-brand-500';
  const layoutId = isAdminVariant ? 'sidebar-active-admin' : 'sidebar-active-main';

  return (
    <NavLink
      to={item.path}
      end={item.end}
      onClick={onNavigate}
      title={!isSidebarOpen ? item.name : undefined}
      aria-label={item.name}
      className={({ isActive }) => `
        relative flex items-center gap-3 rounded-xl border transition-all duration-200 group
        ${isSidebarOpen ? 'px-3 py-2.5' : 'px-0 py-2.5 justify-center w-full'}
        ${isActive
          ? activeClasses
          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-black/[0.05] dark:hover:bg-white/[0.05] border-transparent'
        }
      `}
    >
      {({ isActive }) => (
        <>
          {isActive && isSidebarOpen && (
            <motion.div
              layoutId={layoutId}
              className={`absolute left-0 w-0.5 h-6 rounded-full ${pillColor} shadow-[0_0_10px_rgba(139,92,246,0.45)]`}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            />
          )}
          <item.icon
            size={19}
            className="shrink-0 transition-transform duration-200 group-hover:scale-105"
            aria-hidden
          />
          <AnimatePresence mode="wait" initial={false}>
            {isSidebarOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="flex items-center justify-between flex-1 min-w-0 overflow-hidden"
              >
                <span className="text-sm font-medium tracking-wide truncate">{item.name}</span>
                {item.badge && (
                  <span className="ml-2 shrink-0 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 dark:bg-white/5 dark:text-slate-500 dark:border-white/5">
                    {item.badge}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </NavLink>
  );
};

export const Sidebar: React.FC = () => {
  const { user, setUser, isSidebarOpen, toggleSidebar, setSidebarOpen } = useStore();
  const navigate = useNavigate();
  const userIsAdmin = isAdmin(user);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const closeMobile = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <aside
      className={`
        fixed md:relative top-0 left-0 z-40
        glass-panel h-screen border-r border-white/[0.06]
        flex flex-col
        transition-[width,transform] duration-300 ease-out
        ${isSidebarOpen
          ? 'translate-x-0 w-[268px]'
          : '-translate-x-full md:translate-x-0 md:w-[76px]'
        }
      `}
      aria-label="Main navigation"
    >
      <div className="flex flex-col min-h-0 flex-1">
        {/* Brand */}
        <div
          className={`
            relative flex items-center border-b border-white/[0.06]
            ${isSidebarOpen ? 'px-5 py-4 gap-3' : 'px-3 py-4 justify-center'}
          `}
        >
          <div className="flex items-center justify-center p-2 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 shrink-0">
            <BrainCircuit size={22} className="glow-text-purple" aria-hidden />
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {isSidebarOpen && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                className="font-bold text-slate-900 dark:text-white text-lg tracking-wide font-display glow-text-purple whitespace-nowrap"
              >
                MeetMind <span className="text-brand-400">AI</span>
              </motion.span>
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden md:flex w-7 h-7 items-center justify-center rounded-full bg-slate-100 dark:bg-[#0f162a] border border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shadow-lg absolute -right-3.5 top-7"
            aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className={`flex-1 overflow-y-auto overflow-x-hidden ${isSidebarOpen ? 'px-3 py-4' : 'px-2 py-3'}`}>
          <p
            className={`text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 ${
              isSidebarOpen ? 'px-2' : 'sr-only'
            }`}
          >
            Workspace
          </p>
          <div className="space-y-1">
            {mainNavItems.map((item) => (
              <NavLinkItem
                key={item.path}
                item={item}
                isSidebarOpen={isSidebarOpen}
                onNavigate={closeMobile}
                variant="main"
              />
            ))}
          </div>

          {userIsAdmin && (
            <div className={isSidebarOpen ? 'mt-6' : 'mt-5'}>
              <div
                className={`
                  mb-3
                  ${isSidebarOpen ? 'px-2 pt-4 border-t border-black/[0.06] dark:border-white/[0.06]' : 'flex justify-center pt-3'}
                `}
              >
                {isSidebarOpen ? (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400/90 uppercase tracking-widest">
                      Admin Tools
                    </span>
                    <span className="badge-admin text-[9px] py-0">Staff</span>
                  </div>
                ) : (
                  <div className="w-8 h-px bg-slate-200 dark:bg-white/10" aria-hidden />
                )}
              </div>
              <div className={`space-y-1 ${!isSidebarOpen ? 'rounded-xl bg-purple-500/[0.04] p-1' : ''}`}>
                {adminNavItems.map((item) => (
                  <NavLinkItem
                    key={item.path}
                    item={item}
                    isSidebarOpen={isSidebarOpen}
                    onNavigate={closeMobile}
                    variant="admin"
                  />
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Footer: user + logout */}
      <div
        className={`
          border-t border-black/[0.06] dark:border-white/[0.06] mt-auto
          ${isSidebarOpen ? 'p-3 space-y-2.5' : 'p-2 space-y-2'}
        `}
      >
        {user && isSidebarOpen && (
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-black/[0.04] dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.06]">
            <Avatar user={user} size="sm" className="rounded-lg shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate flex items-center gap-1.5">
                {user.name}
                {userIsAdmin && <span className="badge-admin text-[8px] py-0 shrink-0">Admin</span>}
              </p>
              <p className="text-xs text-slate-500 truncate mt-0.5">{user.email}</p>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          title={!isSidebarOpen ? 'Logout' : undefined}
          className={`
            w-full flex items-center rounded-xl text-rose-400/90
            hover:text-rose-300 hover:bg-rose-500/10 border border-transparent
            hover:border-rose-500/15 transition-all duration-200 group
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/30
            ${isSidebarOpen ? 'gap-3 px-3 py-2.5' : 'justify-center p-2.5'}
          `}
        >
          <LogOut size={18} className="shrink-0 group-hover:-translate-x-0.5 transition-transform" aria-hidden />
          {isSidebarOpen && <span className="text-sm font-semibold">Logout</span>}
        </button>
      </div>
    </aside>
  );
};
