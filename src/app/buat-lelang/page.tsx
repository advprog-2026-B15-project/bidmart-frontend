'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Switch from '@/components/ui/Switch';
import { Upload, Plus, Check, Chevron, Gavel } from '@/components/icons';
import { CAT_TREE, fmtRp } from '@/lib/data';

export default function BuatLelangPage() {
  const router = useRouter();
  const [imgs, setImgs] = useState<(string | null)[]>(['bm-art-elec', 'bm-art-elec', 'bm-art-music', null, null, null]);
  const [title, setTitle] = useState('Sony WH-1000XM5 Wireless Noise-Cancelling — Garansi resmi');
  const [desc, setDesc] = useState('Headphone flagship Sony, kondisi mulus, dipakai pribadi 4 bulan. Lengkap dengan kotak asli, kabel USB-C, kabel aux, dan tas penyimpanan. Garansi resmi Sony Indonesia tersisa 8 bulan.');
  const [startPrice, setStartPrice] = useState('2500000');
  const [reserve, setReserve] = useState('4000000');
  const [increment, setIncrement] = useState('50000');
  const [days, setDays] = useState(7);
  const [antiSnipe, setAntiSnipe] = useState(true);
  const [cat1, setCat1] = useState('Elektronik');
  const [cat2, setCat2] = useState('Audio & Video');
  const [cat3, setCat3] = useState('Headphone');

  const [mountTime] = useState<number>(() => Date.now());
  const onlyDigits = (v: string) => v.replace(/\D/g, '');
  const fmtField = (v: string) => Number(onlyDigits(v) || '0').toLocaleString('id-ID');
  const endDate = new Date(mountTime + days * 86400000).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bm-page-wide">
      <nav className="bm-bread">
        <a onClick={() => router.push('/')}>Beranda</a>
        <span className="sep">/</span>
        <a>Dashboard penjual</a>
        <span className="sep">/</span>
        <span className="here">Buat lelang baru</span>
      </nav>

      <div className="bm-pg-head">
        <div>
          <h1>Buat lelang baru</h1>
          <p>Isi detail barang kamu. Lelang akan tampil setelah dipublikasikan.</p>
        </div>
        <Button variant="ghost" size="md">Simpan sebagai draft</Button>
      </div>

      <div className="bm-create-layout">
        <div className="bm-create-form">
          <div className="bm-section-block">
            <h3><span className="step-num">1</span> Foto produk</h3>
            <div className="bm-upload">
              <Upload width={28} height={28}/>
              <div className="t">Tarik foto ke sini atau klik untuk pilih</div>
              <div className="s">JPG, PNG, atau WEBP — maksimum 12 foto, ukuran 8 MB per foto</div>
            </div>
            <div className="bm-upload-thumbs">
              {imgs.map((art, i) => (
                <div key={i} className={`bm-upload-thumb ${i === 0 && art ? 'main' : ''}`}>
                  {art ? (
                    <>
                      <div className={art} style={{ width: '100%', height: '100%' }}/>
                      <button className="x" onClick={() => { const next = [...imgs]; next[i] = null; setImgs(next); }}>×</button>
                    </>
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--ink-4)', background: 'var(--surface-2)' }}>
                      <Plus width={16} height={16}/>
                      <span style={{ fontSize: 10 }}>Foto {i + 1}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 10 }}>
              Foto pertama akan jadi <b style={{ color: 'var(--ink)' }}>foto utama</b>. Tarik untuk mengubah urutan.
            </div>
          </div>

          <div className="bm-section-block">
            <h3><span className="step-num">2</span> Detail barang</h3>
            <div className="bm-field">
              <label>Judul listing</label>
              <input value={title} onChange={e => setTitle(e.target.value)} maxLength={120}/>
              <span className="hint">{title.length}/120 karakter · Sertakan brand, model, dan kondisi</span>
            </div>
            <div className="bm-field">
              <label>Deskripsi</label>
              <textarea rows={6} value={desc} onChange={e => setDesc(e.target.value)}/>
              <span className="hint">{desc.length}/4000 karakter · Jelaskan kondisi, kelengkapan, dan cacat (jika ada)</span>
            </div>
            <div className="bm-field" style={{ marginBottom: 6 }}><label>Kategori</label></div>
            <div className="bm-cat-cascade">
              <div className="bm-cat-col">
                {Object.keys(CAT_TREE).map(k => (
                  <div key={k} className={`it ${cat1 === k ? 'active' : ''}`}
                    onClick={() => { setCat1(k); const sub = Object.keys(CAT_TREE[k as keyof typeof CAT_TREE])[0]; setCat2(sub); setCat3((CAT_TREE[k as keyof typeof CAT_TREE] as Record<string, string[]>)[sub][0]); }}>
                    <span>{k}</span><Chevron width={12} height={12}/>
                  </div>
                ))}
              </div>
              <div className="bm-cat-col">
                {Object.keys(CAT_TREE[cat1] || {}).map((k: string) => (
                  <div key={k} className={`it ${cat2 === k ? 'active' : ''}`}
                    onClick={() => { setCat2(k); setCat3((CAT_TREE[cat1][k])[0]); }}>
                    <span>{k}</span><Chevron width={12} height={12}/>
                  </div>
                ))}
              </div>
              <div className="bm-cat-col">
                {(CAT_TREE[cat1]?.[cat2] || []).map((k: string) => (
                  <div key={k} className={`it ${cat3 === k ? 'active' : ''}`} onClick={() => setCat3(k)}>
                    <span>{k}</span>
                    {cat3 === k && <Check width={14} height={14} style={{ color: 'var(--blue-600)' }}/>}
                  </div>
                ))}
              </div>
            </div>
            <div className="bm-cat-trail">
              Terpilih: <b>{cat1}</b> <Chevron width={10} height={10} style={{ color: 'var(--ink-4)' }}/>
              <b>{cat2}</b> <Chevron width={10} height={10} style={{ color: 'var(--ink-4)' }}/>
              <b>{cat3}</b>
            </div>
            <div className="bm-grid-2" style={{ marginTop: 16 }}>
              <div className="bm-field">
                <label>Kondisi barang</label>
                <select className="bm-select" style={{ height: 42 }} defaultValue="used-very-good">
                  <option value="new">Baru — Segel pabrik</option>
                  <option value="new-other">Baru tanpa segel — Like new</option>
                  <option value="used-very-good">Bekas — Sangat baik</option>
                  <option value="used-good">Bekas — Baik</option>
                  <option value="used-acceptable">Bekas — Cukup, ada minor flaws</option>
                  <option value="parts">Untuk parts/perbaikan</option>
                </select>
              </div>
              <div className="bm-field"><label>Brand</label><input defaultValue="Sony"/></div>
            </div>
          </div>

          <div className="bm-section-block">
            <h3><span className="step-num">3</span> Harga &amp; aturan lelang</h3>
            <div className="bm-grid-3">
              <div className="bm-field">
                <label>Harga awal (start)</label>
                <div className="bm-prefix-input"><span className="px">Rp</span><input value={fmtField(startPrice)} onChange={e => setStartPrice(onlyDigits(e.target.value))}/></div>
                <span className="hint">Tawaran pertama dimulai dari sini</span>
              </div>
              <div className="bm-field">
                <label>Reserve price</label>
                <div className="bm-prefix-input"><span className="px">Rp</span><input value={fmtField(reserve)} onChange={e => setReserve(onlyDigits(e.target.value))}/></div>
                <span className="hint">Jika tidak tercapai, lelang ditutup tanpa pemenang</span>
              </div>
              <div className="bm-field">
                <label>Kelipatan bid minimum</label>
                <div className="bm-prefix-input"><span className="px">Rp</span><input value={fmtField(increment)} onChange={e => setIncrement(onlyDigits(e.target.value))}/></div>
                <span className="hint">Tawaran harus naik minimal sebesar ini</span>
              </div>
            </div>
            <div className="bm-field" style={{ marginTop: 6 }}>
              <label>Durasi lelang</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 3, 5, 7, 10, 14].map(n => (
                  <button key={n} onClick={() => setDays(n)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid ' + (days === n ? 'var(--ink)' : 'var(--border)'), background: days === n ? 'var(--ink)' : 'var(--surface)', color: days === n ? '#fff' : 'var(--ink)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    {n} hari
                  </button>
                ))}
              </div>
            </div>
            <div className="bm-grid-2">
              <div className="bm-field">
                <label>Mulai</label>
                <input type="text" defaultValue="Segera setelah dipublikasikan" readOnly style={{ color: 'var(--ink-2)', background: 'var(--surface-2)' }}/>
              </div>
              <div className="bm-field">
                <label>Berakhir otomatis pada</label>
                <input type="text" readOnly value={endDate} style={{ background: 'var(--surface-2)', color: 'var(--ink)', fontWeight: 500 }}/>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 14, background: 'var(--blue-50)', borderRadius: 10, marginTop: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue-800)' }}>Anti-sniping aktif</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.5 }}>
                  Jika ada tawaran dalam 2 menit terakhir, lelang otomatis diperpanjang 2 menit dari waktu tawaran tersebut. Tanpa batas perpanjangan.
                </div>
              </div>
              <Switch on={antiSnipe} onChange={setAntiSnipe}/>
            </div>
          </div>

          <div className="bm-section-block">
            <h3><span className="step-num">4</span> Pengiriman</h3>
            <div className="bm-grid-2">
              <div className="bm-field"><label>Lokasi pengiriman</label><input defaultValue="Jakarta Selatan, DKI Jakarta"/></div>
              <div className="bm-field"><label>Berat paket (gram)</label><input defaultValue="850"/></div>
            </div>
            <div className="bm-field">
              <span className="bm-field-label">Kurir tersedia</span>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['JNE Express', 'J&T Express', 'SiCepat', 'Anteraja', 'GoSend', 'Ninja Xpress'].map(c => (
                  <label key={c} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 12px', border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 13, cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked={['JNE Express', 'J&T Express', 'SiCepat'].includes(c)} style={{ accentColor: 'var(--blue-600)' }}/>
                    {c}
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '20px 0 0' }}>
            <Button variant="ghost" size="lg">Pratinjau</Button>
            <Button variant="secondary" size="lg">Simpan draft</Button>
            <Button variant="primary" size="lg" leftIcon={<Gavel width={16} height={16}/>}>Publikasikan Lelang</Button>
          </div>
        </div>

        <aside className="bm-preview-sticky">
          <div className="bm-preview-h">Pratinjau listing</div>
          <div className="bm-preview-card">
            <div className="bm-listing-image" style={{ borderRadius: 8 }}>
              <div className={`bm-listing-image-fill ${imgs[0] || 'bm-art-elec'}`}/>
              <span className="bm-listing-badge bm-listing-badge-amber">BARU</span>
            </div>
            <div className="bm-listing-meta" style={{ padding: '12px 4px 0' }}>
              <div className="bm-listing-title">{title}</div>
              <div className="bm-listing-price">{fmtRp(Number(startPrice) || 0)}</div>
              <div className="bm-listing-sub"><span>{days}h tersisa</span><span> · 0 bid</span></div>
              <div className="bm-listing-sub" style={{ marginTop: 2 }}>
                oleh <span style={{ color: 'var(--ink-2)', fontWeight: 500 }}>aulia_ramadhan</span>
              </div>
            </div>
            <div className="pl">Ini tampilan kartu di hasil pencarian.</div>
          </div>

          <div className="bm-preview-card" style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Ringkasan</div>
            {[
              ['Harga awal', fmtRp(Number(startPrice) || 0)],
              ['Reserve', fmtRp(Number(reserve) || 0)],
              ['Kelipatan', fmtRp(Number(increment) || 0)],
              ['Durasi', `${days} hari`],
            ].map(([lbl, val]) => (
              <div key={lbl} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--ink-2)' }}>{lbl}</span>
                <b style={{ fontVariantNumeric: 'tabular-nums' }}>{val}</b>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--ink-2)' }}>Anti-sniping</span>
              <b style={{ color: antiSnipe ? 'var(--green-700)' : 'var(--ink-3)' }}>{antiSnipe ? 'Aktif' : 'Mati'}</b>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '10px 0 0', marginTop: 8, borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--ink-2)' }}>Biaya penjual (final value · 8%)</span>
              <b style={{ color: 'var(--ink-3)' }}>—</b>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
