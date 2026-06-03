'use client';
import { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import StarRating from '@/components/StarRating';
import { BlocksCountdown, CompactCountdown, useCountdown } from '@/components/Countdown';
import { Heart, Shield, Truck, Refresh, Lock, Settings } from '@/components/icons';
import { fmtRp } from '@/lib/data';
import { useAuction } from '@/store/auction-context';
import { getAuctionRaw, getAuctionByListingId, getAuctionBids, getAuctionStreamUrl, placeBid } from '@/modules/auction/api';
import { getListing, deleteListing, type Listing } from '@/modules/catalog/api';
import { getCurrentUserId } from '@/lib/api';
import type { AuctionItem, BidEntry } from '@/types';


interface AuctionRaw {
  id: string;
  title: string;
  startingPrice: number;
  currentPrice: number;
  minimumIncrement: number;
  endTime: string;
  sellerId: string;
  listingId: string;
  status: string;
}

function DetailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { activeItem, openModal, closeModal, modal, addToast } = useAuction();

  const id = searchParams.get('id');

  const [auctionRaw, setAuctionRaw] = useState<AuctionRaw | null>(null);
  const [listing, setListing] = useState<Listing | null>(null);
  const [bids, setBids] = useState<BidEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidding, setBidding] = useState(false);
  const [thumb, setThumb] = useState(0);
  const [tab, setTab] = useState<'history' | 'desc'>('desc');

  // Derived from raw auction data
  const startingPrice = auctionRaw?.startingPrice ?? 0;
  const currentPrice = auctionRaw?.currentPrice ?? startingPrice;
  const minimumIncrement = auctionRaw?.minimumIncrement ?? 50_000;
  const minNext = (currentPrice || startingPrice) + minimumIncrement;
  const [bidVal, setBidVal] = useState('');

  // Construct AuctionItem for modal and countdown from raw data
  const auctionItem: AuctionItem | null = auctionRaw
    ? {
        id: auctionRaw.id,
        title: auctionRaw.title,
        price: auctionRaw.currentPrice,
        bids: bids.length,
        ends: new Date(auctionRaw.endTime).getTime(),
        art: activeItem?.art ?? 'bm-art-elec',
        imageUrls: listing?.imageUrls ?? activeItem?.imageUrls,
        cat: listing?.category?.name ?? activeItem?.cat ?? 'Lainnya',
        seller: auctionRaw.sellerId,
        rating: 0,
        ratingCount: 0,
      }
    : activeItem;

  const ends = auctionItem?.ends ?? Date.now() + 86400000;
  const cd = useCountdown(ends);
  const safe = cd.total > 60 * 60 * 1000;
  const urgent = cd.total < 2 * 60 * 1000 && cd.total > 0;

  const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8082';
  const mainImageUrl = auctionItem?.imageUrls?.[thumb]
    ? `${API_BASE}/uploads/${auctionItem.imageUrls[thumb].split('/').pop()}`
    : null;

  const refreshBids = useCallback(async () => {
    if (!id) return;
    try {
      const fresh = await getAuctionBids(id);
      setBids(fresh);
    } catch {
      // keep existing bids on error
    }
  }, [id]);

  // Initial data fetch
  useEffect(() => {
    if (!id) {
      router.push('/');
      return;
    }
    
    async function init() {
      try {
        // id from URL may be auction ID or catalog listing ID — try both
        let raw;
        try {
          raw = await getAuctionRaw(id!);
        } catch {
          const byListing = await getAuctionByListingId(id!).catch(() => null);
          if (!byListing) throw new Error('Auction not found');
          raw = byListing;
        }

        const r = raw as unknown as AuctionRaw;
        const bidList = await getAuctionBids(r.id);
        setAuctionRaw(r);
        setBids(bidList);

        const base = r.currentPrice > 0 ? r.currentPrice : r.startingPrice;
        setBidVal(String(base + r.minimumIncrement));

        // Fetch full listing details to get the description
        if (r.listingId) {
          const l = await getListing(r.listingId);
          setListing(l);
        }
      } catch (err) {
        console.error("Failed to fetch auction details:", err);
      } finally {
        setLoading(false);
      }
    }
    
    init();
  }, [id, router]);

  // SSE — real-time price and bid updates with auto-reconnect
  useEffect(() => {
    if (!id) return;
    let es: EventSource;
    let timer: ReturnType<typeof setTimeout>;
    let closed = false;

    function connect() {
      if (closed || !id) return;
      es = new EventSource(getAuctionStreamUrl(id));
      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data as string) as { currentPrice?: number; endTime?: string; status?: string };
          setAuctionRaw(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              ...(data.currentPrice !== undefined && { currentPrice: data.currentPrice }),
              ...(data.endTime !== undefined && { endTime: data.endTime }),
              ...(data.status !== undefined && { status: data.status }),
            };
          });
          void refreshBids();
        } catch {
          // ignore malformed SSE frames
        }
      };
      es.onerror = () => {
        es.close();
        if (!closed) timer = setTimeout(connect, 3000);
      };
    }

    connect();
    return () => {
      closed = true;
      clearTimeout(timer);
      es?.close();
    };
  }, [id, refreshBids]);

  // Bid confirm handler
  async function handleBidConfirm() {
    if (!auctionRaw) return;
    setBidding(true);
    try {
      await placeBid(auctionRaw.id, modal?.amount ?? minNext);
      closeModal();
      addToast({ tone: 'success', title: 'Tawaran berhasil!', desc: `Rp ${(modal?.amount ?? minNext).toLocaleString('id-ID')} masuk.` });
      await refreshBids();
      // Refresh price
      const updated = await getAuctionRaw(auctionRaw.id);
      setAuctionRaw(updated as unknown as AuctionRaw);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal mengirim tawaran';
      addToast({ tone: 'error', title: 'Tawaran gagal', desc: msg });
    } finally {
      setBidding(false);
    }
  }

  if (loading || !auctionItem) {
    return (
      <div className="bm-page-wide" style={{ padding: '48px 0', textAlign: 'center', color: 'var(--ink-3)' }}>
        Memuat lelang...
      </div>
    );
  }

  const it = auctionItem;
  const currentUserId = getCurrentUserId();
  const isLoggedIn = !!currentUserId;
  const isSeller = currentUserId === auctionRaw?.sellerId;
  const canDelete = isSeller && bids.length === 0 && auctionRaw?.status !== 'CLOSED' && auctionRaw?.status !== 'WON';

  async function handleDeleteListing() {
    if (!auctionRaw?.listingId) return;
    if (!confirm('Apakah Anda yakin ingin menghapus listing ini? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      await deleteListing(auctionRaw.listingId);
      addToast({ tone: 'success', title: 'Listing Dihapus', desc: 'Listing lelang berhasil dihapus.' });
      router.push('/');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Gagal menghapus listing.';
      addToast({ tone: 'error', title: 'Gagal', desc: msg });
    }
  }

  return (
    <div className="bm-page-wide">
      <nav className="bm-bread">
        <button type="button" onClick={() => router.push('/')}>Beranda</button>
        <span className="sep">/</span>
        <span className="here">{it.title.split(' ').slice(0, 3).join(' ')}…</span>
      </nav>

      <div className="bm-detail">
        <div className="bm-gallery">
          <div className="bm-gallery-main">
            {mainImageUrl ? (
               /* eslint-disable-next-line @next/next/no-img-element */
               <img src={mainImageUrl} alt={it.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <>
                <div className="bm-gallery-main-art"/>
                <div className={`bm-gallery-main-art ${it.art}`} style={{ position: 'absolute' }}/>
              </>
            )}
            <span className="bm-listing-badge bm-listing-badge-red"
              style={{ top: 16, left: 16, fontSize: 11, padding: '5px 10px' }}>
              LIVE · {cd.total > 0 ? <CompactCountdown end={it.ends}/> : 'Berakhir'}
            </span>
          </div>
          {it.imageUrls && it.imageUrls.length > 0 && (
            <div className="bm-gallery-thumbs">
              {it.imageUrls.map((url, i) => (
                <button key={url} className={`bm-gallery-thumb ${thumb === i ? 'active' : ''}`} onClick={() => setThumb(i)}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`${API_BASE}/uploads/${url.split('/').pop()}`} 
                    alt={`Thumb ${i}`} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                </button>
              ))}
            </div>
          )}
          <dl className="bm-spec-table" style={{ marginTop: 18 }}>
            <dt>Penjual</dt>         <dd>{it.seller}</dd>
            <dt>Kategori</dt>        <dd>{it.cat}</dd>
            <dt>Status</dt>          <dd>{auctionRaw?.status ?? '-'}</dd>
            <dt>Harga awal</dt>      <dd>{fmtRp(startingPrice || it.price)}</dd>
            <dt>Min. kenaikan</dt>   <dd>{fmtRp(minimumIncrement)}</dd>
          </dl>
        </div>

        <div className="bm-detail-info">
          <div>
            <Badge tone="green">Verified seller</Badge>
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
          </div>

          <div className="bm-bid-panel">
            <div className="bm-bid-row-base">
              <span className="bm-bid-lbl">Tawaran tertinggi</span>
              <span className="bm-bid-sub">{bids.length} bid</span>
            </div>
            <div className="bm-bid-row-base" style={{ alignItems: 'flex-end' }}>
              <div className="bm-bid-price-big">{fmtRp(currentPrice)}</div>
            </div>

            <div className="bm-bid-divider"/>

            <div className="bm-bid-row-base">
              <span className="bm-bid-lbl">Sisa waktu</span>
              <span className="bm-bid-sub" style={{
                color: safe ? 'var(--green-700)' : urgent ? 'var(--red-600)' : 'var(--ink-2)',
                fontWeight: 600,
              }}>
                {safe ? 'Masih lama' : urgent ? 'Hampir berakhir!' : 'Akan berakhir'}
              </span>
            </div>
            <BlocksCountdown end={it.ends}/>

            <div className="bm-bid-divider"/>

            {isLoggedIn && isSeller ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <p style={{ color: 'var(--ink-2)', fontSize: 13, marginBottom: 12 }}>Ini adalah listing kamu sendiri. Kamu tidak bisa menawar barang ini.</p>
                {canDelete ? (
                  <Button
                    variant="secondary" size="md"
                    onClick={handleDeleteListing}
                    style={{ width: '100%', color: 'var(--red-600)', borderColor: 'var(--red-300)', background: 'var(--red-50)' }}
                  >
                    Batalkan &amp; Hapus Listing
                  </Button>
                ) : (
                  <p style={{ color: 'var(--ink-3)', fontSize: 12 }}>Listing tidak bisa dihapus karena sudah ada bid yang masuk atau sudah ditutup.</p>
                )}
              </div>
            ) : isLoggedIn ? (
              <>
                <div>
                  <label htmlFor="bid-amount" className="bm-bid-lbl" style={{ display: 'block', marginBottom: 8 }}>Tawaran kamu</label>
                  <div className="bm-bid-input-row">
                    <div className="bm-prefix-input" style={{ flex: 1 }}>
                      <span className="px">Rp</span>
                      <input
                        id="bid-amount"
                        type="text"
                        value={Number(bidVal.replace(/\D/g, '')).toLocaleString('id-ID')}
                        onChange={e => setBidVal(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                  </div>
                  <div className="bm-bid-hint" style={{ marginTop: 8 }}>
                    Minimum tawaran berikutnya: <b style={{ color: 'var(--ink)' }}>{fmtRp(minNext)}</b> · Kelipatan {fmtRp(minimumIncrement)}
                  </div>
                </div>

                <Button
                  variant="primary" size="lg"
                  onClick={() => openModal(it, Number.parseInt(bidVal.replace(/\D/g, ''), 10) || minNext)}
                  style={{ width: '100%', marginBottom: 12, marginTop: 16 }}
                  disabled={cd.total <= 0 || auctionRaw?.status === 'CLOSED' || auctionRaw?.status === 'WON' || auctionRaw?.status === 'UNSOLD'}
                >
                  {cd.total <= 0 || auctionRaw?.status === 'CLOSED' || auctionRaw?.status === 'WON' || auctionRaw?.status === 'UNSOLD' ? 'Lelang Ditutup' : 'Tawar Sekarang'}
                </Button>

                <a href="#auto-bid" style={{ fontSize: 13, color: 'var(--blue-600)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Settings width={14} height={14}/>
                  Atur Auto-bid (Proxy Bid)
                </a>
              </>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--ink-2)', fontSize: 13, padding: '8px 0' }}>
                <a href="/login" style={{ color: 'var(--blue-600)', fontWeight: 600 }}>Masuk</a> untuk ikut menawar
              </div>
            )}
          </div>

          <div className="bm-trust-row">
            <div className="bm-trust-item"><Truck width={16} height={16}/><span>Gratis ongkir Jabodetabek</span></div>
            <div className="bm-trust-item"><Refresh width={16} height={16}/><span>Refund 14 hari</span></div>
            <div className="bm-trust-item"><Lock width={16} height={16}/><span>Pembayaran aman</span></div>
          </div>
        </div>
      </div>

      <div className="bm-detail-tabs">
        <button className={`bm-detail-tab ${tab === 'desc' ? 'active' : ''}`} onClick={() => setTab('desc')}>Deskripsi Produk</button>
        <button className={`bm-detail-tab ${tab === 'history' ? 'active' : ''}`} onClick={() => setTab('history')}>
          Riwayat Tawaran <span style={{ color: 'var(--ink-3)', marginLeft: 4 }}>({bids.length})</span>
        </button>
      </div>

      <div className="bm-detail-body" style={{ maxWidth: '100%', padding: '24px 0 48px' }}>
        {tab === 'desc' && (
          <div style={{ maxWidth: 760, color: 'var(--ink-1)', lineHeight: 1.7, fontSize: 15 }}>
            {listing?.description ? (
              <div style={{ whiteSpace: 'pre-wrap' }}>{listing.description}</div>
            ) : (
              <p style={{ color: 'var(--ink-3)', fontStyle: 'italic' }}>Deskripsi tidak tersedia untuk lelang ini.</p>
            )}
          </div>
        )}
        {tab === 'history' && (
          <div className="bm-table-wrap" style={{ maxWidth: 880 }}>
            {bids.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--ink-3)' }}>
                Belum ada tawaran. Jadilah yang pertama!
              </div>
            ) : (
              <table className="bm-table">
                <thead>
                  <tr>
                    <th>Penawar</th><th>Jumlah</th><th>Waktu</th>
                    <th style={{ textAlign: 'right' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bids.map(b => (
                    <tr key={b.bidder + b.time} style={{ background: b.you ? 'rgba(54,101,243,0.03)' : 'transparent' }}>
                      <td>
                        <div className="item-cell">
                          <span className="bm-avatar sm" style={b.you ? { background: 'var(--blue-600)', color: '#fff' } : {}}>
                            {b.you ? 'KM' : b.bidder.slice(0, 2).toUpperCase()}
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
                         <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>Disalip</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {/* Bid confirm modal rendered inline */}
      {modal && (
        <div className="bm-modal-backdrop">
          <button className="bm-modal-scrim" type="button" aria-label="Tutup modal" onClick={closeModal}/>
          <div className="bm-modal">
            <div className="bm-modal-head">
              <h3>Konfirmasi tawaran kamu</h3>
              <button className="bm-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="bm-modal-body">
              <div className="bm-modal-item">
                <div className="bm-modal-item-thumb">
                  <div className={modal.item.art}/>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="bm-modal-item-title">{modal.item.title}</div>
                  <div className="bm-modal-item-meta">
                    Sisa <CompactCountdown end={modal.item.ends}/> · {bids.length} bid
                  </div>
                </div>
              </div>
              <div className="bm-modal-amount">
                <div className="row">
                  <span className="lbl">Tawaran kamu</span>
                  <span className="big">{fmtRp(modal.amount)}</span>
                </div>
                <div className="row">
                  <span className="lbl" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500, color: 'var(--ink-2)' }}>Tertinggi saat ini</span>
                  <span className="small">{fmtRp(currentPrice)}</span>
                </div>
              </div>
              <div className="bm-modal-hold">
                <div>
                  <b>{fmtRp(modal.amount)}</b> akan ditahan sementara dari dompet kamu hingga lelang berakhir.
                  Jika kamu disalip, dana akan dikembalikan otomatis.
                </div>
              </div>
            </div>
            <div className="bm-modal-fine">
              Dengan menawar, kamu setuju untuk membeli barang ini jika menang. Tawaran tidak dapat dibatalkan setelah dikirim.
            </div>
            <div className="bm-modal-foot">
              <Button variant="secondary" size="lg" onClick={closeModal} disabled={bidding}>Batal</Button>
              <Button variant="primary" size="lg" onClick={handleBidConfirm} disabled={bidding}>
                {bidding ? 'Mengirim...' : 'Konfirmasi tawaran'}
              </Button>
            </div>
          </div>
        </div>
      )}
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
