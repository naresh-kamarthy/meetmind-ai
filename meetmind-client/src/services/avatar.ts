import { api } from './api';
import type { User } from '../types';

interface AvatarResponse {
  success: boolean;
  message: string;
  user: User;
}

export const uploadAvatar = async (
  file: File,
  onProgress?: (percent: number) => void
): Promise<AvatarResponse> => {
  const formData = new FormData();
  formData.append('avatar', file);

  const res = await api.post<AvatarResponse>('/users/avatar/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event) => {
      if (!event.total || !onProgress) return;
      onProgress(Math.round((event.loaded * 100) / event.total));
    },
  });

  return res.data;
};

export const setAvatarUrl = async (url: string): Promise<AvatarResponse> => {
  const res = await api.post<AvatarResponse>('/users/avatar/url', { url });
  return res.data;
};

export const removeAvatar = async (): Promise<AvatarResponse> => {
  const res = await api.delete<AvatarResponse>('/users/avatar');
  return res.data;
};
