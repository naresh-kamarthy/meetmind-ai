import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Settings,
  Shield,
  Users,
  BarChart3,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  name: string;
  path: string;
  icon: LucideIcon;
  end?: boolean;
  badge?: string;
}

export const mainNavItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, end: true },
  { name: 'Meetings', path: '/meetings', icon: FileText },
  { name: 'Tasks Board', path: '/tasks', icon: CheckSquare },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const adminNavItems: NavItem[] = [
  { name: 'Admin Dashboard', path: '/admin', icon: Shield, badge: 'Overview', end: true },
  { name: 'Users', path: '/admin/users', icon: Users, badge: 'Directory' },
  { name: 'Analytics', path: '/admin/analytics', icon: BarChart3, badge: 'Insights' },
];

export const routeTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/meetings': 'Meetings',
  '/tasks': 'Tasks Board',
  '/settings': 'Settings',
  '/admin': 'Admin Dashboard',
  '/admin/users': 'Users',
  '/admin/analytics': 'Analytics',
  '/unauthorized': 'Access Denied',
};

export function getPageTitle(pathname: string): string {
  if (routeTitles[pathname]) return routeTitles[pathname];
  if (pathname.startsWith('/admin')) return 'Admin';
  return 'MeetMind AI';
}

export interface BreadcrumbItem {
  label: string;
  path: string;
}

export function getBreadcrumb(pathname: string): BreadcrumbItem[] {
  if (pathname === '/' || pathname === '/login' || pathname === '/register') {
    return [];
  }

  const crumbs: BreadcrumbItem[] = [{ label: 'Home', path: '/' }];

  if (pathname.startsWith('/admin')) {
    crumbs.push({ label: 'Admin', path: '/admin' });
    const sub = routeTitles[pathname];
    if (sub && pathname !== '/admin') {
      crumbs.push({ label: sub, path: pathname });
    }
    return crumbs;
  }

  const title = routeTitles[pathname];
  if (title && pathname !== '/') {
    crumbs.push({ label: title, path: pathname });
  }

  return crumbs.length > 1 ? crumbs : [];
}
