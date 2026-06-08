'use client';
import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import AuctionCard from '@/components/AuctionCard';
import { fmtRp } from '@/lib/data';
import { useAuction } from '@/store/auction-context';
import { getListings, getCategories, type Listing, type Category } from '@/modules/catalog/api';
import { getUsername } from '@/lib/api';
import type { AuctionItem } from '@/types';

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
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);

  const searchQuery = searchParams.get('q') ?? '';
  const activeCat = searchParams.get('cat') ?? 'all';
  const sortBy = searchParams.get('sb') ?? 'createdAt';
  const direction = (searchParams.get('sd') ?? 'desc') as 'asc' | 'desc';
  const pParam = parseInt(searchParams.get('p') ?? '0', 10);
  const page = isNaN(pParam) ? 0 : pParam;
  const pageSize = 8;

  const [inputQuery, setInputQuery] = useState(searchQuery);

  useEffect(() => {
    const name = getUsername();
    if (name) setUsername(name.includes('@') ? name.split('@')[0] : name);
  }, []);

  useEffect(() => {
    setInputQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    getCategories()
        .then(data => setCategories(data))
        .catch(err => console.error(err));
  }, []);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getListings({
        page: page,
        size: pageSize,
        status: 'ACTIVE',
        sortBy: sortBy,
        direction: direction,
        title: searchQuery || undefined,
        categoryId: activeCat === 'all' ? undefined : activeCat,
      });
      const mapped = data.content
          .map(l => listingToItem(l, activeCat === 'all' ? undefined : activeCat));

      // Jika kita urutkan di backend, kita tidak perlu sort lagi di frontend
      // Kecuali jika kita ingin mempertahankan sort 'ends' sebagai default UI
      if (sortBy === 'createdAt' && !searchParams.get('sb')) {
         mapped.sort((a, b) => a.ends - b.ends);
      }

      setItems(mapped);
      setTotalPages(data.totalPages || 1);
    } catch {
      setItems([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [activeCat, searchQuery, page, sortBy, direction, searchParams]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (inputQuery) params.set('q', inputQuery); else params.delete('q');
    params.set('p', '0');
    router.push(`/?${params.toString()}`);
  }

  function handleSort(sb: string, sd: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sb', sb);
    params.set('sd', sd);
    params.set('p', '0');
    router.push(`/?${params.toString()}`);
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set('p', String(p));
    router.push(`/?${params.toString()}`);
  }

  function goDetail(item: AuctionItem) {
    setActiveItem(item);
    router.push(`/detail?id=${item.id}`);
  }

  const isFiltered = activeCat !== 'all' || !!searchQuery;
  const activeCategoryName = categories.find(c => c.id === activeCat)?.name ?? activeCat;

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
                {searchQuery
                    ? `Hasil pencarian "${searchQuery}"`
                    : `Kategori: ${activeCat === 'all' ? 'Semua' : activeCategoryName}`}
              </h2>
              <button
                  onClick={() => { setInputQuery(''); router.push('/'); }}
                  style={{ fontSize: 13, color: 'var(--blue-600)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                ✕ Hapus filter
              </button>
            </div>
        )}

        {/* Satu-satunya Bar Filter Kategori yang Dipertahankan (Selalu Aktif & Terlihat) */}
        <div style={{ display: 'flex', gap: 8, margin: '16px 0 24px', flexWrap: 'wrap' }}>
          <button
              type="button"
              className={`bm-catpill ${activeCat === 'all' ? 'active' : ''}`}
              onClick={() => {
                const params = new URLSearchParams(searchParams.toString());
                params.delete('cat');
                params.set('p', '0');
                router.push(`/?${params.toString()}`);
              }}
              style={{
                padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontSize: 14, fontWeight: 500,
                backgroundColor: activeCat === 'all' ? 'var(--blue-600)' : 'var(--surface-2)',
                color: activeCat === 'all' ? '#fff' : 'var(--ink)'
              }}
          >
            Semua
          </button>
          {categories.map(c => (
              <button
                  key={c.id}
                  type="button"
                  className={`bm-catpill ${activeCat === c.id ? 'active' : ''}`}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams.toString());
                    params.set('cat', c.id);
                    params.set('p', '0');
                    router.push(`/?${params.toString()}`);
                  }}
                  style={{
                    padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                    fontSize: 14, fontWeight: 500,
                    backgroundColor: activeCat === c.id ? 'var(--blue-600)' : 'var(--surface-2)',
                    color: activeCat === c.id ? '#fff' : 'var(--ink)'
                  }}
              >
                {c.name}
              </button>
          ))}
        </div>

        <section className="bm-section">
          <div className="bm-section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h2>{isFiltered ? 'Hasil' : 'Lelang Terbaru'}</h2>
              <p style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 4 }}>
                {isFiltered ? `${items.length} listing ditemukan` : 'Temukan barang impian kamu di lelang aktif hari ini.'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Urutkan:</span>
              <select
                  className="bm-input"
                  value={`${sortBy}-${direction}`}
                  onChange={(e) => {
                    const [sb, sd] = e.target.value.split('-');
                    handleSort(sb, sd);
                  }}
                  style={{ height: 36, padding: '0 8px', fontSize: 13, width: 'auto' }}
              >
                <option value="createdAt-desc">Terbaru</option>
                <option value="createdAt-asc">Terlama</option>
                <option value="currentPrice-asc">Harga Terendah</option>
                <option value="currentPrice-desc">Harga Tertinggi</option>
                <option value="category-asc">Kategori (A-Z)</option>
                <option value="category-desc">Kategori (Z-A)</option>
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {loading
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} style={{ height: 260, borderRadius: 12, background: 'var(--surface-2)', animation: 'pulse 1.5s ease-in-out infinite' }}/>
                ))
                : items.map(it => (
                    <AuctionCard key={it.id} item={it} onClick={() => goDetail(it)}/>
                ))
            }
            {!loading && items.length === 0 && (
                <div style={{ gridColumn: '1/-1', padding: '40px 0', textAlign: 'center', color: 'var(--ink-3)' }}>
                  {isFiltered ? 'Tidak ada listing yang cocok dengan filter.' : 'Tidak ada lelang aktif saat ini.'}
                </div>
            )}
          </div>

          {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 32 }}>
                <Button
                    variant="secondary"
                    size="md"
                    disabled={page === 0}
                    onClick={() => goToPage(page - 1)}
                >
                  Sebelumnya
                </Button>
                <div style={{ display: 'flex', gap: 8 }}>
                  {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                          key={i}
                          onClick={() => goToPage(i)}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 8,
                            border: '1px solid ' + (page === i ? 'var(--blue-600)' : 'var(--border)'),
                            background: page === i ? 'var(--blue-600)' : 'var(--surface)',
                            color: page === i ? '#fff' : 'var(--ink)',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                      >
                        {i + 1}
                      </button>
                  ))}
                </div>
                <Button
                    variant="secondary"
                    size="md"
                    disabled={page >= totalPages - 1}
                    onClick={() => goToPage(page + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
          )}
        </section>

        {!isFiltered && page === 0 && items.length > 8 && (
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