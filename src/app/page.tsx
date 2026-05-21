'use client';
import { useRouter } from 'next/navigation';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import AuctionCard from '@/components/AuctionCard';
import { ITEMS, fmtRp } from '@/lib/data';
import { useAuction } from '@/store/auction-context';
import type { AuctionItem } from '@/types';

export default function HomePage() {
  const router = useRouter();
  const { setActiveItem } = useAuction();
  const ending = [...ITEMS].sort((a, b) => a.ends - b.ends);

  function goDetail(item: AuctionItem) {
    setActiveItem(item);
    router.push(`/detail?id=${item.id}`);
  }

  return (
    <div className="bm-page-wide">
      <section className="bm-hero" style={{ padding: '32px 48px', margin: '16px 0 28px' }}>
        <div className="bm-hero-grid">
          <div>
            <Badge tone="solid-red" dot>LIVE · 14.832 lelang aktif</Badge>
            <h1 style={{ marginTop: 14, fontSize: 38 }}>Temukan. <em>Tawar.</em> Menangkan.</h1>
            <p style={{ fontSize: 16 }}>
              Lelang real-time dan Beli Sekarang dari jutaan produk — elektronik, koleksi langka,
              fashion, hingga otomotif.
            </p>
            <div className="bm-row">
              <Button variant="primary" size="lg">Jelajahi lelang</Button>
              <Button variant="secondary" size="lg">Cara menawar →</Button>
            </div>
          </div>
          <div className="bm-hero-art">
            <div className="bm-hero-tile bm-hero-tile-1">
              <div className="img bm-art-elec"/>
              <div>
                <div className="price">{fmtRp(4_250_000)}</div>
                <div className="meta">1m 38d · 27 bid</div>
              </div>
            </div>
            <div className="bm-hero-tile bm-hero-tile-2">
              <div className="img bm-art-toys"/>
              <div>
                <div className="price">{fmtRp(72_000_000)}</div>
                <div className="meta">11j 50m · 38 bid</div>
              </div>
            </div>
            <div className="bm-hero-tile bm-hero-tile-3">
              <div className="img bm-art-fash"/>
              <div>
                <div className="price" style={{ color: 'var(--ink)' }}>{fmtRp(1_850_000)}</div>
                <div className="meta">9 bid · 11 jam tersisa</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bm-section">
        <div className="bm-section-head">
          <div>
            <h2>Berakhir dalam waktu dekat</h2>
            <p style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 4 }}>
              Lelang dengan timer terbawah — tawar sekarang sebelum kalah.
            </p>
          </div>
          <a>Lihat semua →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {ending.slice(0, 8).map(it => (
            <AuctionCard key={it.id} item={it} onClick={() => goDetail(it)}/>
          ))}
        </div>
      </section>

      <section className="bm-section">
        <div className="bm-section-head">
          <div>
            <h2>Pilihan untuk Aulia</h2>
            <p style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 4 }}>
              Berdasarkan kategori yang sering kamu lihat.
            </p>
          </div>
          <a>Lihat semua →</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {ending.slice(4, 12).map(it => (
            <AuctionCard key={'r-' + it.id} item={it} onClick={() => goDetail(it)}/>
          ))}
        </div>
      </section>
    </div>
  );
}
