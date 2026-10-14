# Repair and deployment status

## Changes made in this ZIP

- Confirmed the included backend is **Node.js + TypeScript + Fastify**. The UI is React + TypeScript + Vite. The optional Python/FastAPI ML integration is an external contract only; its source is not included.
- Added Render Blueprint configuration (`render.yaml`) and Vercel SPA/build configuration (`frontend/vercel.json`). Added Node 22 version markers and retained npm lockfiles.
- Added `DEPLOYMENT_RENDER_VERCEL.md` with provider setup, deployment steps, environment variables, authentication configuration, free-tier caveats and troubleshooting.
- Removed the insecure frontend fallback that let users into the app without real Supabase authentication. Workspace routes now require a live Supabase session.
- Connected the login page to email/password and phone OTP flows. Phone OTP remains dependent on Supabase Phone Auth plus an SMS provider.
- Added server-backed organization settings for the business profile, AI response detail and in-app alert preferences; updated topbar/sidebar identity and logout behavior to use the signed-in account.
- Added settings/schema support and configurable in-app notifications for new applications and high-risk analyses. Updated hardcoded company/sample labels in the main React components.
- Added clean `.env.example` templates; excluded real `.env` files and dependency folders from this package. The uploaded project contained a real backend environment file, so do not reuse old credentials if they were previously shared or committed—rotate them in the relevant provider dashboards.
- Updated the root and frontend README files to describe the real stack and deployment flow.

## Checks completed

- Backend TypeScript check: passed (`tsc --noEmit`).
- Frontend TypeScript project check: passed (`tsc -b`).
- `render.yaml` parsed as YAML; package manifests, lockfiles and Vercel config parsed as JSON.
- Final ZIP integrity check passed; deployment files and both lockfiles are present. Real `.env` files, dependency directories and build output are excluded.

## Checks that still require deployment or a clean dependency install

- A full frontend production bundle and platform-native linter could not run in the repair environment because the uploaded `node_modules` lacked the Linux native optional dependencies and the package registry was unreachable. Render/Vercel will install from the included lockfiles in their build environment; run `npm ci && npm run build` in each project once registry access is available.
- End-to-end email confirmation, reset links, SMS delivery, database policies, storage upload/download, AI provider calls, and all business workflows must be tested using your own Supabase/provider configuration after deployment. No code-only pass can prove all external integrations work.
- Payments are not activated, email/SMS notification delivery is not implemented, and no Python ML server is included. These are called out rather than represented as working integrations.

This is a repaired deployment package, not a security or financial-underwriting certification. Run user acceptance, privacy and security testing before using real applicant data.
