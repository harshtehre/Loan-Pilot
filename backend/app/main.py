from __future__ import annotations

import io
import json
import math
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, Field


app = FastAPI(title="LoanPilot API", version="2.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ORG_ID = "demo-org"
USER_ID = "demo-user"
now = datetime.now(timezone.utc)


def uid(prefix: str) -> str:
    return f"{prefix}-{uuid.uuid4().hex[:10]}"


def seed_application(
    name: str,
    amount: int,
    status: str,
    credit: int,
    income: int,
    expenses: int,
    risk: str,
) -> dict[str, Any]:
    app_id = uid("app")
    created = now - timedelta(days=len(state["applications"]) + 1)
    return {
        "id": app_id,
        "organization_id": ORG_ID,
        "applicant_id": uid("person"),
        "requested_amount": amount,
        "requested_tenure_months": 36,
        "status": status,
        "created_at": created.isoformat(),
        "updated_at": created.isoformat(),
        "applicants": {
            "id": uid("person"),
            "full_name": name,
            "age": 34,
            "gender": "Not specified",
            "email": f"{name.lower().replace(' ', '.')}@example.com",
            "phone": "+91 98765 43210",
            "address": "Bengaluru, Karnataka",
            "employment_type": "Salaried",
            "company": "Demo Technologies",
            "employment_years": 4,
            "monthly_income": income,
        },
        "financial_profiles": {
            "monthly_expenses": expenses,
            "existing_emi": 5000,
            "dependents": 2,
            "savings": 200000,
            "credit_score": credit,
        },
        "eligibility_results": [{
            "score": 82 if risk == "low" else 68 if risk == "medium" else 42,
            "model_version": "loanpilot-baseline-v1",
            "feature_explanations": {"credit_score": f"Credit score is {credit}"},
        }],
        "risk_assessments": [{
            "risk_level": risk,
            "positive_factors": ["Stable income", "Consistent employment history"] if risk != "high" else [],
            "risk_factors": ["High debt burden"] if risk != "low" else [],
            "recommended_action": "Human review required; use model output as decision support only.",
            "model_version": "loanpilot-baseline-v1",
        }],
        "documents": [],
    }


state: dict[str, Any] = {
    "applications": [],
    "products": [
        {
            "id": uid("product"),
            "name": "Starter Personal Loan",
            "interest_rate": 11.5,
            "min_credit_score": 650,
            "min_monthly_income": 25000,
            "max_loan_amount": 1000000,
            "min_tenure_months": 12,
            "max_tenure_months": 60,
            "employment_requirements": {},
            "eligibility_rules": {},
            "required_documents": ["id_proof", "income_proof"],
            "active": True,
            "created_at": now.isoformat(),
        },
        {
            "id": uid("product"),
            "name": "Business Growth Loan",
            "interest_rate": 13.25,
            "min_credit_score": 700,
            "min_monthly_income": 50000,
            "max_loan_amount": 5000000,
            "min_tenure_months": 24,
            "max_tenure_months": 84,
            "employment_requirements": {},
            "eligibility_rules": {},
            "required_documents": ["id_proof", "income_proof", "bank_statement"],
            "active": True,
            "created_at": now.isoformat(),
        },
    ],
    "team": [
        {"id": USER_ID, "full_name": "Demo Owner", "email": "owner@loanpilot.local", "status": "active", "roles": [{"role": "owner"}]},
        {"id": uid("user"), "full_name": "Priya Sharma", "email": "priya@example.com", "status": "active", "roles": [{"role": "loan_officer"}]},
    ],
    "audit": [],
    "notifications": [
        {"id": uid("notification"), "message": "Welcome to your demo LoanPilot workspace.", "read": False, "created_at": now.isoformat()}
    ],
    "reports": [],
    "settings": {
        "organization": {"id": ORG_ID, "name": "Demo Lending Co.", "business_type": "fintech_startup", "plan": "starter"},
        "settings": {
            "ai_detail": "standard",
            "notification_preferences": {"new_application": True, "high_risk": True},
            "updated_at": now.isoformat(),
        },
    },
}
state["applications"] = [
    seed_application("Ramesh Kulkarni", 420000, "under_review", 742, 85000, 25000, "low"),
    seed_application("Ananya Mehta", 750000, "submitted", 695, 72000, 36000, "medium"),
    seed_application("Vikram Singh", 250000, "approved", 786, 110000, 30000, "low"),
    seed_application("Neha Joshi", 1200000, "needs_documents", 612, 58000, 41000, "high"),
]


def audit(action: str, metadata: dict[str, Any] | None = None) -> None:
    state["audit"].insert(0, {
        "id": uid("audit"),
        "organization_id": ORG_ID,
        "user_id": USER_ID,
        "action": action,
        "metadata": metadata or {},
        "created_at": datetime.now(timezone.utc).isoformat(),
        "users": {"full_name": "Demo Owner", "email": "owner@loanpilot.local"},
    })


def get_application(app_id: str) -> dict[str, Any]:
    item = next((x for x in state["applications"] if x["id"] == app_id), None)
    if not item:
        raise HTTPException(404, "NOT_FOUND")
    return item


class ApplicationInput(BaseModel):
    full_name: str = Field(min_length=2)
    age: int | None = Field(default=None, ge=18, le=100)
    gender: str | None = None
    email: str | None = None
    phone: str | None = None
    address: str | None = None
    monthly_income: float = Field(ge=0)
    monthly_expenses: float = Field(ge=0)
    existing_emi: float = Field(ge=0)
    dependents: int = Field(ge=0)
    savings: float = Field(ge=0)
    credit_score: int = Field(ge=300, le=900)
    requested_amount: float = Field(gt=0)
    requested_tenure_months: int = Field(gt=0)
    employment_type: str | None = None
    company: str | None = None
    employment_years: float | None = Field(default=None, ge=0)


class StatusInput(BaseModel):
    status: str | None = None
    assigned_officer_id: str | None = None


class ProductInput(BaseModel):
    name: str = Field(min_length=2)
    interest_rate: float = Field(ge=0)
    min_credit_score: int | None = None
    min_monthly_income: float | None = None
    max_loan_amount: float = Field(gt=0)
    min_tenure_months: int = Field(gt=0)
    max_tenure_months: int = Field(gt=0)
    employment_requirements: dict[str, Any] = {}
    eligibility_rules: dict[str, Any] = {}
    required_documents: list[str] = []
    active: bool = True


class ChatInput(BaseModel):
    conversation_id: str | None = None
    application_id: str | None = None
    message: str = Field(min_length=1, max_length=10000)


@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "loanpilot-api", "runtime": "python-fastapi", "timestamp": datetime.now(timezone.utc).isoformat()}


@app.get("/applications")
def list_applications(page: int = 1, limit: int = 25, status: str = "all", search: str = "") -> dict[str, Any]:
    rows = state["applications"]
    if status != "all":
        rows = [x for x in rows if x["status"] == status]
    if search:
        rows = [x for x in rows if search.lower() in x["applicants"]["full_name"].lower()]
    total = len(rows)
    start = max(0, page - 1) * min(limit, 100)
    size = min(max(limit, 1), 100)
    return {"data": rows[start:start + size], "page": page, "limit": size, "total": total}


@app.post("/applications", status_code=201)
def create_application(payload: ApplicationInput) -> dict[str, Any]:
    item = {
        "id": uid("app"),
        "organization_id": ORG_ID,
        "applicant_id": uid("person"),
        "requested_amount": payload.requested_amount,
        "requested_tenure_months": payload.requested_tenure_months,
        "status": "submitted",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "applicants": payload.model_dump(include={"full_name", "age", "gender", "email", "phone", "address", "employment_type", "company", "employment_years", "monthly_income"}),
        "financial_profiles": payload.model_dump(include={"monthly_expenses", "existing_emi", "dependents", "savings", "credit_score"}),
        "eligibility_results": [],
        "risk_assessments": [],
        "documents": [],
    }
    state["applications"].insert(0, item)
    state["notifications"].insert(0, {"id": uid("notification"), "message": f"New loan application created for {payload.full_name}.", "read": False, "created_at": item["created_at"]})
    audit("application.created", {"application_id": item["id"]})
    return item


@app.get("/applications/{app_id}")
def application_detail(app_id: str) -> dict[str, Any]:
    return get_application(app_id)


@app.put("/applications/{app_id}")
def update_application(app_id: str, payload: StatusInput) -> dict[str, Any]:
    item = get_application(app_id)
    if payload.status:
        allowed = {"draft", "submitted", "under_review", "ai_analysis", "approved", "rejected", "needs_documents"}
        if payload.status not in allowed:
            raise HTTPException(422, "Invalid status")
        item["status"] = payload.status
    if payload.assigned_officer_id is not None:
        item["assigned_officer_id"] = payload.assigned_officer_id
    item["updated_at"] = datetime.now(timezone.utc).isoformat()
    audit("application.updated", {"application_id": app_id})
    return item


@app.post("/applications/{app_id}/analyze")
def analyze_application(app_id: str) -> dict[str, Any]:
    item = get_application(app_id)
    fp = item["financial_profiles"]
    ap = item["applicants"]
    income = float(ap.get("monthly_income") or 0)
    burden = (float(fp.get("monthly_expenses") or 0) + float(fp.get("existing_emi") or 0)) / max(income, 1)
    score = max(20, min(98, round(60 + (fp.get("credit_score", 600) - 600) / 5 - burden * 20)))
    risk = "low" if score >= 75 else "medium" if score >= 55 else "high"
    result = {
        "eligibility_score": score,
        "risk_level": risk,
        "feature_explanations": {"debt_burden": f"Monthly obligations are {burden:.0%} of income.", "credit_score": f"Credit score is {fp.get('credit_score', 0)}."},
        "positive_factors": ["Credit score supports repayment capacity.", "Income is documented."] if score >= 60 else [],
        "risk_factors": ["High debt-to-income burden."] if burden > 0.5 else [],
        "recommended_action": "Human review required; use model output as decision support only.",
        "model_version": "loanpilot-baseline-v1",
        "prediction_timestamp": datetime.now(timezone.utc).isoformat(),
    }
    item["eligibility_results"] = [result | {"score": score}]
    item["risk_assessments"] = [result | {"risk_level": risk}]
    item["status"] = "ai_analysis"
    audit("application.ai_analysis", {"application_id": app_id})
    return result


@app.get("/analytics")
def analytics() -> dict[str, Any]:
    rows = state["applications"]
    approved = sum(x["status"] == "approved" for x in rows)
    rejected = sum(x["status"] == "rejected" for x in rows)
    risk = {"low": 0, "medium": 0, "high": 0}
    for item in rows:
        level = (item.get("risk_assessments") or [{"risk_level": "medium"}])[-1].get("risk_level", "medium")
        if level in risk:
            risk[level] += 1
    timeline = []
    by_day: dict[str, dict[str, Any]] = {}
    for item in rows:
        day = item["created_at"][:10]
        by_day.setdefault(day, {"x": day, "applications": 0, "approved": 0, "rejected": 0})
        by_day[day]["applications"] += 1
        by_day[day]["approved"] += item["status"] == "approved"
        by_day[day]["rejected"] += item["status"] == "rejected"
    timeline = list(sorted(by_day.values(), key=lambda x: x["x"]))
    return {
        "total": len(rows),
        "approved": approved,
        "rejected": rejected,
        "pending": sum(x["status"] in {"submitted", "under_review", "ai_analysis", "needs_documents"} for x in rows),
        "high_risk": risk["high"],
        "average_loan_amount": sum(float(x["requested_amount"]) for x in rows) / len(rows) if rows else 0,
        "average_credit_score": sum(float(x["financial_profiles"]["credit_score"]) for x in rows) / len(rows) if rows else 0,
        "approval_rate": approved / len(rows) if rows else 0,
        "risk_distribution": risk,
        "timeline": timeline,
    }


@app.get("/loan-products")
def list_products() -> list[dict[str, Any]]:
    return state["products"]


@app.post("/loan-products", status_code=201)
def create_product(payload: ProductInput) -> dict[str, Any]:
    if payload.max_tenure_months < payload.min_tenure_months:
        raise HTTPException(400, "MAX_TENURE_MUST_BE_GE_MIN")
    item = payload.model_dump() | {"id": uid("product"), "created_at": datetime.now(timezone.utc).isoformat()}
    state["products"].insert(0, item)
    audit("loan_product.created", {"product_id": item["id"]})
    return item


@app.post("/loan-products/match")
def match_products(payload: dict[str, Any]) -> list[dict[str, Any]]:
    result = []
    for product in state["products"]:
        reasons, missing = [], []
        if payload.get("credit", 0) >= (product.get("min_credit_score") or 0):
            reasons.append("Credit score meets minimum")
        else:
            missing.append("Credit score below minimum")
        if payload.get("income", 0) >= (product.get("min_monthly_income") or 0):
            reasons.append("Income meets minimum")
        else:
            missing.append("Income below minimum")
        if payload.get("amount", 0) <= product["max_loan_amount"]:
            reasons.append("Requested amount within limit")
        else:
            missing.append("Requested amount exceeds limit")
        if product["min_tenure_months"] <= payload.get("tenure", 0) <= product["max_tenure_months"]:
            reasons.append("Tenure is supported")
        else:
            missing.append("Tenure outside product range")
        result.append(product | {"match": not missing, "reasons": reasons, "missing": missing})
    return result


@app.post("/ai/chat")
def ai_chat(payload: ChatInput) -> dict[str, str]:
    answer = "This demo assistant uses the configured loan products and application context. AI responses are decision support only; a human officer must make the final lending decision."
    if "document" in payload.message.lower():
        answer = "Review the Documents tab for uploaded evidence. Required document checks remain a human-controlled workflow in this local demo."
    elif "risk" in payload.message.lower():
        answer = "Risk is derived from credit score and monthly debt burden in the transparent baseline model. Run AI Analysis on an application to refresh the score."
    audit("ai.chat", {"application_id": payload.application_id})
    return {"conversation_id": payload.conversation_id or uid("conversation"), "answer": answer}


@app.get("/ai/conversations")
def conversations() -> list[dict[str, Any]]:
    return []


@app.get("/reports")
def list_reports() -> list[dict[str, Any]]:
    return state["reports"]


@app.post("/reports/generate")
def generate_report(payload: dict[str, str]) -> dict[str, Any]:
    item = get_application(payload.get("application_id", ""))
    report = {"id": uid("report"), "application_id": item["id"], "generated_at": datetime.now(timezone.utc).isoformat(), "storage_path": None}
    state["reports"].insert(0, report)
    audit("report.generated", {"application_id": item["id"], "report_id": report["id"]})
    return {"report": report, "download_url": f"http://localhost:8080/reports/{report['id']}/download"}


@app.get("/reports/{report_id}/download")
def download_report(report_id: str) -> Response:
    report = next((x for x in state["reports"] if x["id"] == report_id), None)
    if not report:
        raise HTTPException(404, "NOT_FOUND")
    item = get_application(report["application_id"])
    text = "\n".join([
        "LoanPilot AI - Application Report",
        f"Applicant: {item['applicants']['full_name']}",
        f"Requested loan: INR {item['requested_amount']:,.0f}",
        f"Status: {item['status']}",
        "Decision-support only; human underwriting remains required.",
    ])
    # Minimal valid PDF for local demo downloads.
    body = text.replace("(", "[").replace(")", "]")
    pdf = f"%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Count 0>>endobj\n3 0 obj<</Length {len(body)+40}>>stream\nBT /F1 12 Tf 50 750 Td ({body}) Tj ET\nendstream\nendobj\ntrailer<</Root 1 0 R>>\n%%EOF".encode()
    return Response(content=pdf, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{report_id}.pdf"'})


@app.post("/documents/upload", status_code=201)
async def upload_document(application_id: str = Form(...), doc_type: str = Form(...), file: UploadFile = File(...)) -> dict[str, Any]:
    item = get_application(application_id)
    if file.content_type not in {"application/pdf", "image/png", "image/jpeg", "image/webp"}:
        raise HTTPException(415, "UNSUPPORTED_FILE_TYPE")
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(413, "FILE_TOO_LARGE")
    document = {
        "id": uid("doc"),
        "application_id": application_id,
        "doc_type": doc_type,
        "original_name": file.filename or "upload",
        "mime_type": file.content_type,
        "file_size": len(contents),
        "confidence": 0,
        "status": "provider_required",
        "extracted_fields": {},
    }
    item["documents"].append(document)
    audit("document.uploaded", {"document_id": document["id"], "application_id": application_id})
    return document | {"extraction": {"fields": {}, "confidence": 0, "missing": ["OCR/text extraction unavailable"], "inconsistencies": []}}


@app.get("/applications/{app_id}/documents/{doc_id}/download")
def download_document(app_id: str, doc_id: str) -> dict[str, Any]:
    item = get_application(app_id)
    document = next((x for x in item["documents"] if x["id"] == doc_id), None)
    if not document:
        raise HTTPException(404, "NOT_FOUND")
    return {"url": f"http://localhost:8080/health", "expires_in": 300, "filename": document["original_name"], "mime_type": document["mime_type"]}


@app.get("/team")
def list_team() -> list[dict[str, Any]]:
    return state["team"]


@app.post("/team/invite")
def invite_team(payload: dict[str, str]) -> dict[str, bool]:
    member = {"id": uid("user"), "full_name": payload["full_name"], "email": payload["email"], "status": "active", "roles": [{"role": payload.get("role", "viewer")}]}
    state["team"].append(member)
    audit("team.invited", {"email": member["email"]})
    return {"ok": True}


@app.patch("/team/{user_id}")
def update_team(user_id: str, payload: dict[str, str]) -> dict[str, bool]:
    member = next((x for x in state["team"] if x["id"] == user_id), None)
    if not member:
        raise HTTPException(404, "NOT_FOUND")
    if payload.get("status"):
        member["status"] = payload["status"]
    if payload.get("role"):
        member["roles"] = [{"role": payload["role"]}]
    audit("team.updated", {"target_user_id": user_id})
    return {"ok": True}


@app.get("/audit-logs")
def audit_logs(limit: int = 100) -> list[dict[str, Any]]:
    return state["audit"][:min(limit, 200)]


@app.get("/notifications")
def notifications() -> list[dict[str, Any]]:
    return state["notifications"][:50]


@app.patch("/notifications/{notification_id}/read")
def mark_notification_read(notification_id: str) -> dict[str, bool]:
    item = next((x for x in state["notifications"] if x["id"] == notification_id), None)
    if item:
        item["read"] = True
    return {"ok": True}


@app.get("/billing")
def billing() -> dict[str, Any]:
    return {"organization": state["settings"]["organization"], "subscription": {"plan": state["settings"]["organization"]["plan"], "status": "active"}, "providerConfigured": False, "checkoutImplemented": False, "message": "Payment provider is intentionally not simulated in local demo mode."}


@app.post("/billing/change-plan")
def change_plan(payload: dict[str, str]) -> dict[str, Any]:
    if payload.get("plan") not in {"starter", "business", "professional", "enterprise"}:
        raise HTTPException(422, "Invalid plan")
    state["settings"]["organization"]["plan"] = payload["plan"]
    audit("billing.plan_changed", {"plan": payload["plan"]})
    return {"ok": True, "plan": payload["plan"], "note": "Connect a payment provider webhook for production activation."}


@app.get("/settings")
def get_settings() -> dict[str, Any]:
    return state["settings"]


@app.put("/settings")
def update_settings(payload: dict[str, Any]) -> dict[str, Any]:
    org = state["settings"]["organization"]
    if payload.get("organization_name"):
        org["name"] = payload["organization_name"]
    if payload.get("business_type"):
        org["business_type"] = payload["business_type"]
    if payload.get("ai_detail"):
        state["settings"]["settings"]["ai_detail"] = payload["ai_detail"]
    if payload.get("notification_preferences"):
        state["settings"]["settings"]["notification_preferences"].update(payload["notification_preferences"])
    state["settings"]["settings"]["updated_at"] = datetime.now(timezone.utc).isoformat()
    audit("settings.updated", {})
    return state["settings"]
