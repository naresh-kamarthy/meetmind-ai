import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useStore } from '../store/useStore';
import { GlassCard } from '../components/GlassCard';
import { ConfirmModal } from '../components/ConfirmModal';
import { TableSkeleton } from '../components/Skeleton';
import { PageHeader } from '../components/ui/PageHeader';
import { EmptyState } from '../components/ui/EmptyState';
import {
  Search,
  Filter,
  UserCheck,
  UserX,
  Trash2,
  Shield,
  ShieldAlert,
  Mail,
  Calendar,
  AlertTriangle,
  ChevronDown,
  Users as UsersIcon,
} from 'lucide-react';
import type { User } from '../types';
import { Avatar } from '../components/Avatar';
import { AVATAR_SYNC_EVENT } from '../components/SocketProvider';
import type { AvatarSyncPayload } from '../services/socket';

export const AdminUsers: React.FC = () => {
  const { user: currentUser, addToast } = useStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Deletion confirm modal state
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (roleFilter !== 'all') params.append('role', roleFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to retrieve users directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300); // Debounce search
    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter, statusFilter]);

  useEffect(() => {
    const onAvatarSync = (event: Event) => {
      const payload = (event as CustomEvent<AvatarSyncPayload>).detail;
      setUsers((prev) =>
        prev.map((u) =>
          u.id === payload.userId || u._id === payload.userId
            ? { ...u, avatar: payload.avatar, name: payload.name }
            : u
        )
      );
    };
    window.addEventListener(AVATAR_SYNC_EVENT, onAvatarSync);
    return () => window.removeEventListener(AVATAR_SYNC_EVENT, onAvatarSync);
  }, []);

  const handleToggleStatus = async (user: User) => {
    if (user.id === currentUser?.id || user._id === currentUser?.id) {
      addToast('Operation Denied: You cannot deactivate your own active session!', 'warning');
      return;
    }

    try {
      const nextStatus = !(user as any).isActive;
      const res = await api.put(`/admin/users/${user._id || user.id}/status`, { isActive: nextStatus });
      
      // Update local state
      setUsers(users.map(u => (u._id === user._id || u.id === user.id) ? { ...u, isActive: nextStatus } : u));
      addToast(res.data.message, 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update user status.', 'error');
    }
  };

  const handleToggleRole = async (user: User) => {
    if (user.id === currentUser?.id || user._id === currentUser?.id) {
      addToast('Operation Denied: You cannot demote yourself from administrative rights!', 'warning');
      return;
    }

    try {
      const nextRole = user.role === 'admin' ? 'user' : 'admin';
      const res = await api.put(`/admin/users/${user._id || user.id}/role`, { role: nextRole });
      
      // Update local state
      setUsers(users.map(u => (u._id === user._id || u.id === user.id) ? { ...u, role: nextRole } : u));
      addToast(res.data.message, 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to update user role.', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const targetId = deleteTarget._id || deleteTarget.id;
      const res = await api.delete(`/admin/users/${targetId}`);
      
      setUsers(users.filter(u => u._id !== targetId && u.id !== targetId));
      setDeleteTarget(null);
      addToast(res.data.message, 'success');
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Failed to delete user.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 relative">
      <PageHeader
        title="Users"
        description="Manage accounts, roles, and access across your workspace."
        badge="Admin"
      />

      {/* Filters & Control Grid */}
      <GlassCard className="p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
          {/* Search bar input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={15} aria-hidden />
            <input
              type="text"
              placeholder="Search by name or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Filtering selectors */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Filter by role */}
            <div className="relative flex items-center">
              <Filter className="absolute left-3 text-slate-500" size={15} />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="select-field pl-9 py-2.5 w-auto min-w-[160px]"
              >
                <option value="all">All Roles</option>
                <option value="admin">Administrators</option>
                <option value="user">Regular Users</option>
              </select>
              <ChevronDown className="absolute right-3 text-slate-500 pointer-events-none" size={14} />
            </div>

            {/* Filter by status */}
            <div className="relative flex items-center">
              <UserCheck className="absolute left-3 text-slate-500" size={15} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="select-field pl-9 py-2.5 w-auto min-w-[160px]"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Accounts</option>
                <option value="inactive">Deactivated</option>
              </select>
              <ChevronDown className="absolute right-3 text-slate-500 pointer-events-none" size={14} />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Directory Table */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : error ? (
        <GlassCard className="text-center py-12 border-rose-500/10 bg-rose-950/5">
          <AlertTriangle className="mx-auto text-rose-400 mb-3" size={32} />
          <p className="text-slate-300">{error}</p>
        </GlassCard>
      ) : users.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={UsersIcon}
            title="No users found"
            description="Try adjusting your search or filters to find the account you're looking for."
          />
        </GlassCard>
      ) : (
        <div className="table-shell">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="table-head">
                <th className="px-6 py-4">User Info</th>
                <th className="px-6 py-4">Role Tier</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Registered Date</th>
                <th className="px-6 py-4 text-right">Actions Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((item) => {
                const isSelf = item.id === currentUser?.id || item._id === currentUser?.id;
                const isActive = (item as any).isActive !== false;

                return (
                  <tr key={item.id || item._id} className="table-row">
                    {/* User profile details */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar user={item} size="sm" className="rounded-xl" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white font-sans truncate flex items-center gap-1.5">
                            {item.name}
                            {isSelf && (
                              <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-white/10 text-slate-400 border border-white/10 uppercase tracking-widest">
                                Self
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 truncate inline-flex items-center gap-1 mt-0.5">
                            <Mail size={12} className="text-slate-600" />
                            {item.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Role badge */}
                    <td className="px-6 py-4">
                      <span className={`
                        px-2.5 
                        py-1 
                        rounded-lg 
                        text-xs 
                        font-semibold 
                        font-sans 
                        inline-flex 
                        items-center 
                        gap-1
                        ${item.role === 'admin'
                          ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                          : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                        }
                      `}>
                        {item.role === 'admin' ? <ShieldAlert size={12} /> : <Shield size={12} />}
                        {item.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>

                    {/* Active/Inactive badge */}
                    <td className="px-6 py-4">
                      <span className={`
                        px-2.5 
                        py-1 
                        rounded-lg 
                        text-xs 
                        font-semibold 
                        font-sans
                        ${isActive
                          ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                          : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        }
                      `}>
                        {isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    {/* Registered date */}
                    <td className="px-6 py-4 text-xs text-slate-400 font-sans">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} className="text-slate-600" />
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : 'N/A'}
                      </span>
                    </td>

                    {/* Operations actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {/* Toggle Status (deactivate/activate) */}
                        <button
                          onClick={() => handleToggleStatus(item)}
                          disabled={isSelf}
                          title={isSelf ? 'Cannot deactivate yourself' : isActive ? 'Deactivate User' : 'Activate User'}
                          className={`
                            p-2 
                            rounded-lg 
                            border 
                            transition-all
                            ${isSelf 
                              ? 'opacity-30 cursor-not-allowed border-white/5 text-slate-500' 
                              : isActive 
                              ? 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/10 hover:border-rose-500/30 text-rose-400' 
                              : 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/10 hover:border-emerald-500/30 text-emerald-400'
                            }
                          `}
                        >
                          {isActive ? <UserX size={15} /> : <UserCheck size={15} />}
                        </button>

                        {/* Promote/Demote Role */}
                        <button
                          onClick={() => handleToggleRole(item)}
                          disabled={isSelf}
                          title={isSelf ? 'Cannot modify your own administrative rights' : item.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
                          className={`
                            p-2 
                            rounded-lg 
                            border 
                            transition-all
                            ${isSelf 
                              ? 'opacity-30 cursor-not-allowed border-white/5 text-slate-500' 
                              : 'bg-purple-500/5 hover:bg-purple-500/10 border-purple-500/10 hover:border-purple-500/30 text-purple-400'
                            }
                          `}
                        >
                          <ShieldAlert size={15} />
                        </button>

                        {/* Delete user permanently */}
                        <button
                          onClick={() => setDeleteTarget(item)}
                          disabled={isSelf}
                          title={isSelf ? 'Cannot delete yourself' : 'Delete User Permanently'}
                          className={`
                            p-2 
                            rounded-lg 
                            border 
                            transition-all
                            ${isSelf 
                              ? 'opacity-30 cursor-not-allowed border-white/5 text-slate-500' 
                              : 'bg-rose-500/5 hover:bg-rose-500/10 border-rose-500/10 hover:border-rose-500/30 text-rose-400'
                            }
                          `}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteUser}
        title="Delete user permanently"
        message={
          deleteTarget
            ? `Delete ${deleteTarget.name} (${deleteTarget.email})? All meetings, summaries, and tasks created by this user will be removed. This cannot be undone.`
            : ''
        }
        confirmText="Delete user"
        cancelText="Cancel"
        isPending={deleting}
        type="danger"
      />
    </div>
  );
};
