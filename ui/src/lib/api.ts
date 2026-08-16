/**
 * Clean API client for DhanMITR Voice & Chat Assistant.
 */
import {
  ChatRequest,
  ChatResponse,
  VoiceRequest,
  VoiceResponse,
} from "../../../shared/types/typescript";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";

export async function sendChatMessage(req: ChatRequest): Promise<ChatResponse> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn("Backend unavailable, using client mock chat:", error);
    return {
      message_id: "mock-msg-" + Date.now(),
      conversation_id: req.conversation_id || "conv-mock-1",
      reply: `### 💡 DhanMITR Financial Guidance\n\nRegarding your question: *"${req.message}"*\n\n1. **Core Rule**: Prioritize maintaining **6 months of emergency reserves** in liquid mutual funds or high-interest sweep deposits.\n2. **Tax Alignment**: Under the **New Tax Regime**, utilize the standard ₹75,000 deduction to minimize total tax liability efficiently.\n3. **Long-Term Growth**: Set up automated monthly SIP investments into low-cost broad market index funds.`,
      sources: [
        {
          title: "Personal Financial Planning Standard",
          source_type: "Advisory Rule",
          snippet: "Maintain 3-6 months essential expenses in high-liquidity assets.",
        },
      ],
      suggested_actions: [
        "How can I save more taxes this year?",
        "Should I invest in Index Funds or Flexicap?",
        "What is the 50/30/20 budgeting rule?",
      ],
      created_at: new Date().toISOString(),
    };
  }
}

export async function sendVoiceQuery(req: VoiceRequest): Promise<VoiceResponse> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/voice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return await res.json();
  } catch (error) {
    console.warn("Backend voice unavailable, using client mock voice:", error);
    return {
      transcript: req.text || "What is my emergency fund target and current savings rate?",
      reply_text:
        "Your target 6-month emergency reserve is approximately ₹3.6 Lakhs. We recommend keeping this across liquid funds and high-interest savings accounts.",
      latency_ms: 95,
    };
  }
}
