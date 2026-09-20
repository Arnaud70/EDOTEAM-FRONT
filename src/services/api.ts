import axios from 'axios';
import { authService } from './auth.service';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getApiErrorMessage = (error: any, fallback = 'Une erreur est survenue.') => {
  const data = error?.response?.data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error?.message === 'string') return data.error.message;
  if (Array.isArray(data?.message)) return data.message[0];
  if (typeof data?.error === 'string') return data.error;
  if (typeof error?.message === 'string') return error.message;
  return fallback;
};

export const unwrapApiData = <T = any>(payload: any): T => {
  if (!payload || typeof payload !== 'object') return payload as T;

  if ('data' in payload) {
    const nested = payload.data;
    if (nested && typeof nested === 'object' && 'data' in nested && nested.data !== undefined) {
      return nested.data as T;
    }
    return nested as T;
  }

  return payload as T;
};

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Toutes les requêtes qui expirent au même moment partagent le même refresh.
// Cela évite que la rotation du refresh token invalide les requêtes concurrentes.
let refreshPromise: Promise<any> | null = null;

// Intercepteur pour ajouter le token de session si présent
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs globales (ex: 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Ne pas tenter de rafraîchir pour les routes d'authentification ou si déjà réessayé
    const isAuthRoute = originalRequest.url?.includes('/auth/login') || 
                       originalRequest.url?.includes('/auth/register') || 
                       originalRequest.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest?._retry && !isAuthRoute) {
      originalRequest._retry = true;
      
      try {
        refreshPromise ??= authService.refresh().finally(() => {
          refreshPromise = null;
        });
        const { access_token } = await refreshPromise;
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
