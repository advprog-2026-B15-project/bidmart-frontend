import { apiFetch } from '@/lib/api';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  role: string;
  enabled: boolean;
}

export interface SessionInfo {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
}

export interface TotpSetup {
  secret: string;
  otpAuthUrl: string;
}

export function getMe(): Promise<UserProfile> {
  return apiFetch<UserProfile>('/api/users/me');
}

export function setupTotp(): Promise<TotpSetup> {
  return apiFetch<TotpSetup>('/api/auth/2fa/setup', { method: 'POST' });
}

export function confirmTotp(code: string): Promise<void> {
  return apiFetch('/api/auth/2fa/confirm', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export function disableTotp(code: string): Promise<void> {
  return apiFetch('/api/auth/2fa/disable', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}

export function getSessions(): Promise<SessionInfo[]> {
  return apiFetch<SessionInfo[]>('/api/auth/sessions');
}

export function revokeSession(id: string): Promise<void> {
  return apiFetch(`/api/auth/sessions/${id}`, { method: 'DELETE' });
}

export function revokeAllSessions(): Promise<void> {
  return apiFetch('/api/auth/sessions', { method: 'DELETE' });
}
