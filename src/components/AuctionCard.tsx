'use client';
import { useState } from 'react';
import { Heart, HeartFill } from './icons';
import { CompactCountdown, useCountdown } from './Countdown';
import { fmtRp } from '@/lib/data';
import type { AuctionItem } from '@/types';

interface AuctionCardProps {
  item: AuctionItem;
  onClick?: () => void;
}

export default function AuctionCard({ item, onClick }: Readonly<AuctionCardProps>) {
  const [watched, setWatched] = useState(false);
  const { total } = useCountdown(item.ends);
  const urgent = total < 2 * 60 * 1000 && total > 0;
  const ended = total <= 0;
  return (
    <article className="bm-listing">
      <div className="bm-listing-image">
        <div className={`bm-listing-image-fill ${item.art}`}/>
        <button
          className={`bm-listing-heart ${watched ? 'active' : ''}`}
          onClick={e => { e.stopPropagation(); setWatched(w => !w); }}
          aria-label="Watch this item"
        >
          {watched ? <HeartFill width={16} height={16}/> : <Heart width={16} height={16}/>}
        </button>
        {item.badge && !urgent && (
          <span className={`bm-listing-badge bm-listing-badge-${item.badge.tone}`}>{item.badge.text}</span>
        )}
        {urgent && <span className="bm-listing-badge bm-listing-badge-red">BERAKHIR</span>}
      </div>
      <button type="button" className="bm-listing-card-button" onClick={onClick}>
        <div className="bm-listing-meta">
        <div className="bm-listing-title">{item.title}</div>
        <div className="bm-listing-price">{fmtRp(item.price)}</div>
        <div className="bm-listing-sub">
          <span className={urgent ? 'urgent' : ''}>
            {ended ? 'Lelang berakhir' : <CompactCountdown end={item.ends}/>}
          </span>
          <span> · {item.bids} bid</span>
        </div>
        <div className="bm-listing-sub" style={{ marginTop: 2 }}>
          oleh <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>{item.seller}</span>
        </div>
        </div>
      </button>
    </article>
  );
}
