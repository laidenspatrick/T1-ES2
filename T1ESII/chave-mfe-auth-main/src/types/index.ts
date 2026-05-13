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
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'ADMIN';
    created_at: string;
  }
  
  export interface TokenResponse {
    access_token: string;
    refresh_token: string;
  }
  
  export interface ApiError {
    error: string;
  }