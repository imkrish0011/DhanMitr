"""Pydantic schemas for Hyper-Local Business Feasibility Analysis."""

from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class SWOTAnalysis(BaseModel):
    """4-Quadrant SWOT Matrix."""
    strengths: List[str] = Field(default_factory=list, description="Key local advantages and strengths")
    weaknesses: List[str] = Field(default_factory=list, description="Internal operational limitations or vulnerabilities")
    opportunities: List[str] = Field(default_factory=list, description="Untapped market opportunities in the village/cluster")
    threats: List[str] = Field(default_factory=list, description="External risks, market competition, or climate factors")


class FeasibilityAnalyzeRequest(BaseModel):
    """Request payload for hyper-local rural feasibility analysis."""
    location: str = Field(..., description="Village, Block, or District name (e.g. Rampur, Meerut)")
    business_category: str = Field(..., description="Business category: dairy, poultry, retail, textiles, agro, tech")
    margin_capital: float = Field(..., ge=1000, description="Available promoter margin capital in INR (minimum ₹1,000)")
    language: Optional[str] = Field(default="en", description="Output language: 'en' for English or 'hi' for Hindi")


class FeasibilityAnalyzeResponse(BaseModel):
    """Structured feasibility advisory response."""
    location: str
    business_category: str
    category_title: str
    margin_capital: float
    project_cost: float
    loan_eligible_90: float
    recommended_scheme: str
    scheme_tier: str
    scheme_interest_rate: float
    scheme_tenure_years: int
    moratorium_months: int
    market_reach_radius: str
    competitor_density: str
    market_saturation: str
    swot: SWOTAnalysis
    pricing_benchmarks: List[str]
    estimated_monthly_sales: float
    net_margin_percent: float
    estimated_monthly_profit: float
    viability_score: int
    break_even_months: int
    bank_readiness_summary: str
    recommendation: str
