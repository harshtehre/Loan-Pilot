# LoanPilot AI — Production B2B SaaS

LoanPilot AI is a multi-tenant AI-assisted lending operations platform for small NBFCs, fintech startups, loan agencies and financial consultants.

## Implemented

- Premium responsive React + TypeScript + Tailwind/Vite SaaS UI
- Marketing landing page, pricing, FAQ and security positioning
- Supabase Auth: signup, login, email verification, password reset, protected routes
- Organization bootstrap with owner role and synthetic demo workspace data
- Multi-tenant PostgreSQL schema + Row Level Security
- Owner/Admin/Loan Officer/Analyst/Viewer role model
- Application creation, filtering, search, pagination, status updates and detail workflow
- Applicant + financial profile records
- AI eligibility/risk analysis with replaceable Python/FastAPI ML service
- Feature explanations, positive factors, risk factors, model version and timestamp
- Private document uploads with type/size validation, extraction interface and signed downloads
- Configurable organization loan products and matching engine
- RAG-style AI assistant grounded in configured products and application/document context
- Conversation history
- EMI calculation architecture and amortization-ready calculator
- Server-generated PDF application reports stored in private Supabase Storage
- Analytics with date filtering and live database metrics
- Team invitations, role updates and user disabling
- Audit log
- Notifications
- Billing plans and provider-ready subscription state (no fake payments)
- Security headers, CORS, rate limiting, validation, secure error handling and audit events
- Docker/Nginx deployment configuration
- Replaceable AI and ML service boundaries

## Architecture

`React/Vite → Python/FastAPI API → optional Supabase/PostgreSQL + Storage → AI provider`

The browser never receives the Supabase service-role key or AI provider key.

## Environment

Copy the example files and fill in your own provider values. Never commit `.env` files.

### Frontend (`frontend/.env`)

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_ANON_KEY
VITE_API_URL=http://localhost:8080
```

### Backend (`backend/.env`)

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVER_ONLY_SERVICE_ROLE_KEY
FRONTEND_URL=http://localhost:5173
PORT=8080
# Optional external AI provider:
AI_API_KEY=
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
AI_MODEL=gemini-2.5-flash
# Optional only if a separate Python/FastAPI service is deployed:
# ML_SERVICE_URL=http://localhost:8000
```

The backend is **Python + FastAPI**. The frontend is **React + TypeScript + Vite**. Local demo mode is self-contained and uses seeded in-memory data so every workspace screen can be exercised without external credentials. Never place a Supabase service-role key or an AI provider key in a `VITE_*` variable.

## Deployment

For the full step-by-step Render + Vercel + Supabase deployment guide, email/phone authentication setup, free-tier limitations and troubleshooting, see [`DEPLOYMENT_RENDER_VERCEL.md`](DEPLOYMENT_RENDER_VERCEL.md). The repository includes `render.yaml` and `frontend/vercel.json`.

## Supabase setup

1. Create a Supabase project.
2. Enable Email authentication. For mobile OTP, also enable Phone authentication and configure a supported external SMS provider; SMS usage may cost money.
3. Configure production Site URL and redirect URLs.
4. Run `backend/schema.sql` in Supabase SQL Editor.
5. Confirm the private `loan-documents` bucket exists.
6. The signup trigger creates an organization, owner role, starter subscription and clearly-marked synthetic demo applications/products.

## Local development

Terminal 1:

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

Terminal 2:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown by the terminal.

## API

Protected endpoints use `Authorization: Bearer <Supabase access token>`.

- `GET /health`
- `POST /applications`
- `GET /applications`
- `GET /applications/:id`
- `PUT /applications/:id`
- `POST /applications/:id/analyze`
- `POST /documents/upload`
- `GET /applications/:id/documents/:docId/download`
- `POST /ai/chat`
- `GET /ai/conversations`
- `POST /reports/generate`
- `GET /reports`
- `GET /reports/:id/download`
- `GET /analytics`
- `POST /loan-products`
- `GET /loan-products`
- `POST /loan-products/match`
- `GET /team`
- `POST /team/invite`
- `PATCH /team/:userId`
- `GET /audit-logs`
- `GET /notifications`
- `PATCH /notifications/:id/read`
- `GET /billing`
- `POST /billing/change-plan`

## AI

The AI layer uses an OpenAI-compatible chat-completions interface. Groq can be used by setting its OpenAI-compatible base URL and a supported model.

The assistant is explicitly decision-support. It must not claim guaranteed approval or replace human underwriting.

The RAG context is assembled server-side from organization loan products and, when an application is selected, its financial/application/document context. For a larger production corpus, add pgvector or a dedicated retrieval service and approved policy-document ingestion.

## ML service

Set `ML_SERVICE_URL` to a separate FastAPI service exposing:

`POST /predict`

Request:

```json
{
  "monthly_income":80000,
  "monthly_expenses":25000,
  "existing_emi":5000,
  "savings":200000,
  "credit_score":720,
  "requested_amount":500000,
  "employment_years":4,
  "dependents":2
}
```

Response:

```json
{
  "eligibility_score":82,
  "risk_level":"low",
  "feature_explanations":{},
  "positive_factors":[],
  "risk_factors":[],
  "recommended_action":"Human review required",
  "model_version":"loanpilot-xgb-v1",
  "prediction_timestamp":"2026-09-28T00:00:00Z"
}
```

If no ML service is configured, the backend uses a transparent baseline rules implementation so the product remains runnable; this is not presented as a production underwriting model.

## Documents

Supported upload types: PDF, PNG, JPEG, WebP. Maximum 10 MB.

PDF uploads receive lightweight server-side text-field extraction. Image OCR and advanced PDF parsing should be connected to an approved OCR/document-AI provider before production use. The provider boundary is intentionally isolated from the application workflow.

## Reports

The API generates a server-side PDF and stores it in the private Supabase Storage bucket. Downloads use short-lived signed URLs.

## Billing

The UI and subscription schema are ready for Stripe/Razorpay integration. There is deliberately no fake payment-success implementation. Production checkout should:

1. Create checkout sessions server-side.
2. Redirect the customer to the provider.
3. Verify webhook signatures.
4. Update `subscriptions` only after verified provider events.
5. Enforce plan/usage limits server-side.

## Production deployment

The supported reference deployment is **Vercel (frontend) + Render (Node/Fastify API) + Supabase (Postgres/Auth/Storage)**. Follow `DEPLOYMENT_RENDER_VERCEL.md`. A Python/FastAPI ML API may be deployed separately if one is developed; it is optional and not part of this project ZIP. Before launch, configure HTTPS, restrictive CORS, production email delivery, backups, observability, dependency scanning, secret management, data-retention/privacy controls and security testing.

## Docker

```bash
docker compose build
docker compose up
```

For the frontend container, provide the Vite build-time variables as Docker build arguments or build the frontend in CI with the production environment.

## Product safety

LoanPilot AI is decision-support software. Eligibility scores and AI explanations are not guarantees of approval and must not be represented as a lender's final underwriting decision.
