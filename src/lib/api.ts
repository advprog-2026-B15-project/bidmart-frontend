const GATEWAY_URL = '/api/proxy';

function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return {};
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bidmart_token');
}

export function setToken(token: string, userId: string, role: string): void {
  const payload = decodeJwtPayload(token);
  
  // Try to find role in JWT if the provided role is just a default
  let finalRole = role;
  if (role === 'BUYER' || !role) {
    const jwtRole = (payload['role'] as string) || (payload['roles'] as string[])?.[0] || (payload['groups'] as string[])?.[0];
    if (jwtRole) finalRole = jwtRole;
  }

  localStorage.setItem('bidmart_token', token);
  localStorage.setItem('bidmart_user_id', userId);
  localStorage.setItem('bidmart_role', finalRole);
  
  const username = (payload['username'] as string) || (payload['preferred_username'] as string) || (payload['name'] as string) || '';
  const email = (payload['email'] as string) || userId;
  localStorage.setItem('bidmart_username', username);
  localStorage.setItem('bidmart_email', email);
}

export function clearToken(): void {
  ['bidmart_token', 'bidmart_user_id', 'bidmart_role', 'bidmart_username', 'bidmart_email'].forEach(k => localStorage.removeItem(k));
}

export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bidmart_user_id');
}

export function getCurrentRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bidmart_role');
}

export function getUsername(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bidmart_username') || localStorage.getItem('bidmart_user_id');
}

export function getEmail(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bidmart_email') || localStorage.getItem('bidmart_user_id');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const userId = getCurrentUserId();
  const role = getCurrentRole();

  const headers: Record<string, string> = {
    ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['X-User-Id'] = userId;
  if (role) headers['X-User-Role'] = role;

  const res = await fetch(`${GATEWAY_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text);
      message = json.message || json.error || message;
    } catch {
      if (text) message = text;
    }
    throw Object.assign(new Error(message), { status: res.status });
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

