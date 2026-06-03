'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import AuctionCard from '@/components/AuctionCard';
import { fmtRp } from '@/lib/data';
import { useAuction } from '@/store/auction-context';
import { getListings, type Listing } from '@/modules/catalog/api';
import { getUsername } from '@/lib/api';
import type { AuctionItem } from '@/types';
import { CAT_PILLS } from '@/lib/data';
import Icon from '@/components/icons';

const CAT_ID_MAP: Record<string, string> = {
  '11111111-1111-1111-1111-111111111111': 'Elektronik',
  '22222222-2222-2222-2222-222222222222': 'Fashion & Pakaian',
  '33333333-3333-3333-3333-333333333333': 'Barang Koleksi',
  '44444444-4444-4444-4444-444444444444': 'Otomotif',
};

const ART_MAP: Record<string, string> = {
  '11111111-1111-1111-1111-111111111111': 'bm-art-elec',
  '22222222-2222-2222-2222-222222222222': 'bm-art-fash',
  '33333333-3333-3333-3333-333333333333': 'bm-art-coll',
  '44444444-4444-4444-4444-444444444444': 'bm-art-veh',
};

function listingToItem(l: Listing, catId?: string): AuctionItem {
  const artKey = catId ?? l.category?.id;
  return {
    id: l.id,
    title: l.title,
    price: l.currentPrice ?? l.startingPrice,
    bids: l.bidCount,
    ends: new Date(l.endTime).getTime(),
    art: ART_MAP[artKey ?? ''] ?? 'bm-art-elec',
    imageUrls: l.imageUrls,
    cat: l.category?.name ?? 'Lainnya',
    seller: l.sellerId,
    rating: 4.5,
    ratingCount: 0,
  };
}

function HomePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setActiveItem } = useAuction();

  const [items, setItems] = useState<AuctionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inputQuery, setInputQuery] = useState('');

  useEffect(() => {
    const name = getUsername();
    if (name) setUsername(name.includes('@') ? name.split('@')[0] : name);
    const q = searchParams.get('q') ?? '';
    const cat = searchParams.get('cat') ?? 'all';
    setInputQuery(q);
    setSearchQuery(q);
    setActiveCat(cat);
  }, [searchParams]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getListings({
        size: 12,
        title: searchQuery || undefined,
        categoryId: activeCat !== 'all' ? activeCat : undefined,
        status: 'ACTIVE',
      });
      const mapped = data.content
        .map(l => listingToItem(l, activeCat !== 'all' ? activeCat : undefined))
        .sort((a, b) => a.ends - b.ends);
      setItems(mapped);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeCat, searchQuery]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (inputQuery) params.set('q', inputQuery);
    if (activeCat !== 'all') params.set('cat', activeCat);
    router.push(`/?${params}`);
  }

  function handleCat(id: string) {
    setActiveCat(id);
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (id !== 'all') params.set('cat', id);
    router.push(`/?${params}`);
  }

  function goDetail(item: AuctionItem) {
    setActiveItem(item);
    router.push(`/detail?id=${item.id}`);
  }

  const isFiltered = activeCat !== 'all' || !!searchQuery;

  return (
    <div className="bm-page-wide">
      {!isFiltered && (
        <section className="bm-hero" style={{ padding: '32px 48px', margin: '16px 0 28px' }}>
          <div className="bm-hero-grid">
            <div>
              <Badge tone="solid-red" dot>LIVE · Lelang aktif</Badge>
              <h1 style={{ marginTop: 14, fontSize: 38 }}>Temukan. <em>Tawar.</em> Menangkan.</h1>
              <p style={{ fontSize: 16 }}>
                Lelang real-time dari jutaan produk — elektronik, koleksi langka, fashion, hingga otomotif.
              </p>
              <form className="bm-row" onSubmit={handleSearch} style={{ marginTop: 20 }}>
                <input
                  className="bm-input"
                  placeholder="Cari produk, brand, atau kategori..."
                  value={inputQuery}
                  onChange={e => setInputQuery(e.target.value)}
                  style={{ flex: 1, height: 46 }}
                />
                <Button variant="primary" size="lg" type="submit">Cari</Button>
              </form>
            </div>
            <div className="bm-hero-art">
              <div className="bm-hero-tile bm-hero-tile-1">
                <div className="img bm-art-elec"/>
                <div><div className="price">{fmtRp(4_250_000)}</div><div className="meta">27 bid</div></div>
              </div>
              <div className="bm-hero-tile bm-hero-tile-2">
                <div className="img bm-art-toys"/>
                <div><div className="price">{fmtRp(72_000_000)}</div><div className="meta">38 bid</div></div>
              </div>
              <div className="bm-hero-tile bm-hero-tile-3">
                <div className="img bm-art-fash"/>
                <div><div className="price" style={{ color: 'var(--ink)' }}>{fmtRp(1_850_000)}</div><div className="meta">9 bid</div></div>
              </div>
            </div>
          </div>
        </section>
      )}

      {isFiltered && (
        <div style={{ padding: '20px 0 8px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700 }}>
            {searchQuery ? `Hasil pencarian "${searchQuery}"` : `Kategori: ${CAT_ID_MAP[activeCat] ?? activeCat}`}
          </h2>
          <button
            onClick={() => { setInputQuery(''); setActiveCat('all'); router.push('/'); }}
            style={{ fontSize: 13, color: 'var(--blue-600)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            ✕ Hapus filter
          </button>
        </div>
      )}

      <section className="bm-section">
        <div className="bm-section-head">
          <div>
            <h2>{isFiltered ? 'Hasil' : 'Berakhir dalam waktu dekat'}</h2>
            <p style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 4 }}>
              {isFiltered ? `${items.length} listing ditemukan` : 'Lelang dengan timer terbawah — tawar sekarang sebelum kalah.'}
            </p>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ height: 260, borderRadius: 12, background: 'var(--surface-2)', animation: 'pulse 1.5s ease-in-out infinite' }}/>
              ))
            : items.slice(0, 8).map(it => (
                <AuctionCard key={it.id} item={it} onClick={() => goDetail(it)}/>
              ))
          }
          {!loading && items.length === 0 && (
            <div style={{ gridColumn: '1/-1', padding: '40px 0', textAlign: 'center', color: 'var(--ink-3)' }}>
              {isFiltered ? 'Tidak ada listing yang cocok dengan filter.' : 'Tidak ada lelang aktif saat ini.'}
            </div>
          )}
        </div>
      </section>

      {!isFiltered && items.length > 8 && (
        <section className="bm-section">
          <div className="bm-section-head">
            <div>
              <h2>Pilihan untuk {username ?? 'Kamu'}</h2>
              <p style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 4 }}>Berdasarkan kategori yang sering kamu lihat.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {items.slice(8, 16).map(it => (
              <AuctionCard key={'r-' + it.id} item={it} onClick={() => goDetail(it)}/>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>Memuat...</div>}>
      <HomePageContent/>
    </Suspense>
  );
}
