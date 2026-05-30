'use client';
import { useState, useEffect } from 'react';
import AccountSideNav from '@/components/AccountSideNav';
import Button from '@/components/ui/Button';
import { User, Mail, Shield } from '@/components/icons';
import { getMe, type UserProfile } from '@/modules/authentication/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

function RoleBadge({ role }: Readonly<{ role: string }>) {
  const map: Record<string, { lbl: string; bg: string; color: string }> = {
    ADMIN:  { lbl: 'Administrator', bg: 'var(--red-50)',   color: 'var(--red-700)' },
    SELLER: { lbl: 'Penjual',       bg: 'var(--blue-50)',  color: 'var(--blue-600)' },
    BUYER:  { lbl: 'Pembeli',       bg: 'var(--blue-50)',  color: 'var(--blue-600)' },
  };
  const s = map[role] ?? { lbl: role, bg: 'var(--surface-2)', color: 'var(--ink-2)' };
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 999,
      background: s.bg, color: s.color, letterSpacing: '0.05em', textTransform: 'uppercase',
    }}>
      {s.lbl}
    </span>
  );
}

function InfoRow({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div style={{ padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 15, color: 'var(--ink)' }}>{value}</div>
    </div>
  );
}

export default function ProfilPage() {
  useRequireAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() => setError('Gagal memuat profil.'))
      .finally(() => setLoading(false));
  }, []);

  const initials = user?.username?.slice(0, 2).toUpperCase() ?? '?';

  return (
    <div className="bm-page-wide">
      <div className="bm-app">
        <AccountSideNav active="profile"/>
        <div style={{ flex: 1 }}>
          <div className="bm-pg-head">
            <div>
              <h1>Profil saya</h1>
              <p>Informasi akun dan identitas publik kamu.</p>
            </div>
          </div>

          {loading && (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-3)' }}>
              Memuat profil...
            </div>
          )}

          {error && (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--red-600)' }}>{error}</div>
          )}

          {user && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
              {/* Avatar card */}
              <div style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'var(--blue-100)', color: 'var(--blue-600)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 26, fontWeight: 800, flexShrink: 0,
                }}>
                  {initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)' }}>{user.username}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', margin: '2px 0 8px' }}>{user.email}</div>
                  <RoleBadge role={user.role}/>
                </div>
                <div style={{
                  fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 999,
                  background: user.enabled ? '#dcfce7' : '#fef2f2',
                  color: user.enabled ? '#16a34a' : 'var(--red-600)',
                }}>
                  {user.enabled ? 'Terverifikasi' : 'Belum verifikasi'}
                </div>
              </div>

              {/* Detail akun */}
              <div style={{ padding: '0 24px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ paddingTop: 20, paddingBottom: 4 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <User width={15} height={15}/> Detail Akun
                  </div>
                </div>
                <InfoRow label="Username" value={user.username}/>
                <InfoRow label="Email" value={user.email}/>
                <InfoRow label="Tipe akun" value={user.role === 'BUYER' ? 'Pembeli' : user.role === 'SELLER' ? 'Penjual' : 'Administrator'}/>
                <div style={{ padding: '14px 0' }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
                    ID Akun
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{user.id}</div>
                </div>
              </div>

              {/* Informasi tambahan — pending backend */}
              <div style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <Mail width={15} height={15}/> Informasi Kontak
                </div>
                <div style={{ display: 'grid', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>Nama tampilan</div>
                    <input className="bm-input" placeholder="Belum diisi" disabled style={{ opacity: 0.55, cursor: 'not-allowed' }}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>Nomor telepon</div>
                    <input className="bm-input" placeholder="Belum diisi" disabled style={{ opacity: 0.55, cursor: 'not-allowed' }}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>Alamat pengiriman</div>
                    <input className="bm-input" placeholder="Belum diisi" disabled style={{ opacity: 0.55, cursor: 'not-allowed' }}/>
                  </div>
                </div>
                <div style={{ marginTop: 14, padding: '10px 14px', background: 'var(--blue-50)', borderRadius: 8, fontSize: 12, color: 'var(--blue-600)' }}>
                  Pembaruan profil lengkap akan tersedia di update berikutnya.
                </div>
              </div>

              {/* Keamanan shortcut */}
              <div style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <Shield width={20} height={20} style={{ color: 'var(--blue-600)' }}/>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>Keamanan akun</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>Kelola 2FA dan sesi aktif</div>
                  </div>
                </div>
                <Button variant="secondary" size="md" onClick={() => window.location.href = '/keamanan'}>
                  Kelola
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
