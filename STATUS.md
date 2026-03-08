# Smile Transformation — Module Status

## Startup Sprint Tracker

| Track | Status | Definition of done |
|-------|--------|--------------------|
| **M8** Assets Manager + hardening | ✅ Done | CI green (`lint` + `build`), health endpoints, unified migration, admin assets fixes |
| **M9** AI Workers (triage/reply/itinerary) | ✅ Done | Endpoints + admin UI connected, outputs persisted and visible in lead detail |
| **Deploy** (Vercel + Stripe + Supabase) | 🔶 Casi listo | Dev: Vercel + env + webhook configurados; smoke OK. Falta: probar webhook en prod (Send test) + flujo completo una vez. **Sprint Salir a vender:** checklist página profesional ejecutado (2026-03-08); verify + deploy_verify OK. [docs/SPRINT_SALIR_A_VENDER.md](docs/SPRINT_SALIR_A_VENDER.md). **Plan maestro agentes:** [docs/PLAN_AGENTES_PRODUCCION_Y_MEJORAS.md](docs/PLAN_AGENTES_PRODUCCION_Y_MEJORAS.md). **Checklist:** [docs/DEPLOY_CHECKLIST.md](docs/DEPLOY_CHECKLIST.md). |

---

| Module | Status | Notes |
|--------|--------|-------|
| **M1** Foundation & CI | ✅ Done | Next.js 16, TS, Zod, logger, server config, security headers, GitHub Actions (lint + build) |
| **M2** Database & RLS | ✅ Done | `0001_init.sql`: profiles, packages, leads, payments, assets, itineraries, lead_ai; RLS + `is_admin()` |
| **M3** Landing | ✅ Done | Hero, trust (Clínica San Martín), packages from DB |
| **M4** Packages + seed | ✅ Done | `scripts/seed_packages.sql` (smile-medellin, smile-manizales); run after migration |
| **M5** Assessment UI | ✅ Done | Form with honeypot, package prefill from query; POST to `/api/leads` |
| **M5.1** `/api/leads` | ✅ Done | Server-side POST, Zod, service role only; honeypot rejection |
| **M6** Admin leads | ✅ Done | Auth + role gate, leads list/detail, status updates |
| **M7** Stripe checkout + webhook | ✅ Done | Checkout session, webhook with raw body verification |
| **M8** Admin assets manager | ✅ Done | Upload/edit/delete with Supabase Storage, filters and moderation toggles |
| **M8.1** CTO hardening | ✅ Done | `/api/health`, readiness checks, migration `0002` unificada, manejo de errores mejorado |
| **M9** AI agents (admin connected) | ✅ Done | `/api/ai/{triage,respond,itinerary}`, Zod-validated strict JSON, persisted + visible in `/admin/leads/[id]` |
| **M9.1** AI lead responder (selling mode) | ✅ Done | “Generate Reply” returns WhatsApp + email drafts, copy-ready UI, persisted in `lead_ai.messages_json` |
| **Marketplace foundation** | ✅ Done | 0007: providers, packages type/price/provider_id, experiences provider_id. 0008: specialists.provider_id, leads.package_id, bookings. Lead API crea booking; webhook actualiza booking. |
| **Curated network** | ✅ Done | 0009: providers (invited_by, approved_by, approval_status, is_family_network, internal_notes), specialists (recommended_by, approval_status). Red privada; solo admin crea/aprueba. [DATA_MODEL](docs/DATA_MODEL.md), [CURATED_NETWORK_FOUNDATION](docs/CURATED_NETWORK_FOUNDATION.md). |
| **Curated network enterprise (0010)** | ✅ Done | Migration 0010: providers (slug, provider_type, country, contact_*, website, published, approval_status+suspended), packages (package_type, title, subtitle, origin/destination_city, price_from_usd, highlights/includes/excludes), specialists (slug, clinic_name, bio, photo_asset_id, free_evaluation, approval_status+suspended), experiences (slug, category, price_usd, includes), package_experiences, package_specialists, leads extended, consultations (scheduled_at), bookings extended. RLS: public read only for published+approved. Admin APIs: providers, specialists, experiences, packages/[id], consultations, bookings. Landing: hero/trust/FAQ curated messaging; assessment: travel_companions, budget_range; admin pages: providers, specialists, experiences, bookings, consultations. [CURATED_NETWORK_WORKFLOW](docs/CURATED_NETWORK_WORKFLOW.md), [MARKETPLACE_FOUNDATION](docs/MARKETPLACE_FOUNDATION.md). |
| **Admin Overview** | ✅ Done | `/admin` → `/admin/overview`. KPIs: leads hoy/semana, pendientes aprobación, reservas con depósito, ingresos del mes. Navegación a Leads y Assets. [DASHBOARDS_POR_ROL](docs/DASHBOARDS_POR_ROL.md). |
| **Auth + role dashboards (0011)** | ✅ Done | Migration 0011: profiles extended (role, provider_id, specialist_id, is_active, created_at). Roles: admin, coordinator, provider_manager, specialist, patient, user. Login at `/login` with role-aware redirect; `/admin/login` → `/login?next=...`. Guards: requireAdmin, requireCoordinator, requireProviderManager, requireSpecialist, requirePatient, getCurrentProfile. Dashboards: `/provider`, `/specialist`, `/coordinator`, `/patient` with role-scoped data. No public signup for providers/specialists. [AUTH_AND_ROLES](docs/AUTH_AND_ROLES.md), [DASHBOARD_ROLES](docs/DASHBOARD_ROLES.md), [ENGINEERING_HANDBOOK](docs/ENGINEERING_HANDBOOK.md), [SECURITY_COMPLIANCE](docs/SECURITY_COMPLIANCE.md). |
| **Auditoría buenas prácticas** | ✅ Hecho (2026-03) | S1–S5, V1–V2, D3 revisados. [AUDITORIA_RESULTADO](docs/AUDITORIA_RESULTADO.md). [TAREAS_AUDITORIA](docs/TAREAS_AUDITORIA_BUENAS_PRACTICAS.md). |

## Run after migration
Aplicar migraciones en orden. Desde repo (con Supabase enlazado): `npm run db:migrate`. O en SQL Editor (en orden): 0001–0010; **0011_profiles_roles_dashboards.sql**; luego seeds. Opcional: `scripts/seed_packages.sql`, `scripts/seed_marketplace_foundation.sql`.

## Rutas principales
- **Público:** `/`, `/assessment`, `/packages`, `/health-packages`, `/tour-experiences`, `/packages/[slug]`, `/thank-you`, `/legal`, `/login`, `/signin`.
- **Admin:** `/admin` (redirect a overview), `/admin/overview`, `/admin/leads`, `/admin/leads/[id]`, `/admin/providers`, `/admin/specialists`, `/admin/experiences`, `/admin/bookings`, `/admin/consultations`, `/admin/assets`, `/admin/login`, `/admin/status`.
- **Por rol:** `/provider`, `/specialist`, `/coordinator`, `/patient` (requieren login y rol correspondiente).

## Env
Copy `.env.example` to `.env.local` and set Supabase (and Stripe when M7 is added). Ver [docs/ENV_Y_STRIPE.md](docs/ENV_Y_STRIPE.md).
