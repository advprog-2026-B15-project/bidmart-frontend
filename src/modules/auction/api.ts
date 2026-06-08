import { apiFetch, getCurrentUserId } from '@/lib/api';
import { API } from '@/lib/endpoints';
import { getSseGatewayUrl } from '@/lib/sse';
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

export interface MyBidAuction {
  auction: AuctionItem;
  myHighestBid: number;
  isTopBidder: boolean;
  totalBids: number;
  lastBidAt: string | null;
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

export async function getAuctions(params?: { page?: number; size?: number; status?: string; title?: string }): Promise<{ content: AuctionItem[]; totalPages: number }> {
  const q = new URLSearchParams();
  if (params?.page !== undefined) q.set('page', String(params.page));
  if (params?.size !== undefined) q.set('size', String(params.size));
  if (params?.status) q.set('status', params.status);
  if (params?.title) q.set('title', params.title);
  const url = `${API.auction.list}${q.toString() ? '?' + q.toString() : ''}`;
  const res = await apiFetch<{ content: AuctionResponse[]; totalPages: number }>(url);
  return { content: res.content.map(a => mapAuction(a)), totalPages: res.totalPages ?? 1 };
}

export async function getAuctionById(id: string): Promise<AuctionItem> {
  const a = await apiFetch<AuctionResponse>(API.auction.byId(id));
  return mapAuction(a);
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

// SSE stream URL — connect directly to the gateway so the browser keeps the stream open.
export function getAuctionStreamUrl(auctionId: string): string {
  return getSseGatewayUrl(API.auction.stream(auctionId));
}

// Raw auction data (for detail page — includes minimumIncrement)
export async function getAuctionRaw(id: string): Promise<AuctionResponse> {
  return apiFetch<AuctionResponse>(API.auction.byId(id));
}

// Lookup active auction by catalog listing ID
export async function getAuctionByListingId(listingId: string): Promise<AuctionResponse | null> {
  return apiFetch<AuctionResponse>(API.auction.byListingId(listingId)).catch(() => null);
}

export async function getMyActiveBidAuctions(): Promise<MyBidAuction[]> {
  const userId = getCurrentUserId();
  if (!userId) return [];

  const auctionMap = new Map<string, AuctionResponse>();
  const statuses = ['ACTIVE', 'EXTENDED'] as const;

  for (const status of statuses) {
    const firstPage = await apiFetch<{ content: AuctionResponse[]; totalPages: number }>(`${API.auction.list}?status=${status}&page=0&size=50`);
    firstPage.content.forEach(auction => auctionMap.set(auction.id, auction));

    const pageLimit = Math.min(firstPage.totalPages ?? 1, 3);
    for (let page = 1; page < pageLimit; page += 1) {
      const nextPage = await apiFetch<{ content: AuctionResponse[] }>(`${API.auction.list}?status=${status}&page=${page}&size=50`);
      nextPage.content.forEach(auction => auctionMap.set(auction.id, auction));
    }
  }

  const auctions = Array.from(auctionMap.values());
  const results: MyBidAuction[] = [];

  for (let i = 0; i < auctions.length; i += 8) {
    const batch = auctions.slice(i, i + 8);
    const entries = await Promise.all(batch.map(async auction => {
      const bids = await apiFetch<BidResponse[]>(API.auction.bids(auction.id)).catch(() => null);
      if (!bids?.length) return null;

      const myBids = bids.filter(bid => bid.bidderId === userId);
      if (!myBids.length) return null;

      return {
        auction: mapAuction(auction, bids.length),
        myHighestBid: Math.max(...myBids.map(bid => bid.amount)),
        isTopBidder: bids[0]?.bidderId === userId,
        totalBids: bids.length,
        lastBidAt: myBids[0]?.createdAt ?? null,
      } satisfies MyBidAuction;
    }));

    const validEntries = entries.filter((entry): entry is NonNullable<typeof entry> => entry !== null);
    results.push(...validEntries);
  }

  return results.sort((a, b) => a.auction.ends - b.auction.ends);
}
