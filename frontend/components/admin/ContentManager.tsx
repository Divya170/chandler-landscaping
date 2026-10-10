'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { adminApi, ApiError } from '@/lib/api-client';
import type { ContentRow, ContentSchema } from '@/lib/types';
import { useToast } from './AdminShell';
import { ImageField } from './ImageField';

type Draft = { id?: number; key: string; published: boolean; fields: Record<string, unknown> };

/**
 * Generic CRUD for every ContentBlock type. The form is generated from the backend schema
 * (GET /api/admin/content/schemas), so adding a field there is all that's needed.
 */
export function ContentManager({ schema }: { schema: ContentSchema }) {
  const toast = useToast();
  const [rows, setRows] = useState<ContentRow[] | null>(null);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setError('');
    try { setRows(await adminApi<ContentRow[]>(`/admin/content?type=${encodeURIComponent(schema.type)}`)); }
    catch (e) { setError((e as ApiError).message); }
  }, [schema.type]);
  useEffect(() => { setRows(null); setDraft(null); load(); }, [load]);

  const visible = useMemo(() => {
    const t = search.trim().toLowerCase();
    return (rows || []).filter((r) => !t || JSON.stringify(r.fields).toLowerCase().includes(t) || (r.key || '').includes(t));
  }, [rows, search]);

  const blank = (): Draft => ({
    key: '', published: true,
    fields: Object.fromEntries(schema.fields.map((f) => [f.name, f.kind === 'list' ? [] : ''])),
  });
  const edit = (r: ContentRow) => {
    setErrors({});
    setDraft({ id: r.id, key: r.key || '', published: r.published, fields: { ...blank().fields, ...r.fields } });
  };
  const setField = (name: string, v: unknown) => setDraft((d) => (d ? { ...d, fields: { ...d.fields, [name]: v } } : d));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    // Instant client checks mirroring the server schema.
    const errs: Record<string, string> = {};
    schema.fields.forEach((f) => {
      const v = draft.fields[f.name];
      if (f.required && f.kind !== 'list' && !String(v ?? '').trim()) errs[f.name] = `Please enter ${f.label.toLowerCase()}.`;
    });
    if (schema.hasKey && !draft.key.trim()) errs.key = 'Please enter a short id, e.g. "general-contracting".';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSaving(true);
    const body = JSON.stringify({ type: schema.type, key: draft.key, published: draft.published, fields: draft.fields });
    try {
      if (draft.id) await adminApi(`/admin/content/${draft.id}`, { method: 'PATCH', body });
      else await adminApi('/admin/content', { method: 'POST', body });
      toast({ text: `${schema.singular} ${draft.id ? 'updated' : 'added'}.`, kind: 'ok', link: { href: schema.page || '/', label: 'View on site ↗' } });
      setDraft(null);
      load();
    } catch (ex) {
      const a = ex as ApiError;
      setErrors(a.errors);
      if (!Object.keys(a.errors).length) toast({ text: a.message, kind: 'err' });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (r: ContentRow) => {
    try {
      await adminApi(`/admin/content/${r.id}`, { method: 'PATCH', body: JSON.stringify({ published: !r.published }) });
      toast({ text: r.published ? 'Hidden from the site.' : 'Published.', kind: 'ok' });
      load();
    } catch (e) { toast({ text: (e as ApiError).message, kind: 'err' }); }
  };

  const remove = async (id: number) => {
    try {
      await adminApi(`/admin/content/${id}`, { method: 'DELETE' });
      toast({ text: `${schema.singular} deleted.`, kind: 'ok' });
      setConfirmId(null);
      load();
    } catch (e) { toast({ text: (e as ApiError).message, kind: 'err' }); }
  };

  const move = async (index: number, dir: -1 | 1) => {
    if (!rows) return;
    const ids = rows.map((r) => r.id);
    const j = index + dir;
    if (j < 0 || j >= ids.length) return;
    [ids[index], ids[j]] = [ids[j], ids[index]];
    try { setRows(await adminApi<ContentRow[]>('/admin/content/reorder', { method: 'PUT', body: JSON.stringify({ type: schema.type, ids }) })); }
    catch (e) { toast({ text: (e as ApiError).message, kind: 'err' }); }
  };

  const title = (r: ContentRow) => String(r.fields[schema.titleField] || r.key || `#${r.id}`);
  const image = (r: ContentRow) => (typeof r.fields.image === 'string' ? r.fields.image : '');

  return (
    <div className="stack" style={{ gap: 16 }}>
      <p className="muted" style={{ fontSize: 15, maxWidth: '75ch' }}>{schema.description}</p>
      <div className="row" style={{ gap: 12, alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 240px' }}>
          <label htmlFor={`s-${schema.type}`} className="admin-label">Search {schema.label.toLowerCase()}</label>
          <input id={`s-${schema.type}`} type="search" className="admin-input" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button type="button" className="small-btn primary" style={{ minHeight: 44 }} onClick={() => { setErrors({}); setDraft(blank()); }}>+ Add {schema.singular.toLowerCase()}</button>
      </div>

      {error ? (
        <div role="alert" className="alert row" style={{ justifyContent: 'space-between', gap: 12 }}><span>{error}</span><button type="button" className="small-btn" onClick={load}>Try again</button></div>
      ) : !rows ? (
        <div className="stack" style={{ gap: 8 }} aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="skel" style={{ height: 64 }} />)}</div>
      ) : visible.length === 0 ? (
        <div className="empty" style={{ background: '#FFFFFF' }}>
          <p className="serif" style={{ fontSize: 24 }}>{search ? 'Nothing matches your search.' : `No ${schema.label.toLowerCase()} yet.`}</p>
          {search ? <button type="button" className="small-btn" onClick={() => setSearch('')}>Clear search</button>
            : <button type="button" className="small-btn primary" onClick={() => setDraft(blank())}>Add the first one</button>}
        </div>
      ) : (
        <ul className="panel" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {visible.map((r) => {
            const index = rows.findIndex((x) => x.id === r.id);
            return (
              <li key={r.id} className="row" style={{ gap: 12, alignItems: 'center', padding: '12px 14px', borderTop: index === 0 ? 0 : '1px solid var(--line-3)' }}>
                {image(r) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={image(r)} alt="" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 2, flex: 'none' }} />
                )}
                <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                  <p style={{ fontWeight: 600, color: 'var(--navy)' }}>{title(r)}</p>
                  <p style={{ fontSize: 13, color: 'var(--muted)' }}>
                    {r.key && <>id: {r.key} · </>}
                    {r.published ? <span className="badge">Published</span> : <span className="badge off">Hidden</span>}
                  </p>
                </div>
                <div className="row" style={{ gap: 6 }}>
                  {!search && <>
                    <button type="button" className="small-btn" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Move ${title(r)} up`}>↑</button>
                    <button type="button" className="small-btn" disabled={index === rows.length - 1} onClick={() => move(index, 1)} aria-label={`Move ${title(r)} down`}>↓</button>
                  </>}
                  <button type="button" className="small-btn" onClick={() => togglePublish(r)}>{r.published ? 'Hide' : 'Publish'}</button>
                  <button type="button" className="small-btn" onClick={() => edit(r)}>Edit</button>
                  {confirmId === r.id ? (
                    <>
                      <button type="button" className="small-btn danger" onClick={() => remove(r.id)}>Confirm delete</button>
                      <button type="button" className="small-btn" onClick={() => setConfirmId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button type="button" className="small-btn danger" onClick={() => setConfirmId(r.id)}>Delete</button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {draft && (
        <div className="modal-back" onClick={(e) => e.target === e.currentTarget && !saving && setDraft(null)} onKeyDown={(e) => e.key === 'Escape' && !saving && setDraft(null)}>
          <form className="drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-h" onSubmit={save} noValidate>
            <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <h2 id="drawer-h" className="serif" style={{ fontSize: 28, color: 'var(--navy)' }}>{draft.id ? 'Edit' : 'Add'} {schema.singular.toLowerCase()}</h2>
              <button type="button" className="small-btn" onClick={() => setDraft(null)} disabled={saving}>Close</button>
            </div>
            {schema.hasKey && (
              <div>
                <label htmlFor="f-key" className="admin-label">Short id</label>
                <input id="f-key" className="admin-input" value={draft.key} onChange={(e) => setDraft({ ...draft, key: e.target.value })} aria-invalid={!!errors.key} autoFocus />
                {schema.keyHelp && <p className="help" style={{ marginTop: 4 }}>{schema.keyHelp}</p>}
                {errors.key && <p className="field-error">{errors.key}</p>}
              </div>
            )}
            {schema.fields.map((f, i) => {
              const v = draft.fields[f.name];
              const id = `f-${f.name}`;
              if (f.kind === 'image' || f.kind === 'file') {
                return <ImageField key={f.name} id={id} label={f.label} kind={f.kind === 'file' ? 'document' : 'image'} value={String(v || '')} onChange={(url) => setField(f.name, url)} error={errors[f.name]} required={f.required} />;
              }
              if (f.kind === 'select') {
                return (
                  <div key={f.name}>
                    <label htmlFor={id} className="admin-label">{f.label}{f.required ? '' : ' (optional)'}</label>
                    <select id={id} className="admin-input" value={String(v ?? '')} onChange={(e) => setField(f.name, e.target.value)} aria-invalid={!!errors[f.name]}>
                      <option value="">Default</option>
                      {(f.options || []).map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    {f.help && <span className="help">{f.help}</span>}
                    {errors[f.name] && <p className="field-error">{errors[f.name]}</p>}
                  </div>
                );
              }
              if (f.kind === 'list') {
                const list = Array.isArray(v) ? (v as string[]) : [];
                return (
                  <div key={f.name}>
                    <p className="admin-label">{f.label}</p>
                    <div className="stack" style={{ gap: 6 }}>
                      {list.map((item, j) => (
                        <div key={j} className="row" style={{ gap: 6 }}>
                          <input className="admin-input" style={{ flex: 1 }} value={item} maxLength={f.max} aria-label={`${f.label} ${j + 1}`}
                            onChange={(e) => setField(f.name, list.map((x, k) => (k === j ? e.target.value : x)))} />
                          <button type="button" className="small-btn" aria-label={`Remove point ${j + 1}`} onClick={() => setField(f.name, list.filter((_, k) => k !== j))}>×</button>
                        </div>
                      ))}
                      {list.length < 10 && <button type="button" className="small-btn" style={{ alignSelf: 'flex-start' }} onClick={() => setField(f.name, [...list, ''])}>+ Add point</button>}
                    </div>
                    {f.help && <span className="help">{f.help}</span>}
                    {errors[f.name] && <p className="field-error">{errors[f.name]}</p>}
                  </div>
                );
              }
              const common = {
                id, className: 'admin-input', value: String(v ?? ''), maxLength: f.max, 'aria-invalid': !!errors[f.name],
                onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setField(f.name, e.target.value),
                autoFocus: !schema.hasKey && i === 0,
              };
              return (
                <div key={f.name}>
                  <label htmlFor={id} className="admin-label">{f.label}{f.required ? '' : ' (optional)'}</label>
                  {f.kind === 'textarea' ? <textarea rows={4} {...common} /> : <input {...common} />}
                  <div className="row" style={{ justifyContent: 'space-between', gap: 8 }}>
                    <span className="help">{f.help}</span>
                    {f.max && <span className="help">{String(v ?? '').length} / {f.max}</span>}
                  </div>
                  {errors[f.name] && <p className="field-error">{errors[f.name]}</p>}
                </div>
              );
            })}
            <label className="switch">
              <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
              <span><strong>Published</strong><br /><span className="help">Hidden items stay here but don&apos;t appear on the site.</span></span>
            </label>
            <div className="row" style={{ gap: 8, marginTop: 'auto', paddingTop: 8 }}>
              <button type="submit" className="small-btn primary" style={{ minHeight: 44, padding: '0 20px' }} disabled={saving}>
                {saving && <span className="spinner" aria-hidden="true" />}{saving ? 'Saving…' : draft.id ? 'Save changes' : `Add ${schema.singular.toLowerCase()}`}
              </button>
              <button type="button" className="small-btn" style={{ minHeight: 44 }} onClick={() => setDraft(null)} disabled={saving}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

/** Loads the schema list once for pages that use ContentManager. */
export function useSchemas() {
  const [schemas, setSchemas] = useState<ContentSchema[] | null>(null);
  const [error, setError] = useState('');
  const load = useCallback(() => {
    setError('');
    adminApi<ContentSchema[]>('/admin/content/schemas').then(setSchemas).catch((e: ApiError) => setError(e.message));
  }, []);
  useEffect(() => { load(); }, [load]);
  return { schemas, error, reload: load };
}
