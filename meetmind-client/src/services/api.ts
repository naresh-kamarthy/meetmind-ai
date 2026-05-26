import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const AUTH_SKIP_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh-token', '/auth/reset-password'];

let isRefreshing = false;
let refreshQueue: Array<(success: boolean) => void> = [];

const processQueue = (success: boolean) => {
  refreshQueue.forEach((cb) => cb(success));
  refreshQueue = [];
};

export const sessionHandlers: {
  onUnauthorized?: () => void;
  onSessionRestored?: () => void;
} = {};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const requestUrl = original?.url ?? '';
    const isAuthRequest = AUTH_SKIP_REFRESH.some((path) => requestUrl.includes(path));

    if (error.response?.status !== 401 || !original || original._retry || isAuthRequest) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((success) => {
          if (success) {
            resolve(api(original));
          } else {
            reject(error);
          }
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      await api.post('/auth/refresh-token');
      processQueue(true);
      sessionHandlers.onSessionRestored?.();
      return api(original);
    } catch {
      processQueue(false);
      sessionHandlers.onUnauthorized?.();
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  }
);
