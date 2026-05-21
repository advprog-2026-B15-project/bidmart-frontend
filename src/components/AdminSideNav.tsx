'use client';
import { useRouter } from 'next/navigation';
import { Grid, TrendUp, Flag, AlertTri, Shield, Users, Lock, List, Wallet, DollarSign, Home } from './icons';

interface AdminSideNavProps {
  active: string;
}

type NavGroup = { group: string };
type NavItem = { id: string; label: string; ico: React.ReactNode; badge?: number; path?: string };
type NavEntry = NavGroup | NavItem;

function isGroup(e: NavEntry): e is NavGroup {
  return 'group' in e;
}

export default function AdminSideNav({ active }: Readonly<AdminSideNavProps>) {
  const router = useRouter();
  const items: NavEntry[] = [
    { group: 'Overview' },
    { id: 'overview',   label: 'Dashboard',         ico: <Grid width={16} height={16}/> },
    { id: 'metrics',    label: 'Platform metrics',  ico: <TrendUp width={16} height={16}/> },
    { group: 'Moderation' },
    { id: 'flagged',    label: 'Listing di-flag',   ico: <Flag width={16} height={16}/>,     badge: 3 },
    { id: 'disputes',   label: 'Sengketa',          ico: <AlertTri width={16} height={16}/>, badge: 3 },
    { id: 'reports',    label: 'Laporan pengguna',  ico: <Shield width={16} height={16}/>,   badge: 8 },
    { group: 'Manajemen' },
    { id: 'users',      label: 'Pengguna',          ico: <Users width={16} height={16}/> },
    { id: 'roles',      label: 'Role & permission', ico: <Lock width={16} height={16}/> },
    { id: 'categories', label: 'Kategori',          ico: <List width={16} height={16}/> },
    { group: 'Keuangan' },
    { id: 'payouts',    label: 'Payout penjual',    ico: <Wallet width={16} height={16}/> },
    { id: 'fees',       label: 'Tarif & biaya',     ico: <DollarSign width={16} height={16}/> },
    { group: 'System' },
    { id: 'audit',      label: 'Audit log',         ico: <List width={16} height={16}/> },
    { id: 'back',       label: '← Kembali ke toko', ico: <Home width={16} height={16}/>, path: '/' },
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
