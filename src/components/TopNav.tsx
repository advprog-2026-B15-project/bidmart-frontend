'use client';
import { useRef, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Logo from './Logo';
import { Bell, Wallet, ChevronDown, Search, Package, Plus, Shield, Settings, LogOut } from './icons';
import { CAT_PILLS } from '@/lib/data';
import Icon from './icons';
import { getUsername, getEmail, clearToken, getToken } from '@/lib/api';

function getInitials(name: string): string {
  const clean = name.includes('@') ? name.split('@')[0] : name;
  const parts = clean.replace(/[^a-zA-Z ]/g, ' ').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

interface TopNavProps {
  alerts?: number;
}

export default function TopNav({ alerts = 3 }: Readonly<TopNavProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');
  const [userOpen, setUserOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [displayEmail, setDisplayEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = () => {
      const loggedIn = !!getToken();
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        const username = getUsername() ?? '';
        const email = getEmail() ?? '';
        const name = username || (email.includes('@') ? email.split('@')[0] : email);
        setDisplayName(name);
        setDisplayEmail(email);
      }
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  function handleLogout() {
    clearToken();
    setUserOpen(false);
    setIsLoggedIn(false);
    router.push('/login');
  }

  return (
    <header className="bm-nav-wrap">
      <div className="bm-nav">
        <button type="button" className="bm-nav-brand" onClick={() => router.push('/')} aria-label="Ke beranda">
          <Logo size={24}/>
        </button>
        <form
          className="bm-search"
          onSubmit={e => { e.preventDefault(); }}
        >
          <Search width={18} height={18}/>
          <input
            placeholder="Cari produk, brand, atau kategori"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select className="bm-search-cat" defaultValue="All">
            <option>Semua kategori</option>
            <option>Elektronik</option>
            <option>Fashion</option>
            <option>Otomotif</option>
            <option>Koleksi</option>
          </select>
          <button type="submit">Cari</button>
        </form>
        <div className="bm-nav-icons">
          {isLoggedIn ? (
            <>
              <button className="bm-iconbtn" onClick={() => router.push('/notifikasi')}>
                <span className="bm-iconbtn-wrap">
                  <Bell/>
                  {alerts > 0 && <span className="bm-iconbtn-badge">{alerts}</span>}
                </span>
                <span>Notifikasi</span>
              </button>
              <button className="bm-iconbtn" onClick={() => router.push('/wallet')}>
                <Wallet/>
                <span>Dompet</span>
              </button>
              <div ref={userRef} style={{ position: 'relative' }}>
                <button className="bm-userbtn" onClick={() => setUserOpen(o => !o)}>
                  <span className="bm-avatar">{getInitials(displayName || displayEmail || 'U')}</span>
                  <span>{displayName || 'Akun'}</span>
                  <ChevronDown width={14} height={14} style={{ color: 'var(--ink-3)' }}/>
                </button>
                {userOpen && (
                  <div className="bm-popover">
                    <div className="head">
                      <span className="bm-avatar lg">{getInitials(displayName || displayEmail || 'U')}</span>
                      <div>
                        <div className="nm">{displayName || 'Pengguna'}</div>
                        <div className="em">{displayEmail}</div>
                      </div>
                    </div>
                    <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/wallet'); }}><Wallet width={16} height={16}/>Dompet saya</button>
                    <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/pesanan'); }}><Package width={16} height={16}/>Pesanan</button>
                    <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/notifikasi'); }}><Bell width={16} height={16}/>Notifikasi</button>
                    <div className="sep"/>
                    <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/buat-lelang'); }}><Plus width={16} height={16}/>Jual barang</button>
                    <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/admin'); }}><Shield width={16} height={16}/>Admin dashboard</button>
                    <div className="sep"/>
                    <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/pengaturan'); }}><Settings width={16} height={16}/>Pengaturan akun</button>
                    <button type="button" className="row danger" onClick={handleLogout}><LogOut width={16} height={16}/>Keluar</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <button className="bm-userbtn" onClick={() => router.push('/login')}>
              Masuk
            </button>
          )}
        </div>
      </div>
      <div className="bm-page-wide">
        <div className="bm-catpills">
          {CAT_PILLS.map(c => {
            const IconC = (Icon as Record<string, React.FC<React.SVGProps<SVGSVGElement>>>)[c.icon] || Icon.Tag;
            const active = pathname === '/' && c.id === 'all';
            return (
              <button key={c.id} className={`bm-catpill ${active ? 'active' : ''}`}>
                <IconC width={14} height={14}/>{c.name}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
