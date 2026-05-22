/**
 * Centralized API endpoint registry.
 *
 * Usage:
 *   import { API } from '@/lib/endpoints';
 *   fetch(API.auth.login, { method: 'POST', ... })
 *   fetch(API.auction.byId('abc-123'))
 */

const BASE = '';

export const API = {
  // Auth Service
  auth: {
    register:        `${BASE}/api/auth/register`,
    login:           `${BASE}/api/auth/login`,
    verifyEmail:     `${BASE}/api/auth/verify-email`,
    refresh:         `${BASE}/api/auth/refresh`,
    logout:          `${BASE}/api/auth/logout`,
    forgotPassword:  `${BASE}/api/auth/forgot-password`,
    resetPassword:   `${BASE}/api/auth/reset-password`,
    // 2FA, uses mfaToken in body, not JWT
    twoFaVerify:     `${BASE}/api/auth/2fa/verify`,
    // 2FA setup requires login
    twoFaSetup:      `${BASE}/api/auth/2fa/setup`,
    twoFaConfirm:    `${BASE}/api/auth/2fa/confirm`,
    twoFaDisable:    `${BASE}/api/auth/2fa/disable`,
    sessions:        `${BASE}/api/auth/sessions`,
    sessionById:     (id: string) => `${BASE}/api/auth/sessions/${id}`,
    me:              `${BASE}/api/users/me`,
    // Admin only
    adminDisableUser:(id: string) => `${BASE}/api/admin/users/${id}/disable`,
  },

  // Catalog Service
  catalog: {
    // Public
    categories:      `${BASE}/api/categories`,
    listings:        `${BASE}/api/listings`,
    listingById:     (id: string) => `${BASE}/api/listings/${id}`,
    sellerStats:     (sellerId: string) => `${BASE}/api/listings/seller/${sellerId}/stats`,
    // Requires auth + SELLER role
    createListing:   `${BASE}/api/listings`,
    publishListing:  (id: string) => `${BASE}/api/listings/${id}/publish`,
    updateListing:   (id: string) => `${BASE}/api/listings/${id}`,
    deleteListing:   (id: string) => `${BASE}/api/listings/${id}`,
  },

  // Auction Service
  auction: {
    // Public
    list:            `${BASE}/api/auctions`,
    byId:            (id: string) => `${BASE}/api/auctions/${id}`,
    bids:            (id: string) => `${BASE}/api/auctions/${id}/bids`,
    // SSE stream, use with EventSource
    stream:          (id: string) => `${BASE}/api/auctions/${id}/stream`,
    // Requires auth
    create:          `${BASE}/api/auctions`,
    update:          (id: string) => `${BASE}/api/auctions/${id}`,
    activate:        (id: string) => `${BASE}/api/auctions/${id}/activate`,
    placeBid:        (id: string) => `${BASE}/api/auctions/${id}/bids`,
  },

  // Wallet Service
  wallet: {
    balance:         (userId: string) => `${BASE}/api/wallet/${userId}`,
    transactions:    (userId: string) => `${BASE}/api/wallet/${userId}/transactions`,
    topup:           (userId: string) => `${BASE}/api/wallet/${userId}/topup`,
    withdraw:        (userId: string) => `${BASE}/api/wallet/${userId}/withdraw`,
  },

  // Booking Service
  booking: {
    myOrders:        `${BASE}/api/bookings/me`,
    sellingOrders:   `${BASE}/api/bookings/selling`,
    byId:            (id: string) => `${BASE}/api/bookings/${id}`,
    updateShipment:  (id: string) => `${BASE}/api/bookings/${id}/shipment`,
    confirmDelivery: (id: string) => `${BASE}/api/bookings/${id}/confirm-delivery`,
    createDispute:   (id: string) => `${BASE}/api/bookings/${id}/dispute`,
    getDispute:      (id: string) => `${BASE}/api/bookings/${id}/dispute`,
  },

  // Notification Service
  notification: {
    list:            `${BASE}/api/notifications/me`,
    // SSE stream, use with EventSource
    stream:          `${BASE}/api/notifications/stream`,
    getPreferences:  `${BASE}/api/notifications/preferences/me`,
    updatePreferences:`${BASE}/api/notifications/preferences/me`,
    markRead:        (id: string) => `${BASE}/api/notifications/${id}/read`,
  },
} as const;
