'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChatMessage, VoiceState } from '@/types';
import { useFinance } from './FinanceContext';
import { useAuth } from './AuthContext';
import { sendVoiceChat, streamRagChat, streamVoiceAudio } from '@/lib/voiceApi';

export type SupportedLanguage = 'auto' | 'en' | 'hi' | 'hinglish';

interface VoiceChatContextType {
  // Voice State
  voiceState: VoiceState;
  setVoiceState: (state: VoiceState) => void;
  selectedLanguage: SupportedLanguage;
  setSelectedLanguage: (lang: SupportedLanguage) => void;
  startVoiceListening: () => void;
  stopVoiceListening: () => void;
  isVoiceActive: boolean;
  activeTranscript: string;
  assistantVoiceReply: string;
  audioFrequencyData: number[];
  speakText: (text: string, lang?: SupportedLanguage) => void;

  // Chat State
  messages: ChatMessage[];
  sendMessage: (text: string, language?: SupportedLanguage) => Promise<void>;
  resetChat: () => void;
  isGeneratingResponse: boolean;

  // Quick Actions & Triggers
  triggerPrompt: (promptText: string, lang?: SupportedLanguage) => void;
}

const generateMsgId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const getTimestampStr = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const VoiceChatContext = createContext<VoiceChatContextType | undefined>(undefined);

export const VoiceChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    spendingCategories,
    subscriptions,
    insurances,
    transactions,
    budgetItems,
    goals,
    totalIncome,
    totalOutflow,
    netSurplus,
    savingsRate,
    emergencyRunwayMonths,
    profile,
  } = useFinance();

  const { incrementFreeChatCount, isAuthenticated } = useAuth();

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('auto');
  const [activeTranscript, setActiveTranscript] = useState('');
  const [assistantVoiceReply, setAssistantVoiceReply] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [audioFrequencyData, setAudioFrequencyData] = useState<number[]>(new Array(24).fill(10));

  // Audio capture refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const safetyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeSourceNodesRef = useRef<AudioBufferSourceNode[]>([]);
  const nextPlayTimeRef = useRef<number>(0);

  // Stop currently playing audio and revoke object URL
  const stopAudioPlayback = () => {
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    if (currentAudioUrlRef.current) {
      URL.revokeObjectURL(currentAudioUrlRef.current);
      currentAudioUrlRef.current = null;
    }
    if (activeSourceNodesRef.current.length > 0) {
      activeSourceNodesRef.current.forEach((node) => {
        try {
          node.stop();
          node.disconnect();
        } catch {}
      });
      activeSourceNodesRef.current = [];
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.suspend();
      } catch {}
    }
    nextPlayTimeRef.current = 0;
  };


  // Cleanup tracks in microphone stream
  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Dynamic Audio Visualizer Animation Loop
  useEffect(() => {
    let phase = 0;
    const animateFrequencies = () => {
      phase += 0.18;
      if (voiceState === 'listening') {
        const simulated = Array.from({ length: 24 }, (_, i) => {
          const wave = Math.sin(phase + i * 0.4) * 0.5 + 0.5;
          const noise = Math.random() * 0.35;
          return Math.max(16, Math.floor((wave + noise) * 90));
        });
        setAudioFrequencyData(simulated);
      } else if (voiceState === 'speaking') {
        const simulated = Array.from({ length: 24 }, (_, i) => {
          const wave = Math.sin(phase * 1.6 + i * 0.35) * 0.6 + 0.4;
          const bounce = Math.cos(phase * 0.8 + i * 0.2) * 0.3;
          return Math.max(20, Math.floor((wave + bounce) * 105));
        });
        setAudioFrequencyData(simulated);
      } else if (voiceState === 'processing') {
        const simulated = Array.from({ length: 24 }, (_, i) => {
          const wave = Math.sin(phase * 2.2 + i * 0.5) * 0.3 + 0.3;
          return Math.max(10, Math.floor(wave * 45));
        });
        setAudioFrequencyData(simulated);
      } else {
        setAudioFrequencyData(new Array(24).fill(10));
      }
      animationFrameRef.current = requestAnimationFrame(animateFrequencies);
    };

    animationFrameRef.current = requestAnimationFrame(animateFrequencies);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [voiceState]);

  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      stopAudioPlayback();
      cleanupStream();
      if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    };
  }, []);

  // Audio format check for browser MediaRecorder
  const getSupportedMimeType = (): string => {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac',
      'audio/wav',
    ];
    for (const type of types) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  // Helper to assemble rich, itemized financial context
  const buildFinancialContext = () => {
    return {
      profile: profile
        ? {
            user_id: profile.user_id || 'guest',
            currency: profile.currency || 'INR',
            monthly_income: totalIncome,
            monthly_expenses: totalOutflow,
            emergency_fund_balance: profile.emergency_fund_balance || 0,
            total_investments: profile.total_investments || 0,
            total_liabilities: profile.total_liabilities || 0,
            risk_tolerance: profile.risk_tolerance || 'moderate',
            employment_type: profile.employment_type || 'salaried',
            tax_regime: profile.tax_regime || 'new',
          }
        : undefined,
      net_worth: (profile?.total_investments || 0) + (profile?.emergency_fund_balance || 0) - (profile?.total_liabilities || 0),
      net_surplus: netSurplus,
      savings_rate_percentage: savingsRate,
      runway_months: emergencyRunwayMonths,
      active_subscriptions_total: subscriptions
        .filter((s) => s.is_active)
        .reduce((sum, s) => sum + (s.billing_cycle === 'monthly' ? s.amount : Math.round(s.amount / 12)), 0),
      active_insurance_coverages: insurances.filter((i) => i.is_active).map((i) => i.policy_name || i.policy_type),
      top_spending_categories: spendingCategories.map((c) => ({
        category: c.categoryKey || c.category,
        amount: c.amount,
        percentage: c.percentage,
      })),
      subscriptions_list: subscriptions
        .filter((s) => s.is_active)
        .map((s) => ({
          name: s.name,
          amount: s.amount,
          billing_cycle: s.billing_cycle,
          category: s.category || 'Entertainment',
          next_renewal_date: s.next_renewal_date,
        })),
      recent_transactions: (transactions || []).slice(0, 10).map((t) => ({
        title: t.title,
        amount: t.amount,
        category: t.category,
        type: t.type,
        date: t.date,
      })),
      budget_items: (budgetItems || []).map((b) => ({
        category: b.category,
        budgeted_amount: b.allocated,
        actual_spent: b.spent,
      })),
      goals_list: (goals || []).map((g) => ({
        title: g.title,
        target_amount: g.target_amount,
        current_amount: g.current_amount,
        target_date: g.target_date,
      })),
    };
  };

  // Play audio returned from backend via HTMLAudioElement
  const playSynthesizedAudio = (audioBase64: string, audioFormat = 'audio/wav') => {
    try {
      stopAudioPlayback();

      // Convert base64 to Blob
      const binaryString = atob(audioBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: audioFormat });
      const audioUrl = URL.createObjectURL(audioBlob);
      currentAudioUrlRef.current = audioUrl;

      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;

      setVoiceState('speaking');

      audio.onended = () => {
        stopAudioPlayback();
        setVoiceState('idle');
      };

      audio.onerror = () => {
        stopAudioPlayback();
        setVoiceState('idle');
      };

      audio.play().catch(() => {
        stopAudioPlayback();
        setVoiceState('idle');
      });
    } catch {
      stopAudioPlayback();
      setVoiceState('idle');
    }
  };

  // Real-time streaming voice synthesis and playback via Web Audio API
  const speakText = async (text: string, lang: SupportedLanguage = 'en') => {
    if (!text.trim()) return;
    try {
      stopAudioPlayback();
      setVoiceState('processing');

      const AudioCtxClass =
        typeof window !== 'undefined'
          ? window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
          : null;

      if (!AudioCtxClass) {
        const response = await sendVoiceChat({
          text,
          language: lang === 'auto' ? undefined : lang,
          user_id: profile?.user_id,
          financial_context: buildFinancialContext(),
        });

        if (response.audio_base64) {
          playSynthesizedAudio(response.audio_base64, response.audio_format || 'audio/wav');
        } else {
          setVoiceState('idle');
        }
        return;
      }

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new AudioCtxClass();
      }
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      nextPlayTimeRef.current = audioCtx.currentTime;
      let hasStartedSpeaking = false;
      let chunkCount = 0;

      await streamVoiceAudio(
        {
          text,
          language: lang === 'auto' ? undefined : lang,
          user_id: profile?.user_id,
          financial_context: buildFinancialContext(),
        },
        async (chunk) => {
          try {
            chunkCount++;
            const arrayBuffer = chunk.buffer.slice(
              chunk.byteOffset,
              chunk.byteOffset + chunk.byteLength
            ) as ArrayBuffer;
            const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

            if (!hasStartedSpeaking) {
              hasStartedSpeaking = true;
              setVoiceState('speaking');
            }

            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(audioCtx.destination);

            const startTime = Math.max(audioCtx.currentTime, nextPlayTimeRef.current);
            source.start(startTime);
            nextPlayTimeRef.current = startTime + audioBuffer.duration;

            activeSourceNodesRef.current.push(source);

            source.onended = () => {
              activeSourceNodesRef.current = activeSourceNodesRef.current.filter((n) => n !== source);
              if (activeSourceNodesRef.current.length === 0 && audioCtx.currentTime >= nextPlayTimeRef.current - 0.1) {
                setVoiceState('idle');
              }
            };
          } catch (decodeErr) {
            console.debug('Streaming audio chunk decode failed (ignoring corrupt chunk):', decodeErr);
          }
        }
      );

      if (chunkCount === 0) {
        setVoiceState('idle');
      }
    } catch (err) {
      console.warn('Streaming voice playback encountered an issue:', err);
      setVoiceState('idle');
    }
  };


  // Stop voice recording and submit audio
  const stopVoiceListening = () => {
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);

    // If currently speaking, stop playback and return to idle
    if (voiceState === 'speaking') {
      stopAudioPlayback();
      setVoiceState('idle');
      return;
    }

    // If currently listening, stop recorder which triggers onstop -> handleAudioRecorded
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        if (typeof mediaRecorderRef.current.requestData === 'function') {
          mediaRecorderRef.current.requestData();
        }
        mediaRecorderRef.current.stop();
      } catch {
        cleanupStream();
        setVoiceState('idle');
      }
    } else {
      cleanupStream();
      setVoiceState('idle');
    }
  };

  // Send recorded audio Blob to backend Voice API
  const handleAudioRecorded = async (blob: Blob) => {
    setVoiceState('processing');

    if (blob.size < 500) {
      setVoiceState('idle');
      return;
    }

    try {
      // Convert Blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = async () => {
        try {
          const base64Data = (reader.result as string).split(',')[1];
          if (!base64Data) {
            setVoiceState('idle');
            return;
          }

          const historyPayload = messages.slice(-6).map((m) => ({
            role: m.sender,
            content: m.text,
          }));

          const response = await sendVoiceChat({
            audio_base64: base64Data,
            language: selectedLanguage === 'auto' ? undefined : selectedLanguage,
            user_id: profile?.user_id,
            history: historyPayload,
            financial_context: buildFinancialContext(),
          });

          const detectedLang = (response.language as 'en' | 'hi' | 'hinglish') || (selectedLanguage === 'auto' ? 'en' : selectedLanguage);

          // 1. Update user transcript in UI and chat
          const transcriptText = response.transcript || '';
          if (transcriptText) {
            setActiveTranscript(transcriptText);
            const userMsg: ChatMessage = {
              id: generateMsgId('msg_u'),
              sender: 'user',
              text: transcriptText,
              timestamp: getTimestampStr(),
              language: detectedLang,
            };
            setMessages((prev) => [...prev, userMsg]);
          }

          // 2. Update assistant response in UI and chat
          const replyText = response.answer || response.reply_text || '';
          if (replyText) {
            setAssistantVoiceReply(replyText);
            const assistantMsg: ChatMessage = {
              id: generateMsgId('msg_a'),
              sender: 'assistant',
              text: replyText,
              timestamp: getTimestampStr(),
              language: detectedLang,
              sources: response.sources,
            };
            setMessages((prev) => [...prev, assistantMsg]);
          }

          // 3. Play synthesized audio
          if (response.audio_base64) {
            playSynthesizedAudio(response.audio_base64, response.audio_format || 'audio/wav');
          } else {
            setVoiceState('idle');
          }
        } catch (apiErr: unknown) {
          const message = apiErr instanceof Error ? apiErr.message : 'Please try again.';
          const errorMsg: ChatMessage = {
            id: generateMsgId('msg_err'),
            sender: 'assistant',
            text: `Sorry, I encountered an issue connecting to the voice service: ${message}`,
            timestamp: getTimestampStr(),
            language: selectedLanguage,
          };
          setMessages((prev) => [...prev, errorMsg]);
          setVoiceState('idle');
        }
      };

      reader.onerror = () => {
        setVoiceState('idle');
      };
    } catch {
      setVoiceState('idle');
    }
  };

  // Start voice listening using browser MediaRecorder
  const startVoiceListening = async () => {
    // Check free chat quota for guests
    if (!isAuthenticated) {
      const allowed = incrementFreeChatCount();
      if (!allowed) {
        return;
      }
    }

    stopAudioPlayback();
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    setActiveTranscript('');
    setAssistantVoiceReply('');

    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('Microphone capture is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm',
        });
        audioChunksRef.current = [];
        cleanupStream();
        handleAudioRecorded(audioBlob);
      };

      recorder.start(100); // Emit chunks every 100ms
      setVoiceState('listening');

      // Maximum recording timeout safety net (30s)
      safetyTimeoutRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          stopVoiceListening();
        }
      }, 30000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Please check microphone permissions.';
      setVoiceState('idle');
      const errorMsg: ChatMessage = {
        id: generateMsgId('msg_err'),
        sender: 'assistant',
        text: `Microphone access denied or unavailable: ${message}`,
        timestamp: getTimestampStr(),
        language: selectedLanguage,
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Send message from chat box with real-time SSE token streaming (<200ms TTFT)
  const sendMessage = async (text: string, language?: SupportedLanguage) => {
    if (!text.trim()) return;

    if (!isAuthenticated) {
      const allowed = incrementFreeChatCount();
      if (!allowed) {
        return;
      }
    }

    const effectiveLang = language || selectedLanguage;

    const userMsg: ChatMessage = {
      id: generateMsgId('msg_u'),
      sender: 'user',
      text: text,
      timestamp: getTimestampStr(),
      language: effectiveLang,
    };

    const assistantMsgId = generateMsgId('msg_a');
    const initialAssistantMsg: ChatMessage = {
      id: assistantMsgId,
      sender: 'assistant',
      text: '',
      timestamp: getTimestampStr(),
      language: effectiveLang === 'auto' ? 'en' : effectiveLang,
      isStreaming: true,
      sources: [],
    };

    // Extract history of last 6 messages
    const historyPayload = messages.slice(-6).map((m) => ({
      role: m.sender,
      content: m.text,
    }));

    setMessages((prev) => [...prev, userMsg, initialAssistantMsg]);
    setIsGeneratingResponse(true);

    try {
      await streamRagChat(
        {
          question: text,
          language: effectiveLang === 'auto' ? undefined : effectiveLang,
          financial_context: buildFinancialContext(),
          history: historyPayload,
        },
        {
          onMetadata: (meta) => {
            if (meta.sources && meta.sources.length > 0) {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId ? { ...msg, sources: meta.sources } : msg
                )
              );
            }
            if (meta.language) {
              const detected = meta.language as 'en' | 'hi' | 'hinglish';
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMsgId ? { ...msg, language: detected } : msg
                )
              );
            }
          },
          onDelta: (chunkText) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId ? { ...msg, text: msg.text + chunkText } : msg
              )
            );
          },
          onDone: () => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId ? { ...msg, isStreaming: false } : msg
              )
            );
            setIsGeneratingResponse(false);
          },
          onError: (err) => {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === assistantMsgId
                  ? {
                      ...msg,
                      text: msg.text || `Unable to complete response: ${err.message}`,
                      isStreaming: false,
                    }
                  : msg
              )
            );
            setIsGeneratingResponse(false);
          },
        }
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Please try again.';
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                text: msg.text || `Unable to process message: ${message}`,
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsGeneratingResponse(false);
    }
  };

  const triggerPrompt = (promptText: string, lang?: SupportedLanguage) => {
    sendMessage(promptText, lang);
  };

  const resetChat = () => {
    stopAudioPlayback();
    cleanupStream();
    if (safetyTimeoutRef.current) clearTimeout(safetyTimeoutRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setMessages([]);
    setActiveTranscript('');
    setAssistantVoiceReply('');
    setVoiceState('idle');
  };

  return (
    <VoiceChatContext.Provider
      value={{
        voiceState,
        setVoiceState,
        selectedLanguage,
        setSelectedLanguage,
        startVoiceListening,
        stopVoiceListening,
        isVoiceActive: voiceState !== 'idle',
        activeTranscript,
        assistantVoiceReply,
        audioFrequencyData,
        messages,
        sendMessage,
        resetChat,
        isGeneratingResponse,
        triggerPrompt,
        speakText,
      }}
    >
      {children}
    </VoiceChatContext.Provider>
  );
};

export const useVoiceChat = () => {
  const context = useContext(VoiceChatContext);
  if (!context) {
    throw new Error('useVoiceChat must be used within a VoiceChatProvider');
  }
  return context;
};
