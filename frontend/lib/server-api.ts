// Server-only module: imported by Server Components only (uses BACKEND_URL, never shipped to the browser).
import type { ContentBundle, FormOptions, GalleryResponse, PublicSettings } from './types';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

/** Server-side fetch from NestJS. Always fresh, so admin edits show up immediately. */
async function getJSON<T>(path: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BACKEND_URL}/api${path}`, { cache: 'no-store', headers: { Accept: 'application/json' } });
  } catch {
    throw new Error('We couldn’t reach the server. Please try again in a moment.');
  }
  if (!res.ok) throw new Error(`The server returned an error (${res.status}).`);
  return res.json() as Promise<T>;
}

export const getSettings = () => getJSON<PublicSettings>('/settings');
export const getContent = () => getJSON<ContentBundle>('/content');
export const getGallery = () => getJSON<GalleryResponse>('/gallery');
export const getPrivacyPolicy = () => getJSON<{ text: string | null }>('/privacy-policy');
export const getFormOptions = () => getJSON<FormOptions>('/form-options');
