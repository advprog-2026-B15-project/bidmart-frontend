import { apiFetch } from '@/lib/api';

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

export function createListing(data: {
  title: string;
  description: string;
  startingPrice: number;
  reservePrice?: number;
  endTime: string;
}) {
  return apiFetch<Listing>('/api/listings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function publishListing(id: string) {
  return apiFetch<Listing>(`/api/listings/${id}/publish`, { method: 'PATCH' });
}
