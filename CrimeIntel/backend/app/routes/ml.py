"""
ML routes — /ml endpoints.
"""
from fastapi import APIRouter, HTTPException

from app.ml import risk_model

router = APIRouter(prefix="/ml", tags=["ML"])


@router.get("/risk-scores")
def get_risk_scores():
    """Return risk scores for all districts, sorted descending."""
    scores = risk_model.get_risk_scores()
    if not scores:
        return {"message": "Model not yet trained", "scores": []}
    return scores


@router.get("/risk-score/{district}")
def get_risk_score(district: str):
    """Return risk score for a specific district."""
    score = risk_model.get_risk_score(district)
    if not score:
        raise HTTPException(status_code=404, detail=f"District {district} not found")
    return score


@router.get("/explain/{district}")
def explain_district(district: str):
    """Return feature explanation for a district's risk score."""
    explanation = risk_model.get_explanation(district)
    if not explanation:
        raise HTTPException(status_code=404, detail=f"District {district} not found")
    return explanation
