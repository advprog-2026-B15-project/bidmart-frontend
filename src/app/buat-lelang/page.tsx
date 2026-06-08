'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Switch from '@/components/ui/Switch';
import { Upload, Plus, Check, Chevron, Gavel } from '@/components/icons';
import { fmtRp } from '@/lib/data';
import { createListing, publishListing } from '@/modules/catalog/api';
import { createAuction, activateAuction } from '@/modules/auction/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuction } from '@/store/auction-context';

interface CategoryInfo {
  id: string;
  sub: Record<string, string[]>;
}

const CATEGORY_TREE: Record<string, CategoryInfo> = {
  'Elektronik': {
    id: '11111111-1111-1111-1111-111111111111',
    sub: { 'Audio & Video': ['Headphone', 'Speaker'], 'Gadget': ['Smartphone', 'Tablet'] }
  },
  'Fashion & Pakaian': {
    id: '22222222-2222-2222-2222-222222222222',
    sub: { 'Pria': ['Kaos', 'Kemeja'], 'Wanita': ['Gaun', 'Tas'] }
  },
  'Barang Koleksi': {
    id: '33333333-3333-3333-3333-333333333333',
    sub: { 'Mainan': ['Action Figure', 'Mobil-mobilan'], 'Seni': ['Lukisan', 'Patung'] }
  },
  'Otomotif': {
    id: '44444444-4444-4444-4444-444444444444',
    sub: { 'Mobil': ['Sedan', 'SUV'], 'Motor': ['Sport', 'Matic'] }
  }
};

const PHOTO_SLOTS = [0, 1, 2, 3, 4, 5];
const DURATIONS = [
  { label: '2 Menit', ms: 2 * 60 * 1000 },
  { label: '1 Hari', ms: 86400000 },
  { label: '3 Hari', ms: 3 * 86400000 },
  { label: '7 Hari', ms: 7 * 86400000 },
  { label: '14 Hari', ms: 14 * 86400000 },
];

export default function BuatLelangPage() {
  useRequireAuth('SELLER');
  const router = useRouter();
  const { addToast } = useAuction();
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
  const [durationMs, setDurationMs] = useState(7 * 86400000);
  const [antiSnipe, setAntiSnipe] = useState(true);
  const [cat1, setCat1] = useState('Elektronik');
  const [cat2, setCat2] = useState('Audio & Video');
  const [cat3, setCat3] = useState('Headphone');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewBaseTime, setPreviewBaseTime] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setPreviewBaseTime(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const onlyDigits = (v: string) => v.replace(/\D/g, '');
  const fmtField = (v: string) => Number(onlyDigits(v) || '0').toLocaleString('id-ID');
  const endDate = new Date(previewBaseTime + durationMs).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  function buildEndTimes() {
    const endTimeIso = new Date(Date.now() + durationMs).toISOString();
    return {
      local: endTimeIso.replace('Z', ''),
      offset: endTimeIso.replace('Z', '+00:00'),
    };
  }

  const selectPrimaryCategory = (category: string) => {
    const categoryInfo = CATEGORY_TREE[category];
    if (categoryInfo) {
      const subKeys = Object.keys(categoryInfo.sub);
      const sub = subKeys[0];
      setCat1(category);
      setCat2(sub);
      setCat3(categoryInfo.sub[sub][0]);
    }
  };

  async function handleSaveDraft() {
    if (!title.trim()) { setErrorMsg('Judul tidak boleh kosong untuk menyimpan draft.'); return; }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const { local: endTimeLocal } = buildEndTimes();
      const startAmt = Number(onlyDigits(startPrice)) || 0;
      const reserveAmt = reserve ? Number(onlyDigits(reserve)) : 0;
      const imageFiles = files.filter((f): f is File => f !== null);

      const categoryId = CATEGORY_TREE[cat1]?.id;

      await createListing({
        title,
        description: desc,
        startingPrice: startAmt,
        reservePrice: reserveAmt > 0 ? reserveAmt : undefined,
        endTime: endTimeLocal,
        categoryId: categoryId,
        images: imageFiles.length > 0 ? imageFiles : undefined,
      });

      addToast({ tone: 'success', title: 'Draft disimpan', desc: 'Barang kamu berhasil disimpan sebagai draft.' });
      router.push('/listing-saya'); // Redirect to my listings page
    } catch (err) {
      setErrorMsg((err as Error).message || 'Gagal menyimpan draft.');
      setSubmitting(false);
    }
  }

  async function handlePublish() {
    if (!title.trim()) { setErrorMsg('Judul tidak boleh kosong.'); return; }
    if (!startPrice) { setErrorMsg('Harga awal tidak boleh kosong.'); return; }
    setSubmitting(true);
    setErrorMsg('');
    try {
      const { local: endTimeLocal, offset: endTimeOffset } = buildEndTimes();
      const startAmt = Number(onlyDigits(startPrice));
      const reserveAmt = reserve ? Number(onlyDigits(reserve)) : 0;
      const imageFiles = files.filter((f): f is File => f !== null);

      const categoryId = CATEGORY_TREE[cat1]?.id;

      const listing = await createListing({
        title,
        description: desc,
        startingPrice: startAmt,
        reservePrice: reserveAmt > 0 ? reserveAmt : undefined,
        endTime: endTimeLocal,
        categoryId: categoryId,
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
      await publishListing(listing.id);
      await activateAuction(auction.id);
      addToast({ tone: 'success', title: 'Lelang Berhasil!', desc: 'Barang kamu kini tayang dan bisa ditawar.' });
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
          <p>Isi detail barang kamu. Pilih antara simpan sebagai draft atau publikasikan sekarang.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Button variant="ghost" size="md" onClick={handleSaveDraft} disabled={submitting}>
            Simpan sebagai draft
          </Button>
          <Button variant="primary" size="md" onClick={handlePublish} disabled={submitting}>
            Publikasikan
          </Button>
        </div>
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
                {Object.keys(CATEGORY_TREE[cat1]?.sub || {}).map((k: string) => (
                  <button type="button" key={k} className={`it ${cat2 === k ? 'active' : ''}`}
                    onClick={() => {
                      const categoryInfo = CATEGORY_TREE[cat1];
                      setCat2(k);
                      if (categoryInfo && categoryInfo.sub[k]) {
                        setCat3(categoryInfo.sub[k][0]);
                      }
                    }}>
                    <span>{k}</span><Chevron width={12} height={12}/>
                  </button>
                ))}
              </div>
              <div className="bm-cat-col">
                {(CATEGORY_TREE[cat1]?.sub[cat2] || []).map((k: string) => (
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
                {DURATIONS.map(d => (
                  <button type="button" key={d.label} onClick={() => setDurationMs(d.ms)} style={{ padding: '9px 16px', borderRadius: 8, border: '1px solid ' + (durationMs === d.ms ? 'var(--ink)' : 'var(--border)'), background: durationMs === d.ms ? 'var(--ink)' : 'var(--surface)', color: durationMs === d.ms ? '#fff' : 'var(--ink)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    {d.label}
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
            <Button variant="secondary" size="lg" onClick={handleSaveDraft} disabled={submitting}>
              Simpan sebagai draft
            </Button>
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
              <div className="bm-listing-sub"><span>{DURATIONS.find(d => d.ms === durationMs)?.label} tersisa</span><span> · 0 bid</span></div>
            </div>
          </div>

          <div className="bm-preview-card" style={{ marginTop: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Ringkasan</div>
            {[
              ['Harga awal', fmtRp(Number(startPrice) || 0)],
              ['Reserve', reserve ? fmtRp(Number(reserve)) : '—'],
              ['Kelipatan', fmtRp(Number(increment) || 50_000)],
              ['Durasi', DURATIONS.find(d => d.ms === durationMs)?.label || '-'],
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
