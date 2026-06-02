import { apiFetch, getToken, getCurrentUserId, getCurrentRole } from '@/lib/api';

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: { id: string; name: string } | null;
  imageUrls?: string[];
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

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
  children?: Category[];
}

export interface ListingFilters {
  page?: number;
  size?: number;
  title?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
}

export function getListings(filters?: ListingFilters) {
  const qs = new URLSearchParams();
  if (filters?.page !== undefined) qs.set('page', String(filters.page));
  if (filters?.size !== undefined) qs.set('size', String(filters.size));
  if (filters?.title) qs.set('title', filters.title);
  if (filters?.categoryId) qs.set('categoryId', filters.categoryId);
  if (filters?.minPrice !== undefined) qs.set('minPrice', String(filters.minPrice));
  if (filters?.maxPrice !== undefined) qs.set('maxPrice', String(filters.maxPrice));
  if (filters?.status) qs.set('status', filters.status);
  const query = qs.toString() ? `?${qs}` : '';
  return apiFetch<PagedListings>(`/api/listings${query}`);
}

export function getListing(id: string) {
  return apiFetch<Listing>(`/api/listings/${id}`);
}

export function getCategories() {
  return apiFetch<Category[]>('/api/categories');
}

export function getSellerListings(sellerId: string, filters?: { page?: number; size?: number; status?: string }) {
  const qs = new URLSearchParams();
  qs.set('sellerId', sellerId);
  if (filters?.page !== undefined) qs.set('page', String(filters.page));
  if (filters?.size !== undefined) qs.set('size', String(filters.size));
  if (filters?.status) qs.set('status', filters.status);
  return apiFetch<PagedListings>(`/api/listings?${qs}`);
}

function multipartHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = getToken();
  const userId = getCurrentUserId();
  const role = typeof window !== 'undefined' ? localStorage.getItem('bidmart_role') : null;
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (userId) headers['X-User-Id'] = userId;
  if (role) headers['X-User-Role'] = role;
  return headers;
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
  const form = new FormData();
  form.append('title', data.title);
  form.append('description', data.description);
  form.append('startingPrice', String(data.startingPrice));
  if (data.reservePrice) form.append('reservePrice', String(data.reservePrice));
  form.append('endTime', data.endTime);
  if (data.categoryId) form.append('categoryId', data.categoryId);
  data.images?.forEach(f => form.append('imageFiles', f));

  const res = await fetch('/api/proxy/api/listings', { method: 'POST', headers: multipartHeaders(), body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    let message = `HTTP ${res.status}`;
    try { const j = JSON.parse(text); message = j.message || j.error || message; } catch { if (text) message = text; }
    throw Object.assign(new Error(message), { status: res.status });
  }
  return res.json() as Promise<Listing>;
}

export async function updateListing(id: string, data: {
  title?: string;
  description?: string;
  categoryId?: string;
}): Promise<Listing> {
  return apiFetch<Listing>(`/api/listings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteListing(id: string): Promise<void> {
  return apiFetch<void>(`/api/listings/${id}`, { method: 'DELETE' });
}

export function publishListing(id: string) {
  return apiFetch<Listing>(`/api/listings/${id}/publish`, { method: 'PATCH' });
}
