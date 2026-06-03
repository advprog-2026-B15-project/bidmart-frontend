'use client';
import { useRef, useState, useEffect, Suspense } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Logo from './Logo';
import { Bell, Wallet, ChevronDown, Search, Package, Plus, Shield, Settings, LogOut, User } from './icons';
import { CAT_PILLS } from '@/lib/data';
import Icon from './icons';
import { getUsername, getEmail, clearToken, getToken, getCurrentRole } from '@/lib/api';
import { getMyNotifications } from '@/modules/booking/api';

function getInitials(name: string): string {
  const clean = name.includes('@') ? name.split('@')[0] : name;
  const parts = clean.replace(/[^a-zA-Z ]/g, ' ').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

function TopNavContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [userOpen, setUserOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [displayEmail, setDisplayEmail] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [role, setRole] = useState('');
  const userRef = useRef<HTMLDivElement>(null);

  // Sync state with URL only when they differ to avoid cascading renders
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    const cat = searchParams.get('cat') ?? 'all';
    if (query !== q) setQuery(q);
    if (selectedCat !== cat) setSelectedCat(cat);
  }, [searchParams, query, selectedCat]);

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
        setRole(getCurrentRole() ?? '');
        getMyNotifications()
          .then(list => setUnreadCount(list.filter(n => n.unread).length))
          .catch(() => {});
      } else {
        setUnreadCount(0);
        setRole('');
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

  function handleSearch(e?: React.FormEvent, catId?: string) {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (query && !catId) params.set('q', query);
    const category = catId ?? selectedCat;
    if (category !== 'all') params.set('cat', category);
    router.push(`/?${params}`);
  }

  return (
    <header className="bm-nav-wrap">
      <div className="bm-nav">
        <button type="button" className="bm-nav-brand" onClick={() => router.push('/')} aria-label="Ke beranda">
          <Logo size={24}/>
        </button>
        <form
          className="bm-search"
          onSubmit={handleSearch}
        >
          <Search width={18} height={18}/>
          <input
            placeholder="Cari produk, brand, atau kategori"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <select 
            className="bm-search-cat" 
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
          >
            {CAT_PILLS.map(c => (
              <option key={c.id} value={c.id}>
                {c.id === 'all' ? 'Semua kategori' : c.name}
              </option>
            ))}
          </select>
          <button type="submit">Cari</button>
        </form>
        <div className="bm-nav-icons">
          {isLoggedIn ? (
            <>
              <button className="bm-iconbtn" onClick={() => router.push('/notifikasi')}>
                <span className="bm-iconbtn-wrap">
                  <Bell/>
                  {unreadCount > 0 && <span className="bm-iconbtn-badge">{unreadCount}</span>}
                </span>
                <span>Notifikasi</span>
              </button>
              {role !== 'ADMIN' && (
                <button className="bm-iconbtn" onClick={() => router.push('/wallet')}>
                  <Wallet/>
                  <span>Dompet</span>
                </button>
              )}
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
                        <div style={{ fontSize: 11, fontWeight: 600, marginTop: 3, padding: '1px 7px', borderRadius: 999, display: 'inline-block',
                          background: role === 'ADMIN' ? 'var(--red-50)' : role === 'SELLER' ? 'var(--blue-50)' : '#f0fdf4',
                          color: role === 'ADMIN' ? 'var(--red-700)' : role === 'SELLER' ? 'var(--blue-600)' : '#16a34a',
                        }}>
                          {role === 'ADMIN' ? 'Administrator' : role === 'SELLER' ? 'Penjual' : 'Pembeli'}
                        </div>
                      </div>
                    </div>

                    {role === 'ADMIN' ? (
                      <>
                        <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/admin'); }}><Shield width={16} height={16}/>Admin dashboard</button>
                        <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/notifikasi'); }}><Bell width={16} height={16}/>Notifikasi</button>
                        <div className="sep"/>
                        <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/profil'); }}><User width={16} height={16}/>Profil</button>
                        <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/keamanan'); }}><Settings width={16} height={16}/>Pengaturan akun</button>
                      </>
                    ) : (
                      <>
                        <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/wallet'); }}><Wallet width={16} height={16}/>Dompet saya</button>
                        <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/pesanan'); }}><Package width={16} height={16}/>Pesanan</button>
                        <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/notifikasi'); }}><Bell width={16} height={16}/>Notifikasi</button>
                        {role === 'SELLER' && (
                          <>
                            <div className="sep"/>
                            <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/buat-lelang'); }}><Plus width={16} height={16}/>Jual barang</button>
                          </>
                        )}
                        <div className="sep"/>
                        <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/profil'); }}><User width={16} height={16}/>Profil</button>
                        <button type="button" className="row" onClick={() => { setUserOpen(false); router.push('/keamanan'); }}><Settings width={16} height={16}/>Pengaturan akun</button>
                      </>
                    )}

                    <div className="sep"/>
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
            const active = pathname === '/' && selectedCat === c.id;
            return (
              <button 
                key={c.id} 
                className={`bm-catpill ${active ? 'active' : ''}`}
                onClick={() => handleSearch(undefined, c.id)}
              >
                <IconC width={14} height={14}/>{c.name}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}

export default function TopNav() {
  return (
    <Suspense fallback={<div style={{ height: 110 }} />}>
      <TopNavContent />
    </Suspense>
  );
}
