'use client';
import { useState, useEffect } from 'react';
import AccountSideNav from '@/components/AccountSideNav';
import Button from '@/components/ui/Button';
import { Wallet, Clock, ArrowUp, Plus, Filter } from '@/components/icons';
import { fmtRp } from '@/lib/data';
import { Gavel, ArrowDown, CreditCard, Refresh } from '@/components/icons';
import { getWallet, getTransactions, topUp, withdraw, type WalletData, type WalletTransaction } from '@/modules/wallet/api';
import { getCurrentUserId } from '@/lib/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const TYPE_LABEL: Record<string, string> = {
  TOP_UP: 'Top Up',
  WITHDRAW: 'Withdraw',
  HOLD: 'Bid Hold',
  RELEASE: 'Refund',
  PAYMENT: 'Payment',
};

function typeBadge(t: string) {
  const label = TYPE_LABEL[t] ?? t;
  const map: Record<string, { tone: string; icon: React.ReactNode }> = {
    'Top Up':   { tone: 'green',  icon: <ArrowDown width={12} height={12}/> },
    'Bid Hold': { tone: 'amber',  icon: <Gavel width={12} height={12}/> },
    'Payment':  { tone: 'blue',   icon: <CreditCard width={12} height={12}/> },
    'Refund':   { tone: 'gray',   icon: <Refresh width={12} height={12}/> },
    'Withdraw': { tone: 'gray',   icon: <ArrowUp width={12} height={12}/> },
  };
  const m = map[label] || { tone: 'gray', icon: null };
  return <span className={`bm-badge bm-badge-${m.tone}`}>{m.icon} {label}</span>;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function WalletPage() {
  const isAuth = useRequireAuth();
  const [typeFilter, setTypeFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [txns, setTxns] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const perPage = 8;

  useEffect(() => {
    if (!isAuth) return;
    const userId = getCurrentUserId();
    if (!userId) return;
    Promise.all([
      getWallet(userId),
      getTransactions(userId, 0, 100),
    ]).then(([w, t]) => {
      setWallet(w);
      setTxns(t.content ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [isAuth]);

  async function handleTopUp() {
    const amtStr = window.prompt('Jumlah top up (Rp):');
    if (!amtStr) return;
    const amt = Number(amtStr.replace(/\D/g, ''));
    if (!amt) return;
    const userId = getCurrentUserId();
    if (!userId) return;
    try {
      const updated = await topUp(userId, amt);
      setWallet(updated);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  async function handleWithdraw() {
    const amtStr = window.prompt('Jumlah tarik dana (Rp):');
    if (!amtStr) return;
    const amt = Number(amtStr.replace(/\D/g, ''));
    if (!amt) return;
    const userId = getCurrentUserId();
    if (!userId) return;
    try {
      const updated = await withdraw(userId, amt);
      setWallet(updated);
    } catch (err) {
      alert((err as Error).message);
    }
  }

  const filtered = typeFilter === 'All' ? txns : txns.filter(t => TYPE_LABEL[t.type] === typeFilter);
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  const available = wallet?.availableBalance ?? 0;
  const onHold = wallet?.heldBalance ?? 0;

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
              <Button variant="secondary" size="md" leftIcon={<ArrowUp width={16} height={16}/>} onClick={handleWithdraw}>Tarik dana</Button>
              <Button variant="primary" size="md" leftIcon={<Plus width={16} height={16}/>} onClick={handleTopUp}>Top Up</Button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>Memuat dompet...</div>
          ) : (
            <>
              <div className="bm-walletcards">
                <div className="bm-walletcard green">
                  <div className="bm-walletcard-ico"><Wallet width={26} height={26}/></div>
                  <div className="bm-walletcard-body">
                    <div className="bm-walletcard-lbl">Saldo Tersedia</div>
                    <div className="bm-walletcard-val">{fmtRp(available)}</div>
                  </div>
                </div>
                <div className="bm-walletcard amber">
                  <div className="bm-walletcard-ico"><Clock width={26} height={26}/></div>
                  <div className="bm-walletcard-body">
                    <div className="bm-walletcard-lbl">Sedang Ditahan</div>
                    <div className="bm-walletcard-val">{fmtRp(onHold)}</div>
                    <div className="bm-walletcard-sub">
                      Dana otomatis kembali jika kamu disalip atau lelang berakhir.
                    </div>
                  </div>
                </div>
              </div>

              <div className="bm-pg-head" style={{ marginBottom: 14, alignItems: 'flex-end' }}>
                <div>
                  <h3 style={{ fontSize: 18, margin: 0 }}>Riwayat Transaksi</h3>
                  <p style={{ color: 'var(--ink-3)', fontSize: 13, marginTop: 4 }}>
                    Menampilkan <b style={{ color: 'var(--ink)' }}>{filtered.length}</b> dari {txns.length} transaksi
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
                    {slice.length === 0 ? (
                      <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--ink-3)', padding: 32 }}>Tidak ada transaksi.</td></tr>
                    ) : slice.map(t => (
                      <tr key={t.id}>
                        <td style={{ color: 'var(--ink-2)' }}>{fmtDate(t.createdAt)}</td>
                        <td>{typeBadge(t.type)}</td>
                        <td style={{ color: 'var(--ink)' }}>{t.auctId ? `Auction #${t.auctId.slice(0, 8)}` : TYPE_LABEL[t.type] ?? t.type}</td>
                        <td style={{ textAlign: 'right' }} className={t.amount >= 0 ? 'pos' : 'neg'}>
                          {t.amount >= 0 ? '+' : '−'}{fmtRp(Math.abs(t.amount))}
                        </td>
                        <td style={{ textAlign: 'right', color: 'var(--ink)' }}>{fmtRp(t.balanceAfter)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bm-pagination">
                <span>Menampilkan {filtered.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, filtered.length)} dari {filtered.length}</span>
                <div className="pages">
                  <button className="pg" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                    <button key={pg} className={`pg ${page === pg ? 'active' : ''}`} onClick={() => setPage(pg)}>{pg}</button>
                  ))}
                  <button className="pg" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
