import { apiFetch, getToken } from '@/lib/api';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: { id: string; name: string } | null;
  sellerId: string;
  startingPrice: number;
  currentPrice: number | null;
  reservePrice: number | null;
  endTime: string;
  status: string;
  bidCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PagedListings {
  content: Listing[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export function getListings(params?: { page?: number; size?: number }) {
  const qs = new URLSearchParams();
  if (params?.page !== undefined) qs.set('page', String(params.page));
  if (params?.size !== undefined) qs.set('size', String(params.size));
  const query = qs.toString() ? `?${qs}` : '';
  return apiFetch<PagedListings>(`/api/listings${query}`);
}

export function getListing(id: string) {
  return apiFetch<Listing>(`/api/listings/${id}`);
}

export async function createListing(data: {
  title: string;
  description: string;
  startingPrice: number;
  reservePrice?: number;
  endTime: string;
  categoryId?: string;
  images?: File[];
}): Promise<Listing> {
  // Catalog service requires multipart/form-data — do NOT set Content-Type manually
  const form = new FormData();
  form.append('title', data.title);
  form.append('description', data.description);
  form.append('startingPrice', String(data.startingPrice));
  if (data.reservePrice) form.append('reservePrice', String(data.reservePrice));
  form.append('endTime', data.endTime);
  if (data.categoryId) form.append('categoryId', data.categoryId);
  data.images?.forEach(f => form.append('imageFiles', f));

  const token = getToken();
  const userId = localStorage.getItem('bidmart_user_id');
  const role = localStorage.getItem('bidmart_role');
  
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['X-User-Id'] = userId;
  if (role) headers['X-User-Role'] = role;

  const res = await fetch('/api/proxy/api/listings', { method: 'POST', headers, body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, string>;
    throw Object.assign(new Error(err['message'] ?? `HTTP ${res.status}`), { status: res.status });
  }
  return res.json() as Promise<Listing>;
}

export function publishListing(id: string) {
  return apiFetch<Listing>(`/api/listings/${id}/publish`, { method: 'PATCH' });
}
