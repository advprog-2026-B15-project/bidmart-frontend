'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Package, Heart, Gavel, Bell, Wallet, CreditCard, List, Plus, TrendUp, User, Lock, Settings } from './icons';
import { getMyNotifications, getMyBookings, getMySellingBookings } from '@/modules/booking/api';
import { getToken } from '@/lib/api';

interface AccountSideNavProps {
  active: string;
}

type NavGroup = { group: string };
type NavItem = { id: string; label: string; ico: React.ReactNode; badge?: number; path?: string };
type NavEntry = NavGroup | NavItem;

function isGroup(e: NavEntry): e is NavGroup {
  return 'group' in e;
}

export default function AccountSideNav({ active }: Readonly<AccountSideNavProps>) {
  const router = useRouter();
  const [unreadNotif, setUnreadNotif] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);

  useEffect(() => {
    if (!getToken()) return;
    getMyNotifications()
      .then(list => setUnreadNotif(list.filter(n => n.unread).length))
      .catch(() => {});
    Promise.all([getMyBookings(), getMySellingBookings()])
      .then(([buying, selling]) => {
        const active = [...buying, ...selling].filter(o => ['wait', 'ship'].includes(o.status)).length;
        setActiveOrders(active);
      })
      .catch(() => {});
  }, []);

  const items: NavEntry[] = [
    { group: 'Aktivitas' },
    { id: 'orders',        label: 'Pesanan',         ico: <Package width={16} height={16}/>,  badge: activeOrders || undefined,  path: '/pesanan' },
    { id: 'watchlist',     label: 'Watchlist',        ico: <Heart width={16} height={16}/> },
    { id: 'bidding',       label: 'Sedang menawar',   ico: <Gavel width={16} height={16}/> },
    { id: 'notifications', label: 'Notifikasi',       ico: <Bell width={16} height={16}/>,     badge: unreadNotif || undefined,  path: '/notifikasi' },
    { group: 'Keuangan' },
    { id: 'wallet',        label: 'Dompet',           ico: <Wallet width={16} height={16}/>,              path: '/wallet' },
    { id: 'payment',       label: 'Metode bayar',     ico: <CreditCard width={16} height={16}/> },
    { group: 'Jualan' },
    { id: 'listings',      label: 'Listing saya',     ico: <List width={16} height={16}/>,               path: '/listing-saya' },
    { id: 'create',        label: 'Buat lelang baru', ico: <Plus width={16} height={16}/>,               path: '/buat-lelang' },
    { id: 'sales',         label: 'Penjualan',        ico: <TrendUp width={16} height={16}/> },
    { group: 'Akun' },
    { id: 'profile',       label: 'Profil',           ico: <User width={16} height={16}/>,   path: '/profil' },
    { id: 'security',      label: 'Keamanan',         ico: <Lock width={16} height={16}/>,   path: '/keamanan' },
    { id: 'settings',      label: 'Pengaturan',       ico: <Settings width={16} height={16}/> },
  ];

  return (
    <nav className="bm-sidenav">
      {items.map(it =>
        isGroup(it) ? (
          <div key={'group-' + it.group} className="bm-sidenav-h">{it.group}</div>
        ) : (
          <button
            key={it.id}
            className={`bm-sidenav-item ${active === it.id ? 'active' : ''}`}
            onClick={() => it.path && router.push(it.path)}
          >
            {it.ico}{it.label}
            {it.badge && <span className="pill">{it.badge}</span>}
          </button>
        )
      )}
    </nav>
  );
}
