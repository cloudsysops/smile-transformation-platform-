# Data model (MVP + Curated Network)

Smile Transformation uses a **curated private network** model: trusted providers and specialists are added and approved only by admins. There is no public signup for providers or specialists.

---

## Core entities

| Entity | Purpose | Who can create/update |
|--------|---------|------------------------|
| **profiles** | Extends Supabase Auth; stores role, provider_id, specialist_id, is_active (see [AUTH_AND_ROLES](AUTH_AND_ROLES.md)). | Auth + admin. |
| **providers** | Clinics, tour operators (curated network). | **Admin only.** |
| **packages** | Health / tour / combo offers; linked to provider. | **Admin only.** |
| **specialists** | Medical/specialist professionals; linked to provider. | **Admin only.** |
| **experiences** | Recovery/tourism activities; linked to provider. | **Admin only.** |
| **leads** | Patient inquiries from assessment form. | Public (submit); admin (manage). |
| **consultations** | Scheduled specialist consultations per lead. | Admin only. |
| **bookings** | One per lead when they choose a package; lifecycle + future commission. | System (on lead create) + admin. |
| **payments** | Stripe-related; link to leads. | System (webhook) + admin. |

---

## Curated network: providers

- **Creation:** Admin only (no public signup).
- **Fields (curation):**
  - `invited_by_provider_id` — Which provider invited this one (recommendation chain).
  - `approved_by` — Admin (profile id) who approved.
  - `approval_status` — `pending` \| `approved` \| `rejected` \| `suspended`. Only `approved` appear in the public catalog.
  - `is_family_network` — Core family-oriented trusted partner.
  - `internal_notes` — Admin-only notes; never shown publicly.
- **Visibility:** Public sees only providers with `approval_status = 'approved'` **and** `published = true` (RLS + `getApprovedProviders()`). Admin sees all.
- **Enterprise fields (migration 0010):** `slug`, `provider_type` (clinic \| specialist \| tour_operator \| hotel \| transport \| wellness), `country`, `contact_email`, `contact_phone`, `website`, `published`.

---

## Curated network: specialists

- **Creation:** Admin only.
- **Fields (curation):**
  - `recommended_by_provider_id` — Provider (e.g. clinic) who recommended this specialist.
  - `approval_status` — `pending` \| `approved` \| `rejected` \| `suspended`. Only approved can be published.
- **Visibility:** Public catalog shows specialists where `published = true` **and** `approval_status = 'approved'` (e.g. `getPublishedSpecialists()`). Admin sees all.

---

## Packages and experiences

- **packages:** Belong to a provider (`provider_id`), have type (`health` \| `tour` \| `combo`). Only admins create/edit. Public sees only published packages (RLS: `packages_public_select` where `published = true`). Enterprise fields (0010): `package_type`, `title`, `subtitle`, `origin_city`, `destination_city`, `price_from_usd`, `highlights`, `includes`, `excludes` (jsonb).
- **package_experiences:** Junction table (package_id, experience_id, is_included, sort_order). Admin manages via package relations.
- **package_specialists:** Junction table (package_id, specialist_id, is_primary). Admin manages via package relations.
- **experiences:** Belong to a provider (`provider_id`). Admin-only create; public sees only published. Enterprise fields: `slug`, `category` (nature \| culture \| adventure \| wellness \| food \| recovery \| other), `price_usd`, `includes` (jsonb).

---

## Leads and bookings

- **leads:** Created when a patient submits the assessment form. Store `package_slug` and `package_id` (resolved), specialist/experience interests. Enterprise fields (0010): `selected_specialties`, `selected_experience_categories`, `selected_experience_ids` (jsonb), `travel_companions`, `budget_range`, `utm_source`, `utm_medium`, `utm_campaign`, `updated_at`.
- **bookings:** One row per lead when they chose a package (`lead_id`, `package_id`, `provider_id`, `status`). Created on lead submit; status updated when payment succeeds. Enterprise fields: `total_price_usd`, `deposit_paid`, `start_date`, `end_date`, `notes`. Status may be `draft` \| `confirmed` \| `in_progress` \| `completed` \| `cancelled` (legacy: `pending`, `deposit_paid`).

---

## Approval workflow (conceptual)

1. **New provider/specialist:** Admin creates the row (e.g. in Supabase Dashboard or future admin UI). `approval_status` defaults to `pending`.
2. **Review:** Admin sets `invited_by_provider_id` or `recommended_by_provider_id` if applicable, and reviews `internal_notes` (providers).
3. **Approve or reject:** Admin sets `approval_status` to `approved` or `rejected`, and optionally sets `approved_by` to their profile id.
4. **Publish (specialists):** For specialists, admin also sets `published = true` so they appear in the public catalog. Only approved specialists should be published.
5. **Public catalog:** Public-facing APIs and pages only show providers/specialists/packages/experiences that are approved (and published where applicable).

No automated workflow is required; admins perform these steps in the dashboard or future admin UI.

---

## Why this supports quality and trust

- **Single gate:** Only admins add and approve partners; no open registration.
- **Recommendation chain:** `invited_by_provider_id` and `recommended_by_provider_id` keep the network traceable and accountable.
- **Explicit approval:** Nothing appears in the public catalog without `approval_status = 'approved'` (and `published` for specialists/packages/experiences).
- **Family-oriented:** `is_family_network` and careful curation support a trusted, professional brand.

**Sample seed:** `scripts/seed_marketplace_foundation.sql` (post-0010) creates one provider (Clínica San Martín), two specialists, three experiences, three combo packages, and their junction rows. See [MARKETPLACE_FOUNDATION.md](MARKETPLACE_FOUNDATION.md#sample-seeded-entities-marketplace-foundation-seed) for the list of seeded slugs and execution order.

---

## Profiles (auth + roles, migration 0011)

- **profiles** extend `auth.users`: `id`, `email`, `full_name`, `role`, `provider_id`, `specialist_id`, `is_active`, `created_at`, `updated_at`.
- **Roles:** `admin`, `coordinator`, `provider_manager`, `specialist`, `patient`, `user` (legacy; treated as patient for redirects).
- **provider_id** / **specialist_id** — Set when role is `provider_manager` or `specialist`; scopes dashboards to that entity. Only admins create/invite these users; no public signup.
- **is_active** — If false, user cannot log in.
- See [AUTH_AND_ROLES.md](AUTH_AND_ROLES.md) and [DASHBOARD_ROLES.md](DASHBOARD_ROLES.md).

---

See [CURATED_NETWORK_FOUNDATION.md](CURATED_NETWORK_FOUNDATION.md) for implementation details and now vs later.
