# Python ML service contract

The Node API calls `${ML_SERVICE_URL}/predict` when `ML_SERVICE_URL` is configured.

## Request

```json
{
  "monthly_income": 80000,
  "monthly_expenses": 25000,
  "existing_emi": 5000,
  "savings": 200000,
  "credit_score": 720,
  "requested_amount": 500000,
  "employment_years": 4,
  "dependents": 2
}
```

## Response

```json
{
  "eligibility_score": 82,
  "risk_level": "low",
  "feature_explanations": {
    "credit_score": "..."
  },
  "positive_factors": [],
  "risk_factors": [],
  "recommended_action": "Human review required",
  "model_version": "loanpilot-xgb-v1",
  "prediction_timestamp": "2026-09-28T00:00:00Z"
}
```

The frontend never loads the model directly.
