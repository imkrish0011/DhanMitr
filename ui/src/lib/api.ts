/**
 * API client to communicate with the FastAPI backend orchestration layer.
 */
import {
  ChatRequest,
  ChatResponse,
  VoiceRequest,
  VoiceResponse,
  UserFinancialProfile,
  Transaction,
  FinancialGoal,
} from "../../../shared/types/typescript";
import {
  MOCK_USER_PROFILE,
  MOCK_TRANSACTIONS,
  MOCK_GOALS,
} from "./mockData";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

export async function sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn("Backend unavailable, using client-side mock chat:", error);
    return {
      message_id: "mock-msg-" + Date.now(),
      conversation_id: req.conversation_id || "conv-mock-1",
      reply: `### 💡 DhanMITR Financial Analysis\n\nBased on your query: *"${req.message}"*\n\n1. **Emergency Reserve**: Your target 6-month emergency cushion is **₹3,60,000**, which is currently 100% funded.\n2. **Surplus Deployment**: You have an estimated **₹67,000 monthly surplus**. Allocating 60% towards equity index funds and 40% towards your house down payment goal accelerates your timeline by 14 months.\n3. **Tax Optimization**: Under the New Tax Regime, ensure you leverage standard deductions to keep taxable brackets optimized.`,
      sources: [
        {
          title: "Emergency Fund 6-Month Liquidity Rule",
          source_type: "Planning Standard",
          snippet: "Maintain 3-6 months in high liquidity sweep accounts before taking risk.",
        },
      ],
      suggested_actions: [
        "How can I save more taxes this year?",
        "Should I pre-pay my loan or invest in mutual funds?",
        "Analyze my dining and food delivery expenses",
      ],
      created_at: new Date().toISOString(),
    };
  }
}

export async function sendVoiceQuery(req: VoiceRequest): Promise<VoiceResponse> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn("Backend voice unavailable, using mock response:", error);
    return {
      transcript: req.text || "What is my emergency fund target and current savings rate?",
      reply_text:
        "Your emergency fund is currently fully funded at ₹3.6 Lakhs. Your monthly savings rate stands strong at 53%, well above the recommended 20% benchmark.",
      latency_ms: 120,
    };
  }
}

export async function fetchFinancialProfile(): Promise<UserFinancialProfile> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/finance/profile`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    return MOCK_USER_PROFILE;
  }
}

export async function saveFinancialProfile(
  profile: UserFinancialProfile
): Promise<UserFinancialProfile> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/finance/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    return profile;
  }
}

export async function fetchTransactions(): Promise<Transaction[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/finance/transactions`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    return MOCK_TRANSACTIONS;
  }
}

export async function fetchGoals(): Promise<FinancialGoal[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/finance/goals`);
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    return MOCK_GOALS;
  }
}
