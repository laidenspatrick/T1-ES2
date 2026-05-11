import { LoginInput, RegisterInput, TokenResponse, UserPublic } from '../types';

const BASE_URL = import.meta.env.VITE_MS_AUTH_URL || 'http://localhost:3001';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error((data as { error?: string }).error || 'Erro desconhecido');
  }

  return data as T;
}

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem('access_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  register(input: RegisterInput): Promise<UserPublic> {
    return request<UserPublic>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  login(input: LoginInput): Promise<TokenResponse> {
    return request<TokenResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  refresh(refreshToken: string): Promise<{ access_token: string }> {
    return request<{ access_token: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  logout(): Promise<void> {
    return request<void>('/auth/logout', {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  },

  me(): Promise<UserPublic> {
    return request<UserPublic>('/auth/me', {
      headers: getAuthHeaders(),
    });
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