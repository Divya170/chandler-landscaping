import * as fs from 'fs';
import * as path from 'path';

/** Minimal .env loader (no extra dependency). Real env vars always win. */
function loadDotEnv() {
  const file = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(file)) return;
  for (const raw of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
    if (process.env[key] === undefined) process.env[key] = val;
  }
}
loadDotEnv();

const DEV_SECRET = 'dev-only-insecure-secret-change-me';
const dataRoot = path.resolve(process.cwd(), '..', 'database');

export const config = {
  port: Number(process.env.PORT || 4000),
  frontendOrigins: (process.env.FRONTEND_ORIGIN || 'http://localhost:3000').split(',').map((s) => s.trim()).filter(Boolean),
  databasePath: path.resolve(process.cwd(), process.env.DATABASE_PATH || '../database/app.sqlite'),
  /** Private lead photos — never served statically. */
  privateUploadDir: path.join(dataRoot, 'uploads', 'leads'),
  /** Public CMS media (gallery / services / hero images uploaded by admins). */
  publicMediaDir: path.join(dataRoot, 'media'),
  jwtSecret: process.env.JWT_SECRET || DEV_SECRET,
  usingDevSecret: !process.env.JWT_SECRET,
  adminEmail: (process.env.ADMIN_EMAIL || 'admin@chandlerlandscaping.com').toLowerCase(),
  adminPassword: process.env.ADMIN_PASSWORD || 'ChangeMe!2026',
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 5),
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000),
  signedUrlTtlSeconds: 5 * 60,
  /** Public address of the site — used for the admin link in alert emails. */
  siteUrl: (process.env.SITE_URL || (process.env.FRONTEND_ORIGIN || 'http://localhost:3000').split(',')[0]).trim().replace(/\/+$/, ''),
  /** Outgoing email (new-quote alerts). Alerts are skipped, with one log line, until SMTP_HOST and SMTP_FROM are set. */
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    /** true = implicit TLS (usually port 465); false = STARTTLS on 587. */
    secure: /^(1|true|yes)$/i.test(process.env.SMTP_SECURE || ''),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || '',
  },
};
