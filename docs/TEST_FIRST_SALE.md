# Test procedure: first sale (lead → deposit)

Use this to verify the full flow from lead creation to deposit payment and status update.

**Prerequisites**

- App deployed (e.g. Vercel dev URL).
- Supabase: migrations applied, seed run, at least one admin user.
- Vercel: env vars set (Supabase + Stripe, including `STRIPE_WEBHOOK_SECRET`).
- Stripe: webhook endpoint pointing to `https://<your-domain>/api/stripe/webhook`, event `checkout.session.completed`.

---

## Steps

### 1. Create a lead

1. Open the **landing** (e.g. `https://smile-transformation-platform-dev.vercel.app`).
2. Click **Start Free Assessment** (or **View Packages** → choose a package → **Start with this package**).
3. Fill the assessment form: first name, last name, email (required); optionally phone, country, package, message.
4. Submit the form.
5. You should be redirected to **Thank you** with a reference and, if you selected a package, a **recommended package** block (orientation only; disclaimer shown).
6. Note the `lead_id` from the URL or the page (reference).
7. **Optional:** Create a patient account at **/signup** with the same email; after login you can see the lead in **/patient** and use **Pay deposit** to complete checkout yourself.

### 2. Open admin

1. Go to **/signin** (or **/admin/login**, which redirects to /signin).
2. Log in with the admin user (email + password created in Supabase Auth).
3. Go to **Leads** and find the lead you just created (same name/email and recent time).
4. Click the lead to open the **lead detail** page. At the top you should see:
   - **Lead status** (e.g. `new`, `qualified`, `deposit_paid`).
   - **Package** (from the form or recommendation).
   - **Deposit** section with the **Collect deposit** button.

### 3. Recommend package (if needed) and collect deposit

**Option A — Admin:**

1. In the **Recommend package** section on the lead detail, choose the package you want to suggest for this lead (for example, Essential Care Journey) and click **Save recommendation**.
2. In the **Deposit** section at the top, click **Collect deposit**. You are redirected to Stripe Checkout. The deposit amount is taken from the lead’s **recommended package** (or the package from the form if no recommendation is set).

**Option B — Patient:** If the lead’s email has a patient account, log in and go to **/patient**. In “Your assessments”, click **Pay deposit** for that lead. Checkout uses the same API; patient can only pay for leads matching their email.

### 4. Pay with Stripe test card

1. On Stripe Checkout use the test card: **4242 4242 4242 4242**.
2. Use any future expiry (e.g. 12/34) and any CVC (e.g. 123).
3. Complete the payment.
4. You should be redirected back to the app (e.g. `/admin/leads/<id>?paid=1`).
5. A success message should appear (e.g. “Deposit registered successfully”).

### 5. Verify payment in Supabase

1. Open **Supabase** → your project → **Table Editor**.
2. **payments** table: find the row for this lead. Check:
   - `stripe_checkout_session_id` is set (starts with `cs_` in test mode).
   - `status` = **succeeded**.
3. **leads** table: open the lead row. Check:
   - `status` = **deposit_paid**.

### 6. Verify lead status in admin

1. In the admin, open the same lead again (or refresh the lead detail page).
2. The lead status should show **deposit_paid**.
3. The **Stripe deposit** section should show “Deposit paid” (or the button disabled/hidden when already paid).

---

## Optional checks

- **Stripe Dashboard** → Developers → Webhooks: the `checkout.session.completed` event for this payment should show response **200**.
- **Send test webhook**: in Stripe, use “Send test webhook” for `checkout.session.completed` and confirm the endpoint returns 200 (idempotent if payment already processed).

---

## Troubleshooting

| Issue | What to check |
|-------|----------------|
| Lead not in admin | Assessment submitted successfully? Check network tab for POST /api/leads 201 and `lead_id` in response. |
| Collect deposit does nothing | Admin session valid? Check browser console and network for POST /api/stripe/checkout. |
| Stripe checkout fails | Stripe keys in Vercel (STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY). |
| Webhook not updating payment | STRIPE_WEBHOOK_SECRET in Vercel; webhook URL exactly `/api/stripe/webhook`; Redeploy after adding secret. |
| Payment row not created | Checkout session created? Look in Stripe Dashboard → Payments. Check Supabase `payments` insert in checkout route. |
