'use client';
import { useState, useEffect, useCallback } from 'react';
import AccountSideNav from '@/components/AccountSideNav';
import Button from '@/components/ui/Button';
import { Shield, Check, AlertTri, Smartphone, Trash } from '@/components/icons';
import {
  setupTotp, confirmTotp, disableTotp,
  getSessions, revokeSession, revokeAllSessions,
  type SessionInfo, type TotpSetup,
} from '@/modules/authentication/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function parseDevice(ua: string) {
  if (!ua) return 'Perangkat tidak dikenal';
  if (/iPhone|iPad/i.test(ua)) return 'iOS Device';
  if (/Android/i.test(ua)) return 'Android Device';
  if (/Windows/i.test(ua)) return 'Windows PC';
  if (/Mac OS X/i.test(ua)) return 'Mac';
  if (/Linux/i.test(ua)) return 'Linux';
  return 'Browser';
}

// ── 2FA Section ───────────────────────────────────────────────────────────────

type TotpStep = 'idle' | 'setting-up' | 'confirming' | 'disabling';

function TwoFASection() {
  const [step, setStep] = useState<TotpStep>('idle');
  const [setup, setSetup] = useState<TotpSetup | null>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  async function startSetup() {
    setLoading(true); setMsg(null);
    try {
      const res = await setupTotp();
      setSetup(res);
      setStep('setting-up');
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err.status === 409) {
        setMsg({ type: 'err', text: '2FA sudah aktif. Nonaktifkan terlebih dahulu.' });
      } else {
        setMsg({ type: 'err', text: err.message || 'Gagal memulai setup 2FA.' });
      }
    } finally { setLoading(false); }
  }

  async function handleConfirm() {
    if (code.length !== 6) { setMsg({ type: 'err', text: 'Masukkan 6 digit kode.' }); return; }
    setLoading(true); setMsg(null);
    try {
      await confirmTotp(code);
      setMsg({ type: 'ok', text: '2FA berhasil diaktifkan!' });
      setStep('idle'); setSetup(null); setCode('');
    } catch {
      setMsg({ type: 'err', text: 'Kode salah atau kadaluarsa.' });
    } finally { setLoading(false); }
  }

  async function handleDisable() {
    if (code.length !== 6) { setMsg({ type: 'err', text: 'Masukkan 6 digit kode.' }); return; }
    setLoading(true); setMsg(null);
    try {
      await disableTotp(code);
      setMsg({ type: 'ok', text: '2FA berhasil dinonaktifkan.' });
      setStep('idle'); setCode('');
    } catch {
      setMsg({ type: 'err', text: 'Kode salah atau 2FA belum aktif.' });
    } finally { setLoading(false); }
  }

  const qrUrl = setup
    ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(setup.otpAuthUrl)}&size=180x180&margin=8`
    : null;

  return (
    <div style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <Shield width={18} height={18} style={{ color: 'var(--blue-600)' }}/>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Autentikasi Dua Faktor (2FA)</div>
      </div>

      {msg && (
        <div style={{
          padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13,
          background: msg.type === 'ok' ? '#dcfce7' : 'var(--red-50)',
          color: msg.type === 'ok' ? '#16a34a' : 'var(--red-700)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          {msg.type === 'ok' ? <Check width={15} height={15}/> : <AlertTri width={15} height={15}/>}
          {msg.text}
        </div>
      )}

      {step === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
            Lindungi akunmu dengan autentikasi dua faktor menggunakan aplikasi seperti Google Authenticator.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <Button variant="primary" size="md" loading={loading} onClick={startSetup}>
              Aktifkan 2FA
            </Button>
            <Button variant="ghost" size="md" onClick={() => { setStep('disabling'); setMsg(null); setCode(''); }}>
              Nonaktifkan 2FA
            </Button>
          </div>
        </div>
      )}

      {step === 'setting-up' && setup && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
            Scan QR code ini dengan Google Authenticator, lalu masukkan kode 6 digit untuk konfirmasi.
          </p>
          <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrUrl!} alt="QR Code 2FA" width={180} height={180} style={{ border: '1px solid var(--border)', borderRadius: 8 }}/>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                  Kunci manual (jika tidak bisa scan)
                </div>
                <div style={{
                  padding: '8px 12px', background: 'var(--surface-2)', borderRadius: 8,
                  fontFamily: 'var(--font-mono)', fontSize: 13, letterSpacing: '0.1em',
                  color: 'var(--ink)', userSelect: 'all', wordBreak: 'break-all',
                }}>
                  {setup.secret}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 6 }}>Kode verifikasi dari aplikasi</div>
                <input
                  className="bm-input"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
                  style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', fontSize: 18, textAlign: 'center' }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="primary" size="md" loading={loading} onClick={handleConfirm}>
                  Konfirmasi & Aktifkan
                </Button>
                <Button variant="ghost" size="md" onClick={() => { setStep('idle'); setSetup(null); setCode(''); setMsg(null); }}>
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 'disabling' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ fontSize: 13, color: 'var(--ink-2)', margin: 0 }}>
            Masukkan kode dari aplikasi authenticator untuk menonaktifkan 2FA.
          </p>
          <div style={{ maxWidth: 240 }}>
            <input
              className="bm-input"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.2em', fontSize: 18, textAlign: 'center' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary" size="md" loading={loading} onClick={handleDisable} style={{ background: 'var(--red-600)' }}>
              Nonaktifkan 2FA
            </Button>
            <Button variant="ghost" size="md" onClick={() => { setStep('idle'); setCode(''); setMsg(null); }}>
              Batal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sessions Section ──────────────────────────────────────────────────────────

function SessionsSection() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setSessions(await getSessions()); } catch { setSessions([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleRevoke(id: string) {
    setRevoking(id);
    try { await revokeSession(id); await load(); } catch (e) { alert((e as Error).message); }
    finally { setRevoking(null); }
  }

  async function handleRevokeAll() {
    if (!confirm('Cabut semua sesi? Kamu akan keluar dari semua perangkat.')) return;
    setRevoking('all');
    try { await revokeAllSessions(); await load(); } catch (e) { alert((e as Error).message); }
    finally { setRevoking(null); }
  }

  return (
    <div style={{ padding: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Smartphone width={18} height={18} style={{ color: 'var(--blue-600)' }}/>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Sesi Aktif</div>
        </div>
        {sessions.length > 1 && (
          <Button
            variant="ghost" size="sm"
            loading={revoking === 'all'}
            onClick={handleRevokeAll}
            leftIcon={<Trash width={14} height={14}/>}
            style={{ color: 'var(--red-600)' }}
          >
            Cabut semua
          </Button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
          Memuat sesi...
        </div>
      ) : sessions.length === 0 ? (
        <div style={{ padding: '30px 0', textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
          Tidak ada sesi aktif.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {sessions.map((s, i) => (
            <div key={s.id} style={{
              padding: '14px 0',
              borderBottom: i < sessions.length - 1 ? '1px solid var(--border)' : 'none',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: 'var(--blue-50)', color: 'var(--blue-600)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Smartphone width={18} height={18}/>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
                  {parseDevice(s.deviceInfo)}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>
                  IP: {s.ipAddress} · Login: {fmtDate(s.createdAt)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 1 }}>
                  Kedaluwarsa: {fmtDate(s.expiresAt)}
                </div>
              </div>
              <Button
                variant="ghost" size="sm"
                loading={revoking === s.id}
                onClick={() => handleRevoke(s.id)}
                style={{ color: 'var(--red-600)', flexShrink: 0 }}
              >
                Cabut
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function KeamananPage() {
  useRequireAuth();

  return (
    <div className="bm-page-wide">
      <div className="bm-app">
        <AccountSideNav active="security"/>
        <div style={{ flex: 1 }}>
          <div className="bm-pg-head">
            <div>
              <h1>Keamanan</h1>
              <p>Kelola autentikasi dua faktor dan sesi perangkat aktif kamu.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 680 }}>
            <TwoFASection/>
            <SessionsSection/>
          </div>
        </div>
      </div>
    </div>
  );
}
