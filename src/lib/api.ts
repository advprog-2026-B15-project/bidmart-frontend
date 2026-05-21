const GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? 'https://bidmart-b15.duckdns.org';

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bidmart_token');
}

export function setToken(token: string, userId: string, role: string): void {
  localStorage.setItem('bidmart_token', token);
  localStorage.setItem('bidmart_user_id', userId);
  localStorage.setItem('bidmart_role', role);
}

export function clearToken(): void {
  localStorage.removeItem('bidmart_token');
  localStorage.removeItem('bidmart_user_id');
  localStorage.removeItem('bidmart_role');
}

export function getCurrentUserId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bidmart_user_id');
}

export function getCurrentRole(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('bidmart_role');
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${GATEWAY_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, string>;
    throw Object.assign(new Error(err['message'] ?? `HTTP ${res.status}`), { status: res.status });
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
