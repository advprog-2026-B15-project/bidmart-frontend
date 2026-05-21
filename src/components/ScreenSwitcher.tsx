'use client';
import { useRouter, usePathname } from 'next/navigation';

const SCREENS: [string, string][] = [
  ['/', 'Beranda'],
  ['/detail', 'Detail Lelang'],
  ['/modal', 'Konfirmasi Bid'],
  ['/wallet', 'Dompet'],
  ['/login', 'Sign In / Register'],
  ['/buat-lelang', 'Buat Lelang'],
  ['/pesanan', 'Pesanan'],
  ['/notifikasi', 'Notifikasi'],
  ['/admin', 'Admin Dashboard'],
];

export default function ScreenSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <div className="bm-screen-switcher">
      <span className="lbl">Prototype · {SCREENS.length} screens</span>
      {SCREENS.map(([path, label]) => (
        <button
          key={path}
          className={pathname === path ? 'active' : ''}
          onClick={() => router.push(path)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
