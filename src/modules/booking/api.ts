import { apiFetch } from '@/lib/api';
import type { Order, Notification } from '@/types';

// ── Backend response types ────────────────────────────────────────────────────

interface BookingSummary {
  id: number;
  auctionId: string;
  listingId: string;
  buyerUserId: string;
  sellerUserId: string;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
}

interface BookingDetail extends BookingSummary {
  items: { itemName: string; quantity: number; unitPrice: number }[];
  shipment: {
    status: string;
    trackingNumber: string | null;
    courierName: string | null;
    shippedAt: string | null;
    deliveredAt: string | null;
  } | null;
  updatedAt: string;
}

interface ApiNotification {
  id: number;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  relatedAuctionId: string | null;
  relatedBookingId: number | null;
}

interface NotificationPreference {
  userId: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
}

// ── Mappers ───────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, string> = {
  PENDING: 'wait', PAID: 'wait', CONFIRMED: 'wait',
  SHIPPED: 'ship',
  DELIVERED: 'recv', RESOLVED: 'recv',
  DISPUTED: 'disp',
};

const STEP_MAP: Record<string, number> = {
  PENDING: 1, PAID: 1, CONFIRMED: 1,
  SHIPPED: 2,
  DISPUTED: 3,
  DELIVERED: 4, RESOLVED: 4,
};

const NOTIF_TYPE_MAP: Record<string, string> = {
  WIN: 'won', LOSE: 'out',
  NEW_BID: 'bid', OUTBID: 'out',
  PAYMENT_CONFIRMED: 'order', BALANCE_RELEASED: 'order',
  SHIPPED: 'order', DELIVERED: 'order',
  DISPUTE_FILED: 'order', INFO: 'order',
};

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diffMs / 60000);
  const hour = Math.floor(min / 60);
  const day = Math.floor(hour / 24);
  if (min < 1) return 'Baru saja';
  if (min < 60) return `${min} menit lalu`;
  if (hour < 24) return `${hour} jam lalu`;
  if (day === 1) return 'Kemarin';
  return `${day} hari lalu`;
}

function mapBooking(b: BookingSummary, role: 'buyer' | 'seller', itemName?: string): Order {
  return {
    id: `BM-${b.id}`,
    role,
    status: STATUS_MAP[b.status] ?? 'wait',
    item: { title: itemName ?? b.auctionId ?? 'Item Lelang', art: 'bm-art-elec' },
    counterpart: role === 'buyer' ? b.sellerUserId : b.buyerUserId,
    price: b.totalAmount,
    when: `Dibuat ${new Date(b.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    step: STEP_MAP[b.status] ?? 1,
  };
}

function mapBookingDetail(b: BookingDetail, role: 'buyer' | 'seller'): Order {
  const itemName = b.items?.[0]?.itemName;
  const order = mapBooking(b, role, itemName);

  if (b.shipment?.trackingNumber) {
    order.tracking = {
      courier: b.shipment.courierName ?? 'Kurir',
      num: b.shipment.trackingNumber,
      lastUpd: b.shipment.shippedAt
        ? new Date(b.shipment.shippedAt).toLocaleString('id-ID')
        : '-',
    };
  }

  return order;
}

function mapNotification(n: ApiNotification): Notification {
  return {
    id: String(n.id),
    type: NOTIF_TYPE_MAP[n.type] ?? 'order',
    unread: !n.isRead,
    title: n.title,
    desc: n.message,
    when: relativeTime(n.createdAt),
  };
}

// ── Booking API ───────────────────────────────────────────────────────────────

export async function getMyBookings(): Promise<Order[]> {
  const list = await apiFetch<BookingSummary[]>('/api/bookings/me');
  return list.map(b => mapBooking(b, 'buyer'));
}

export async function getMySellingBookings(): Promise<Order[]> {
  const list = await apiFetch<BookingSummary[]>('/api/bookings/selling');
  return list.map(b => mapBooking(b, 'seller'));
}

export async function getBookingDetail(id: string, role: 'buyer' | 'seller'): Promise<Order> {
  const numericId = id.replace('BM-', '');
  const detail = await apiFetch<BookingDetail>(`/api/bookings/${numericId}`);
  return mapBookingDetail(detail, role);
}

export async function updateShipment(
  id: string,
  courierName: string,
  trackingNumber: string,
): Promise<void> {
  const numericId = id.replace('BM-', '');
  await apiFetch(`/api/bookings/${numericId}/shipment`, {
    method: 'PATCH',
    headers: { 'X-User-Role': 'SELLER' },
    body: JSON.stringify({ status: 'SHIPPED', courierName, trackingNumber }),
  });
}

export async function confirmDelivery(id: string): Promise<void> {
  const numericId = id.replace('BM-', '');
  await apiFetch(`/api/bookings/${numericId}/confirm-delivery`, {
    method: 'PATCH',
    headers: { 'X-User-Role': 'BUYER' },
  });
}

export async function fileDispute(id: string, reason: string): Promise<void> {
  const numericId = id.replace('BM-', '');
  await apiFetch(`/api/bookings/${numericId}/dispute`, {
    method: 'POST',
    headers: { 'X-User-Role': 'BUYER' },
    body: JSON.stringify({ reason }),
  });
}

// ── Notification API ──────────────────────────────────────────────────────────

export async function getMyNotifications(): Promise<Notification[]> {
  const list = await apiFetch<ApiNotification[]>('/api/notifications/me');
  return list.map(mapNotification);
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiFetch(`/api/notifications/${id}/read`, {
    method: 'PATCH',
    body: JSON.stringify({ read: true }),
  });
}

export async function getNotificationPreferences(): Promise<NotificationPreference> {
  return apiFetch<NotificationPreference>('/api/notifications/preferences/me');
}

export async function updateNotificationPreferences(
  emailEnabled: boolean,
  inAppEnabled: boolean,
): Promise<NotificationPreference> {
  return apiFetch<NotificationPreference>('/api/notifications/preferences/me', {
    method: 'PATCH',
    body: JSON.stringify({ emailEnabled, inAppEnabled }),
  });
}
