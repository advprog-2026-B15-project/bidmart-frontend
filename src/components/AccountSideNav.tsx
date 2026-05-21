'use client';
import { useRouter } from 'next/navigation';
import { Package, Heart, Gavel, Bell, Wallet, CreditCard, List, Plus, TrendUp, User, Lock, Settings } from './icons';

interface AccountSideNavProps {
  active: string;
}

export default function AccountSideNav({ active }: AccountSideNavProps) {
  const router = useRouter();
  const items = [
    { group: 'Aktivitas' },
    { id: 'orders',        label: 'Pesanan',         ico: <Package width={16} height={16}/>,  badge: 4,  path: '/pesanan' },
    { id: 'watchlist',     label: 'Watchlist',        ico: <Heart width={16} height={16}/>,    badge: 12 },
    { id: 'bidding',       label: 'Sedang menawar',   ico: <Gavel width={16} height={16}/>,    badge: 2 },
    { id: 'notifications', label: 'Notifikasi',       ico: <Bell width={16} height={16}/>,     badge: 3,  path: '/notifikasi' },
    { group: 'Keuangan' },
    { id: 'wallet',        label: 'Dompet',           ico: <Wallet width={16} height={16}/>,              path: '/wallet' },
    { id: 'payment',       label: 'Metode bayar',     ico: <CreditCard width={16} height={16}/> },
    { group: 'Jualan' },
    { id: 'listings',      label: 'Listing saya',     ico: <List width={16} height={16}/>,     badge: 7 },
    { id: 'create',        label: 'Buat lelang baru', ico: <Plus width={16} height={16}/>,               path: '/buat-lelang' },
    { id: 'sales',         label: 'Penjualan',        ico: <TrendUp width={16} height={16}/> },
    { group: 'Akun' },
    { id: 'profile',       label: 'Profil',           ico: <User width={16} height={16}/> },
    { id: 'security',      label: 'Keamanan',         ico: <Lock width={16} height={16}/> },
    { id: 'settings',      label: 'Pengaturan',       ico: <Settings width={16} height={16}/> },
  ];

  return (
    <nav className="bm-sidenav">
      {(items as any[]).map((it: any, i: number) =>
        it.group ? (
          <div key={'g' + i} className="bm-sidenav-h">{it.group}</div>
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
