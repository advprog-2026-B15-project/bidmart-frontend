'use client';
import { useState } from 'react';
import AccountSideNav from '@/components/AccountSideNav';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Switch from '@/components/ui/Switch';
import { Check, Gavel, AlertTri, Trophy, Clock, Box, Info } from '@/components/icons';
import { NOTIFS } from '@/lib/data';
import type { Notification } from '@/types';


function iconFor(t: string) {
  switch (t) {
    case 'bid':    return { Ico: Gavel,    cls: 'bid' };
    case 'out':    return { Ico: AlertTri, cls: 'out' };
    case 'won':    return { Ico: Trophy,   cls: 'won' };
    case 'ending': return { Ico: Clock,    cls: 'ending' };
    case 'order':  return { Ico: Box,      cls: 'order' };
    default:       return { Ico: Info,     cls: 'order' };
  }
}

export default function NotifikasiPage() {
  const [tab, setTab] = useState<'all' | 'bids' | 'auctions' | 'orders'>('all');
  const [emailOn, setEmailOn] = useState(true);
  const [pushOn, setPushOn] = useState(true);
  const [smsOn, setSmsOn] = useState(false);
  const [outbidOn, setOutbidOn] = useState(true);
  const [endingOn, setEndingOn] = useState(true);
  const [list, setList] = useState<Notification[]>(NOTIFS);

  const filterMap = {
    all:      () => true,
    bids:     (n: Notification) => n.type === 'bid' || n.type === 'out',
    auctions: (n: Notification) => n.type === 'won' || n.type === 'ending',
    orders:   (n: Notification) => n.type === 'order',
  };
  const filtered = list.filter(filterMap[tab]);
  const counts = {
    all:      list.length,
    bids:     list.filter(filterMap.bids).length,
    auctions: list.filter(filterMap.auctions).length,
    orders:   list.filter(filterMap.orders).length,
  };
  const unreadCt = list.filter(n => n.unread).length;

  function markAllRead() { setList(prev => prev.map(n => ({ ...n, unread: false }))); }
  function toggleRead(id: string) { setList(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n)); }

  return (
    <div className="bm-page-wide">
      <div className="bm-app">
        <AccountSideNav active="notifications"/>
        <div>
          <div className="bm-pg-head">
            <div>
              <h1>Notifikasi {unreadCt > 0 && <span style={{ fontSize: 16, color: 'var(--blue-600)', fontWeight: 600 }}>({unreadCt} belum dibaca)</span>}</h1>
              <p>Aktivitas terbaru untuk lelang, pesanan, dan akun kamu.</p>
            </div>
            <Button variant="ghost" size="md" onClick={markAllRead} leftIcon={<Check width={16} height={16}/>}>
              Tandai semua dibaca
            </Button>
          </div>

          <div className="bm-notif-shell">
            <div>
              <div className="bm-tabpills">
                {(['all', 'bids', 'auctions', 'orders'] as const).map(t => (
                  <button key={t} className={`bm-tabpill ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                    {t === 'all' ? 'Semua' : t === 'bids' ? 'Tawaran' : t === 'auctions' ? 'Lelang' : 'Pesanan'}
                    <span className="count">{counts[t]}</span>
                  </button>
                ))}
              </div>

              <div className="bm-notif-list" style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface)', overflow: 'hidden' }}>
                {filtered.map(n => {
                  const { Ico, cls } = iconFor(n.type);
                  return (
                    <div key={n.id} className={`bm-notif ${n.unread ? 'unread' : ''}`} onClick={() => toggleRead(n.id)}>
                      <div className={`bm-notif-ico ${cls}`}><Ico width={20} height={20}/></div>
                      <div className="bm-notif-body">
                        <div className="bm-notif-title">
                          {n.title}
                          {n.type === 'ending' && <Badge tone="red">URGENT</Badge>}
                          {n.type === 'won' && <Badge tone="green">MENANG</Badge>}
                        </div>
                        <div className="bm-notif-desc">{n.desc}</div>
                      </div>
                      <div className="bm-notif-right">
                        {n.unread && <span className="bm-notif-unread-dot"/>}
                        <span>{n.when}</span>
                      </div>
                    </div>
                  );
                })}
                {filtered.length === 0 && (
                  <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
                    Tidak ada notifikasi di kategori ini.
                  </div>
                )}
              </div>
            </div>

            <aside className="bm-prefs">
              <h4>Saluran</h4>
              <div className="bm-prefrow">
                <div className="l"><span className="nm">Email</span><span className="ds">aulia.r@gmail.com</span></div>
                <Switch on={emailOn} onChange={setEmailOn}/>
              </div>
              <div className="bm-prefrow">
                <div className="l"><span className="nm">Push notification</span><span className="ds">Di browser &amp; aplikasi</span></div>
                <Switch on={pushOn} onChange={setPushOn}/>
              </div>
              <div className="bm-prefrow">
                <div className="l"><span className="nm">SMS</span><span className="ds">+62 812-•••-3344</span></div>
                <Switch on={smsOn} onChange={setSmsOn}/>
              </div>
              <h4 style={{ marginTop: 22 }}>Jenis</h4>
              <div className="bm-prefrow">
                <div className="l"><span className="nm">Saat kamu disalip</span><span className="ds">Outbid alerts</span></div>
                <Switch on={outbidOn} onChange={setOutbidOn}/>
              </div>
              <div className="bm-prefrow">
                <div className="l"><span className="nm">Lelang akan berakhir</span><span className="ds">Watchlist · 5 menit</span></div>
                <Switch on={endingOn} onChange={setEndingOn}/>
              </div>
              <div className="bm-prefrow">
                <div className="l"><span className="nm">Update pesanan</span><span className="ds">Pengiriman, sengketa</span></div>
                <Switch on={true} onChange={() => {}}/>
              </div>
              <div className="bm-prefrow">
                <div className="l"><span className="nm">Promo &amp; rekomendasi</span><span className="ds">Maksimal 1× per minggu</span></div>
                <Switch on={false} onChange={() => {}}/>
              </div>
              <div style={{ paddingTop: 14, marginTop: 6, borderTop: '1px solid var(--border)' }}>
                <a style={{ fontSize: 13, color: 'var(--blue-600)', cursor: 'pointer' }}>Pengaturan lanjutan →</a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
