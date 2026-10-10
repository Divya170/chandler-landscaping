# Chandler Landscaping

The design (`design-source/`) rebuilt as a working site with a content admin.
**Frontend:** Next.js 14 (port 3000). **Backend:** NestJS 10 + TypeORM (port 4000). **Database:** SQLite3 (`database/app.sqlite`, created and seeded on first boot).
Next proxies `/api/*` and `/media/*` to NestJS, so the browser only ever talks to one origin.

## Quick start (Node 18.18+)
```bash
npm run setup
cp backend/.env.example backend/.env          # set JWT_SECRET and ADMIN_PASSWORD
cp frontend/.env.example frontend/.env.local
npm run dev                                   # site http://localhost:3000 · admin http://localhost:3000/admin/login
```
The API prints the first admin login on first boot. The default is `admin@chandlerlandscaping.com` / `ChangeMe!2026`; change it under **Account**.
To reset everything to the launch content, delete `database/app.sqlite` (the tables are rebuilt by the migrations on the next start).

## Pages
`/` · `/services` (`?s=lawn` scrolls to that service) · `/our-work` (service filters + before/after) · `/about` · `/faqs` · `/contact` (`?service=hedge|unsure` preselects the service).
All copy, services, FAQs, steps, gallery photos and contact details come from the database and can be edited in the admin.

## Quote form → `POST /api/quote-requests`
Validation is copied exactly from the design (`backend/src/inquiries/inquiry.validation.ts`, mirrored in `frontend/lib/validation.ts`).

| Field | Rule |
|---|---|
| Name, phone, email, property location | Required |
| Phone | 7–15 digits |
| Preferred date | Optional; not in the past |
| Details | Optional; up to 1,000 characters |
| Consent | Required |
| Photos | Up to 5 JPEG/PNG/WebP, 10 MB each, checked by file content |

- **Success:** returns `201 {reference: "CL-XXXXXX"}`, and the "Request received" card offers three next actions.
- **Errors:** `400 {errors}` (field errors shown inline and in a summary), `413`, and `429` (5 per 10 minutes per IP). Each shows the design's status messages.
- **Upload progress:** the bar reflects the real upload.
- **Honeypot:** gets the design's silent fake success, and nothing is saved.

## Admin (`/admin`, JWT)
- **Quote requests.** Search, status/service/unread filters, counts, CSV export.
  - Opening a request marks it read; you can also mark it unread.
  - Statuses: New / In Review / Contacted / Closed.
  - Internal notes, private photos (5-minute signed links), and delete.
- **Gallery.** Add, edit, upload, tile size, focal point, publish/hide, reorder and delete.
- **Services** and **Site content.** FAQs (with approval status and "show on Services"), Home points, the quote checklist, About steps, Contact tips and the before/after pair.
- **Settings.** Contact details, the notification email, client-approved copy (introduction, story, owner photo, success wording), the **privacy policy** text, and two switches: **Show content flags** and **Mobile quote bar**.

## Privacy policy
Paste the approved text into **Admin → Settings → Privacy policy**. Until then `/privacy` shows a short holding message and nothing links to it; once the text is saved, the quote form's consent line and the footer link to it automatically.
Format: blank line = new paragraph, `## ` = heading, `- ` = list item. `docs/privacy-policy-starter.txt` is a starter draft of what this site collects (not legal advice; the client should approve the final wording).

## Email alerts
Each new quote request emails the **Notification email** in Admin → Settings (name, contact details, project details and a link to the admin; photos stay private). Reply goes straight to the visitor.
Set these in `backend/.env` (see `.env.example`) and restart the API:
`SMTP_HOST`, `SMTP_PORT` (587, or 465 with `SMTP_SECURE=true`), `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, and `SITE_URL` (the public address, used for the admin link).
- With `SMTP_HOST` empty, alerts are off; the API logs one reminder and everything else works.
- Sending never delays or breaks a submission: if the mail server is down, the request is still saved in the admin and the failure is logged.

## Database & migrations
The schema is managed by migrations in `backend/src/migrations` and applied automatically when the API starts (no `synchronize`). A database created by an earlier version is adopted safely and keeps its data.
Changing the schema:
1. Edit the entity, then `npm --prefix backend run migration:generate` (writes `src/migrations/<timestamp>-Change.ts`; rename it descriptively if you like).
2. Add the new class to `src/migrations/index.ts`.
3. `npm --prefix backend run migration:run` applies it to your local database; `migration:check` should then report the schema is up to date; `migration:revert` undoes the last one.
Back up `database/app.sqlite` before upgrading a live site.

## Tests
`npm test` (runs the backend suite with Jest): quote-form rules, photo file checks, the alert email, the mail service and the migrations (a fresh database must match the entities exactly, and an older database must upgrade without losing data).

See `DATA-MODEL.md` for everything extracted from the design.
