# Security and compliance (reference)

Smile Transformation is a curated private medical tourism platform. This document summarizes access control and security-related practices.

---

## Curated private access model

- **No public signup** for providers, specialists, or coordinators. Only admins create or invite these users and set their role and optional `provider_id` / `specialist_id`.
- **Patient-facing experience** remains simple: assessment form (public), optional patient account to view own submissions (matched by email).
- **All privileged actions** (create/edit providers, specialists, experiences, packages, consultations, bookings) go through admin-only or role-scoped APIs and pages.

---

## Who can sign in

- **Admin** — Full access; created via Supabase Dashboard or by another admin.
- **Coordinator** — Access to coordinator dashboard (leads, bookings, consultations).
- **Provider manager** — Access only to own provider’s data (dashboard scoped by `provider_id`).
- **Specialist** — Access only to own specialist’s consultations (scoped by `specialist_id`).
- **Patient** — Optional account; sees only own leads/bookings/payments (matched by email).

See [AUTH_AND_ROLES.md](AUTH_AND_ROLES.md).

---

## Server-side enforcement

- **Role guards** are used on every protected route (Server Components and API routes): `requireAdmin()`, `requireCoordinator()`, `requireProviderManager()`, `requireSpecialist()`, `requirePatient()`.
- **Do not rely only on client-side** route protection or hiding UI; server must reject unauthorized access with 401/403.
- **Data access layer** (`lib/dashboard-data.ts`) returns only role-appropriate data (e.g. provider sees only rows for `provider_id`).

---

## Secrets and env

- **Service role key** and **STRIPE_SECRET_KEY** are server-only; never exposed to the client.
- **NEXT_PUBLIC_*** variables are safe for client (e.g. Supabase URL, anon key, Stripe publishable key).
- See [ENV_Y_STRIPE.md](ENV_Y_STRIPE.md).

---

## RLS and database

- Row Level Security is enabled on relevant tables; `is_admin()` and role helpers support policies where needed.
- Application layer additionally filters by `provider_id` / `specialist_id` / email so each role sees only intended rows.

---

## Rollout

- Auth + role dashboards (migration 0011, guards, login, dashboards) are additive; existing MVP flows (leads, Stripe, health, admin) are unchanged and remain protected by `requireAdmin()` where applicable.
