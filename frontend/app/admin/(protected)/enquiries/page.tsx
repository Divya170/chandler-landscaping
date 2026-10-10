'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/components/admin/AdminShell';
import { adminApi, adminDownload, ApiError } from '@/lib/api-client';
import type { FormOptions, LeadDetail, LeadList } from '@/lib/types';
import { fmtSize } from '@/lib/validation';

const fmt = (iso: string, o: Intl.DateTimeFormatOptions) => {
  try { return new Date(iso).toLocaleString('en-US', o); } catch { return iso; }
};
const DOT: Record<string, string> = { New: 'var(--green)', 'In Review': 'var(--sage)', Contacted: '#C9D4BF', Closed: 'var(--rule)' };
const pill = (s: string) => `badge pill-${s.replace(/\s/g, '')}`;

export default function QuoteRequestsPage() {
  const toast = useToast();
  const [opts, setOpts] = useState<FormOptions | null>(null);
  const [search, setSearch] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('All');
  const [service, setService] = useState('All');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [list, setList] = useState<LeadList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [sel, setSel] = useState<LeadDetail | null>(null);
  const [selLoading, setSelLoading] = useState(false);
  const [selError, setSelError] = useState('');
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');
  const [confirmDel, setConfirmDel] = useState(false);
  const detailRef = useRef<HTMLDivElement>(null);

  useEffect(() => { adminApi<FormOptions>('/form-options').then(setOpts).catch(() => {}); }, []);
  useEffect(() => {
    const t = setTimeout(() => { setQ(search); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const params = useCallback(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (status !== 'All') p.set('status', status);
    if (service !== 'All') p.set('service', service);
    if (unreadOnly) p.set('unread', 'true');
    return p;
  }, [q, status, service, unreadOnly]);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const p = params(); p.set('page', String(page));
    try { setList(await adminApi<LeadList>(`/admin/leads?${p}`)); }
    catch (e) { setError((e as ApiError).message); }
    finally { setLoading(false); }
  }, [params, page]);
  useEffect(() => { load(); }, [load]);

  const open = async (id: string) => {
    setSelId(id); setSelLoading(true); setSelError(''); setConfirmDel(false);
    try {
      const d = await adminApi<LeadDetail>(`/admin/leads/${id}`);
      setSel(d); setNotes(d.adminNotes || '');
      // Opening marks it read on the server — reflect that in the list without a refetch.
      setList((l) => l && { ...l, unread: Math.max(0, l.unread - (l.items.find((x) => x.id === id && !x.read) ? 1 : 0)), items: l.items.map((x) => (x.id === id ? { ...x, read: true } : x)) });
      if (window.innerWidth < 1000) setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e) { setSel(null); setSelError((e as ApiError).message); }
    finally { setSelLoading(false); }
  };

  const patch = async (body: Record<string, unknown>, ok: string) => {
    if (!sel) return;
    setSaving(true);
    try {
      const d = await adminApi<LeadDetail>(`/admin/leads/${sel.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      setSel(d); setNotes(d.adminNotes || '');
      toast({ text: ok, kind: 'ok' });
      load();
    } catch (e) { toast({ text: (e as ApiError).message, kind: 'err' }); }
    finally { setSaving(false); }
  };

  const remove = async () => {
    if (!sel) return;
    setSaving(true);
    try {
      await adminApi(`/admin/leads/${sel.id}`, { method: 'DELETE' });
      toast({ text: `Quote request ${sel.reference} deleted.`, kind: 'ok' });
      setSel(null); setSelId(null); setConfirmDel(false);
      load();
    } catch (e) { toast({ text: (e as ApiError).message, kind: 'err' }); }
    finally { setSaving(false); }
  };

  const exportCsv = async () => {
    try { await adminDownload(`/admin/leads/export.csv?${params()}`, 'chandler-quote-requests.csv'); }
    catch (e) { toast({ text: (e as ApiError).message, kind: 'err' }); }
  };

  const statuses = opts?.statuses || ['New', 'In Review', 'Contacted', 'Closed'];
  const filtersActive = !!q || status !== 'All' || service !== 'All' || unreadOnly;
  const clearFilters = () => { setSearch(''); setQ(''); setStatus('All'); setService('All'); setUnreadOnly(false); setPage(1); };

  return (
    <div className="stack" style={{ gap: 20 }}>
      <div className="row" style={{ gap: 12, alignItems: 'flex-end' }}>
        <div style={{ marginRight: 'auto' }}>
          <p className="eyebrow admin">Admin</p>
          <h1 id="main-h" tabIndex={-1} className="admin-h1">Quote enquiries</h1>
        </div>
        <div style={{ flex: '0 1 220px' }}>
          <label htmlFor="a-q" className="admin-label">Search</label>
          <input id="a-q" type="search" className="admin-input" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, email, location" />
        </div>
        <div>
          <label htmlFor="a-s" className="admin-label">Status</label>
          <select id="a-s" className="admin-input" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="All">All</option>
            {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="a-v" className="admin-label">Service</label>
          <select id="a-v" className="admin-input" value={service} onChange={(e) => { setService(e.target.value); setPage(1); }}>
            <option value="All">All</option>
            <option value="unsure">Not sure yet</option>
            {opts?.services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
        </div>
        <button type="button" className="small-btn" style={{ minHeight: 44 }} onClick={exportCsv} disabled={!list?.totalAll}>Export CSV</button>
      </div>

      {list && (
        <div className="row" style={{ gap: 8 }} role="group" aria-label="Quick filters">
          <button type="button" className="stat" aria-pressed={unreadOnly} onClick={() => { setUnreadOnly((u) => !u); setPage(1); }}>
            <span className="dot" style={{ background: 'var(--error)' }} />Unread <strong>{list.unread}</strong>
          </button>
          {statuses.map((s) => (
            <button key={s} type="button" className="stat" aria-pressed={status === s} onClick={() => { setStatus(status === s ? 'All' : s); setPage(1); }}>
              <span className="dot" style={{ background: DOT[s] || 'var(--rule)' }} />{s} <strong>{list.counts[s] ?? 0}</strong>
            </button>
          ))}
        </div>
      )}

      {error ? (
        <div role="alert" className="alert row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <span>{error}</span><button type="button" className="small-btn" onClick={load}>Try again</button>
        </div>
      ) : (
        <div className="admin-split">
          <div className="panel" aria-busy={loading} style={{ opacity: loading && list ? 0.6 : 1, transition: 'opacity .2s' }}>
            {!list ? (
              <div className="stack" style={{ gap: 1 }}>{[0, 1, 2, 3, 4].map((i) => <div key={i} className="skel" style={{ height: 62, borderRadius: 0 }} />)}</div>
            ) : list.items.length === 0 ? (
              <div className="stack" style={{ padding: '40px 24px', gap: 10, alignItems: 'flex-start' }}>
                <p style={{ fontSize: 16, fontWeight: 600 }}>No enquiries match.</p>
                <p className="muted" style={{ fontSize: 15 }}>{filtersActive ? 'Try different filters.' : 'Quote requests from the website will arrive here.'}</p>
                {filtersActive ? <button type="button" className="small-btn" onClick={clearFilters}>Clear filters</button>
                  : <a href="/contact" target="_blank" rel="noopener noreferrer" style={{ fontSize: 15, fontWeight: 500 }}>Open the quote form →</a>}
              </div>
            ) : (
              <>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {list.items.map((l) => (
                    <li key={l.id}>
                      <button type="button" className="lead-row" aria-current={l.id === selId ? 'true' : undefined} onClick={() => open(l.id)}>
                        <span aria-label={l.read ? 'Read' : 'Unread'} role="img" className="dot" style={{ background: l.read ? 'transparent' : 'var(--error)' }} />
                        <span className="stack" style={{ gap: 2, minWidth: 0 }}>
                          <span className="ellipsis" style={{ fontSize: 15, fontWeight: l.read ? 400 : 600 }}>{l.name}</span>
                          <span className="ellipsis muted" style={{ fontSize: 13 }}>{l.serviceLabel} · {l.location}</span>
                        </span>
                        <span className="stack" style={{ alignItems: 'flex-end', gap: 4 }}>
                          <span className={pill(l.status)}>{l.status}</span>
                          <span className="muted" style={{ fontSize: 12 }}>{fmt(l.createdAt, { month: 'short', day: 'numeric' })}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
                {list.pages > 1 && (
                  <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 14px', fontSize: 14 }}>
                    <span>Page {list.page} of {list.pages} · {list.total} results</span>
                    <div className="row" style={{ gap: 8 }}>
                      <button type="button" className="small-btn" disabled={list.page <= 1 || loading} onClick={() => setPage(list.page - 1)}>Previous</button>
                      <button type="button" className="small-btn" disabled={list.page >= list.pages || loading} onClick={() => setPage(list.page + 1)}>Next</button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div ref={detailRef}>
            {selLoading ? (
              <div className="panel stack" style={{ padding: 24, gap: 12 }} aria-busy="true">
                <div className="skel" style={{ height: 30, width: '55%' }} /><div className="skel" style={{ height: 14, width: '70%' }} /><div className="skel" style={{ height: 140 }} />
              </div>
            ) : selError ? (
              <div role="alert" className="alert">{selError}</div>
            ) : sel ? (
              <section aria-labelledby="ld-h" className="panel stack" style={{ padding: 24, gap: 18 }}>
                <div className="row" style={{ justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <div className="stack" style={{ gap: 4 }}>
                    <h2 id="ld-h" className="serif" style={{ fontSize: 28, color: 'var(--green)' }}>{sel.name}</h2>
                    <span className="muted" style={{ fontSize: 13 }}>{sel.reference} · Submitted {fmt(sel.createdAt, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                  </div>
                  <div>
                    <label htmlFor="a-st" className="admin-label">Status</label>
                    <select id="a-st" className="admin-input" style={{ borderColor: 'var(--green)' }} value={sel.status} disabled={saving}
                      onChange={(e) => patch({ status: e.target.value }, `Status updated to ${e.target.value}.`)}>
                      {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <dl className="dl-grid">
                  <div><dt>Phone</dt><dd><a href={`tel:${sel.phone.replace(/[^\d+]/g, '')}`}>{sel.phone}</a></dd></div>
                  <div><dt>Email</dt><dd><a href={`mailto:${sel.email}`}>{sel.email}</a></dd></div>
                  <div><dt>Service</dt><dd>{sel.serviceLabel}</dd></div>
                  <div><dt>Preferred date</dt><dd>{sel.preferredDate ? fmt(`${sel.preferredDate}T12:00:00`, { dateStyle: 'medium' }) : 'Not provided'}</dd></div>
                  <div><dt>Location</dt><dd>{sel.location}</dd></div>
                  <div><dt>Photos</dt><dd>{sel.files.length ? `${sel.files.length} file(s) — private storage` : 'None'}</dd></div>
                </dl>
                <div className="stack" style={{ gap: 6, paddingTop: 16, borderTop: '1px solid var(--mist)' }}>
                  <span className="admin-label" style={{ textTransform: 'uppercase', letterSpacing: '.08em', fontSize: 12, color: 'var(--muted)' }}>Project details</span>
                  <p style={{ fontSize: 15, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{sel.details || 'No details provided.'}</p>
                </div>
                {sel.files.length > 0 && (
                  <div className="stack" style={{ gap: 6 }}>
                    <ul className="thumbs">
                      {sel.files.map((f) => (
                        <li key={f.id}>
                          <a href={f.url} target="_blank" rel="noopener noreferrer" title={`Open ${f.name}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={f.url} alt={`Photo: ${f.name}`} />
                          </a>
                          <div className="ellipsis" style={{ padding: '6px 8px', fontSize: 12 }}>{f.name} · {fmtSize(f.bytes)}</div>
                        </li>
                      ))}
                    </ul>
                    <p className="help">Photo links expire after 5 minutes — reopen the enquiry for fresh ones.</p>
                  </div>
                )}
                <div>
                  <label htmlFor="a-notes" className="admin-label">Internal notes</label>
                  <textarea id="a-notes" className="admin-input" rows={3} maxLength={4000} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Only visible to admins" />
                  <div className="row" style={{ gap: 8, marginTop: 8 }}>
                    <button type="button" className="small-btn primary" disabled={saving || notes === (sel.adminNotes || '')} onClick={() => patch({ adminNotes: notes }, 'Notes saved.')}>Save notes</button>
                    <button type="button" className="small-btn" disabled={saving} onClick={() => patch({ read: false }, 'Marked as unread.')}>Mark as unread</button>
                    <a className="small-btn" href={`mailto:${sel.email}?subject=${encodeURIComponent(`Your quote request ${sel.reference}`)}`}>Reply by email</a>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--mist)', paddingTop: 16 }}>
                  {!confirmDel ? (
                    <button type="button" className="small-btn danger" onClick={() => setConfirmDel(true)}>Delete enquiry</button>
                  ) : (
                    <div className="row" style={{ gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 14 }}>Delete this enquiry{sel.files.length ? ' and its photos' : ''}? This can&apos;t be undone.</span>
                      <button type="button" className="small-btn danger" disabled={saving} onClick={remove}>Yes, delete</button>
                      <button type="button" className="small-btn" onClick={() => setConfirmDel(false)}>Cancel</button>
                    </div>
                  )}
                </div>
              </section>
            ) : list && list.items.length > 0 ? (
              <div className="panel" style={{ padding: 24 }}><p className="muted" style={{ fontSize: 15 }}>Select an enquiry to see its details.</p></div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
