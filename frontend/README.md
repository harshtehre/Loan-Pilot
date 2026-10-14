# LoanPilot AI — Frontend

React + TypeScript + Vite frontend for LoanPilot AI. It uses Supabase Auth for email/password and optional phone OTP authentication, and calls the Fastify API configured by `VITE_API_URL`.

## Stack
- React + TypeScript + Vite
- React Router
- Tailwind CSS
- Supabase JS client for authentication

## Run locally

```bash
cp .env.example .env
# Edit .env with your Supabase project URL/public anon key and the API URL.
npm ci
npm run dev
```

## Production build

```bash
npm ci
npm run build
```

The generated static site is written to `dist/`. `vercel.json` configures this output directory and SPA route rewrites. Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL` in Vercel before deployment.

## Authentication

Email/password and password reset use Supabase Auth. Mobile OTP additionally requires Supabase Phone Auth and a separately configured SMS provider; charges may apply. Authentication is not mocked and the protected workspace redirects to `/login` when there is no valid Supabase session.

For all backend, Supabase schema and deployment setup, see the repository's `DEPLOYMENT_RENDER_VERCEL.md` and root `README.md`.
