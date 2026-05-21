export interface AuctionItem {
  id: string;
  title: string;
  price: number;
  bids: number;
  ends: number;
  art: string;
  cat: string;
  seller: string;
  rating: number;
  ratingCount: number;
  badge?: { tone: string; text: string };
}

export interface CategoryPill {
  id: string;
  name: string;
  icon: string;
  art?: string;
}

export interface Transaction {
  type: string;
  desc: string;
  amount: number;
  d: number;
  balance: number;
  date: string;
}

export interface TrackingEvent {
  t: string;
  desc: string;
  where: string;
  curr?: boolean;
}

export interface Order {
  id: string;
  role: string;
  status: string;
  item: { title: string; art: string };
  counterpart: string;
  price: number;
  when: string;
  tracking?: { courier: string; num: string; lastUpd: string };
  history?: TrackingEvent[];
  step: number;
}

export interface Notification {
  id: string;
  type: string;
  unread: boolean;
  title: string;
  desc: string;
  when: string;
}

export interface BidEntry {
  bidder: string;
  amount: number;
  time: string;
  you: boolean;
  top: boolean;
  opener?: boolean;
}

export interface AdminUser {
  name: string;
  email: string;
  role: string;
  status: string;
  joined: string;
  lifetime: number;
}

export interface AdminFlag {
  id: string;
  title: string;
  art: string;
  reason: string;
  seller: string;
  time: string;
}

export interface AdminDispute {
  id: string;
  title: string;
  buyer: string;
  seller: string;
  status: string;
  amount: number;
  age: string;
}

export interface Toast {
  id: string;
  tone: 'success' | 'error' | 'info';
  title: string;
  desc?: string;
}

export interface ModalState {
  item: AuctionItem;
  amount: number;
}
