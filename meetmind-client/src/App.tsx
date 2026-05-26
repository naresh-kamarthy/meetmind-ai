import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthBootstrap } from './components/AuthBootstrap';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { MeetingWorkspace } from './pages/MeetingWorkspace';
import { TaskBoard } from './pages/TaskBoard';
import { Settings } from './pages/Settings';
import { AdminRoute } from './components/AdminRoute';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsers } from './pages/AdminUsers';
import { AdminAnalytics } from './pages/AdminAnalytics';
import { Unauthorized } from './pages/Unauthorized';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
      <BrowserRouter>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected MERN workspace routes */}
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/meetings" element={<MeetingWorkspace />} />
            <Route path="/tasks" element={<TaskBoard />} />
            <Route path="/settings" element={<Settings />} />

            {/* Secure Admin Portal Routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>

            <Route path="/unauthorized" element={<Unauthorized />} />
          </Route>

          {/* Fallback Redirects */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </AuthBootstrap>
    </QueryClientProvider>
  );
};

export default App;
