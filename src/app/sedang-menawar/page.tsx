'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AccountSideNav from '@/components/AccountSideNav';
import AuctionCard from '@/components/AuctionCard';
import Button from '@/components/ui/Button';
import { fmtRp } from '@/lib/data';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { getMyActiveBidAuctions, type MyBidAuction } from '@/modules/auction/api';
import { useAuction } from '@/store/auction-context';

function StatCard({ label, value }: Readonly<{ label: string; value: string | number }>) {
  return (
    <div style={{
      padding: 18,
      borderRadius: 16,
      border: '1px solid var(--border)',
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)',
    }}>
      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-3)' }}>
        {label}
      </div>
      <div style={{ marginTop: 10, fontSize: 28, fontWeight: 800, color: 'var(--ink)' }}>
        {value}
      </div>
    </div>
  );
}

function BidSummaryCard({
  item,
  onOpen,
}: Readonly<{
  item: MyBidAuction;
  onOpen: () => void;
}>) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <AuctionCard item={item.auction} onClick={onOpen}/>
      <div style={{
        display: 'grid',
        gap: 10,
        padding: 16,
        border: '1px solid var(--border)',
        borderRadius: 14,
        background: 'var(--surface)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 10px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            background: item.isTopBidder ? '#ecfdf3' : '#fff7ed',
            color: item.isTopBidder ? '#15803d' : '#c2410c',
          }}>
            {item.isTopBidder ? 'Tawaran tertinggi' : 'Sudah disalip'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>
            {item.totalBids} bid
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Tawaran tertinggimu</div>
            <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
              {fmtRp(item.myHighestBid)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Harga saat ini</div>
            <div style={{ marginTop: 4, fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>
              {fmtRp(item.auction.price)}
            </div>
          </div>
        </div>

        <Button variant="secondary" size="md" onClick={onOpen}>
          Buka detail lelang
        </Button>
      </div>
    </div>
  );
}

export default function SedangMenawarPage() {
  useRequireAuth();
  const router = useRouter();
  const { setActiveItem } = useAuction();
  const [items, setItems] = useState<MyBidAuction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setItems(await getMyActiveBidAuctions());
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  function openDetail(item: MyBidAuction) {
    setActiveItem(item.auction);
    router.push(`/detail?id=${item.auction.id}`);
  }

  const leadingCount = items.filter(item => item.isTopBidder).length;
  const outbidCount = items.length - leadingCount;

  return (
    <div className="bm-page-wide">
      <div className="bm-app">
        <AccountSideNav active="bidding"/>
        <div>
          <div className="bm-pg-head">
            <div>
              <h1>Sedang menawar</h1>
              <p>Lihat auction yang masih aktif dan posisi tawaranmu saat ini.</p>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
              Memuat lelang yang kamu ikuti...
            </div>
          ) : items.length === 0 ? (
            <div style={{
              padding: '48px 28px',
              borderRadius: 18,
              border: '1px dashed var(--border-strong)',
              background: 'linear-gradient(180deg, #ffffff 0%, #f9fbff 100%)',
              textAlign: 'center',
            }}>
              <h2 style={{ margin: 0, fontSize: 24 }}>Belum ada tawaran aktif</h2>
              <p style={{ margin: '10px 0 20px', color: 'var(--ink-3)' }}>
                Setelah kamu menawar di sebuah lelang aktif, item-nya akan muncul di sini.
              </p>
              <Button variant="primary" size="lg" onClick={() => router.push('/')}>
                Cari lelang aktif
              </Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                <StatCard label="Lelang diikuti" value={items.length}/>
                <StatCard label="Masih unggul" value={leadingCount}/>
                <StatCard label="Perlu dibalas" value={outbidCount}/>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 18 }}>
                {items.map(item => (
                  <BidSummaryCard
                    key={item.auction.id}
                    item={item}
                    onOpen={() => openDetail(item)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
