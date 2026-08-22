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
