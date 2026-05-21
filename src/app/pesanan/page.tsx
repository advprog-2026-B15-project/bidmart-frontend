'use client';
import { useState, useEffect, useCallback } from 'react';
import AccountSideNav from '@/components/AccountSideNav';
import Button from '@/components/ui/Button';
import { Check, AlertTri, Truck, Star } from '@/components/icons';
import { fmtRp } from '@/lib/data';
import {
  getMyBookings,
  getMySellingBookings,
  updateShipment,
  confirmDelivery,
  fileDispute,
} from '@/modules/booking/api';
import { getToken } from '@/lib/api';
import type { Order, TrackingEvent } from '@/types';

function statusLabel(s: string) {
  return {
    wait: { lbl: 'Menunggu Pengiriman', cls: 'bm-status-wait' },
    ship: { lbl: 'Dikirim',             cls: 'bm-status-ship' },
    recv: { lbl: 'Diterima',            cls: 'bm-status-recv' },
    disp: { lbl: 'Sengketa',            cls: 'bm-status-disp' },
  }[s] || { lbl: s, cls: 'bm-status-done' };
}

function OrderCard({ order, active, onClick, role }: Readonly<{ order: Order; active: boolean; onClick: () => void; role: string }>) {
  const st = statusLabel(order.status);
  return (
    <button type="button" className={`bm-order-card ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="bm-order-thumb"><div className={order.item.art}/></div>
      <div className="bm-order-body">
        <div className="bm-order-title">{order.item.title}</div>
        <div className="bm-order-meta">
          <span className="price">{fmtRp(order.price)}</span>
          <span style={{ color: 'var(--ink-4)' }}>·</span>
          <span>{role === 'buyer' ? `Penjual: ${order.counterpart}` : `Pembeli: ${order.counterpart}`}</span>
          <span style={{ color: 'var(--ink-4)' }}>·</span>
          <span>{order.when}</span>
        </div>
      </div>
      <div className="bm-order-right">
        <span className={`bm-status ${st.cls}`}>{st.lbl}</span>
        <span style={{ fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{order.id}</span>
      </div>
    </button>
  );
}

function OrderDetail({
  order, role, trackingNum, setTrackingNum, courierName, setCourierName, onAction,
}: Readonly<{
  order: Order;
  role: string;
  trackingNum: string;
  setTrackingNum: (v: string) => void;
  courierName: string;
  setCourierName: (v: string) => void;
  onAction: (action: string) => void;
}>) {
  const steps = [
    { key: 0, lbl: 'Won',       when: order.when?.replace('Dibuat ', '') },
    { key: 1, lbl: 'Packaging', when: order.status === 'wait' ? 'Menunggu' : '-' },
    { key: 2, lbl: 'Shipped',   when: ['ship', 'recv'].includes(order.status) ? order.tracking?.lastUpd ?? '-' : '—' },
    { key: 3, lbl: 'Delivered', when: order.status === 'recv' ? '-' : order.status === 'disp' ? 'Belum tiba' : '—' },
    { key: 4, lbl: 'Confirmed', when: order.status === 'recv' ? '-' : '—' },
  ];

  return (
    <div className="bm-orderdetail">
      <div className="bm-order-hero">
        <div className="bm-order-hero-thumb"><div className={order.item.art}/></div>
        <div>
          <h3 className="bm-order-hero-title">{order.item.title}</h3>
          <div className="bm-order-hero-meta">
            Order <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>#{order.id}</span>
            <span style={{ margin: '0 8px', color: 'var(--ink-4)' }}>·</span>
            {role === 'buyer' ? 'Dijual oleh' : 'Dibeli oleh'} <b style={{ color: 'var(--ink)' }}>{order.counterpart}</b>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Winning bid</div>
          <div className="bm-order-hero-price">{fmtRp(order.price)}</div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14, color: 'var(--ink)' }}>Status pesanan</div>
        <div className="bm-timeline">
          {steps.map((s, i) => {
            const state = i < order.step ? 'done' : i === order.step ? 'current' : '';
            return (
              <div key={s.key} className={`bm-tlstep ${state}`}>
                <div className="dot">
                  {state === 'done' ? <Check width={14} height={14}/> : <span style={{ fontSize: 11, fontWeight: 700 }}>{i + 1}</span>}
                </div>
                <div className="lbl">{s.lbl}</div>
                <div className="when">{s.when}</div>
              </div>
            );
          })}
        </div>
      </div>

      {order.status === 'ship' && order.tracking && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Informasi pengiriman</div>
          <div className="bm-tracking-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Truck width={20} height={20} style={{ color: 'var(--blue-600)' }}/>
              <span className="courier">{order.tracking.courier}</span>
            </div>
            <span className="num">{order.tracking.num}</span>
            <span style={{ flex: 1, textAlign: 'right', color: 'var(--ink-3)', fontSize: 12 }}>{order.tracking.lastUpd}</span>
          </div>
          {order.history && (
            <div className="bm-tracking-history">
              {order.history.map((h: TrackingEvent) => (
                <div key={h.t + h.where} className={`item ${h.curr ? 'curr' : ''}`}>
                  <span className="t">{h.t}</span>
                  <span className="ix"><span className="d"/><span className="l"/></span>
                  <div className="desc">{h.desc}<div className="where">{h.where}</div></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {role === 'seller' && order.status === 'wait' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Input nomor resi</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <select
              className="bm-select"
              style={{ flex: '0 0 160px', height: 42 }}
              value={courierName}
              onChange={e => setCourierName(e.target.value)}
            >
              <option>JNE Express</option>
              <option>J&T Express</option>
              <option>SiCepat</option>
              <option>Anteraja</option>
            </select>
            <input
              className="bm-input"
              placeholder="Nomor resi"
              style={{ flex: 1, height: 42, fontSize: 14, fontFamily: 'var(--font-mono)' }}
              value={trackingNum}
              onChange={e => setTrackingNum(e.target.value)}
            />
            <Button
              variant="primary"
              size="lg"
              disabled={!trackingNum}
              onClick={() => onAction('ship')}
            >
              Update Status
            </Button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 8 }}>
            Pembeli akan mendapat notifikasi otomatis.
          </div>
        </div>
      )}

      {order.status === 'disp' && (
        <div style={{ padding: 16, background: 'var(--red-50)', border: '1px solid #f5c5cc', borderRadius: 10 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <AlertTri width={20} height={20} style={{ color: 'var(--red-600)', flexShrink: 0, marginTop: 2 }}/>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--red-700)' }}>Sengketa terbuka</div>
              <div style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.5 }}>
                Pesanan ini sedang dalam sengketa. Sedang diinvestigasi oleh tim BidMart Trust & Safety.
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 }}>
        {role === 'buyer' && order.status === 'ship' && (
          <>
            <Button variant="ghost" size="md" onClick={() => onAction('dispute')}>Buka sengketa</Button>
            <Button variant="primary" size="md" leftIcon={<Check width={16} height={16}/>} onClick={() => onAction('confirm')}>
              Konfirmasi Barang Diterima
            </Button>
          </>
        )}
        {role === 'buyer' && order.status === 'recv' && (
          <Button variant="ghost" size="md" onClick={() => onAction('dispute')}>Buka sengketa</Button>
        )}
        {role === 'buyer' && order.status === 'recv' && (
          <Button variant="primary" size="md" leftIcon={<Star width={16} height={16}/>}>Beri ulasan</Button>
        )}
      </div>
    </div>
  );
}

export default function PesananPage() {
  const [tab, setTab] = useState<'active' | 'completed' | 'disputes'>('active');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [openOrder, setOpenOrder] = useState<Order | null>(null);
  const [trackingNum, setTrackingNum] = useState('');
  const [courierName, setCourierName] = useState('JNE Express');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');

  const fetchOrders = useCallback(async () => {
    if (!getToken()) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = role === 'buyer'
        ? await getMyBookings()
        : await getMySellingBookings();
      setOrders(data);
      if (data.length > 0) setOpenOrder(data[0]);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  async function handleAction(action: string) {
    if (!openOrder) return;
    try {
      if (action === 'ship') {
        await updateShipment(openOrder.id, courierName, trackingNum);
        setTrackingNum('');
      } else if (action === 'confirm') {
        await confirmDelivery(openOrder.id);
      } else if (action === 'dispute') {
        const reason = window.prompt('Alasan sengketa:');
        if (!reason) return;
        await fileDispute(openOrder.id, reason);
      }
      await fetchOrders();
    } catch (err) {
      alert((err as Error).message);
    }
  }

  const filtered = orders.filter(o => {
    if (tab === 'active') return ['wait', 'ship'].includes(o.status);
    if (tab === 'completed') return o.status === 'recv';
    if (tab === 'disputes') return o.status === 'disp';
    return true;
  });

  const counts = {
    active:    orders.filter(o => ['wait', 'ship'].includes(o.status)).length,
    completed: orders.filter(o => o.status === 'recv').length,
    disputes:  orders.filter(o => o.status === 'disp').length,
  };

  return (
    <div className="bm-page-wide">
      <div className="bm-app">
        <AccountSideNav active="orders"/>
        <div>
          <div className="bm-pg-head">
            <div>
              <h1>Pesanan saya</h1>
              <p>Pantau status, lacak pengiriman, dan kelola sengketa.</p>
            </div>
            <div className="bm-tabpills" style={{ margin: 0 }}>
              <button
                className={`bm-tabpill ${role === 'buyer' ? 'active' : ''}`}
                onClick={() => setRole('buyer')}
              >
                Sebagai Pembeli
              </button>
              <button
                className={`bm-tabpill ${role === 'seller' ? 'active' : ''}`}
                onClick={() => setRole('seller')}
              >
                Sebagai Penjual
              </button>
            </div>
          </div>

          <div className="bm-tabs">
            {(['active', 'completed', 'disputes'] as const).map(t => (
              <button key={t} className={`bm-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'active' ? 'Active Orders' : t === 'completed' ? 'Completed' : 'Disputes'}
                <span className="count">{counts[t]}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
              Memuat pesanan...
            </div>
          ) : !getToken() ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
              Silakan <a href="/login" style={{ color: 'var(--blue-600)' }}>masuk</a> untuk melihat pesanan.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 24, alignItems: 'flex-start' }}>
              <div className="bm-orders-list">
                {filtered.map(o => (
                  <OrderCard
                    key={o.id}
                    order={o}
                    active={openOrder?.id === o.id}
                    onClick={() => setOpenOrder(o)}
                    role={role}
                  />
                ))}
                {filtered.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--ink-3)', padding: '40px 20px', border: '1px dashed var(--border-strong)', borderRadius: 12 }}>
                    Tidak ada pesanan di kategori ini.
                  </div>
                )}
              </div>
              {openOrder && (
                <OrderDetail
                  order={openOrder}
                  role={role}
                  trackingNum={trackingNum}
                  setTrackingNum={setTrackingNum}
                  courierName={courierName}
                  setCourierName={setCourierName}
                  onAction={handleAction}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
