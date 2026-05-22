import { apiFetch } from '@/lib/api';

export interface WalletData {
  id: string;
  userId: string;
  availableBalance: number;
  heldBalance: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: 'TOP_UP' | 'WITHDRAW' | 'HOLD' | 'RELEASE' | 'PAYMENT';
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  auctId: string | null;
  createdAt: string;
}

export interface PagedTransactions {
  content: WalletTransaction[];
  totalElements: number;
  totalPages: number;
  number: number;
}

export function getWallet(userId: string) {
  return apiFetch<WalletData>(`/api/wallet/${userId}`);
}

export function topUp(userId: string, amount: number) {
  return apiFetch<WalletData>(`/api/wallet/${userId}/topup`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export function withdraw(userId: string, amount: number) {
  return apiFetch<WalletData>(`/api/wallet/${userId}/withdraw`, {
    method: 'POST',
    body: JSON.stringify({ amount }),
  });
}

export function getTransactions(userId: string, page = 0, size = 20) {
  return apiFetch<PagedTransactions>(`/api/wallet/${userId}/transactions?page=${page}&size=${size}`);
}
