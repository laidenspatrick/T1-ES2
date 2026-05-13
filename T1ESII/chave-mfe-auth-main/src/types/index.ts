export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface UserPublic {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
}

export interface ApiError {
  error: string;
}
