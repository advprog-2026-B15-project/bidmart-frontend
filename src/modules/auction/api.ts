import { apiFetch, getCurrentUserId } from '@/lib/api';
import { API } from '@/lib/endpoints';
import type { AuctionItem, BidEntry } from '@/types';

// Backend response types

interface AuctionResponse {
  id: string;
  title: string;
  startingPrice: number;
  reservePrice: number;
  minimumIncrement: number;
  currentPrice: number;
  status: 'DRAFT' | 'ACTIVE' | 'EXTENDED' | 'CLOSED' | 'WON' | 'UNSOLD';
  endTime: string;
  listingId: string;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
}

interface BidResponse {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  createdAt: string;
}

export interface CreateAuctionRequest {
  listingId: string;
  title: string;
  startingPrice: number;
  reservePrice?: number;
  minimumIncrement: number;
  endTime: string;
}

// Mappers

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  const hour = Math.floor(min / 60);
  if (min < 1) return 'Baru saja';
  if (min < 60) return `${min} menit lalu`;
  if (hour < 24) return `${hour} jam lalu`;
  return `${Math.floor(hour / 24)} hari lalu`;
}

function mapAuction(a: AuctionResponse, bidCount = 0): AuctionItem {
  return {
    id: a.id,
    title: a.title,
    price: a.currentPrice,
    bids: bidCount,
    ends: new Date(a.endTime).getTime(),
    // Catalog integration pending — use default art as fallback
    art: 'bm-art-elec',
    cat: 'elec',
    seller: a.sellerId,
    rating: 0,
    ratingCount: 0,
    badge: a.status === 'EXTENDED'
      ? { tone: 'amber', text: 'DIPERPANJANG' }
      : undefined,
  };
}

function mapBid(b: BidResponse, currentUserId: string | null, index: number): BidEntry {
  const isTop = index === 0;
  const isYou = b.bidderId === currentUserId;
  return {
    bidder: isYou ? 'kamu' : `${b.bidderId.slice(0, 6)}***`,
    amount: b.amount,
    time: relativeTime(b.createdAt),
    you: isYou,
    top: isTop,
    opener: false,
  };
}

// API functions

export async function getAuctions(): Promise<AuctionItem[]> {
  const list = await apiFetch<AuctionResponse[]>(API.auction.list);
  return list.map(a => mapAuction(a));
}

export async function getAuctionById(id: string): Promise<AuctionItem> {
  const a = await apiFetch<AuctionResponse>(API.auction.byId(id));
  return mapAuction(a);
}

export async function findAuctionByListingId(listingId: string): Promise<AuctionResponse | null> {
  try {
    for (let page = 0; page < 5; page++) {
      const url = `${API.auction.list}?page=${page}&size=50`;
      const res = await apiFetch<{content: AuctionResponse[]}>(url);
      const found = res.content.find(a => a.listingId === listingId);
      if (found) return found;
      if (res.content.length < 50) break;
    }
  } catch (e) {
    console.warn('Fallback search failed', e);
  }
  return null;
}

export async function getAuctionBids(auctionId: string): Promise<BidEntry[]> {
  const userId = getCurrentUserId();
  const bids = await apiFetch<BidResponse[]>(API.auction.bids(auctionId));
  return bids.map((b, i) => mapBid(b, userId, i));
}

export async function placeBid(auctionId: string, amount: number): Promise<BidResponse> {
  return apiFetch<BidResponse>(API.auction.placeBid(auctionId), {
    method: 'POST',
    body: JSON.stringify({ amount, auctionId }),
  });
}

export async function createAuction(data: CreateAuctionRequest): Promise<AuctionResponse> {
  return apiFetch<AuctionResponse>(API.auction.create, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function activateAuction(auctionId: string): Promise<AuctionResponse> {
  return apiFetch<AuctionResponse>(API.auction.activate(auctionId), {
    method: 'PATCH',
  });
}

// SSE stream URL — use with EventSource (routes through Vercel proxy)
export function getAuctionStreamUrl(auctionId: string): string {
  return `/api/proxy${API.auction.stream(auctionId)}`;
}

// Raw auction data (for detail page — includes minimumIncrement)
export async function getAuctionRaw(id: string): Promise<AuctionResponse> {
  return apiFetch<AuctionResponse>(API.auction.byId(id));
}
