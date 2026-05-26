import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/useStore';

export const AdminRoute: React.FC = () => {
  const { user, authReady } = useStore();

  if (!authReady) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }

  // If they are an admin, render the child outlets
  return <Outlet />;
};
