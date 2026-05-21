'use client';
import { useRouter } from 'next/navigation';
import BidConfirmModal from '@/components/BidConfirmModal';
import { BlocksCountdown } from '@/components/Countdown';
import { ITEMS, fmtRp } from '@/lib/data';

export default function ModalPage() {
  const router = useRouter();
  const item = ITEMS[0];
  const bidAmount = item.price + 150_000;
  return (
    <div style={{ position: 'relative', minHeight: 'calc(100vh - 110px)' }}>
      <div className="bm-page-wide" style={{ pointerEvents: 'none', filter: 'blur(0.5px)', opacity: 0.55 }}>
        <nav className="bm-bread">
          <button type="button" onClick={() => router.push('/')}>Beranda</button><span className="sep">/</span><a href="#electronics">Elektronik</a><span className="sep">/</span>
          <span className="here">Sony WH-1000XM5…</span>
        </nav>
        <div className="bm-detail">
          <div className="bm-gallery">
            <div className="bm-gallery-main">
              <div className={`bm-gallery-main-art ${item.art}`}/>
            </div>
            <div className="bm-gallery-thumbs">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="bm-gallery-thumb">
                  <div className={`bm-gallery-thumb-art ${item.art}`}/>
                </div>
              ))}
            </div>
          </div>
          <div className="bm-detail-info">
            <h1 className="bm-detail-title">{item.title}</h1>
            <div className="bm-bid-panel">
              <div className="bm-bid-price-big">{fmtRp(item.price)}</div>
              <BlocksCountdown end={item.ends}/>
            </div>
          </div>
        </div>
      </div>
      <BidConfirmModal
        open={true}
        item={item}
        bidAmount={bidAmount}
        onClose={() => router.push('/detail?id=' + item.id)}
        onConfirm={() => router.push('/detail?id=' + item.id)}
      />
    </div>
  );
}
