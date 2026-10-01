# Ladion Services Platform (Demo)

Next.js 14 (App Router) + Supabase. A complete **service request -> payment -> notification** workflow that runs locally with **no real payments, emails or WhatsApp messages**. All three are simulated behind provider abstractions so the real ones can be plugged in later.

The existing static `ladion_technologies.html` website is untouched. Link its "Services" button to `http://localhost:3000/services`.

---

## 1. One-time setup (about 10 minutes)

**Requirements:** Node 18+ and a free Supabase project (https://supabase.com).

1. **Create a Supabase project.**
2. **Run the schema.** Supabase Dashboard -> SQL Editor -> paste `supabase/schema.sql` -> Run.
3. **Run the seed.** Paste `supabase/seed.sql` -> Run (loads the 9 services).
4. **Disable email confirmation** (recommended for a smooth demo):
   Authentication -> Providers -> Email -> turn off "Confirm email".
5. **Get your keys:** Project Settings -> API. You need the Project URL, the `anon` key and the `service_role` key.
6. **Configure the app:**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Leave `APP_MODE=demo`.
7. **Install and run:**
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:3000

### Create your admin account
1. Register normally at `/register` with the email you want as admin.
2. In the Supabase SQL editor run:
   ```sql
   update public.profiles set role = 'admin' where email = 'your-admin@email.com';
   ```
3. Sign in with that account and you land on `/admin/dashboard`.

Use a second browser (or a private window) for the client so you can show both sides at once.

---

## 2. Demo script (client + admin)

| # | Who | Action |
|---|-----|--------|
| 1 | Client | Open `/services`, open **AI & Machine Learning**, click **Start a project** |
| 2 | Client | Register (add a phone number), you land in the intake form |
| 3 | Client | Fill the 6 steps: project "AI-Powered Business Analytics Platform", budget 50,000, 30 days, optionally upload a file, then **Submit project** |
| 4 | Client | See **Project Submitted Successfully** with ID like `LAD-2026-001` |
| 5 | Admin | `/admin/dashboard` shows the activity, `/admin/projects` lists the project, open it and review requirements and files |
| 6 | Admin | In **Create payment request**: 25000 INR, "50% Project Advance", **Create** |
| 7 | Client | Dashboard now shows **Payment required 25,000**, click **Pay now** |
| 8 | Client | Simulated gateway: choose UPI or Card, click **Pay 25,000**, see Processing, then **Payment Successful** with Email Sent and WhatsApp Sent |
| 9 | Client | `/client/notifications` shows the email preview and the WhatsApp conversation |
| 10 | Admin | `/admin/payments` shows Paid with order/transaction IDs. `/admin/notifications` shows both messages (click a row to preview) |
| 11 | Admin | On the project, set Status to **In Progress**, **Save**. Two more notifications are generated |
| 12 | Client | Refresh the project page: timeline shows Requirements, Payment, Review done, Development current |

**Failure path:** on the gateway tick "Demo control: simulate a failed payment", pay, and see the failed state and Retry. Or use **Admin -> Demo control** to force success / failure / cancellation on any open payment and to mark notifications as delivered.

---

## 3. Architecture

```
Browser (never trusted for payment state)
   |  POST /api/payments/:id/pay   { method }
   v
Pay route (server): verifies ownership -> status "processing"
   |  DummyPaymentProvider.createOrder() + charge()
   v
Signed webhook (HMAC-SHA256, x-ladion-signature)
   |  POST /api/payments/webhook   <- verifies signature
   v
processPaymentWebhookEvent()  <- the ONLY code that can set status "paid"
   |-> payments row: paid + order_id, payment_ref, transaction_id, paid_at
   |-> project status -> payment_received
   |-> notifyPaymentReceived()
          |-> sendEmailNotification()    -> notifications table (simulated)
          |-> sendWhatsAppNotification() -> notifications table (simulated)
          |-> activity_log
```

Key folders:

- `lib/payments/` provider abstraction: `index.js` (factory), `dummy.js` (active), `razorpay.js` (placeholder), `signature.js`, `webhookHandler.js`
- `lib/notifications/` `sendEmailNotification` / `sendWhatsAppNotification` plus the simulated senders
- `lib/projectEvents.js` maps events (payment received, status changed) to messages
- `lib/supabase/` browser client, cookie-based server client, service-role client (`server-only`)
- `app/api/` `projects`, `payments`, `payments/[id]/pay`, `payments/webhook`, `projects/[id]/status`, `demo/simulate`
- `middleware.js` session refresh and route guarding for `/client/*` and `/admin/*`

## 4. Security model

- **RLS on every table.** Clients can only read their own projects, payments, files and notifications; only admins can update projects. The `payments` table has **no** client insert/update policy.
- **Payment status is server-only.** Writes to `payments` use the service-role client after ownership is checked in code. The service-role key is imported through `server-only` and never reaches the browser.
- **Signed webhook.** Missing or forged signatures get `401`.
- **Demo-only controls** (`/admin/demo`, `/api/demo/simulate`, "simulate failure") return 404/ignored unless `APP_MODE=demo`.
- Uploads: type allow-list, 10 MB cap, private bucket, path must start with the user's own id.

## 5. Integrations intentionally disabled

| Real service | Status | Replaced by |
|---|---|---|
| Razorpay | Not connected | `DummyPaymentProvider` |
| Resend (email) | Not connected | `lib/notifications/emailSimulated.js` |
| Meta WhatsApp Cloud API | Not connected | `lib/notifications/whatsappSimulated.js` |

Note: Supabase Auth's own password-reset email is separate from the app's notifications and is sent by Supabase.

## 6. Going live later

- **Razorpay:** `npm i razorpay`, implement `createOrder` in `lib/payments/razorpay.js`, replace HMAC check in `app/api/payments/webhook/route.js` with Razorpay's `X-Razorpay-Signature` verification, open Razorpay Checkout instead of the simulated gateway UI, set `APP_MODE=live` and `PAYMENT_PROVIDER=razorpay`.
- **Resend:** in `lib/notifications/index.js` replace the `emailSimulated` call with `resend.emails.send(...)` and set status from the response.
- **WhatsApp Cloud API:** same file, replace `whatsappSimulated` with a call to the Graph API using an approved template. Opt-out (`profiles.whatsapp_opt_in`) is already respected.

No project, payment or notification logic needs to change.

## 7. Known limits

- Built and type-checked (`next build` passes, 23 routes) and the webhook signature and auth guards were tested against a running server, but the full flow was **not run against a live Supabase project** by the author. Follow the demo script once before presenting.
- Client-side "Google sign-in" is not included (email/password only, as specified).
- Admin roles are `admin` / `client` (no finer RBAC in this demo).
