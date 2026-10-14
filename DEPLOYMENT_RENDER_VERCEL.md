# LoanPilot AI — Render + Vercel + Supabase deployment

This repository's **main backend is Node.js + TypeScript + Fastify**, not Python. The frontend is **React + TypeScript + Vite**. A separate Python/FastAPI ML service is optional; it is not included in this ZIP. Deploy the included API as a Node service on Render.

## Before deploying

- Create accounts with Supabase, Render and Vercel. Their entry-level/free offers and quotas can change; confirm current limits in each provider's dashboard.
- Keep this repository private if it contains private business/source information.
- Never commit `.env`, the Supabase service-role key, AI API keys, or any production credentials. Only the Supabase project's public `anon`/publishable key belongs in a `VITE_*` variable.

## 1. Configure Supabase (database, auth and file storage)

1. Create a Supabase project and save its project URL.
2. Open **SQL Editor** and run the complete `backend/schema.sql` file from this repository. The schema creates the application tables, organization settings, row-level security policies, signup bootstrap and private `loan-documents` storage bucket.
3. In **Authentication → Providers**, enable **Email**. Choose whether users must verify email before signing in. Configure SMTP/custom email delivery for real production use; the built-in email sender has restrictive limits.
4. Under **Authentication → URL Configuration**, set the Site URL to the deployed Vercel URL. Add redirect URLs for the Vercel production URL and its `/verify-email` path. Also add any preview URLs you intend to use.
5. Copy the project's URL and the browser-safe `anon`/publishable key from the API settings page.

### Email and mobile login

- **Email/password** uses Supabase Auth.
- **Mobile OTP** uses Supabase Phone Auth. Enable the Phone provider and configure an external SMS provider in Supabase first. SMS provider usage may cost money and free SMS is not guaranteed; India may require compliant sender/template registration depending on the provider and message type.
- Email and phone sign-in are not automatically linked to one account just because the same person owns both. Use a deliberate account-linking flow before treating them as the same identity.
- New email and phone signups create a separate organization and owner account. Existing phone accounts should log in using their verified phone number.

## 2. Deploy the backend on Render

1. Push this folder to a Git repository and create a **New Web Service** on Render (or use the included `render.yaml` blueprint).
2. Set the service root directory to `backend`.
3. Runtime: **Node**. Build command: `npm ci && npm run build`. Start command: `npm start`. Health check path: `/health`.
4. Add these environment variables in Render's Environment page:

   | Variable | Value |
   |---|---|
   | `SUPABASE_URL` | Your Supabase project URL, e.g. `https://PROJECT.supabase.co` |
   | `SUPABASE_SERVICE_ROLE_KEY` | The server-only service-role/secret key from Supabase API settings |
   | `FRONTEND_URL` | Start with `http://localhost:5173`; replace after Vercel deploy with the exact deployed frontend origin |
   | `NODE_ENV` | `production` |
   | `AI_API_KEY` | Optional. Leave blank to run without a configured external AI provider |
   | `AI_BASE_URL` | Optional; use a provider's documented OpenAI-compatible endpoint |
   | `AI_MODEL` | Optional; a model supported by the selected provider |
   | `ML_SERVICE_URL` | Optional; only set if a separate Python/FastAPI service exposing `POST /predict` is deployed |

   Render supplies the port automatically; the API reads `PORT` and listens on `0.0.0.0`.
5. Deploy and open `https://YOUR-API.onrender.com/health`. A working service returns JSON containing `"ok": true`.

If using an AI provider's free tier, review its current data-use and privacy terms before sending real applicant/financial information. Do not place the AI key in any frontend/Vercel `VITE_*` variable.

## 3. Deploy the frontend on Vercel

1. Import the same Git repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework preset: **Vite**. Build command: `npm run build`. Output directory: `dist`.
4. Add these environment variables to the Vercel project (Production; add Preview only if needed):

   | Variable | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | The public Supabase `anon`/publishable key, never the service-role key |
   | `VITE_API_URL` | Your Render API base URL, e.g. `https://YOUR-API.onrender.com` (no trailing slash required) |

5. Deploy the frontend and copy its public origin, e.g. `https://YOUR-APP.vercel.app`.
6. Go back to Render and update `FRONTEND_URL` to that exact origin. Multiple origins can be comma-separated, e.g. `https://YOUR-APP.vercel.app,http://localhost:5173`. Save and redeploy the API. Avoid allowing arbitrary origins in production.
7. If you change Vercel environment variables, redeploy the frontend for the change to take effect.

`frontend/vercel.json` includes SPA rewrites so routes such as `/login`, `/verify-email`, and `/app/dashboard` continue to work after refresh.

## 4. Local setup / deploy checks

Use Node.js 22.x (both projects specify it). In separate terminals:

```bash
cd backend
npm ci
cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env
npm run build
npm run dev
```

```bash
cd frontend
npm ci
cp .env.example .env
# Fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY and VITE_API_URL
npm run build
npm run dev
```

Do not upload either `.env` file. `.env.example` files contain placeholders only.

## 5. Free-plan limits and production readiness

- Free web services may sleep when idle; the first request after sleeping can be slow. Free service filesystems may be ephemeral, so persistent application data and uploads belong in Supabase Storage/database, not local disk.
- Supabase free projects have usage quotas and may pause when inactive. Auth email sending limits and storage/database quotas can affect real usage.
- Real phone OTP requires an SMS provider and can incur per-message charges. It is not possible to promise unlimited free mobile login.
- The project implements authentication and app flows, but a deployment still needs real credentials, valid provider configuration, an executed schema, and end-to-end testing. The optional ML service and payment provider are not included/configured by this ZIP. Payment UI/schema do not mean real payments are enabled.
- Loan eligibility/risk outputs are decision support, not a substitute for compliant human underwriting. Perform security, privacy, access-control and financial-model validation before handling real applicant data.

## Common deployment failures

- **CORS error**: ensure Render `FRONTEND_URL` exactly matches the Vercel origin (`https://...`, with no path or trailing slash). Redeploy backend after changing it.
- **App keeps returning to login**: confirm the Supabase URL and public key are set in Vercel and that Auth provider settings/redirect URLs are correct; redeploy frontend after changing environment variables.
- **Email verification redirects incorrectly**: set the Supabase Site URL and allowed redirect URL to the Vercel domain and `/verify-email`.
- **Mobile OTP fails**: enable Supabase Phone provider and configure a supported SMS provider, balance/credentials, country restrictions and any required local compliance settings.
- **API doesn't start on Render**: inspect Render logs and confirm `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are present. Never use the public key in place of the server key for the backend.
- **First request is very slow**: the Render free service may be waking from idle.
