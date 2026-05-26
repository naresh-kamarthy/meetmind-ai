import { create } from "zustand";
import type { User } from "../types";
import { normalizeUser } from "../utils/auth";

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

interface AppState {
  user: User | null;
  authReady: boolean;
  isSidebarOpen: boolean;
  theme: 'light' | 'dark';
  taskFilters: {
    search: string;
    priority: string;
  };
  toasts: ToastItem[];
  notifications: Notification[];
  isNotificationPanelOpen: boolean;
  setUser: (user: User | null) => void;
  setAuthReady: (ready: boolean) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  toggleTheme: () => void;
  setTaskFilters: (filters: Partial<{ search: string; priority: string }>) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  removeNotification: (id: string) => void;
  toggleNotificationPanel: () => void;
  setNotificationPanelOpen: (isOpen: boolean) => void;
}

const getStoredTheme = (): 'light' | 'dark' => {
  const theme = localStorage.getItem("meetmind_theme");
  if (theme === 'light') return 'light';
  return 'dark';
};

export const useStore = create<AppState>((set) => ({
  user: null,
  authReady: false,
  isSidebarOpen: true,
  theme: getStoredTheme(),
  taskFilters: {
    search: "",
    priority: "",
  },
  toasts: [],
  notifications: [],
  isNotificationPanelOpen: false,
  setUser: (user) => {
    const normalized = user ? normalizeUser(user as unknown as Record<string, unknown>) : null;
    set({ user: normalized });
  },
  setAuthReady: (ready) => set({ authReady: ready }),
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem("meetmind_theme", nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { theme: nextTheme };
  }),
  setTaskFilters: (filters) => set((state) => ({
    taskFilters: { ...state.taskFilters, ...filters }
  })),
  addToast: (message, type = 'success') => set((state) => {
    const id = Math.random().toString(36).substring(2, 9);
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 4000);
    return { toasts: [...state.toasts, { id, message, type }] };
  }),
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  addNotification: (notification) => set((state) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newNotification: Notification = {
      id,
      ...notification,
      timestamp: new Date(),
      read: false,
    };
    return { notifications: [newNotification, ...state.notifications] };
  }),
  markNotificationAsRead: (id) => set((state) => ({
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
  })),
  markAllNotificationsAsRead: () => set((state) => ({
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter((n) => n.id !== id),
  })),
  toggleNotificationPanel: () => set((state) => ({
    isNotificationPanelOpen: !state.isNotificationPanelOpen,
  })),
  setNotificationPanelOpen: (isOpen) => set({ isNotificationPanelOpen: isOpen }),
}));

const initialTheme = getStoredTheme();
if (initialTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else {
  document.documentElement.classList.remove('dark');
}
