'use client';

/** Browser-side API calls. Requests go to same-origin /api, which Next rewrites to NestJS. */
export class ApiError extends Error {
  constructor(public status: number, message: string, public errors: Record<string, string> = {}) {
    super(message);
  }
}

const TOKEN_KEY = 'chandler-admin-token';

export const tokenStore = {
  get(): string | null {
    try { return window.localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set(t: string) {
    try { window.localStorage.setItem(TOKEN_KEY, t); } catch { /* storage unavailable */ }
  },
  clear() {
    try { window.localStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
  },
};

export async function api<T = unknown>(path: string, init: RequestInit & { auth?: boolean } = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (init.auth) {
    const t = tokenStore.get();
    if (t) headers.set('Authorization', `Bearer ${t}`);
  }
  let res: Response;
  try {
    res = await fetch(`/api${path}`, { ...init, headers });
  } catch {
    throw new ApiError(0, 'We couldn’t reach the server. Please check your connection and try again.');
  }
  if (res.status === 401 && init.auth) {
    tokenStore.clear();
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
      window.location.href = '/admin/login?expired=1';
    }
  }
  const type = res.headers.get('content-type') || '';
  const data = type.includes('application/json') ? await res.json().catch(() => ({})) : await res.text();
  if (!res.ok) {
    const d = (typeof data === 'object' && data) ? (data as { message?: string; errors?: Record<string, string> }) : {};
    throw new ApiError(res.status, d.message || 'Something went wrong. Please try again.', d.errors || {});
  }
  return data as T;
}

/** Authenticated helper for the admin area. */
export const adminApi = <T = unknown>(path: string, init: RequestInit = {}) => api<T>(path, { ...init, auth: true });

/** Download an authenticated file (e.g. CSV export). */
export async function adminDownload(path: string, filename: string) {
  const t = tokenStore.get();
  const res = await fetch(`/api${path}`, { headers: t ? { Authorization: `Bearer ${t}` } : {} });
  if (!res.ok) throw new ApiError(res.status, 'Export failed. Please try again.');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Multipart POST with real upload progress (XMLHttpRequest — fetch can't report upload progress).
 * Resolves with the JSON body; rejects with ApiError (status 0 = network failure).
 */
export function postWithProgress<T>(path: string, body: FormData, onProgress: (pct: number) => void): Promise<T> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api${path}`);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100)); };
    xhr.onerror = () => reject(new ApiError(0, 'We couldn’t reach the server. Please check your connection and try again.'));
    xhr.ontimeout = xhr.onerror;
    xhr.onload = () => {
      let data: { message?: string; errors?: Record<string, string> } = {};
      try { data = JSON.parse(xhr.responseText || '{}'); } catch { /* non-JSON body */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(data as T);
      else reject(new ApiError(xhr.status, data.message || 'Something went wrong. Please try again.', data.errors || {}));
    };
    xhr.timeout = 120000;
    xhr.send(body);
  });
}
