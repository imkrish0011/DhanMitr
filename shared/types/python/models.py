"""Pydantic Models representing shared domain entities and API schemas."""
from datetime import datetime, date
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid


class CurrencyCode(str, Enum):
    INR = "INR"
    USD = "USD"
    EUR = "EUR"
    GBP = "GBP"


class RiskTolerance(str, Enum):
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"


class EmploymentType(str, Enum):
    SALARIED = "salaried"
    SELF_EMPLOYED = "self_employed"
    FREELANCER = "freelancer"
    STUDENT = "student"
    RETIRED = "retired"


class TaxRegime(str, Enum):
    NEW = "new"
    OLD = "old"
    NOT_APPLICABLE = "not_applicable"


class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"
    INVESTMENT = "investment"


class TransactionCategory(str, Enum):
    HOUSING = "housing"
    INVESTMENTS = "investments"
    UTILITIES = "utilities"
    SUBSCRIPTIONS = "subscriptions"
    INSURANCE = "insurance"
    DINING = "dining"
    GROCERIES = "groceries"
    SHOPPING = "shopping"
    TRAVEL = "travel"
    HEALTHCARE = "healthcare"
    EDUCATION = "education"
    ENTERTAINMENT = "entertainment"
    SALARY = "salary"
    FREELANCE = "freelance"
    INVESTMENT_RETURN = "investment_return"
    RENT = "rent"
    OTHER = "other"


class BillingCycle(str, Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    YEARLY = "yearly"
    WEEKLY = "weekly"


class InsuranceType(str, Enum):
    HEALTH = "health"
    TERM_LIFE = "term_life"
    MOTOR = "motor"
    HOME = "home"
    CRITICAL_ILLNESS = "critical_illness"
    OTHER = "other"


class GoalCategory(str, Enum):
    EMERGENCY_FUND = "emergency_fund"
    HOME = "home"
    RETIREMENT = "retirement"
    VEHICLE = "vehicle"
    EDUCATION = "education"
    VACATION = "vacation"
    WEDDING = "wedding"
    OTHER = "other"


class GoalPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


# -----------------------------------------------------------------------------
# User Profile & Context Models
# -----------------------------------------------------------------------------

class UserFinancialProfile(BaseModel):
    model_config = {"extra": "allow"}

    user_id: Optional[str] = "guest"
    currency: CurrencyCode = CurrencyCode.INR
    monthly_income: float = Field(default=0.0, ge=0, description="Monthly in-hand net income")
    monthly_expenses: float = Field(default=0.0, ge=0, description="Estimated monthly fixed + variable expenses")
    emergency_fund_balance: float = Field(default=0.0, ge=0)
    total_investments: float = Field(default=0.0, ge=0)
    total_liabilities: float = Field(default=0.0, ge=0)
    risk_tolerance: RiskTolerance = RiskTolerance.MODERATE
    employment_type: EmploymentType = EmploymentType.SALARIED
    tax_regime: TaxRegime = TaxRegime.NEW
    updated_at: Optional[datetime] = None


class SpendingCategorySummary(BaseModel):
    model_config = {"extra": "allow"}

    category: Any = "other"
    amount: float = 0.0
    percentage: float = 0.0


class FinancialContext(BaseModel):
    model_config = {"extra": "allow"}

    profile: Optional[UserFinancialProfile] = None
    net_worth: Optional[float] = None
    net_surplus: Optional[float] = None
    savings_rate_percentage: Optional[float] = None
    runway_months: Optional[float] = None
    debt_to_income_ratio: Optional[float] = None
    top_spending_categories: Optional[List[SpendingCategorySummary]] = None
    active_goals_count: Optional[int] = None
    active_subscriptions_total: Optional[float] = None
    active_insurance_coverages: Optional[List[str]] = None



# -----------------------------------------------------------------------------
# Core Domain Entity Models
# -----------------------------------------------------------------------------

class Transaction(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    title: str
    amount: float
    currency: CurrencyCode = CurrencyCode.INR
    type: TransactionType = TransactionType.EXPENSE
    category: TransactionCategory = TransactionCategory.OTHER
    date: datetime = Field(default_factory=datetime.utcnow)
    account_name: Optional[str] = None
    is_recurring: bool = False
    tags: List[str] = Field(default_factory=list)


class Subscription(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    name: str
    amount: float
    currency: CurrencyCode = CurrencyCode.INR
    billing_cycle: BillingCycle = BillingCycle.MONTHLY
    category: Optional[str] = "entertainment"
    next_renewal_date: Optional[date] = None
    is_active: bool = True


class Insurance(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    policy_name: str
    provider: str
    policy_type: InsuranceType
    coverage_amount: float
    premium_amount: float
    premium_frequency: str = "yearly"
    renewal_date: Optional[date] = None
    policy_number: Optional[str] = None


class FinancialGoal(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None
    title: str
    target_amount: float
    current_amount: float = 0.0
    target_date: date
    category: GoalCategory = GoalCategory.EMERGENCY_FUND
    monthly_contribution: float = 0.0
    priority: GoalPriority = GoalPriority.MEDIUM
    is_completed: bool = False


# -----------------------------------------------------------------------------
# Chat & Voice Request / Response Payloads
# -----------------------------------------------------------------------------

class KnowledgeSource(BaseModel):
    title: str
    source_type: str
    snippet: str
    url: Optional[str] = None


class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    user_id: Optional[str] = None
    stream: bool = False
    language: str = "en"
    financial_context: Optional[FinancialContext] = None


class ChatResponse(BaseModel):
    message_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    conversation_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reply: str
    sources: List[KnowledgeSource] = Field(default_factory=list)
    suggested_actions: List[str] = Field(default_factory=list)
    metrics_snapshot: Optional[Dict[str, Any]] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ChatStreamChunk(BaseModel):
    type: str  # 'delta' | 'source' | 'suggestion' | 'done' | 'error'
    content: Optional[str] = None
    source: Optional[KnowledgeSource] = None
    suggestions: Optional[List[str]] = None
    error: Optional[str] = None


class STTTelemetry(BaseModel):
    provider: str = ""
    latency_ms: float = 0.0


class TTSTelemetry(BaseModel):
    provider: str = ""
    voice: str = ""
    latency_ms: float = 0.0


class VoiceTimingTelemetry(BaseModel):
    total_ms: float = 0.0


class VoiceHealthResponse(BaseModel):
    status: str
    service: str = "dhanmitr-voice"
    stt: Dict[str, Any] = Field(default_factory=dict)
    tts: Dict[str, Any] = Field(default_factory=dict)
    uptime_ready: bool = True


class VoiceRequest(BaseModel):
    model_config = {"extra": "allow"}

    audio_base64: Optional[str] = None
    text: Optional[str] = None
    voice_id: Optional[str] = None
    language: str = "en"
    stream_output: bool = False
    user_id: Optional[str] = None
    financial_context: Optional[Any] = None


class VoiceResponse(BaseModel):
    transcript: str
    answer: Optional[str] = None
    reply_text: Optional[str] = None
    audio_base64: Optional[str] = None
    audio_format: str = "audio/wav"
    language: str = "en"
    duration_seconds: Optional[float] = None
    latency_ms: Optional[float] = None
    stt: Optional[STTTelemetry] = None
    tts: Optional[TTSTelemetry] = None
    timing: Optional[VoiceTimingTelemetry] = None

