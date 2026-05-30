'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AccountSideNav from '@/components/AccountSideNav';
import Button from '@/components/ui/Button';
import { Plus, Pencil, Trash, Check, AlertTri } from '@/components/icons';
import { fmtRp } from '@/lib/data';
import { getSellerListings, deleteListing, updateListing, publishListing, type Listing } from '@/modules/catalog/api';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { getCurrentUserId } from '@/lib/api';

const STATUS_LABEL: Record<string, { lbl: string; cls: string }> = {
  DRAFT:    { lbl: 'Draft',    cls: 'bm-status-wait' },
  ACTIVE:   { lbl: 'Aktif',   cls: 'bm-status-recv' },
  INACTIVE: { lbl: 'Nonaktif', cls: 'bm-status-done' },
  SOLD:     { lbl: 'Terjual', cls: 'bm-status-recv' },
};

function EditModal({ listing, onSave, onClose }: Readonly<{
  listing: Listing;
  onSave: (data: { title: string; description: string }) => Promise<void>;
  onClose: () => void;
}>) {
  const [title, setTitle] = useState(listing.title);
  const [desc, setDesc] = useState(listing.description);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      await onSave({ title, description: desc });
      onClose();
    } catch (ex) { setErr((ex as Error).message); }
    finally { setLoading(false); }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: 28, width: 520, maxWidth: '90vw', boxShadow: 'var(--shadow-3)' }}>
        <h3 style={{ marginBottom: 20, fontSize: 16, fontWeight: 700 }}>Edit Listing</h3>
        {err && (
          <div style={{ padding: '10px 14px', background: 'var(--red-50)', color: 'var(--red-700)', borderRadius: 8, marginBottom: 14, fontSize: 13, display: 'flex', gap: 8 }}>
            <AlertTri width={15} height={15}/> {err}
          </div>
        )}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: 'var(--ink-3)', display: 'block', marginBottom: 6 }}>Judul</label>
            <input className="bm-input" value={title} onChange={e => setTitle(e.target.value)} required/>
          </div>
          <div>
            <label style={{ fontSize: 12, color: 'var(--ink-3)', display: 'block', marginBottom: 6 }}>Deskripsi</label>
            <textarea
              className="bm-input"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={5}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
            <Button variant="ghost" size="md" type="button" onClick={onClose}>Batal</Button>
            <Button variant="primary" size="md" type="submit" loading={loading} leftIcon={<Check width={15} height={15}/>}>
              Simpan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ListingSayaPage() {
  useRequireAuth('SELLER');
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'ALL' | 'DRAFT' | 'ACTIVE'>('ALL');
  const [editTarget, setEditTarget] = useState<Listing | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const uid = getCurrentUserId() ?? '';
    try {
      const data = await getSellerListings(uid, { size: 50 });
      setListings(data.content);
    } catch { setListings([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = tab === 'ALL' ? listings : listings.filter(l => l.status === tab);

  async function handleDelete(id: string) {
    if (!confirm('Hapus listing ini? Tindakan tidak bisa dibatalkan.')) return;
    setDeleting(id);
    try { await deleteListing(id); await load(); }
    catch (e) { alert((e as Error).message); }
    finally { setDeleting(null); }
  }

  async function handlePublish(id: string) {
    setPublishing(id);
    try { await publishListing(id); await load(); }
    catch (e) { alert((e as Error).message); }
    finally { setPublishing(null); }
  }

  async function handleSave(id: string, data: { title: string; description: string }) {
    await updateListing(id, data);
    await load();
  }

  const counts = {
    ALL: listings.length,
    DRAFT: listings.filter(l => l.status === 'DRAFT').length,
    ACTIVE: listings.filter(l => l.status === 'ACTIVE').length,
  };

  return (
    <div className="bm-page-wide">
      <div className="bm-app">
        <AccountSideNav active="listings"/>
        <div style={{ flex: 1 }}>
          <div className="bm-pg-head">
            <div>
              <h1>Listing saya</h1>
              <p>Kelola semua listing lelang yang kamu buat.</p>
            </div>
            <Button variant="primary" size="md" leftIcon={<Plus width={16} height={16}/>} onClick={() => router.push('/buat-lelang')}>
              Buat lelang baru
            </Button>
          </div>

          <div className="bm-tabs" style={{ marginBottom: 20 }}>
            {(['ALL', 'DRAFT', 'ACTIVE'] as const).map(t => (
              <button key={t} className={`bm-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                {t === 'ALL' ? 'Semua' : t === 'DRAFT' ? 'Draft' : 'Aktif'}
                <span className="count">{counts[t]}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ink-3)' }}>Memuat listing...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--ink-3)', border: '1px dashed var(--border-strong)', borderRadius: 12 }}>
              {tab === 'ALL' ? 'Belum ada listing.' : `Tidak ada listing dengan status ${tab}.`}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(l => {
                const st = STATUS_LABEL[l.status] ?? { lbl: l.status, cls: 'bm-status-done' };
                const canEdit = l.bidCount === 0 && l.status === 'DRAFT';
                const canDelete = l.bidCount === 0;
                const canPublish = l.status === 'DRAFT';
                return (
                  <div key={l.id} style={{
                    padding: '16px 20px', background: 'var(--surface)',
                    border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
                    display: 'flex', alignItems: 'center', gap: 16,
                  }}>
                    <div className="bm-art-elec" style={{ width: 56, height: 56, borderRadius: 10, flexShrink: 0 }}/>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 3 }}>
                        Harga awal: {fmtRp(l.startingPrice)}
                        {l.currentPrice && l.currentPrice !== l.startingPrice && ` · Terkini: ${fmtRp(l.currentPrice)}`}
                        {' · '}{l.bidCount} bid
                        {' · '}{l.category?.name ?? '-'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
                        {l.id}
                      </div>
                    </div>
                    <span className={`bm-status ${st.cls}`}>{st.lbl}</span>
                    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                      {canPublish && (
                        <Button variant="secondary" size="sm" loading={publishing === l.id} onClick={() => handlePublish(l.id)}>
                          Publikasikan
                        </Button>
                      )}
                      {canEdit && (
                        <Button variant="ghost" size="sm" leftIcon={<Pencil width={13} height={13}/>} onClick={() => setEditTarget(l)}>
                          Edit
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost" size="sm"
                          loading={deleting === l.id}
                          leftIcon={<Trash width={13} height={13}/>}
                          onClick={() => handleDelete(l.id)}
                          style={{ color: 'var(--red-600)' }}
                        >
                          Hapus
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {editTarget && (
        <EditModal
          listing={editTarget}
          onSave={data => handleSave(editTarget.id, data)}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  );
}
