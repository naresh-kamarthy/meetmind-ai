import React, { useCallback, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { uploadAvatar, setAvatarUrl, removeAvatar } from '../services/avatar';
import { useStore } from '../store/useStore';
import { GlassCard } from '../components/GlassCard';
import { PageHeader } from '../components/ui/PageHeader';
import { Avatar } from '../components/Avatar';
import {
  User as UserIcon,
  Link as LinkIcon,
  Save,
  Loader2,
  Upload,
  Trash2,
  ImagePlus,
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { isAdmin } from '../utils/auth';
import type { User } from '../types';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const avatarUrlSchema = z.object({
  url: z.string().url('Enter a valid image URL'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type AvatarUrlFormValues = z.infer<typeof avatarUrlSchema>;

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const Settings: React.FC = () => {
  const { user, setUser, addToast } = useStore();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUser = user
    ? { ...user, avatar: previewUrl ?? user.avatar }
    : null;

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '' },
  });

  const urlForm = useForm<AvatarUrlFormValues>({
    resolver: zodResolver(avatarUrlSchema),
    defaultValues: { url: user?.avatarType === 'url' ? user.avatar ?? '' : '' },
  });

  const profileMutation = useMutation({
    mutationFn: (data: ProfileFormValues) =>
      api.put('/auth/profile', data).then((res: { data: { user: User } }) => res.data),
    onSuccess: (data) => {
      setUser(data.user);
      addToast('Profile updated successfully', 'success');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    },
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadAvatar(file, setUploadProgress),
    onSuccess: (data) => {
      setUser(data.user);
      setPreviewUrl(null);
      setUploadProgress(0);
      addToast(data.message, 'success');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      setUploadProgress(0);
      addToast(err.response?.data?.message || 'Avatar upload failed', 'error');
    },
  });

  const urlMutation = useMutation({
    mutationFn: (url: string) => setAvatarUrl(url),
    onSuccess: (data) => {
      setUser(data.user);
      setPreviewUrl(data.user.avatar ?? null);
      addToast(data.message, 'success');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      addToast(err.response?.data?.message || 'Failed to set avatar URL', 'error');
    },
  });

  const removeMutation = useMutation({
    mutationFn: removeAvatar,
    onSuccess: (data) => {
      setUser(data.user);
      setPreviewUrl(null);
      urlForm.reset({ url: '' });
      addToast(data.message, 'success');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      addToast(err.response?.data?.message || 'Failed to remove avatar', 'error');
    },
  });

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only JPG, PNG, and WebP images are allowed.';
    }
    if (file.size > 2 * 1024 * 1024) {
      return 'Image must be 2MB or smaller.';
    }
    return null;
  };

  const handleFile = useCallback(
    (file: File) => {
      const error = validateFile(file);
      if (error) {
        addToast(error, 'error');
        return;
      }
      setPreviewUrl(URL.createObjectURL(file));
      uploadMutation.mutate(file);
    },
    [addToast, uploadMutation]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const isAvatarBusy =
    uploadMutation.isPending || urlMutation.isPending || removeMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto space-y-6 sm:space-y-8">
      <PageHeader
        title="Settings"
        description="Manage your profile and avatar across MeetMind AI."
      />

      <GlassCard className="p-6 sm:p-8 space-y-8 border-white/5 relative overflow-hidden">
        <div className="absolute top-[-40%] right-[-40%] w-full h-full bg-brand-500/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 border-b border-white/5 pb-6 sm:pb-8 relative z-10">
          <Avatar
            user={previewUser}
            size="lg"
            showRing
            loading={uploadMutation.isPending}
            className="shrink-0"
          />
          <div className="text-center sm:text-left space-y-1 min-w-0 flex-1">
            <h4 className="text-base font-bold text-white truncate">{user?.name}</h4>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            <p className="text-[10px] text-slate-500 capitalize">
              Avatar: {user?.avatarType ?? 'generated'}
            </p>
            <p className={`text-[10px] font-bold uppercase tracking-wider ${isAdmin(user) ? 'text-purple-400' : 'text-brand-400'}`}>
              {isAdmin(user) ? 'Administrator' : 'Member'}
            </p>
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/5 w-fit">
            {(['upload', 'url'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab === 'upload' ? 'Upload' : 'URL'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'upload' ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-3"
              >
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`
                    cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all
                    ${isDragging
                      ? 'border-brand-400 bg-brand-500/10'
                      : 'border-white/10 hover:border-brand-500/40 hover:bg-white/5'
                    }
                  `}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                      e.target.value = '';
                    }}
                  />
                  <ImagePlus className="mx-auto mb-3 text-brand-400" size={28} aria-hidden />
                  <p className="text-sm font-medium text-white">Drag & drop or click to upload</p>
                  <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP · max 2MB</p>
                  {uploadMutation.isPending && (
                    <div className="mt-4 space-y-2">
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <motion.div
                          className="h-full bg-brand-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-slate-400">Uploading… {uploadProgress}%</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.form
                key="url"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                onSubmit={urlForm.handleSubmit((data) => urlMutation.mutate(data.url))}
                className="space-y-3"
              >
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 pointer-events-none">
                    <LinkIcon size={16} aria-hidden />
                  </span>
                  <input
                    {...urlForm.register('url')}
                    type="url"
                    placeholder="https://example.com/avatar.png"
                    className="input-field pl-12 py-3.5"
                  />
                </div>
                {urlForm.formState.errors.url && (
                  <span className="text-xs text-rose-400 pl-1">
                    {urlForm.formState.errors.url.message}
                  </span>
                )}
                <button
                  type="submit"
                  disabled={urlMutation.isPending || isAvatarBusy}
                  className="btn-primary py-3"
                >
                  {urlMutation.isPending ? (
                    <Loader2 size={16} className="animate-spin" aria-hidden />
                  ) : (
                    <Upload size={16} aria-hidden />
                  )}
                  Apply URL
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          <button
            type="button"
            onClick={() => removeMutation.mutate()}
            disabled={isAvatarBusy}
            className="flex items-center gap-2 text-xs text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50"
          >
            {removeMutation.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Remove avatar (use generated)
          </button>
        </div>

        <form onSubmit={handleSubmit((data) => profileMutation.mutate(data))} className="space-y-6 relative z-10 border-t border-white/5 pt-8">
          <div className="space-y-2">
            <label htmlFor="settings-name" className="text-xs font-semibold text-slate-300 tracking-wider uppercase pl-1">
              Full name
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-slate-500 pointer-events-none">
                <UserIcon size={16} aria-hidden />
              </span>
              <input
                id="settings-name"
                {...register('name')}
                type="text"
                placeholder="Your name"
                className="input-field pl-12 py-3.5"
              />
            </div>
            {errors.name && (
              <span className="text-xs text-rose-400 pl-1">{errors.name.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={profileMutation.isPending}
            className="btn-primary w-full sm:w-auto py-3.5"
          >
            {profileMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden />
                Saving…
              </>
            ) : (
              <>
                <Save size={16} aria-hidden />
                Save name
              </>
            )}
          </button>
        </form>
      </GlassCard>
    </div>
  );
};
