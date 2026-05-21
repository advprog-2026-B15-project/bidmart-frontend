'use client';
import { useState } from 'react';
import AccountSideNav from '@/components/AccountSideNav';
import Button from '@/components/ui/Button';
import { Wallet, Clock, ArrowUp, Plus, Filter } from '@/components/icons';
import { TXNS, fmtRp } from '@/lib/data';
import { Gavel, ArrowDown, CreditCard, Refresh } from '@/components/icons';

function typeBadge(t: string) {
  const map: Record<string, { tone: string; icon: React.ReactNode }> = {
    'Top Up':   { tone: 'green',  icon: <ArrowDown width={12} height={12}/> },
    'Bid Hold': { tone: 'amber',  icon: <Gavel width={12} height={12}/> },
    'Payment':  { tone: 'blue',   icon: <CreditCard width={12} height={12}/> },
    'Refund':   { tone: 'gray',   icon: <Refresh width={12} height={12}/> },
    'Withdraw': { tone: 'gray',   icon: <ArrowUp width={12} height={12}/> },
  };
  const m = map[t] || { tone: 'gray', icon: null };
  return <span className={`bm-badge bm-badge-${m.tone}`}>{m.icon} {t}</span>;
}

export default function WalletPage() {
  const [typeFilter, setTypeFilter] = useState('All');
  const [page, setPage] = useState(1);
  const perPage = 8;
  const available = 18_420_000;
  const onHold = 4_250_000 + 27_000_000;

  const filtered = typeFilter === 'All' ? TXNS : TXNS.filter(t => t.type === typeFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="bm-page-wide">
      <div className="bm-app">
        <AccountSideNav active="wallet"/>
        <div>
          <div className="bm-pg-head">
            <div>
              <h1>Dompet BidMart</h1>
              <p>Kelola saldo, top up, dan pantau riwayat transaksi kamu.</p>
            </div>
            <div className="bm-row" style={{ gap: 10 }}>
              <Button variant="secondary" size="md" leftIcon={<ArrowUp width={16} height={16}/>}>Tarik dana</Button>
              <Button variant="primary" size="md" leftIcon={<Plus width={16} height={16}/>}>Top Up</Button>
            </div>
          </div>

          <div className="bm-walletcards">
            <div className="bm-walletcard green">
              <div className="bm-walletcard-ico"><Wallet width={26} height={26}/></div>
              <div className="bm-walletcard-body">
                <div className="bm-walletcard-lbl">Saldo Tersedia</div>
                <div className="bm-walletcard-val">{fmtRp(available)}</div>
                <div className="bm-walletcard-sub">Terakhir top up: {fmtRp(5_000_000)} pada 18 Mei 2026, 06:14</div>
              </div>
            </div>
            <div className="bm-walletcard amber">
              <div className="bm-walletcard-ico"><Clock width={26} height={26}/></div>
              <div className="bm-walletcard-body">
                <div className="bm-walletcard-lbl">Sedang Ditahan</div>
                <div className="bm-walletcard-val">{fmtRp(onHold)}</div>
                <div className="bm-walletcard-sub">
                  Pada <b style={{ color: '#a07000' }}>2</b> lelang aktif —
                  dana otomatis kembali jika kamu disalip atau lelang berakhir.
                </div>
              </div>
            </div>
          </div>

          <div className="bm-pg-head" style={{ marginBottom: 14, alignItems: 'flex-end' }}>
            <div>
              <h3 style={{ fontSize: 18, margin: 0 }}>Riwayat Transaksi</h3>
              <p style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 4 }}>
                Menampilkan <b style={{ color: 'var(--ink)' }}>{filtered.length}</b> dari {TXNS.length} transaksi
              </p>
            </div>
            <div className="bm-filterbar" style={{ margin: 0 }}>
              <select className="bm-select" value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1); }}>
                <option value="All">Semua tipe</option>
                <option value="Top Up">Top Up</option>
                <option value="Bid Hold">Bid Hold</option>
                <option value="Payment">Payment</option>
                <option value="Refund">Refund</option>
                <option value="Withdraw">Withdraw</option>
              </select>
              <select className="bm-select" defaultValue="30d">
                <option value="7d">7 hari terakhir</option>
                <option value="30d">30 hari terakhir</option>
                <option value="90d">90 hari terakhir</option>
                <option value="1y">12 bulan terakhir</option>
                <option value="all">Semua waktu</option>
              </select>
              <Button variant="ghost" size="md" leftIcon={<Filter width={14} height={14}/>}>Filter lain</Button>
            </div>
          </div>

          <div className="bm-table-wrap">
            <table className="bm-table">
              <thead>
                <tr>
                  <th style={{ width: 160 }}>Tanggal</th>
                  <th style={{ width: 130 }}>Tipe</th>
                  <th>Deskripsi</th>
                  <th style={{ width: 160, textAlign: 'right' }}>Jumlah</th>
                  <th style={{ width: 140, textAlign: 'right' }}>Saldo</th>
                </tr>
              </thead>
              <tbody>
                {slice.map(t => (
                  <tr key={t.date + t.type + t.amount}>
                    <td style={{ color: 'var(--ink-2)' }}>{t.date}</td>
                    <td>{typeBadge(t.type)}</td>
                    <td style={{ color: 'var(--ink)' }}>{t.desc}</td>
                    <td style={{ textAlign: 'right' }} className={t.amount >= 0 ? 'pos' : 'neg'}>
                      {t.amount >= 0 ? '+' : '−'}{fmtRp(Math.abs(t.amount))}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--ink)' }}>{fmtRp(t.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bm-pagination">
            <span>Menampilkan {(page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} dari {filtered.length}</span>
            <div className="pages">
              <button className="pg" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                <button key={pg} className={`pg ${page === pg ? 'active' : ''}`} onClick={() => setPage(pg)}>{pg}</button>
              ))}
              <button className="pg" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
