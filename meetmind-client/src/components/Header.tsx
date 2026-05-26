import React, { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { isAdmin } from '../utils/auth';
import { getBreadcrumb, getPageTitle } from '../constants/navigation';
import { Sun, Moon, Bell, Menu, Shield, ChevronRight } from 'lucide-react';
import { Avatar } from './Avatar';
import { SearchBar } from './ui/SearchBar';
import { Button } from './ui/Button';
import { NotificationPanel } from './NotificationPanel';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  const { user, theme, toggleTheme, isSidebarOpen, setSidebarOpen, notifications, isNotificationPanelOpen, toggleNotificationPanel, setNotificationPanelOpen, addNotification } = useStore();
  const location = useLocation();
  const onAdminRoute = location.pathname.startsWith('/admin');
  const userIsAdmin = isAdmin(user);
  const breadcrumb = getBreadcrumb(location.pathname);
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Add sample notifications for testing
  useEffect(() => {
    if (notifications.length === 0) {
      addNotification({
        title: 'Welcome to MeetMind',
        message: 'Get started by exploring your dashboard and connecting with your team.',
        type: 'info',
      });
      addNotification({
        title: 'New feature available',
        message: 'Check out the new task management features in the dashboard.',
        type: 'success',
      });
    }
  }, []);

  return (
    <header className="app-header sticky top-0 z-20 shrink-0">
      <div className="app-header-row">
        {/* Left: menu + title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1 basis-0">
          <Button
            variant="ghost"
            className="md:hidden shrink-0 !p-2"
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            aria-label={isSidebarOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isSidebarOpen}
            icon={Menu}
          />

          <div className="min-w-0 flex-1">
            <h1 className="header-title truncate">{title}</h1>
            {breadcrumb.length > 0 ? (
              <nav aria-label="Breadcrumb" className="flex items-center gap-1 mt-0.5 min-w-0">
                {breadcrumb.map((crumb, i) => (
                  <React.Fragment key={crumb.path}>
                    {i > 0 && (
                      <ChevronRight size={10} className="text-slate-600 shrink-0" aria-hidden />
                    )}
                    {i === breadcrumb.length - 1 ? (
                      <span className="text-meta truncate">{crumb.label}</span>
                    ) : (
                      <Link
                        to={crumb.path}
                        className="text-meta hover:text-slate-400 transition-colors truncate"
                      >
                        {crumb.label}
                      </Link>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            ) : onAdminRoute ? (
              <p className="text-meta text-purple-400/90 font-semibold uppercase tracking-widest mt-0.5">
                Admin Portal
              </p>
            ) : null}
          </div>
        </div>

        {/* Right: actions */}
        <div className="header-actions">
          {userIsAdmin && !onAdminRoute && (
            <Link
              to="/admin"
              className="hidden lg:inline-flex items-center gap-1.5 h-9 px-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold hover:bg-purple-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/30 shrink-0"
            >
              <Shield size={14} aria-hidden />
              Admin
            </Link>
          )}

          <Button
            variant="ghost"
            className="!p-2 shrink-0"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            icon={theme === 'dark' ? Sun : Moon}
          />

          <div className="relative hidden sm:inline-flex shrink-0">
            <button
              type="button"
              className="btn-icon relative"
              onClick={toggleNotificationPanel}
              aria-label="Notifications"
              aria-expanded={isNotificationPanelOpen}
            >
              <Bell size={18} aria-hidden />
              {unreadCount > 0 && (
                <span
                  className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-brand-500 ring-2 ring-white dark:ring-[#090d1a]"
                  aria-hidden
                />
              )}
            </button>
            {isNotificationPanelOpen && (
              <NotificationPanel onClose={() => setNotificationPanelOpen(false)} />
            )}
          </div>

          {user && (
            <div className="header-profile shrink-0">
              <Avatar user={user} size="sm" className="rounded-lg shrink-0" />
              <div className="hidden lg:block text-left min-w-0 max-w-[7.5rem] xl:max-w-[9rem]">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-tight">{user.name}</p>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider leading-tight mt-0.5 truncate ${
                    userIsAdmin ? 'text-purple-500 dark:text-purple-400' : 'text-brand-600 dark:text-brand-400'
                  }`}
                >
                  {userIsAdmin ? 'Administrator' : 'Member'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile / narrow: search full width below */}
      <div className="header-search-mobile md:hidden px-4 sm:px-6 pb-3">
        <SearchBar />
      </div>
    </header>
  );
};

/** @deprecated Use Header — kept for minimal import churn */
export const Navbar: React.FC<HeaderProps> = ({ title }) => {
  const location = useLocation();
  const resolvedTitle = title || getPageTitle(location.pathname);
  return <Header title={resolvedTitle} />;
};
