'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import Button from '@/components/ui/Button';
import { Eye, EyeOff, Shield } from '@/components/icons';

function otpChange(
  pos: number, val: string,
  otp: string[], setOtp: React.Dispatch<React.SetStateAction<string[]>>,
  refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
) {
  if (val && !/^\d$/.test(val)) return;
  const next = [...otp]; next[pos] = val; setOtp(next);
  if (val && pos < 5) refs.current[pos + 1]?.focus();
}

function otpKey(
  pos: number, e: React.KeyboardEvent,
  otp: string[], refs: React.MutableRefObject<(HTMLInputElement | null)[]>,
) {
  if (e.key === 'Backspace' && !otp[pos] && pos > 0) refs.current[pos - 1]?.focus();
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'register' | 'otp'>('signin');
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  return (
    <div className="bm-auth-shell">
      <div className="bm-auth-logo"><Logo size={30}/></div>
      <div className="bm-auth-card">
        {mode === 'otp' ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <div style={{ width: 56, height: 56, borderRadius: 999, background: 'var(--blue-50)', color: 'var(--blue-600)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield width={28} height={28}/>
              </div>
            </div>
            <h1 style={{ textAlign: 'center', fontSize: 22, marginTop: 14 }}>Verifikasi dua langkah</h1>
            <p className="sub" style={{ textAlign: 'center' }}>
              Masukkan 6 digit kode dari aplikasi <b style={{ color: 'var(--ink)' }}>Google Authenticator</b> kamu.
            </p>
            <div className="bm-otp">
              {[0, 1, 2, 3, 4, 5].map(pos => (
                <input
                  key={pos}
                  ref={el => { otpRefs.current[pos] = el; }}
                  type="text" inputMode="numeric" maxLength={1}
                  value={otp[pos]} className={otp[pos] ? 'filled' : ''}
                  onChange={e => otpChange(pos, e.target.value, otp, setOtp, otpRefs)}
                  onKeyDown={e => otpKey(pos, e, otp, otpRefs)}
                />
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', textAlign: 'center', marginBottom: 18 }}>
              Kode akan kadaluarsa dalam <b style={{ color: 'var(--red-600)', fontVariantNumeric: 'tabular-nums' }}>00:42</b>
            </div>
            <Button variant="primary" size="lg" style={{ width: '100%' }} onClick={() => router.push('/')}>
              Verifikasi
            </Button>
            <div className="bm-auth-foot" style={{ justifyContent: 'center', marginTop: 16, gap: 4, flexWrap: 'wrap' }}>
              Tidak punya akses ke aplikasi? <a>Pakai SMS</a> · <a>Gunakan recovery code</a>
            </div>
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'center' }}>
              <a style={{ fontSize: 13, color: 'var(--ink-2)', cursor: 'pointer' }} onClick={() => setMode('signin')}>
                ← Kembali ke Sign In
              </a>
            </div>
          </>
        ) : (
          <>
            <h1>{mode === 'signin' ? 'Masuk ke BidMart' : 'Buat akun BidMart'}</h1>
            <p className="sub">
              {mode === 'signin'
                ? 'Lanjutkan menawar di lelang yang sedang kamu pantau.'
                : 'Gratis untuk daftar. Mulai menawar dalam 30 detik.'}
            </p>
            <div className="bm-auth-tabs">
              <button className={`bm-auth-tab ${mode === 'signin' ? 'active' : ''}`} onClick={() => setMode('signin')}>Sign In</button>
              <button className={`bm-auth-tab ${mode === 'register' ? 'active' : ''}`} onClick={() => setMode('register')}>Register</button>
            </div>

            {mode === 'signin' ? (
              <form onSubmit={e => { e.preventDefault(); setMode('otp'); }}>
                <div className="bm-field">
                  <label>Email</label>
                  <input type="email" placeholder="kamu@email.com" defaultValue="aulia.r@gmail.com"/>
                </div>
                <div className="bm-field">
                  <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                    Password
                    <a style={{ color: 'var(--blue-600)', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}>Lupa password?</a>
                  </label>
                  <div style={{ position: 'relative', display: 'flex' }}>
                    <input type={showPw ? 'text' : 'password'} placeholder="••••••••••" defaultValue="supersecret" style={{ flex: 1, paddingRight: 40 }}/>
                    <button type="button" onClick={() => setShowPw(p => !p)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 0, color: 'var(--ink-3)', cursor: 'pointer', padding: 6 }}>
                      {showPw ? <EyeOff width={18} height={18}/> : <Eye width={18} height={18}/>}
                    </button>
                  </div>
                </div>
                <div className="bm-field-row">
                  <label><input type="checkbox" defaultChecked/>Ingat saya di perangkat ini</label>
                </div>
                <Button variant="primary" size="lg" style={{ width: '100%' }} type="submit">Masuk</Button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '18px 0', color: 'var(--ink-3)', fontSize: 12 }}>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
                  <span>atau</span>
                  <div style={{ flex: 1, height: 1, background: 'var(--border)' }}/>
                </div>
                <Button variant="secondary" size="lg" style={{ width: '100%', marginBottom: 8 }}>
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
                    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
                    <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
                    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
                  </svg>
                  Lanjutkan dengan Google
                </Button>
                <Button variant="secondary" size="lg" style={{ width: '100%' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Lanjutkan dengan Apple
                </Button>
                <div className="bm-auth-foot">
                  <span>Belum punya akun?</span>
                  <a onClick={() => setMode('register')}>Daftar sekarang</a>
                </div>
              </form>
            ) : (
              <form onSubmit={e => { e.preventDefault(); setMode('otp'); }}>
                <div className="bm-grid-2">
                  <div className="bm-field"><label>Nama depan</label><input placeholder="Aulia"/></div>
                  <div className="bm-field"><label>Nama belakang</label><input placeholder="Ramadhan"/></div>
                </div>
                <div className="bm-field"><label>Email</label><input type="email" placeholder="kamu@email.com"/></div>
                <div className="bm-field">
                  <label>Password</label>
                  <input type="password" placeholder="Minimal 10 karakter"/>
                  <span className="hint">Gunakan campuran huruf, angka, dan simbol.</span>
                </div>
                <div className="bm-field"><label>Konfirmasi password</label><input type="password" placeholder="Ketik ulang password"/></div>
                <div className="bm-field-row" style={{ alignItems: 'flex-start' }}>
                  <label>
                    <input type="checkbox"/>
                    <span>Saya setuju dengan <a style={{ color: 'var(--blue-600)' }}>Syarat &amp; Ketentuan</a> dan <a style={{ color: 'var(--blue-600)' }}>Kebijakan Privasi</a> BidMart.</span>
                  </label>
                </div>
                <Button variant="primary" size="lg" style={{ width: '100%' }} type="submit">Buat Akun</Button>
                <div className="bm-auth-foot">
                  <span>Sudah punya akun?</span>
                  <a onClick={() => setMode('signin')}>Masuk</a>
                </div>
              </form>
            )}
          </>
        )}
      </div>
      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 28, display: 'flex', gap: 14 }}>
        <a style={{ color: 'var(--ink-3)' }}>Privasi</a>
        <a style={{ color: 'var(--ink-3)' }}>Syarat</a>
        <a style={{ color: 'var(--ink-3)' }}>Bantuan</a>
        <a style={{ color: 'var(--ink-3)' }}>© 2026 BidMart Indonesia</a>
      </div>
    </div>
  );
}
