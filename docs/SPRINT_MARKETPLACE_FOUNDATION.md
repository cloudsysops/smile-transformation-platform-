# Marketplace Foundation Sprint — Proposal

**Objective:** Prepare the data model and architecture so Smile Transformation can scale from a small MVP into a full medical tourism marketplace, without implementing all features at once.

> **Curated private network:** Smile Transformation is **not** an open marketplace. It is a **curated private network** of trusted providers and specialists. Only admins create/approve providers and specialists; there is no public signup. See [CURATED_NETWORK_FOUNDATION.md](CURATED_NETWORK_FOUNDATION.md) and [DATA_MODEL.md](DATA_MODEL.md).

---

## 1. Entity map: current state

| Entity        | Exists | Where / Notes |
|---------------|--------|----------------|
| **providers** | ✅     | `0007` — id, name, type (clinic, tour_operator, specialist), city, description, verified, featured_listing |
| **packages**  | ✅     | `0001` + `0006` + `0007` — provider_id, **type (health \| tour \| combo)** ✅, price_cents, featured, location, recovery_city, deposit_cents, etc. |
| **specialists** | ✅   | `0006` — id, name, specialty, city, clinic, description, published, sort_order. **No link to providers.** |
| **experiences** | ✅   | `0006` + `0007` — provider_id ✅, city, category, price_cents, duration_hours, etc. |
| **leads**     | ✅     | `0001` + `0006` — package_slug (text), specialist_ids, experience_ids, status. **No package_id; no FK to packages.** |
| **consultations** | ✅ | `0006` — lead_id, specialist_id, status, scheduled_date/time. Links lead ↔ specialist. |
| **bookings**  | ❌     | Not present. Payments link to leads only; no explicit “booking” (lead + package + provider + lifecycle). |

**Conclusion:** Package types are already in place. The main gaps for a scalable foundation are: **specialists not linked to providers**, **leads only reference package by slug**, and **no bookings table** for a clear lifecycle and future commissions.

---

## 2. What needs migrations

- **specialists** — Add optional `provider_id` (FK → providers) so a specialist can belong to a clinic/provider.
- **leads** — Add optional `package_id` (FK → packages) for referential integrity and reporting; keep `package_slug` for display/backfill.
- **bookings** — New table: one row per “lead committed to a package” (created when lead is created with a package, or when deposit is paid — see below). Enables future commission and clear booking lifecycle.

**What we are not doing in this sprint:** Changing payment flow, Stripe, or admin UX. Only schema + minimal code to support it.

---

## 3. What to refactor carefully

- **Lead creation (API + form):** Today we only store `package_slug`. We should resolve slug → `package_id` and store both (or at least `package_id`). Backfill: optional one-off script or migration to set `lead.package_id` from `package_slug` where possible.
- **Booking creation:** Decide when a booking row is created. Two options:
  - **A)** When lead is created and has a package → create `bookings(lead_id, package_id, status='pending')`. Simple and gives a single place for “this lead chose this package.”
  - **B)** When lead status becomes `deposit_paid` → create booking. Closer to “money received = booking.”
- **Recommendation for foundation:** Option A. Create a booking row when the lead is created with a package; update booking status when payment succeeds (e.g. webhook sets `bookings.status = 'deposit_paid'`). Keeps one clear record per “lead + package” and allows future commission logic on `bookings`.

---

## 4. Proposed sprint (one sprint only)

### 4.1 Sprint goal

**Establish the minimal marketplace data model:** providers as the central entity, specialists linked to providers, leads linked to packages by ID, and a single **bookings** table as the place for “lead chose a package” and future commission/reporting. No change to Stripe or public flows beyond storing and using the new IDs.

### 4.2 Tables to add or modify

| Change | Table | Action |
|--------|--------|--------|
| Link specialists to providers | `specialists` | Add `provider_id uuid references providers(id) on delete set null`. Index on `provider_id`. |
| Lead → package FK | `leads` | Add `package_id uuid references packages(id) on delete set null`. Index on `package_id`. Keep `package_slug`. |
| Booking lifecycle | `bookings` | **New table:** `id`, `lead_id` (FK, unique so one booking per lead for now), `package_id` (FK), `provider_id` (nullable, denormalized from package at creation), `status` (`pending`, `deposit_paid`, `completed`, `cancelled`), `deposit_cents` (nullable), `created_at`, `updated_at`. Unique on `lead_id`. |

Optional: add `bookings.payment_id` (FK to payments) later when we tie “booking confirmed” to a specific payment.

### 4.3 Files to change

| Area | File(s) | Change |
|------|---------|--------|
| **Migrations** | New: `supabase/migrations/0008_marketplace_foundation.sql` | Add specialist.provider_id, lead.package_id, create bookings table + RLS + indexes. |
| **Lead API** | `app/api/leads/route.ts` | When `package_slug` is present, resolve slug → package id (e.g. `getPublishedPackageBySlug`), set `package_id` and `package_slug` on insert. After insert, if `package_id` is set, insert into `bookings` (lead_id, package_id, provider_id from package, status='pending'). |
| **Validation** | `lib/validation/lead.ts` | No schema change; still accept `package_slug`. Optional: accept `package_id` from client for future. |
| **Admin / leads** | `app/admin/leads/[id]/page.tsx` | Optional: show `package_id` or link to package; show booking status if we add a bookings query. Can be minimal (e.g. “Booking: Pending”). |
| **Types / lib** | New: `lib/bookings.ts` (optional) | Helper to create booking from lead + package; or keep logic in API only for this sprint. |

No change to: assessment form fields, Stripe webhook, payments table, or marketplace listing pages.

### 4.4 UI areas affected

- **Public:** None required. Assessment form continues to send `package_slug`; backend resolves and stores `package_id` and creates a booking.
- **Admin:** Optional small change on lead detail: show “Package” (link to package if we have package_id) and “Booking status” (from bookings table). Can be text-only for this sprint.

### 4.5 Test plan

1. **Migrations**
   - Run `0008_marketplace_foundation.sql` on a copy of current DB (or dev).
   - Verify: `specialists.provider_id` nullable; `leads.package_id` nullable; `bookings` exists and RLS/policies apply.
   - Rollback script or down-migration optional but recommended for safety.

2. **Lead creation**
   - Submit assessment with a valid `package_slug` that exists in DB.
   - Assert: lead row has `package_id` set and `package_slug` set.
   - Assert: one row in `bookings` for that lead with `package_id`, `status = 'pending'`, and `provider_id` = package’s provider (if any).

3. **Lead creation without package**
   - Submit with no package (or invalid slug).
   - Assert: lead created with `package_id` null; no row in `bookings`.

4. **Regression**
   - Existing flows: thank-you page, Stripe checkout, webhook (deposit_paid). Confirm no 500s and lead status still updates. Optionally extend webhook to set `bookings.status = 'deposit_paid'` when payment succeeds.

5. **Admin**
   - Open a lead that has a package; confirm package link and booking status display if implemented.

---

## 5. Out of scope for this sprint

- Commission calculation or payouts.
- Provider dashboard or self-service.
- Changing package types (already health / tour / combo).
- Multiple bookings per lead (we assume one booking per lead for now).
- Experiences as “bookable” entities (only package booking in this foundation).

---

## 6. Summary

| Deliverable | Description |
|-------------|-------------|
| **Goal** | Marketplace foundation: providers central, specialists linked, leads + bookings model. |
| **New migration** | `0008_marketplace_foundation.sql` — specialists.provider_id, leads.package_id, bookings table. |
| **Code** | Lead API: resolve slug → package_id, create booking when lead has package. Optional: lib/bookings.ts, admin lead detail. |
| **UI** | No required change for public; optional admin lead/booking display. |
| **Tests** | Migration, lead+booking creation (with/without package), regression on payment flow. |

This keeps the sprint to **one clear outcome: a correct, scalable data foundation** without implementing full marketplace features.
