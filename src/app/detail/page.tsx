'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { Suspense } from 'react';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StarRating from '@/components/StarRating';
import { BlocksCountdown, CompactCountdown, useCountdown } from '@/components/Countdown';
import { Heart, Shield, Truck, Refresh, Lock, Settings } from '@/components/icons';
import { ITEMS, BID_HISTORY, fmtRp } from '@/lib/data';
import { useAuction } from '@/store/auction-context';

function DetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeItem, openModal } = useAuction();
  const id = searchParams.get('id');
  const it = (id ? ITEMS.find(i => i.id === id) : null) ?? activeItem ?? ITEMS[0];

  const [thumb, setThumb] = useState(0);
  const [tab, setTab] = useState<'history' | 'desc' | 'shipping'>('history');
  const [bidVal, setBidVal] = useState(String(it.price + 50_000));
  const cd = useCountdown(it.ends);
  const safe = cd.total > 60 * 60 * 1000;
  const urgent = cd.total < 2 * 60 * 1000 && cd.total > 0;
  const minNext = it.price + 50_000;

  return (
    <div className="bm-page-wide">
      <nav className="bm-bread">
        <a onClick={() => router.push('/')}>Beranda</a>
        <span className="sep">/</span>
        <a>Elektronik</a>
        <span className="sep">/</span>
        <a>Audio &amp; Headphone</a>
        <span className="sep">/</span>
        <span className="here">{it.title.split(' ').slice(0, 3).join(' ')}…</span>
      </nav>

      <div className="bm-detail">
        <div className="bm-gallery">
          <div className="bm-gallery-main">
            <div className="bm-gallery-main-art"/>
            <div className={`bm-gallery-main-art ${it.art}`} style={{ position: 'absolute' }}/>
            <span className="bm-listing-badge bm-listing-badge-red"
              style={{ top: 16, left: 16, fontSize: 11, padding: '5px 10px' }}>
              LIVE · {cd.total > 0 ? <CompactCountdown end={it.ends}/> : 'Berakhir'}
            </span>
          </div>
          <div className="bm-gallery-thumbs">
            {[0, 1, 2, 3].map(i => (
              <button key={i} className={`bm-gallery-thumb ${thumb === i ? 'active' : ''}`} onClick={() => setThumb(i)}>
                <div className={`bm-gallery-thumb-art ${it.art}`} style={{ opacity: 0.9 - i * 0.12 }}/>
              </button>
            ))}
          </div>
          <dl className="bm-spec-table" style={{ marginTop: 18 }}>
            <dt>Kondisi</dt>           <dd>Bekas — Sangat Baik</dd>
            <dt>Brand</dt>             <dd>Sony</dd>
            <dt>Model</dt>             <dd>WH-1000XM5</dd>
            <dt>Konektivitas</dt>      <dd>Bluetooth 5.2 · 3.5mm jack</dd>
            <dt>Kelengkapan</dt>       <dd>Kotak asli, kabel USB-C, kabel aux, tas penyimpanan</dd>
            <dt>Lokasi</dt>            <dd>Jakarta Selatan</dd>
            <dt>Garansi</dt>           <dd>Tersisa 8 bulan (resmi Sony Indonesia)</dd>
          </dl>
        </div>

        <div className="bm-detail-info">
          <div>
            <Badge tone="green">Top-rated seller</Badge>
            <span style={{ marginLeft: 8 }}><Badge tone="blue">Garansi resmi</Badge></span>
          </div>
          <h1 className="bm-detail-title">{it.title}</h1>

          <div className="bm-seller-row">
            <span className="bm-avatar">{it.seller.slice(0, 2).toUpperCase()}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="bm-seller-name">{it.seller}</div>
              <div className="bm-seller-stats">
                <StarRating rating={it.rating} count={it.ratingCount}/>
              </div>
            </div>
            <a style={{ fontSize: 13, color: 'var(--blue-600)', cursor: 'pointer' }}>Lihat profil →</a>
          </div>

          <div className="bm-bid-panel">
            <div className="bm-bid-row-base">
              <span className="bm-bid-lbl">Tawaran tertinggi</span>
              <span className="bm-bid-sub">{it.bids} bid · Reserve terpenuhi</span>
            </div>
            <div className="bm-bid-row-base" style={{ alignItems: 'flex-end' }}>
              <div className="bm-bid-price-big">{fmtRp(it.price)}</div>
            </div>

            <div className="bm-bid-divider"/>

            <div className="bm-bid-row-base">
              <span className="bm-bid-lbl">Sisa waktu</span>
              <span className="bm-bid-sub" style={{
                color: safe ? 'var(--green-700)' : urgent ? 'var(--red-600)' : 'var(--ink-2)',
                fontWeight: 600
              }}>
                {safe ? 'Masih lama' : urgent ? 'Hampir berakhir!' : 'Akan berakhir'}
              </span>
            </div>
            <BlocksCountdown end={it.ends}/>

            <div className="bm-bid-divider"/>

            <div>
              <label className="bm-bid-lbl" style={{ display: 'block', marginBottom: 8 }}>Tawaran kamu</label>
              <div className="bm-bid-input-row">
                <div className="bm-prefix-input" style={{ flex: 1 }}>
                  <span className="px">Rp</span>
                  <input
                    type="text"
                    value={Number(bidVal.replace(/\D/g, '')).toLocaleString('id-ID')}
                    onChange={e => setBidVal(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
              <div className="bm-bid-hint" style={{ marginTop: 8 }}>
                Minimum tawaran berikutnya: <b style={{ color: 'var(--ink)' }}>{fmtRp(minNext)}</b> · Kelipatan {fmtRp(50_000)}
              </div>
            </div>

            <Button
              variant="primary" size="lg"
              onClick={() => openModal(it, parseInt(bidVal.replace(/\D/g, ''), 10) || minNext)}
              style={{ width: '100%' }}
            >
              Tawar Sekarang
            </Button>

            <a style={{ fontSize: 13, color: 'var(--blue-600)', cursor: 'pointer', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Settings width={14} height={14}/>
              Atur Auto-bid (Proxy Bid)
            </a>

            <div className="bm-bid-divider"/>

            <div className="bm-row" style={{ gap: 8 }}>
              <button className="bm-bid-watch" style={{ flex: 1 }}>
                <Heart width={16} height={16}/>Watchlist
              </button>
              <button className="bm-bid-watch" style={{ flex: 1 }}>
                <Shield width={16} height={16}/>Buyer Protection
              </button>
            </div>
          </div>

          <div className="bm-trust-row">
            <div className="bm-trust-item"><Truck width={16} height={16}/><span>Gratis ongkir Jabodetabek</span></div>
            <div className="bm-trust-item"><Refresh width={16} height={16}/><span>Refund 14 hari</span></div>
            <div className="bm-trust-item"><Lock width={16} height={16}/><span>Pembayaran aman</span></div>
          </div>
        </div>
      </div>

      <div className="bm-detail-tabs">
        <button className={`bm-detail-tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          Riwayat Tawaran <span style={{ color: 'var(--ink-3)', marginLeft: 4 }}>({BID_HISTORY.length})</span>
        </button>
        <button className={`bm-detail-tab ${tab === 'desc' ? 'active' : ''}`} onClick={() => setTab('desc')}>Deskripsi</button>
        <button className={`bm-detail-tab ${tab === 'shipping' ? 'active' : ''}`} onClick={() => setTab('shipping')}>
          Pengiriman &amp; Pembayaran
        </button>
      </div>

      <div className="bm-detail-body" style={{ maxWidth: '100%', padding: '24px 0 48px' }}>
        {tab === 'history' && (
          <div className="bm-table-wrap" style={{ maxWidth: 880 }}>
            <table className="bm-table">
              <thead>
                <tr>
                  <th>Penawar</th><th>Jumlah</th><th>Waktu</th>
                  <th style={{ textAlign: 'right' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {BID_HISTORY.map(b => (
                  <tr key={b.time + b.bidder} style={{ background: b.you ? 'rgba(54,101,243,0.03)' : 'transparent' }}>
                    <td>
                      <div className="item-cell">
                        <span className="bm-avatar sm" style={b.you ? { background: 'var(--blue-600)', color: '#fff' } : {}}>
                          {b.opener ? '—' : b.you ? 'AR' : b.bidder.slice(0, 2).toUpperCase()}
                        </span>
                        <span style={{ fontWeight: b.you ? 600 : 500, color: b.you ? 'var(--blue-700)' : 'var(--ink)' }}>
                          {b.bidder}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{fmtRp(b.amount)}</td>
                    <td style={{ color: 'var(--ink-3)' }}>{b.time}</td>
                    <td style={{ textAlign: 'right' }}>
                      {b.top ? <Badge tone="green">Tertinggi</Badge> :
                       b.opener ? <Badge tone="gray">Bid awal</Badge> :
                       <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>Disalip</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === 'desc' && (
          <div style={{ maxWidth: 760, color: 'var(--ink-2)', lineHeight: 1.7 }}>
            <p>Sony WH-1000XM5 dalam kondisi sangat baik, dipakai pribadi selama 4 bulan untuk kerja dari rumah. Tidak ada cacat fisik di luar bekas pakai normal pada cushion. Suara, ANC, dan touch control berfungsi sempurna. Kotak, dokumen, dan kabel asli lengkap.</p>
            <p style={{ marginTop: 12 }}>Garansi resmi Sony Indonesia tersisa 8 bulan (kartu garansi terlampir). Headphone akan dikemas double-bubble wrap dan kotak luar untuk keamanan pengiriman.</p>
            <h4 style={{ marginTop: 24, fontSize: 15 }}>Yang termasuk</h4>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              <li>Sony WH-1000XM5 Headphones (warna Midnight Black)</li>
              <li>Kotak retail asli dengan inner foam</li>
              <li>Kabel USB-C charging</li>
              <li>Kabel audio 3.5mm</li>
              <li>Carrying case original Sony</li>
              <li>Buku manual dan kartu garansi</li>
            </ul>
          </div>
        )}
        {tab === 'shipping' && (
          <div style={{ maxWidth: 760 }}>
            <dl className="bm-spec-table" style={{ gridTemplateColumns: '200px 1fr' }}>
              <dt>Lokasi pengiriman</dt>  <dd>Jakarta Selatan, DKI Jakarta</dd>
              <dt>Kurir tersedia</dt>     <dd>JNE Express · J&amp;T · SiCepat · Anteraja</dd>
              <dt>Estimasi sampai</dt>    <dd>1–3 hari kerja (Jabodetabek) · 2–5 hari (luar Jawa)</dd>
              <dt>Ongkir</dt>             <dd><b style={{ color: 'var(--green-700)' }}>GRATIS</b> ke Jabodetabek · Mulai Rp 25.000 untuk luar Jabodetabek</dd>
              <dt>Asuransi</dt>           <dd>Termasuk hingga {fmtRp(5_000_000)}</dd>
              <dt>Metode pembayaran</dt>  <dd>BidMart Wallet · BCA · Mandiri · BRI · BNI · GoPay · OVO · DANA</dd>
              <dt>Refund</dt>             <dd>14 hari setelah barang diterima — barang harus dikembalikan dalam kondisi semula</dd>
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DetailPage() {
  return (
    <Suspense fallback={<div style={{ padding: 48 }}>Memuat…</div>}>
      <DetailContent/>
    </Suspense>
  );
}
