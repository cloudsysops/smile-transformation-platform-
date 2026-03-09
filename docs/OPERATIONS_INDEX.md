## Nebula Smile — Operations index

This page links the main docs needed to deploy, verify, and run the first sales for Nebula Smile.

- **Deploy & verify production**
  - `docs/VERCEL_PRODUCTION_VERIFICATION_GUIDE.md` — how to confirm Vercel is connected to this repo, `main` is the production branch, and the latest deploy is live at `https://smile-transformation-platform-dev.vercel.app`.
  - `docs/ENVIRONMENTS.md` — overview of environments (local, dev, production) and required env vars.

- **First test sale (end-to-end)**
  - `docs/TEST_FIRST_SALE.md` — step-by-step runbook for: assessment → lead → admin → Stripe test checkout → Supabase verification → patient/admin post-payment state.

- **Production package slugs (landing / packages)**
  - `docs/PRODUCTION_PACKAGE_SLUGS_FIX.md` — source of truth for the three main package slugs used in landing and package pages (`essential-care-journey`, `comfort-recovery-journey`, `premium-transformation-experience`), plus exact SQL options to seed/fix them in production Supabase.

- **Deployment and strategy**
  - `docs/DEPLOYMENT_STRATEGY.md` — how we use Vercel + Supabase + Stripe; which branch deploys to production; how previews work.

- **Day‑1 admin & leads operations**
  - Login as admin (`/admin/login`), open **Leads**, and use the lead detail view to:
    - See lead status, recommended package, and deposit status.
    - Use **Recommend package** to set the suggested journey.
    - Use **Collect deposit** to open Stripe Checkout for the deposit.
  - Combine this with `docs/TEST_FIRST_SALE.md` to run first sales manually.

