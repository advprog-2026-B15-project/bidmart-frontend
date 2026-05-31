'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Switch from '@/components/ui/Switch';
import { Upload, Plus, Check, Chevron, Gavel } from '@/components/icons';
import { CAT_TREE, fmtRp } from '@/lib/data';
import { createListing } from '@/modules/catalog/api';
import { createAuction, activateAuction } from '@/modules/auction/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const CATEGORY_TREE = CAT_TREE as Record<string, Record<string, string[]>>;
const PHOTO_SLOTS = [0, 1, 2, 3, 4, 5];
const DURATIONS = [1, 3, 5, 7, 10, 14];

export default function BuatLelangPage() {
  useRequireAuth('SELLER');
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const targetSlotRef = useRef<number | null>(null);
  const [imgs, setImgs] = useState<(string | null)[]>([null, null, null, null, null, null]);
  const [files, setFiles] = useState<(File | null)[]>([null, null, null, null, null, null]);

  function openFilePicker(slot: number | null) {
    targetSlotRef.current = slot;
    if (fileInputRef.current) {
      fileInputRef.current.multiple = slot === null;
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }

  function storeFile(slot: number, file: File) {
    setFiles(prev => { const copy = [...prev]; copy[slot] = file; return copy; });
    const reader = new FileReader();
    reader.onload = ev => setImgs(prev => { const copy = [...prev]; copy[slot] = ev.target?.result as string; return copy; });
    reader.readAsDataURL(file);
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    if (!selected.length) return;
    let startSlot = targetSlotRef.current ?? imgs.findIndex(s => s === null);
    if (startSlot === -1) startSlot = 0;
    selected.forEach((file, i) => storeFile((startSlot + i) % PHOTO_SLOTS.length, file));
  }
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [startPrice, setStartPrice] = useState('');
  const [reserve, setReserve] = useState('');
  const [increment, setIncrement] = useState('50000');
  const [days, setDays] = useState(7);
  const [antiSnipe, setAntiSnipe] = useState(true);
  const [cat1, setCat1] = useState('Elektronik');
  const [cat2, setCat2] = useState('Audio & Video');
  const [cat3, setCat3] = useState('Headphone');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [mountTime] = useState<number>(() => Date.now());
  const onlyDigits = (v: string) => v.replace(/\D/g, '');
  const fmtField = (v: string) => Number(onlyDigits(v) || '0').toLocaleString('id-ID');
  const endDate = new Date(mountTime + days * 86400000).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const selectPrimaryCategory = (category: string) => {
    const sub = Object.keys(CATEGORY_TREE[category])[0];
    setCat1(category);
    setCat2(sub);
    setCat3(CATEGORY_TREE[category][sub][0]);
  };

  async function handlePublish() {
    if (!title.trim()) { setErrorMsg('Judul tidak boleh kosong.'); return; }
    if (!startPrice) { setErrorMsg('Harga awal tidak boleh kosong.'); return; }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const endTimeIso = new Date(mountTime + days * 86400000).toISOString();
      const endTimeLocal = endTimeIso.replace('Z', ''); // catalog (LocalDateTime)
      const endTimeOffset = endTimeIso.replace('.000Z', '+00:00'); // auction (OffsetDateTime)
      const startAmt = Number(onlyDigits(startPrice));
      const reserveAmt = reserve ? Number(onlyDigits(reserve)) : 0;
      const imageFiles = files.filter((f): f is File => f !== null);
      const listing = await createListing({
        title,
        description: desc,
        startingPrice: startAmt,
        reservePrice: reserveAmt > 0 ? reserveAmt : undefined,
        endTime: endTimeLocal,
        images: imageFiles.length > 0 ? imageFiles : undefined,
      });
      const auction = await createAuction({
        listingId: listing.id,
        title,
        startingPrice: startAmt,
        reservePrice: reserveAmt > startAmt ? reserveAmt : undefined,
        minimumIncrement: Number(onlyDigits(increment)) || 50_000,
        endTime: endTimeOffset,
      });
      await activateAuction(auction.id);
      router.push(`/detail?id=${auction.id}`);
    } catch (err) {
      const error = err as Error & { status?: number };
      let msg = error.message || 'Gagal mempublikasikan lelang.';
      if (error.status === 403) {
        msg = `Akses Ditolak: ${msg}`;
      }
      setErrorMsg(msg);
      setSubmitting(false);
    }
  }

  return (
      <div className="bm-page-wide">
        <nav className="bm-bread">
        <button type="button" onClick={() => router.push('/')}>Beranda</button>
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

      {errorMsg && (
        <div style={{ padding: '12px 16px', background: 'var(--red-50)', border: '1px solid #f5c5cc', borderRadius: 8, color: 'var(--red-700)', marginBottom: 16, fontSize: 14 }}>
          {errorMsg}
        </div>
      )}

      <div className="bm-create-layout">
        <div className="bm-create-form">
          <div className="bm-section-block">
            <h3><span className="step-num">1</span> Foto produk</h3>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={handleFiles}
            />
            <div
              className="bm-upload"
              style={{ cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onClick={() => openFilePicker(null)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFilePicker(null); } }}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                if (!dropped.length) return;
                let slot = imgs.findIndex(s => s === null);
                if (slot === -1) slot = 0;
                dropped.forEach((file, i) => storeFile((slot + i) % PHOTO_SLOTS.length, file));
              }}
            >
              <Upload width={28} height={28}/>
              <div className="t">Tarik foto ke sini atau klik untuk pilih</div>
              <div className="s">JPG, PNG, atau WEBP — maksimum 12 foto, ukuran 8 MB per foto</div>
            </div>
            <div className="bm-upload-thumbs">
              {PHOTO_SLOTS.map(slot => {
                const art = imgs[slot];
                return (
                  <div
                    key={slot}
                    className={`bm-upload-thumb ${slot === 0 && art ? 'main' : ''}`}
                    style={{ cursor: 'pointer' }}
                    role="button"
                    tabIndex={0}
                    onClick={() => !art && openFilePicker(slot)}
                    onKeyDown={e => { if (!art && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); openFilePicker(slot); } }}
                  >
                    {art ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={art} alt={`Foto ${slot + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }}/>
                        <button className="x" onClick={e => { e.stopPropagation(); setImgs(prev => { const c = [...prev]; c[slot] = null; return c; }); setFiles(prev => { const c = [...prev]; c[slot] = null; return c; }); }}>×</button>
                      </>
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--ink-4)', background: 'var(--surface-2)' }}>
                        <Plus width={16} height={16}/>
                        <span style={{ fontSize: 10 }}>Foto {slot + 1}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bm-section-block">
            <h3><span className="step-num">2</span> Detail barang</h3>
            <div className="bm-field">
              <label htmlFor="listing-title">Judul listing</label>
              <input id="listing-title" value={title} onChange={e => setTitle(e.target.value)} maxLength={120} placeholder="Contoh: Sony WH-1000XM5 Wireless — Garansi resmi"/>
              <span className="hint">{title.length}/120 karakter · Sertakan brand, model, dan kondisi</span>
            </div>
            <div className="bm-field">
              <label htmlFor="listing-description">Deskripsi</label>
              <textarea id="listing-description" rows={6} value={desc} onChange={e => setDesc(e.target.value)} placeholder="Jelaskan kondisi, kelengkapan, dan cacat (jika ada)"/>
              <span className="hint">{desc.length}/4000 karakter</span>
            </div>
            <div className="bm-field" style={{ marginBottom: 6 }}><span className="bm-field-label">Kategori</span></div>
            <div className="bm-cat-cascade">
              <div className="bm-cat-col">
                {Object.keys(CATEGORY_TREE).map(k => (
                  <button type="button" key={k} className={`it ${cat1 === k ? 'active' : ''}`}
                    onClick={() => selectPrimaryCategory(k)}>
                    <span>{k}</span><Chevron width={12} height={12}/>
                  </button>
                ))}
              </div>
              <div className="bm-cat-col">
                {Object.keys(CATEGORY_TREE[cat1] || {}).map((k: string) => (
                  <button type="button" key={k} className={`it ${cat2 === k ? 'active' : ''}`}
                    onClick={() => { setCat2(k); setCat3(CATEGORY_TREE[cat1][k][0]); }}>
                    <span>{k}</span><Chevron width={12} height={12}/>
                  </button>
                ))}
              </div>
              <div className="bm-cat-col">
                {(CATEGORY_TREE[cat1]?.[cat2] || []).map((k: string) => (
                  <button type="button" key={k} className={`it ${cat3 === k ? 'active' : ''}`} onClick={() => setCat3(k)}>
                    <span>{k}</span>
                    {cat3 === k && <Check width={14} height={14} style={{ color: 'var(--blue-600)' }}/>}
                  </button>
                ))}
              </div>
            </div>
            <div className="bm-cat-trail">
              Terpilih: <b>{cat1}</b> <Chevron width={10} height={10} style={{ color: 'var(--ink-4)' }}/>
              <b>{cat2}</b> <Chevron width={10} height={10} style={{ color: 'var(--ink-4)' }}/>
              <b>{cat3}</b>
            </div>
          </div>

          <div className="bm-section-block">
            <h3><span className="step-num">3</span> Harga &amp; aturan lelang</h3>
            <div className="bm-grid-3">
              <div className="bm-field">
                <label htmlFor="start-price">Harga awal (start)</label>
                <div className="bm-prefix-input"><span className="px">Rp</span><input id="start-price" value={fmtField(startPrice)} onChange={e => setStartPrice(onlyDigits(e.target.value))} placeholder="0"/></div>
                <span className="hint">Tawaran pertama dimulai dari sini</span>
              </div>
              <div className="bm-field">
                <label htmlFor="reserve-price">Reserve price</label>
                <div className="bm-prefix-input"><span className="px">Rp</span><input id="reserve-price" value={fmtField(reserve)} onChange={e => setReserve(onlyDigits(e.target.value))} placeholder="0 (opsional)"/></div>
                <span className="hint">Jika tidak tercapai, lelang ditutup tanpa pemenang</span>
              </div>
              <div className="bm-field">
                <label htmlFor="bid-increment">Kelipatan bid minimum</label>
                <div className="bm-prefix-input"><span className="px">Rp</span><input id="bid-increment" value={fmtField(increment)} onChange={e => setIncrement(onlyDigits(e.target.value))}/></div>
                <span className="hint">Tawaran harus naik minimal sebesar ini</span>
              </div>
            </div>
            <div className="bm-field" style={{ marginTop: 6 }}>
              <span className="bm-field-label">Durasi lelang</span>
              <div style={{ display: 'flex', gap: 8 }}>
                {DURATIONS.map(n => (
                  <button type="button" key={n} onClick={() => setDays(n)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid ' + (days === n ? 'var(--ink)' : 'var(--border)'), background: days === n ? 'var(--ink)' : 'var(--surface)', color: days === n ? '#fff' : 'var(--ink)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    {n} hari
                  </button>
                ))}
              </div>
            </div>
            <div className="bm-grid-2">
              <div className="bm-field">
                <label htmlFor="auction-start">Mulai</label>
                <input id="auction-start" type="text" defaultValue="Segera setelah dipublikasikan" readOnly style={{ color: 'var(--ink-2)', background: 'var(--surface-2)' }}/>
              </div>
              <div className="bm-field">
                <label htmlFor="auction-end">Berakhir otomatis pada</label>
                <input id="auction-end" type="text" readOnly value={endDate} style={{ background: 'var(--surface-2)', color: 'var(--ink)', fontWeight: 500 }}/>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 14, background: 'var(--blue-50)', borderRadius: 10, marginTop: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--blue-800)' }}>Anti-sniping aktif</div>
                <div style={{ fontSize: 12, color: 'var(--ink-2)', marginTop: 4, lineHeight: 1.5 }}>
                  Jika ada tawaran dalam 2 menit terakhir, lelang otomatis diperpanjang 2 menit dari waktu tawaran tersebut.
                </div>
              </div>
              <Switch on={antiSnipe} onChange={setAntiSnipe}/>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', padding: '20px 0 0' }}>
            <Button variant="ghost" size="lg" onClick={() => router.push('/')}>Batal</Button>
            <Button variant="primary" size="lg" leftIcon={<Gavel width={16} height={16}/>} onClick={handlePublish} disabled={submitting}>
              {submitting ? 'Memproses...' : 'Publikasikan Lelang'}
            </Button>
          </div>
        </div>

        <aside className="bm-preview-sticky">
          <div className="bm-preview-h">Pratinjau listing</div>
          <div className="bm-preview-card">
            <div className="bm-listing-image" style={{ borderRadius: 8 }}>
              {imgs[0] ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={imgs[0]} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}/>
              ) : (
                <div className="bm-listing-image-fill bm-art-elec"/>
              )}
              <span className="bm-listing-badge bm-listing-badge-amber">BARU</span>
            </div>
            <div className="bm-listing-meta" style={{ padding: '12px 4px 0' }}>
              <div className="bm-listing-title">{title || 'Judul lelang'}</div>
              <div className="bm-listing-price">{fmtRp(Number(startPrice) || 0)}</div>
              <div className="bm-listing-sub"><span>{days}h tersisa</span><span> · 0 bid</span></div>
            </div>
          </div>

          <div className="bm-preview-card" style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Ringkasan</div>
            {[
              ['Harga awal', fmtRp(Number(startPrice) || 0)],
              ['Reserve', reserve ? fmtRp(Number(reserve)) : '—'],
              ['Kelipatan', fmtRp(Number(increment) || 50_000)],
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
          </div>
        </aside>
      </div>
    </div>
  );
}
