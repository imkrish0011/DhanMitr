/**
 * Voice API Client for DhanMITR
 * Connects frontend UI to backend FastAPI voice service.
 */

import { VoiceHealthResponse, VoiceRequest, VoiceResponse } from '@/types';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8000';

export class VoiceApiError extends Error {
  statusCode?: number;
  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'VoiceApiError';
    this.statusCode = statusCode;
  }
}

/**
 * Sends audio recording and user context to backend /api/v1/voice/chat.
 */
export async function sendVoiceChat(payload: VoiceRequest): Promise<VoiceResponse> {
  const url = `${BACKEND_URL}/api/v1/voice/chat`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let detail = 'Voice request failed';
      try {
        const errorJson = await response.json();
        detail = errorJson.detail || detail;
      } catch {
        detail = response.statusText || detail;
      }
      throw new VoiceApiError(detail, response.status);
    }

    const data: VoiceResponse = await response.json();
    return data;
  } catch (error: unknown) {
    if (error instanceof VoiceApiError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Unable to connect to DhanMITR Voice service.';
    throw new VoiceApiError(message, 503);
  }
}

/**
 * Checks readiness and warmup state of the backend voice models.
 */
export async function fetchVoiceHealth(): Promise<VoiceHealthResponse> {
  const url = `${BACKEND_URL}/api/v1/voice/health`;
  try {
    const response = await fetch(url, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new VoiceApiError('Voice health check failed', response.status);
    }

    const data: VoiceHealthResponse = await response.json();
    return data;
  } catch (error: unknown) {
    if (error instanceof VoiceApiError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : 'Backend voice service is unreachable';
    throw new VoiceApiError(message, 503);
  }
}

export interface StreamChatCallbacks {
  onMetadata?: (meta: { sources?: any[]; language?: string; live_data?: any; rag_ms?: number }) => void;
  onDelta?: (text: string) => void;
  onDone?: (timing: { total_ms?: number; rag_ms?: number; llm_ms?: number }) => void;
  onError?: (err: Error) => void;
}

/**
 * Streams grounded answers token-by-token using Server-Sent Events (SSE).
 */
export async function streamRagChat(
  payload: {
    question: string;
    financial_context?: Record<string, unknown>;
    language?: string;
    history?: { role: 'user' | 'assistant'; content: string }[];
  },
  callbacks: StreamChatCallbacks
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/rag/stream`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Streaming request failed: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body stream is unavailable.');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      let currentEvent = 'message';
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
          currentEvent = 'message';
          continue;
        }

        if (trimmed.startsWith('event:')) {
          currentEvent = trimmed.slice(6).trim();
        } else if (trimmed.startsWith('data:')) {
          const rawData = trimmed.slice(5).trim();
          try {
            const parsed = JSON.parse(rawData);
            if (currentEvent === 'metadata') {
              callbacks.onMetadata?.(parsed);
            } else if (currentEvent === 'delta') {
              callbacks.onDelta?.(parsed.text || '');
            } else if (currentEvent === 'done') {
              callbacks.onDone?.(parsed);
            }
          } catch (e) {
            console.debug('Failed to parse SSE JSON:', rawData, e);
          }
        }
      }
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    callbacks.onError?.(error);
    throw error;
  }
}

/**
 * Streams synthesized WAV audio byte chunks from /api/v1/voice/stream in real time.
 */
export async function streamVoiceAudio(
  payload: VoiceRequest,
  onAudioChunk: (chunk: Uint8Array) => void
): Promise<void> {
  const url = `${BACKEND_URL}/api/v1/voice/stream`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new VoiceApiError(`Voice streaming failed with status ${response.status}`, response.status);
  }

  if (!response.body) {
    throw new VoiceApiError('Voice stream response body is unavailable', 500);
  }

  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value && value.length > 0) {
      onAudioChunk(value);
    }
  }
}

