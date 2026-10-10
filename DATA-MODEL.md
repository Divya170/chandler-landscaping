# Chandler Landscaping — Data model extracted from the design

Source: `design-source/Chandler-Landscaping-Website.bundled.html`, a self-contained bundle. The unpacked design comp is `design-source/Chandler Landscaping.dc.html`. The six embedded photos are exported to `frontend/public/assets/*.webp`:
`hero-garden`, `garden-backyard`, `service-pruning`, `service-lawn`, `cleanup-before`, `cleanup-after`.

## Identity
- **Chandler Landscaping**: residential outdoor care in New York, NY. Point of contact: **Beau Chandler**.
- Phone `+1 (617) 722-6832` · `beau.chandler@yahoo.com` · `1000 5th Ave, New York, NY 10028`.
- Fonts: DM Serif Display (headings), DM Sans 400/500/600 (body).
- Colors: paper `#F7F4EC`, ink `#292F2A`, green `#254737` (hover/dark `#193629`), sage `#A8B99A`, mist `#E8EDE3`, rule `#D9D5CA`, muted `#5C625A`, admin bg `#F2F0EA`, error `#B42318`, success `#246B45`.
- Layout: max width 1280px · gutter `clamp(20px,5vw,56px)` · radius 4px · focus ring 2.5px green (light on dark sections).
- Breakpoints: desktop nav ≥900px (below that, a Menu button opens a full-height panel with focus trap); wide ≥1100px (4-column gallery, 4-column footer); plus 820, 760, 640, 560 and 480px column switches.
- Mobile quote bar (sticky "Request a Quote" + "Call") below 900px, except on Contact.

## Routes
`/` · `/services` (`?s=<id>` scrolls to `#svc-<id>`) · `/our-work` (filter All/Lawn/Cleanup/Hedges + before/after) · `/about` · `/faqs` · `/contact` (`?service=<id>|unsure` preselects) · `/admin` (enquiries)

## Content (seeded verbatim)
- **Services** (01–03):
  - lawn "Landscaping & lawn maintenance" (tag Lawn)
  - cleanup "Garden cleanup" (tag Cleanup)
  - hedge "Hedge trimming" (tag Hedges)
  - Each has short, body, image, alt and focal point.
  - "What's included" and "Good to know" are bracketed placeholders, shown as "awaiting confirmation" while content flags are on.
- **FAQs** ×8. q1, q2, q7 and q8 are flagged "Awaiting client-approved answer". q4, q5 and q6 also appear on Services under "Common questions".
- **Home "How it works"** points ×3 · **Home CTA steps** ×3 · **About "How an enquiry works"** ×3 · **Contact "What helps us review"** ×4.
- **Gallery** ×5 (scene, category, alt, focal point, column/row span) · **Before/after** pair ("An overgrown back garden, cleared.").
- **Business introduction / story / photo / next-step wording**: client-approved copy not supplied yet. These are settings that show the bracketed placeholder while flags are on.

## Quote form (validation copied exactly into NestJS)
| field | rule / message |
|---|---|
| name | required "Enter your full name." · ≥2 chars "Name looks too short." · ≤120 |
| phone | required "Enter a phone number we can reach you on." · `^[\d\s()+.\-]+$` "Use only digits, spaces, brackets, + or -." · 7–15 digits "Check the number — it should have 7 to 15 digits." |
| email | required "Enter your email address." · `^[^\s@]+@[^\s@]+\.[^\s@]{2,}$` "Enter an email in the format name@example.com." · ≤200 |
| service | optional; a service id or empty / "unsure" (→ "Not sure yet") |
| location | required "Enter the property address, or neighborhood and ZIP code." · ≤200 |
| date | optional; YYYY-MM-DD, not in the past — "Choose today or a future date." |
| details | optional ≤1000 — "Keep the description under 1,000 characters." |
| consent | required — "Please confirm so we can use your details to reply." |
| photos | ≤5 · JPEG/PNG/WebP (server verifies file signatures) · ≤10 MB |
| website | honeypot. A filled honeypot gets the comp's silent fake success (reference "—") and nothing is stored |

- Success: "Request received" card with the reference (`CL-XXXXXX`) and buttons: Back to home · Explore services · Submit another request.
- Status messages (verbatim): network · rate-limited (429) · upload failure (413/photo) · server validation (field errors).
- An upload progress bar shows while photos are attached.

## Admin (from the comp's prototype view)
- Search (name, email, location, reference) · status filter (New, In Review, Contacted, Closed) · service filter (incl. "Not sure yet").
- Unread count + per-status counts. Unread dot and bold name; opening an enquiry marks it read.
- Detail view: phone, email, service, preferred date, location, photos and details, with a status change.

## Feature flags (`data-props`) → settings
- `showContentFlags` (default true): the dashed "Awaiting client confirmation" / "[Client-approved …]" notes.
- `mobileQuoteBar` (default true).
- `apiScenario` is **prototype-only and not reproduced**: the real API returns real outcomes.

## Prototype-only — NOT reproduced
- localStorage leads (`chandler-leads-v1`), the unprotected `#/admin`, the fake upload progress timer and the simulated API scenarios.
- JS width-based layout (replaced by CSS breakpoints).

## Added after the first handover
- `settings.privacyPolicy` (text, admin-edited). Public flag `hasPrivacyPolicy`; the text itself is served from `GET /api/privacy-policy` and shown at `/privacy`.
- New-quote alert email to `settings.notifyEmail` through SMTP (`backend/.env`). Photos are never attached.
- Schema versioning: `backend/src/migrations` (baseline + privacy policy column). `synchronize` is off.
