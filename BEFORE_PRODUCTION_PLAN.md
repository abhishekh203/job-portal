# Before-Production Plan — NayaJagir

> A living checklist of what must be decided/done **before going live**. Update as items land.
> Status legend: ⬜ todo · 🟡 in progress / decision pending · ✅ done

---

## 1. Domain — `nayajagir.com`

**Decision:** we will buy **`nayajagir.com`** (the brand-exact `.com`). **Not purchased yet.**

**Current state (checked 2026-06-24):**
- **Available to register** — `whois` returns *"No match for domain NAYAJAGIR.COM"* (currently unregistered).
- **Has prior history** — it was a live website around **2019** (Wayback Machine snapshot
  `2019-08-07`, HTTP 200). So this is a *dropped* domain someone owned before; it's now free again.

**Why this is an edge (and the honest caveat):**
- ✅ Brand-exact `.com` matching the product name → strong for trust, recall, and click-through.
- ✅ A dropped domain *can* carry residual SEO value (age, leftover backlinks).
- ⚠️ **But prior history is only a benefit if the old site was clean.** If it was used for spam, it
  can carry baggage. **Don't assume the edge — verify it first.**

**Action items:**
- ⬜ **Audit the domain's history before buying** — check the old backlink profile (Ahrefs/Moz/
  SEMrush) and the Wayback snapshots to confirm it wasn't spammy or off-topic. If clean → real bonus.
- ⬜ Register `nayajagir.com` (pick a registrar; enable auto-renew + WHOIS privacy).
- ⬜ Point DNS to the chosen hosting (see §3).
- ⬜ Set production env: `NEXT_PUBLIC_APP_URL=https://nayajagir.com`,
  `FRONTEND_URL=https://nayajagir.com`, `ADMIN_URL=https://<admin-subdomain>` — this fixes the
  sitemap base URL, canonical URLs, CORS, and email links (currently default to `localhost`).
- ⬜ Add HTTPS (TLS cert), force `https://` + non-www → www (or vice-versa) canonical redirect.
- ⬜ Submit the sitemap to Google Search Console once live.

---

## 2. SEO — get it in better shape before launch

The foundation is solid (per-page metadata, `JobPosting` JSON-LD, dynamic sitemap, canonicals).
Fix these before going public (details in the SEO review):

**Correctness bugs (do first):**
- ⬜ Job schema `baseSalary.currency` hard-coded to `USD` → use the job's real `currency` (NPR).
- ⬜ Job schema `validThrough` hard-coded to "today + 30 days" → use real `applicationDeadline`.
- ⬜ Remote jobs not marked remote → add `jobLocationType: "TELECOMMUTE"` for remote roles.
- ⬜ Remove leftover `console.log`s in `generateMetadata` (jobs/blogs detail pages).

**Quick wins:**
- ⬜ Add `robots.ts` (point to sitemap).
- ⬜ Add `metadataBase` in `app/layout.tsx` (so canonical/OG URLs resolve absolute).
- ⬜ Add a default OG share image (social previews look bare right now).
- ⬜ Fix sitemap fallback URL (`localhost:3000` → real domain via env).

**Later:** titles on `/jobs` & `/blogs` list pages, `employmentType` value mapping
(CONTRACT→CONTRACTOR), no-index filtered/paginated URLs.

---

## 3. Hosting — decision pending 🟡

**Current plan:** backend hosted on a **VPS from a local provider** (Nepal-based), **not** a big
provider like Hostinger/AWS/GCP. **To be re-evaluated later.**

**Notes / what to check before committing:**
- ⬜ Confirm the local VPS gives: root/SSH access, ability to run Node + a process manager
  (PM2/systemd), HTTPS, a firewall, and reliable uptime/backups.
- ⬜ Decide how each app is hosted: `server/` (Node API), `portal/` (Next.js — needs Node runtime or
  a Node host, not static-only), `admin/` (static Vite build — can be a simple static host/CDN).
- ⬜ Put the API behind a reverse proxy (Nginx) → then **set `app.set('trust proxy', 1)`** in the
  server (without it, rate limiting and audit-log IPs break — see backend tech-debt).
- ⬜ Plan DB hosting (currently Supabase Postgres — see §4) and how the VPS reaches it.
- ⬜ Reconsider a managed/global host later if traffic or reliability needs grow.

---

## 4. Environment & secrets

**Rule:** **no secrets in code or committed files.** All secrets via environment variables only
(`server/.env`, `portal/.env.local`, `admin/.env` are git-ignored — keep it that way).

- ⬜ Audit the repo to confirm no secret is hard-coded (JWT secret, SMTP pass, Supabase keys, etc.).
- ⬜ Production secrets stored in the host's secret manager / env config, not in the repo.
- ⬜ Rotate any secret that was ever shared in plaintext.
- ⬜ Set strong production values: `JWT_SECRET`, `ADMIN_SECRET_KEY`, SMTP creds, Supabase keys.

**Storage today vs. later:**
- ✅ **Now: Supabase** for Postgres + file storage (resumes, logos, blog/profile images).
- 📝 **Note for later:** if storage/scale grows, we may move file storage to a cloud object store
  like **Google Cloud Storage (GCS)** (or S3/R2). Keep upload code abstracted enough that swapping
  the storage backend (`lib/supabase.ts`) is a contained change.

---

## 5. Backend production hardening (from `server/ARCHITECTURE.md` §16)

- ⬜ Fix stale fallback URLs (`PORT||5000`, `FRONTEND_URL||:3000`) — set real env in prod.
- ⬜ Gate `tls.rejectUnauthorized:false` (email) behind dev only — don't ship it.
- ⬜ `app.set('trust proxy', 1)` once behind a reverse proxy.
- ⬜ Don't `process.exit(1)` on every unhandled rejection; add graceful shutdown (close server +
  `db.$disconnect()` on SIGTERM/SIGINT).
- ⬜ Guard Swagger `/api-docs` behind `NODE_ENV !== 'production'` (or auth).
- ⬜ Use Prisma error codes (P2002/P2025) instead of string matching.
- ⬜ Run `prisma migrate deploy` (incl. the production indexes) against the prod DB.

---

## 6. General pre-launch checklist

- ⬜ Set `NODE_ENV=production` everywhere.
- ⬜ Verify email deliverability (verification/reset/approval emails) from the prod domain.
- ⬜ Smoke-test the core flows on staging: register → verify → apply; employer post → admin approve.
- ⬜ Confirm logs/monitoring + DB backups are in place.
- ⬜ Remove/secure any seed/test accounts.

---

*Owner decisions captured 2026-06-24: buy `nayajagir.com` (pending), backend on local VPS (pending
final call), Supabase now / cloud storage (e.g. GCS) considered later.*
