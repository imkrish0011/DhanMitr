"""DhanMITR Shared Python Constants"""

SUPPORTED_CURRENCIES = {
    "INR": {"symbol": "₹", "name": "Indian Rupee"},
    "USD": {"symbol": "$", "name": "US Dollar"},
    "EUR": {"symbol": "€", "name": "Euro"},
    "GBP": {"symbol": "£", "name": "British Pound"},
}

TRANSACTION_CATEGORIES = [
    "groceries",
    "dining",
    "utilities",
    "rent",
    "shopping",
    "travel",
    "healthcare",
    "education",
    "entertainment",
    "salary",
    "freelance",
    "investment_return",
    "other",
]

DEFAULT_FINANCIAL_BENCHMARKS = {
    "MIN_EMERGENCY_FUND_MONTHS": 6,
    "MAX_HOUSING_RATIO": 0.30,
    "MAX_DEBT_TO_INCOME_RATIO": 0.36,
    "TARGET_SAVINGS_RATE": 0.20,
}

API_ENDPOINTS = {
    "HEALTH": "/health",
    "CHAT": "/api/chat",
    "CHAT_STREAM": "/api/chat/stream",
    "VOICE": "/api/voice",
    "VOICE_STREAM": "/api/voice/stream",
    "FINANCE_PROFILE": "/api/finance/profile",
    "FINANCE_METRICS": "/api/finance/metrics",
    "TRANSACTIONS": "/api/finance/transactions",
    "GOALS": "/api/finance/goals",
}
