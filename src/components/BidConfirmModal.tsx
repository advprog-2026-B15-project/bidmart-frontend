'use client';
import { X, Gavel, Wallet } from './icons';
import Button from './ui/Button';
import { CompactCountdown } from './Countdown';
import { fmtRp } from '@/lib/data';
import type { AuctionItem } from '@/types';

interface BidConfirmModalProps {
  open: boolean;
  item: AuctionItem | null;
  bidAmount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export default function BidConfirmModal({ open, item, bidAmount, onClose, onConfirm }: BidConfirmModalProps) {
  if (!open || !item) return null;
  const fee = Math.round(bidAmount * 0.02);
  const total = bidAmount + fee;
  return (
    <div className="bm-modal-backdrop" onClick={onClose}>
      <div className="bm-modal" onClick={e => e.stopPropagation()}>
        <div className="bm-modal-head">
          <h3>Konfirmasi tawaran kamu</h3>
          <button className="bm-modal-close" onClick={onClose}><X width={20} height={20}/></button>
        </div>
        <div className="bm-modal-body">
          <div className="bm-modal-item">
            <div className="bm-modal-item-thumb">
              <div className={item.art}/>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="bm-modal-item-title">{item.title}</div>
              <div className="bm-modal-item-meta">
                Sisa <CompactCountdown end={item.ends}/> · {item.bids} bid · oleh {item.seller}
              </div>
            </div>
          </div>
          <div className="bm-modal-amount">
            <div className="row">
              <span className="lbl">Tawaran kamu</span>
              <span className="big">{fmtRp(bidAmount)}</span>
            </div>
            <div className="row">
              <span className="lbl" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500, color: 'var(--ink-2)' }}>Tertinggi saat ini</span>
              <span className="small">{fmtRp(item.price)}</span>
            </div>
            <div className="row">
              <span className="lbl" style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500, color: 'var(--ink-2)' }}>Biaya layanan (2%)</span>
              <span className="small">{fmtRp(fee)}</span>
            </div>
          </div>
          <div className="bm-modal-hold">
            <Wallet width={18} height={18}/>
            <div>
              <b>{fmtRp(total)}</b> akan ditahan sementara dari dompet kamu hingga lelang berakhir.
              Jika kamu disalip, dana akan dikembalikan otomatis.
            </div>
          </div>
        </div>
        <div className="bm-modal-fine">
          Dengan menawar, kamu setuju untuk membeli barang ini jika menang. Tawaran tidak dapat dibatalkan setelah dikirim.
        </div>
        <div className="bm-modal-foot">
          <Button variant="secondary" size="lg" onClick={onClose}>Batal</Button>
          <Button variant="primary" size="lg" onClick={onConfirm}>
            <Gavel width={16} height={16}/> Konfirmasi tawaran
          </Button>
        </div>
      </div>
    </div>
  );
}
