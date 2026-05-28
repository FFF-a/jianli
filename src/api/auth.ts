import { api } from './client';
import type { LoginRequest, LoginResponse, RegisterRequest, TokenRefreshResponse } from './types';

export function login(phone: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>('/api/auth/login', { phone, password } as LoginRequest);
}

export function register(data: RegisterRequest): Promise<LoginResponse> {
  return api.post<LoginResponse>('/api/auth/register', data);
}

export function sendSms(phone: string): Promise<null> {
  return api.post<null>('/api/auth/send-sms', { phone });
}

export function refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
  return api.post<TokenRefreshResponse>('/api/auth/refresh', { refreshToken });
}
