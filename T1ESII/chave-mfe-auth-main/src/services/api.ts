import axios, { type InternalAxiosRequestConfig } from 'axios';
import type { LoginInput, RegisterInput, TokenResponse, UserPublic } from '../types';

const BASE_URL = import.meta.env.VITE_MS_AUTH_URL || 'http://localhost:3001';

const http = axios.create({ baseURL: BASE_URL });

// Injeta o Bearer token em todas as requisições
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Tenta refresh automático em 401
http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post<{ access_token: string }>(
            `${BASE_URL}/auth/refresh`,
            { refresh_token: refreshToken },
          );
          saveTokens(data.access_token, refreshToken);
          original.headers.Authorization = `Bearer ${data.access_token}`;
          return http(original);
        } catch {
          clearTokens();
        }
      }
    }
    const message =
      (error.response?.data as { error?: string } | undefined)?.error ?? error.message;
    return Promise.reject(new Error(message));
  },
);

export const api = {
  register(input: RegisterInput): Promise<UserPublic> {
    return http.post<UserPublic>('/auth/register', input).then((r) => r.data);
  },

  login(input: LoginInput): Promise<TokenResponse> {
    return http.post<TokenResponse>('/auth/login', input).then((r) => r.data);
  },

  refresh(refreshToken: string): Promise<{ access_token: string }> {
    return http
      .post<{ access_token: string }>('/auth/refresh', { refresh_token: refreshToken })
      .then((r) => r.data);
  },

  logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    return http.post('/auth/logout', { refresh_token: refreshToken }).then(() => undefined);
  },

  me(): Promise<UserPublic> {
    return http.get<UserPublic>('/auth/me').then((r) => r.data);
  },
};

export function saveTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem('access_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

export function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}
