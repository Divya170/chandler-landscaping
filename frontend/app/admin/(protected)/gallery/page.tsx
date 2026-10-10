'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/admin/AdminShell';
import { ImageField } from '@/components/admin/ImageField';
import { adminApi, ApiError } from '@/lib/api-client';
import type { AdminGalleryItem, TileSize } from '@/lib/types';

type Draft = { id?: number; title: string; category: string; imageUrl: string; alt: string; focal: string; size: TileSize; published: boolean };
const BLANK: Draft = { title: '', category: '', imageUrl: '', alt: '', focal: '50% 50%', size: 'standard', published: true };
const SIZES: { v: TileSize; label: string }[] = [{ v: 'standard', label: 'Standard (1×1)' }, { v: 'wide', label: 'Wide (2×1)' }, { v: 'large', label: 'Large (2×2)' }];

export default function AdminGalleryPage() {
  const toast = useToast();
  const [rows, setRows] = useState<AdminGalleryItem[] | null>(null);
  const [cats, setCats] = useState<{ key: string; label: string }[]>([]);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const [r, c] = await Promise.all([adminApi<AdminGalleryItem[]>('/admin/gallery'), adminApi<{ key: string; label: string }[]>('/admin/gallery/categories')]);
      setRows(r); setCats(c);
    } catch (e) { setError((e as ApiError).message); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const label = (k: string) => cats.find((c) => c.key === k)?.label || k;
  const visible = useMemo(() => {
    const t = search.trim().toLowerCase();
    return (rows || []).filter((p) => (cat === 'all' || p.category === cat) && (!t || `${p.title} ${p.alt}`.toLowerCase().includes(t)));
  }, [rows, search, cat]);
  const filtering = !!search.trim() || cat !== 'all';
  const blank = () => ({ ...BLANK, category: cats[0]?.key || '' });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    const errs: Record<string, string> = {};
    if (!draft.title.trim()) errs.title = 'Enter a caption.';
    if (!draft.category) errs.category = 'Choose a service category.';
    if (!draft.imageUrl.trim()) errs.imageUrl = 'Upload an image.';
    if (!draft.alt.trim()) errs.alt = 'Describe the image for screen-reader users.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    const { id, ...body } = draft;
    try {
      if (id) await adminApi(`/admin/gallery/${id}`, { method: 'PATCH', body: JSON.stringify(body) });
      else await adminApi('/admin/gallery', { method: 'POST', body: JSON.stringify(body) });
      toast({ text: id ? 'Photo updated.' : 'Photo added to Our Work.', kind: 'ok', link: { href: '/our-work', label: 'View on site ↗' } });
      setDraft(null);
      load();
    } catch (ex) {
      const a = ex as ApiError;
      setErrors(a.errors);
      if (!Object.keys(a.errors).length) toast({ text: a.message, kind: 'err' });
    } finally { setSaving(false); }
  };

  const togglePublish = async (p: AdminGalleryItem) => {
    try {
      await adminApi(`/admin/gallery/${p.id}`, { method: 'PATCH', body: JSON.stringify({ published: !p.published }) });
      toast({ text: p.published ? 'Hidden from Our Work.' : 'Published to Our Work.', kind: 'ok' });
      load();
    } catch (e) { toast({ text: (e as ApiError).message, kind: 'err' }); }
  };

  const remove = async (id: number) => {
    try {
      await adminApi(`/admin/gallery/${id}`, { method: 'DELETE' });
      toast({ text: 'Photo deleted.', kind: 'ok' });
      setConfirmId(null);
      load();
    } catch (e) { toast({ text: (e as ApiError).message, kind: 'err' }); }
  };

  const move = async (id: number, dir: -1 | 1) => {
    if (!rows) return;
    const ids = rows.map((r) => r.id);
    const i = ids.indexOf(id), j = i + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    try { setRows(await adminApi<AdminGalleryItem[]>('/admin/gallery/reorder', { method: 'PUT', body: JSON.stringify({ ids }) })); }
    catch (e) { toast({ text: (e as ApiError).message, kind: 'err' }); }
  };

  return (
    <>
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, marginBottom: 20 }}>
        <div>
          <p className="eyebrow admin">Admin</p>
          <h1 id="main-h" tabIndex={-1} className="admin-h1">Our Work gallery</h1>
        </div>
        <button type="button" className="small-btn primary" style={{ minHeight: 44 }} onClick={() => { setErrors({}); setDraft(blank()); }} disabled={!cats.length}>+ Add photo</button>
      </div>
      <p className="muted" style={{ fontSize: 15, marginBottom: 16, maxWidth: '75ch' }}>Only publish photos of genuine {`Chandler Landscaping`} work. The first three photos also appear in &ldquo;From the garden journal&rdquo; on Home.</p>
      <div className="row" style={{ gap: 12, marginBottom: 20 }}>
        <div style={{ flex: '1 1 240px' }}>
          <label htmlFor="g-search" className="admin-label">Search</label>
          <input id="g-search" type="search" className="admin-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Caption or description" />
        </div>
        <div style={{ flex: '0 1 220px' }}>
          <label htmlFor="g-cat" className="admin-label">Service</label>
          <select id="g-cat" className="admin-input" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="all">All services</option>
            {cats.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
        </div>
      </div>

      {error ? (
        <div role="alert" className="alert row" style={{ justifyContent: 'space-between', gap: 12 }}><span>{error}</span><button type="button" className="small-btn" onClick={load}>Try again</button></div>
      ) : !rows ? (
        <div className="cards-grid" aria-busy="true">{[0, 1, 2, 3].map((i) => <div key={i} className="skel" style={{ height: 260 }} />)}</div>
      ) : visible.length === 0 ? (
        <div className="empty" style={{ background: 'var(--white)' }}>
          <p className="serif">{filtering ? 'No photos match these filters.' : 'The gallery is empty.'}</p>
          {filtering ? <button type="button" className="small-btn" onClick={() => { setSearch(''); setCat('all'); }}>Clear filters</button>
            : <button type="button" className="small-btn primary" onClick={() => setDraft(blank())}>Add the first photo</button>}
        </div>
      ) : (
        <ul className="cards-grid">
          {visible.map((p) => {
            const index = rows.findIndex((r) => r.id === p.id);
            return (
              <li key={p.id} className="panel stack" style={{ overflow: 'hidden' }}>
                <div className="media" style={{ aspectRatio: '4 / 3', opacity: p.published ? 1 : 0.5 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.imageUrl} alt={p.alt} loading="lazy" style={{ objectPosition: p.focal }} />
                </div>
                <div className="stack" style={{ padding: 12, gap: 8, flex: 1 }}>
                  <div>
                    <p style={{ fontWeight: 600, color: 'var(--green)' }}>{p.title}</p>
                    <p className="muted" style={{ fontSize: 13 }}>{label(p.category)} · {p.size} · {p.published ? <span className="badge">Published</span> : <span className="badge off">Hidden</span>}</p>
                  </div>
                  <div className="row" style={{ gap: 6, marginTop: 'auto' }}>
                    {!filtering && <>
                      <button type="button" className="small-btn" disabled={index === 0} onClick={() => move(p.id, -1)} aria-label={`Move ${p.title} earlier`}>←</button>
                      <button type="button" className="small-btn" disabled={index === rows.length - 1} onClick={() => move(p.id, 1)} aria-label={`Move ${p.title} later`}>→</button>
                    </>}
                    <button type="button" className="small-btn" onClick={() => { setErrors({}); setDraft({ id: p.id, title: p.title, category: p.category, imageUrl: p.imageUrl, alt: p.alt, focal: p.focal, size: p.size, published: p.published }); }}>Edit</button>
                    <button type="button" className="small-btn" onClick={() => togglePublish(p)}>{p.published ? 'Hide' : 'Publish'}</button>
                    {confirmId === p.id ? (
                      <>
                        <button type="button" className="small-btn danger" onClick={() => remove(p.id)}>Confirm</button>
                        <button type="button" className="small-btn" onClick={() => setConfirmId(null)}>Cancel</button>
                      </>
                    ) : <button type="button" className="small-btn danger" onClick={() => setConfirmId(p.id)}>Delete</button>}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {draft && (
        <div className="modal-back" onClick={(e) => e.target === e.currentTarget && !saving && setDraft(null)} onKeyDown={(e) => e.key === 'Escape' && !saving && setDraft(null)}>
          <form className="drawer" role="dialog" aria-modal="true" aria-labelledby="g-drawer-h" onSubmit={save} noValidate>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <h2 id="g-drawer-h" className="serif" style={{ fontSize: 28, color: 'var(--green)' }}>{draft.id ? 'Edit photo' : 'Add photo'}</h2>
              <button type="button" className="small-btn" onClick={() => setDraft(null)} disabled={saving}>Close</button>
            </div>
            <ImageField id="g-image" label="Image" required value={draft.imageUrl} onChange={(url) => setDraft({ ...draft, imageUrl: url })} error={errors.imageUrl} />
            <div>
              <label htmlFor="g-title" className="admin-label">Caption</label>
              <input id="g-title" className="admin-input" maxLength={120} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} aria-invalid={!!errors.title} placeholder="e.g. Front lawn and flower beds" />
              {errors.title && <p className="field-error">⚠ {errors.title}</p>}
            </div>
            <div className="row" style={{ gap: 12 }}>
              <div style={{ flex: '1 1 180px' }}>
                <label htmlFor="g-category" className="admin-label">Service</label>
                <select id="g-category" className="admin-input" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} aria-invalid={!!errors.category}>
                  <option value="">Choose a service</option>
                  {cats.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
                </select>
                {errors.category && <p className="field-error">⚠ {errors.category}</p>}
              </div>
              <div style={{ flex: '1 1 180px' }}>
                <label htmlFor="g-size" className="admin-label">Tile size</label>
                <select id="g-size" className="admin-input" value={draft.size} onChange={(e) => setDraft({ ...draft, size: e.target.value as TileSize })}>
                  {SIZES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label htmlFor="g-alt" className="admin-label">Image description (alt text)</label>
              <textarea id="g-alt" className="admin-input" rows={3} maxLength={300} value={draft.alt} onChange={(e) => setDraft({ ...draft, alt: e.target.value })} aria-invalid={!!errors.alt} />
              {errors.alt && <p className="field-error">⚠ {errors.alt}</p>}
            </div>
            <div>
              <label htmlFor="g-focal" className="admin-label">Focal point</label>
              <input id="g-focal" className="admin-input" value={draft.focal} onChange={(e) => setDraft({ ...draft, focal: e.target.value })} aria-invalid={!!errors.focal} />
              <p className="help">Which part of the photo to keep in view when cropped, e.g. &ldquo;50% 60%&rdquo; (horizontal, vertical).</p>
              {errors.focal && <p className="field-error">⚠ {errors.focal}</p>}
            </div>
            <label className="switch">
              <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
              <span><strong>Published</strong><br /><span className="help">Show this photo on Our Work.</span></span>
            </label>
            <div className="row" style={{ gap: 8, marginTop: 'auto', paddingTop: 8 }}>
              <button type="submit" className="small-btn primary" style={{ minHeight: 44, padding: '0 20px' }} disabled={saving}>
                {saving && <span className="spinner" aria-hidden="true" />}{saving ? 'Saving…' : draft.id ? 'Save changes' : 'Add photo'}
              </button>
              <button type="button" className="small-btn" style={{ minHeight: 44 }} onClick={() => setDraft(null)} disabled={saving}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
