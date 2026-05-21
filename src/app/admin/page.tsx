'use client';
import { useState } from 'react';
import AdminSideNav from '@/components/AdminSideNav';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Users, Gavel, DollarSign, AlertTri, TrendUp, Refresh, Plus, MoreH, ArrowRight } from '@/components/icons';
import { ADMIN_USERS, ADMIN_FLAGS, ADMIN_DISPUTES, fmtRp, fmtRpShort } from '@/lib/data';

function SparkMetric({ label, value, delta, deltaTone, data, highlight }: Readonly<{
  label: string; value: string; delta: string; deltaTone: 'up' | 'down';
  data: number[]; highlight?: number;
}>) {
  const max = Math.max(...data), min = Math.min(...data);
  const w = 200, h = 44;
  const step = w / (data.length - 1);
  const pts = data.map((v, i) => `${i * step},${h - ((v - min) / (max - min || 1)) * (h - 4) - 2}`).join(' ');
  const dots = data.map((v, i) => ({
    cx: i * step,
    cy: h - ((v - min) / (max - min || 1)) * (h - 4) - 2,
    active: i === (highlight ?? data.length - 1),
    key: `${Math.round(i * step)},${Math.round(h - ((v - min) / (max - min || 1)) * (h - 4) - 2)}`,
  }));
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--ink-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
        <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>{value}</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: deltaTone === 'up' ? 'var(--green-700)' : 'var(--red-600)' }}>{delta}</span>
      </div>
      <svg width="100%" height={h + 8} viewBox={`0 0 ${w} ${h + 8}`} preserveAspectRatio="none" style={{ marginTop: 6, display: 'block' }}>
        <polyline fill="none" stroke="var(--blue-600)" strokeWidth="2" points={pts}/>
        {dots.map(dot => (
          <circle key={dot.key} cx={dot.cx} cy={dot.cy}
            r={dot.active ? 3.5 : 0}
            fill="var(--blue-600)" stroke="#fff" strokeWidth="2"/>
        ))}
      </svg>
    </div>
  );
}

export default function AdminPage() {
  const [userQuery, setUserQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = ADMIN_USERS.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (userQuery && !(u.name + u.email).toLowerCase().includes(userQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bm-page-wide">
      <div className="bm-app">
        <AdminSideNav active="overview"/>
        <div>
          <div className="bm-pg-head">
            <div>
              <h1>Admin Dashboard</h1>
              <p>Pantau platform health, moderasi listing, dan kelola pengguna.</p>
            </div>
            <div className="bm-row">
              <select className="bm-select" defaultValue="7d">
                <option value="24h">24 jam terakhir</option>
                <option value="7d">7 hari terakhir</option>
                <option value="30d">30 hari terakhir</option>
                <option value="90d">90 hari terakhir</option>
              </select>
              <Button variant="secondary" size="md" leftIcon={<Refresh width={14} height={14}/>}>Sinkronisasi data</Button>
            </div>
          </div>

          <div className="bm-admin-stats">
            <div className="bm-adminstat">
              <div className="lbl"><Users width={16} height={16}/> Total Users</div>
              <div className="val">142.819</div>
              <div className="delta up"><TrendUp width={12} height={12}/> +8.4% vs minggu lalu</div>
            </div>
            <div className="bm-adminstat">
              <div className="lbl"><Gavel width={16} height={16}/> Active Auctions</div>
              <div className="val">14.832</div>
              <div className="delta up"><TrendUp width={12} height={12}/> +2.1% vs minggu lalu</div>
            </div>
            <div className="bm-adminstat">
              <div className="lbl"><DollarSign width={16} height={16}/> Total Revenue (GMV)</div>
              <div className="val">{fmtRpShort(8_240_000_000)}</div>
              <div className="delta up"><TrendUp width={12} height={12}/> +12.3% vs minggu lalu</div>
            </div>
            <div className="bm-adminstat">
              <div className="lbl"><AlertTri width={16} height={16}/> Open Disputes</div>
              <div className="val" style={{ color: 'var(--red-600)' }}>{ADMIN_DISPUTES.length}</div>
              <div className="delta warn"><TrendUp width={12} height={12}/> +1 vs minggu lalu — perlu perhatian</div>
            </div>
          </div>

          <div className="bm-admin-block">
            <div className="bm-admin-block-head">
              <div>
                <h3>Manajemen pengguna</h3>
                <div className="sub">{ADMIN_USERS.length} pengguna terdaftar · {ADMIN_USERS.filter(u => u.status === 'suspended').length} suspended</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="bm-input" placeholder="Cari nama atau email…" value={userQuery} onChange={e => setUserQuery(e.target.value)} style={{ width: 240 }}/>
                <select className="bm-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
                  <option value="all">Semua role</option>
                  <option value="admin">Admin</option>
                  <option value="seller">Seller</option>
                  <option value="buyer">Buyer</option>
                </select>
                <Button variant="primary" size="md" leftIcon={<Plus width={14} height={14}/>}>Tambah pengguna</Button>
              </div>
            </div>
            <div className="bm-admin-block-body">
              <table className="bm-table">
                <thead>
                  <tr>
                    <th>Nama</th><th>Email</th><th>Role</th><th>Status</th>
                    <th>Bergabung</th><th style={{ textAlign: 'right' }}>GMV</th><th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(u => (
                    <tr key={u.email}>
                      <td>
                        <div className="item-cell">
                          <span className="bm-avatar sm">{u.name.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()}</span>
                          <span style={{ fontWeight: 500 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--ink-2)' }}>{u.email}</td>
                      <td><span className={`bm-role bm-role-${u.role}`}>{u.role.toUpperCase()}</span></td>
                      <td>
                        {u.status === 'active'
                          ? <span className="bm-statactive"><span className="bm-badge-dot" style={{ marginRight: 6 }}/>Active</span>
                          : <span className="bm-suspended"><span className="bm-badge-dot" style={{ marginRight: 6 }}/>Suspended</span>}
                      </td>
                      <td style={{ color: 'var(--ink-2)' }}>{u.joined}</td>
                      <td style={{ textAlign: 'right', color: 'var(--ink-2)' }}>{u.lifetime > 0 ? fmtRpShort(u.lifetime) : '—'}</td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {u.status === 'active' ? <Button variant="ghost" size="sm">Suspend</Button> : <Button variant="ghost" size="sm">Aktifkan</Button>}
                          <Button variant="ghost" size="sm">Edit Role</Button>
                          <button style={{ background: 'transparent', border: 0, color: 'var(--ink-3)', cursor: 'pointer', padding: 6 }}><MoreH width={16} height={16}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bm-admin-twocol">
            <div className="bm-admin-block">
              <div className="bm-admin-block-head">
                <div><h3>Moderasi listing</h3><div className="sub">{ADMIN_FLAGS.length} listing perlu review</div></div>
                <Button variant="ghost" size="sm">Lihat semua →</Button>
              </div>
              <div>
                {ADMIN_FLAGS.map(f => (
                  <div key={f.id} className="bm-flag-card">
                    <div className="bm-flag-thumb"><div className={f.art}/></div>
                    <div style={{ minWidth: 0 }}>
                      <div className="bm-flag-title">{f.title}</div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span className="bm-flag-reason"><span className="dot"/>{f.reason}</span>
                        <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>· oleh {f.seller} · {f.time}</span>
                      </div>
                    </div>
                    <div className="bm-flag-actions">
                      <Button variant="ghost" size="sm">Tinjau</Button>
                      <Button variant="danger" size="sm">Tolak</Button>
                      <Button variant="primary" size="sm">Approve</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bm-admin-block">
              <div className="bm-admin-block-head">
                <div><h3>Sengketa aktif</h3><div className="sub">{ADMIN_DISPUTES.length} perlu keputusan admin</div></div>
                <Button variant="ghost" size="sm">Lihat semua →</Button>
              </div>
              <div>
                {ADMIN_DISPUTES.map(d => (
                  <div key={d.id} className="bm-dispute">
                    <div style={{ minWidth: 0 }}>
                      <div className="case">{d.title}<span className="id">#{d.id}</span></div>
                      <div className="who">
                        {d.buyer} <ArrowRight width={11} height={11} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--ink-4)', margin: '0 4px' }}/> {d.seller}
                        <span style={{ margin: '0 8px', color: 'var(--ink-4)' }}>·</span>
                        Nilai <b style={{ color: 'var(--ink)' }}>{fmtRp(d.amount)}</b>
                      </div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6 }}>
                        <Badge tone={d.status === 'investigation' ? 'amber' : d.status === 'awaiting-seller' ? 'blue' : 'green'}>
                          {d.status === 'investigation' ? 'Investigasi' : d.status === 'awaiting-seller' ? 'Menunggu penjual' : 'Diputuskan: pembeli'}
                        </Badge>
                        <span className="age">{d.age}</span>
                      </div>
                    </div>
                    <Button variant="secondary" size="sm">Tinjau</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bm-admin-block" style={{ marginTop: 20 }}>
            <div className="bm-admin-block-head">
              <div><h3>Platform health · 7 hari terakhir</h3><div className="sub">Metrik operasional kunci</div></div>
            </div>
            <div className="bm-admin-block-body padded" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
              <SparkMetric label="Bid throughput / detik"  value="248"    delta="+14%"  deltaTone="up" data={[120,180,140,220,200,248,230]} highlight={4}/>
              <SparkMetric label="Avg p95 latency"         value="84 ms"  delta="−6 ms" deltaTone="up" data={[100,110,92,88,90,84,86]} highlight={5}/>
              <SparkMetric label="Lelang ditutup (WON)"    value="2.184"  delta="+6.2%" deltaTone="up" data={[1700,1800,1900,2000,2050,2100,2184]} highlight={6}/>
              <SparkMetric label="Lelang ditutup (UNSOLD)" value="411"    delta="−1.4%" deltaTone="up" data={[440,460,430,420,415,412,411]} highlight={6}/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
