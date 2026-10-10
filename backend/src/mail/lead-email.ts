/** Builds the "new quote request" alert. Pure functions only — no SMTP here, so it's easy to test. */
export interface LeadEmailInput {
  reference: string;
  name: string;
  phone: string;
  email: string;
  serviceLabel: string;
  location: string;
  preferredDate: string | null;
  details: string | null;
  photoCount: number;
  receivedAt: Date;
}

export interface BuiltEmail { subject: string; text: string; html: string }

const escapeHtml = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/** Strips line breaks and control characters so visitor-supplied text can never inject extra mail headers. */
export const oneLine = (v: string) => v.replace(/[\u0000-\u001f\u007f]+/g, ' ').replace(/\s{2,}/g, ' ').trim();

const when = (d: Date) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/New_York' }).format(d) + ' (New York time)';

export function buildLeadEmail(lead: LeadEmailInput, adminUrl: string, businessName: string): BuiltEmail {
  const rows: [string, string][] = [
    ['Reference', lead.reference],
    ['Name', lead.name],
    ['Phone', lead.phone],
    ['Email', lead.email],
    ['Service', lead.serviceLabel],
    ['Property location', lead.location],
    ['Preferred date', lead.preferredDate || 'Not given'],
    ['Photos attached', lead.photoCount ? String(lead.photoCount) : 'None'],
    ['Received', when(lead.receivedAt)],
  ];

  const subject = oneLine(`New quote request ${lead.reference} — ${lead.name} (${lead.serviceLabel})`).slice(0, 200);

  const text = [
    `A new quote request has come in on the ${businessName} website.`,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Project details:',
    lead.details || '(none given)',
    '',
    `Open it in the admin: ${adminUrl}`,
    lead.photoCount ? 'Photos are private — view them in the admin, not in this email.' : '',
    'You can reply to this email to write back to the visitor.',
  ].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f6f1;font-family:Arial,Helvetica,sans-serif;color:#1f2a1f">
<div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #d5dccd;border-radius:8px;padding:24px">
<h1 style="margin:0 0 4px;font-size:20px;color:#2f4a2f">New quote request</h1>
<p style="margin:0 0 16px;color:#5b6a5b;font-size:14px">${escapeHtml(businessName)} website</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:15px">
${rows.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#5b6a5b;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0;vertical-align:top">${escapeHtml(v)}</td></tr>`).join('\n')}
</table>
<h2 style="margin:20px 0 6px;font-size:15px;color:#2f4a2f">Project details</h2>
<p style="margin:0;font-size:15px;line-height:1.55;white-space:pre-wrap">${escapeHtml(lead.details || '(none given)')}</p>
<p style="margin:24px 0 0"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#2f4a2f;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-size:15px">Open in the admin</a></p>
<p style="margin:16px 0 0;color:#5b6a5b;font-size:13px">${lead.photoCount ? 'Photos are private — view them in the admin, not in this email. ' : ''}Reply to this email to write back to the visitor.</p>
</div></body></html>`;

  return { subject, text, html };
}
