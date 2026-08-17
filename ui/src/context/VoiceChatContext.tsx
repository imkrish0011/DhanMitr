'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChatMessage, VoiceState } from '@/types';
import { initialChatMessages } from '@/data/mockData';
import { useFinance } from './FinanceContext';
import { useAuth } from './AuthContext';

interface VoiceChatContextType {
  // Voice State
  voiceState: VoiceState;
  setVoiceState: (state: VoiceState) => void;
  selectedLanguage: 'en' | 'hi' | 'hinglish';
  setSelectedLanguage: (lang: 'en' | 'hi' | 'hinglish') => void;
  startVoiceListening: () => void;
  stopVoiceListening: () => void;
  isVoiceActive: boolean;
  activeTranscript: string;
  assistantVoiceReply: string;
  audioFrequencyData: number[];
  
  // Chat State
  messages: ChatMessage[];
  sendMessage: (text: string, language?: 'en' | 'hi' | 'hinglish') => Promise<void>;
  resetChat: () => void;
  isGeneratingResponse: boolean;
  
  // Quick Actions & Triggers
  triggerPrompt: (promptText: string, lang?: 'en' | 'hi' | 'hinglish') => void;
}

const VoiceChatContext = createContext<VoiceChatContextType | undefined>(undefined);

export const VoiceChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    spendingCategories,
    subscriptions,
    insurances,
    totalIncome,
    totalOutflow,
    netSurplus,
    savingsRate,
    profile,
  } = useFinance();

  const { incrementFreeChatCount, isAuthenticated } = useAuth();

  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'hinglish'>('en');
  const [activeTranscript, setActiveTranscript] = useState('');
  const [assistantVoiceReply, setAssistantVoiceReply] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialChatMessages);
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [audioFrequencyData, setAudioFrequencyData] = useState<number[]>(new Array(24).fill(10));

  const recognitionRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const listeningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize Speech Recognition if supported in browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';

        recognition.onstart = () => {
          setVoiceState('listening');
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          if (currentTranscript.trim()) {
            setActiveTranscript(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition status:', event.error);
        };

        recognition.onend = () => {};

        recognitionRef.current = recognition;
      }
    }
  }, [selectedLanguage]);

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
        setAudioFrequencyData(new Array(24).fill(8));
      }
      animationFrameRef.current = requestAnimationFrame(animateFrequencies);
    };

    animationFrameRef.current = requestAnimationFrame(animateFrequencies);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [voiceState]);

  // Real TTS Voice Synthesis
  const speakText = (text: string, lang: 'en' | 'hi' | 'hinglish' = 'en') => {
    setVoiceState('speaking');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*_#`[\]()]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onend = () => {
        setVoiceState('idle');
      };
      utterance.onerror = () => {
        setTimeout(() => setVoiceState('idle'), 3000);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setVoiceState('idle');
      }, 4000);
    }
  };

  // Start voice listening
  const startVoiceListening = () => {
    // Check free chat limit for guests
    if (!isAuthenticated) {
      const allowed = incrementFreeChatCount();
      if (!allowed) {
        return;
      }
    }

    if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
    setActiveTranscript('');
    setAssistantVoiceReply('');
    setVoiceState('listening');

    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
      } catch (e) {}
    }

    const sampleQuery =
      selectedLanguage === 'hi'
        ? 'मेरे खर्चों का विश्लेषण करें और बचत के तरीके बताएं'
        : 'Analyze my spending and show how I can save more';

    listeningTimeoutRef.current = setTimeout(() => {
      const queryToProcess = activeTranscript.trim() || sampleQuery;
      setActiveTranscript(queryToProcess);
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      processQuerySequence(queryToProcess);
    }, 3200);
  };

  // Process query sequence
  const processQuerySequence = async (query: string) => {
    setVoiceState('processing');

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: selectedLanguage,
    };

    setMessages((prev) => [...prev, userMsg]);

    await new Promise((resolve) => setTimeout(resolve, 1800));

    const result = generateDynamicAssistantResponse(query, selectedLanguage);
    setAssistantVoiceReply(result.voiceReply);

    const assistantMsg: ChatMessage = {
      id: `msg_a_${Date.now()}`,
      sender: 'assistant',
      text: result.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: result.lang,
      widgetType: result.widgetType,
      widgetData: result.widgetData,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    speakText(result.voiceReply, result.lang);
  };

  // Stop voice recording
  const stopVoiceListening = () => {
    if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
    try {
      recognitionRef.current?.stop();
    } catch (e) {}

    if (voiceState === 'speaking' && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setVoiceState('idle');
      return;
    }

    if (voiceState === 'listening') {
      const query = activeTranscript.trim() || (selectedLanguage === 'hi' ? 'मेरे खर्चों का विश्लेषण करें' : 'How can I save more money?');
      setActiveTranscript(query);
      processQuerySequence(query);
    } else {
      setVoiceState('idle');
    }
  };

  // Dynamic Financial Response Generator based on actual user profile & Supabase records
  const generateDynamicAssistantResponse = (query: string, langHint?: 'en' | 'hi' | 'hinglish') => {
    const q = query.toLowerCase().trim();
    const isHindi =
      langHint === 'hi' ||
      /[\u0900-\u097F]/.test(query) ||
      q.includes('खर्च') ||
      q.includes('बचत') ||
      q.includes('सब्सक्रिप्शन') ||
      q.includes('निवेश');

    const userName = profile?.name || 'Friend';
    const formattedIncome = `₹${totalIncome.toLocaleString('en-IN')}`;
    const formattedOutflow = `₹${totalOutflow.toLocaleString('en-IN')}`;
    const formattedSurplus = `₹${netSurplus.toLocaleString('en-IN')}`;

    const activeSubs = subscriptions.filter((s) => s.is_active);
    const activeSubsCost = activeSubs.reduce(
      (sum, s) => sum + (s.billing_cycle === 'monthly' ? s.amount : Math.round(s.amount / 12)),
      0
    );

    // If user has zero financial records
    const hasNoData = totalIncome === 0 && totalOutflow === 0 && subscriptions.length === 0;

    if (isHindi) {
      if (hasNoData) {
        return {
          text: `नमस्ते ${userName}! आपके पास वर्तमान में कोई वित्तीय रिकॉर्ड नहीं जुड़ा है।\n\nआप **Finance Hub** में जाकर अपना वेतन (Income), नियमित खर्च और सक्रिय सब्सक्रिप्शन जोड़ सकते हैं ताकि मैं आपको सटीक और व्यक्तिगत सलाह दे सकूँ।`,
          widgetType: 'none' as const,
          voiceReply: `नमस्ते ${userName}, आपके खाते में अभी वित्तीय रिकॉर्ड नहीं हैं। कृपया अपना बजट और आय जोड़ें।`,
          lang: 'hi' as const,
        };
      }

      if (q.includes('विश्लेषण') || q.includes('खर्च') || q.includes('expenses') || q.includes('spend')) {
        const topCategories = spendingCategories.filter((c) => c.amount > 0);
        return {
          text: `जरूर ${userName}! आपकी वर्तमान मासिक आउटफ्लो **${formattedOutflow}** है।\n\n${
            topCategories.length > 0
              ? topCategories.map((c) => `- **${c.category}:** ₹${c.amount.toLocaleString('en-IN')} (${c.percentage}%)`).join('\n')
              : 'आपके अधिकांश खर्च अभी वर्गीकृत नहीं हैं।'
          }\n\nक्या आप किसी विशेष श्रेणी में बचत के उपाय जानना चाहते हैं?`,
          widgetType: 'expense_summary' as const,
          widgetData: spendingCategories,
          voiceReply: `आपके वर्तमान कुल खर्च ${totalOutflow} रुपये हैं।`,
          lang: 'hi' as const,
        };
      }

      if (q.includes('सब्सक्रिप्शन') || q.includes('ott') || q.includes('subscription')) {
        return {
          text: `आपके पास कुल **${activeSubs.length} सक्रिय सब्सक्रिप्शन** हैं, जिनका मासिक खर्च **₹${activeSubsCost.toLocaleString('en-IN')}** है।\n\n${
            activeSubs.length > 0
              ? activeSubs.slice(0, 4).map((s) => `- **${s.name}:** ₹${s.amount} (${s.billing_cycle})`).join('\n')
              : 'वर्तमान में कोई सक्रिय प्लान नहीं है।'
          }`,
          widgetType: 'subscription_alert' as const,
          widgetData: activeSubs.slice(0, 4),
          voiceReply: `आपके पास ${activeSubs.length} सक्रिय सब्सक्रिप्शन हैं जिनका मासिक खर्च ${activeSubsCost} रुपये है।`,
          lang: 'hi' as const,
        };
      }

      if (q.includes('बचत') || q.includes('save') || q.includes('कम')) {
        return {
          text: `आपकी वर्तमान मासिक बचत **${formattedSurplus}** (${savingsRate}% बचत दर) है।\n\n**बचत बढ़ाने के 3 स्मार्ट सुझाव:**\n1. **आवर्ती खर्चों की समीक्षा:** अप्रयुक्त सब्सक्रिप्शन और प्लान्स को पॉज करें।\n2. **यूटिलिटी और बिल प्रबंधन:** ऑटो-पे और कैशबैक ऑफर्स का उपयोग करें।\n3. **स्वचालित निवेश:** वेतन आते ही बचत राशि को अलग करें।`,
          widgetType: 'none' as const,
          voiceReply: `आपकी मासिक बचत दर ${savingsRate} प्रतिशत है।`,
          lang: 'hi' as const,
        };
      }

      if (q.includes('निवेश') || q.includes('invest') || q.includes('फंड')) {
        return {
          text: `आपके **${profile.risk_tolerance || 'Moderate'}** रिस्क प्रोफाइल के आधार पर:\n\n- **इंडेक्स म्यूचुअल फंड (Nifty 50):** दीर्घकालिक पूंजी वृद्धि के लिए अनुकूल।\n- **आपातकालीन निधि (Emergency Fund):** कम से कम 3 से 6 महीने का खर्च सुरक्षित रखें।\n- **बीमा सुरक्षा:** पर्याप्त टर्म और स्वास्थ्य बीमा सक्रिय रखें।`,
          widgetType: 'investment_tip' as const,
          voiceReply: `आपकी रिस्क प्रोफाइल के अनुसार इंडेक्स फंड और आपातकालीन बचत सबसे अनुकूल विकल्प हैं।`,
          lang: 'hi' as const,
        };
      }

      return {
        text: `नमस्ते ${userName}! आपकी मासिक आय **${formattedIncome}** और मासिक खर्च **${formattedOutflow}** है। मैं आपके वित्तीय प्रबंधन में कैसे सहायता कर सकता हूँ?`,
        widgetType: 'none' as const,
        voiceReply: `नमस्ते ${userName}, मैं आपकी वित्तीय सहायता के लिए तैयार हूँ।`,
        lang: 'hi' as const,
      };
    } else {
      // English responses
      if (hasNoData) {
        return {
          text: `Hello ${userName}! You haven't added any financial records yet.\n\nGo to the **Finance Hub** to log your income, monthly budget, or active subscriptions. Once added, I will provide real-time spending insights and custom savings strategies!`,
          widgetType: 'none' as const,
          voiceReply: `Hello ${userName}! You have not added any financial records yet. Add your income and expenses to get started.`,
          lang: 'en' as const,
        };
      }

      if (q.includes('expense') || q.includes('spending') || q.includes('biggest') || q.includes('cost')) {
        const topCategories = spendingCategories.filter((c) => c.amount > 0);
        return {
          text: `Here is your current monthly outflow breakdown totaling **${formattedOutflow}**:\n\n${
            topCategories.length > 0
              ? topCategories.map((c) => `- **${c.category}:** ₹${c.amount.toLocaleString('en-IN')} (${c.percentage}%)`).join('\n')
              : '- No categorized expenses recorded yet.'
          }\n\nWould you like recommendations on optimizing any of these categories?`,
          widgetType: 'expense_summary' as const,
          widgetData: spendingCategories,
          voiceReply: `Your total monthly outflow is ${formattedOutflow}.`,
          lang: 'en' as const,
        };
      }

      if (q.includes('save') || q.includes('more') || q.includes('budget')) {
        return {
          text: `Your current monthly surplus is **${formattedSurplus}** with a **${savingsRate}% savings rate**.\n\n**Top AI Recommendations to Increase Savings:**\n1. **Audit Recurring Plans:** Review your ${activeSubs.length} active subscriptions.\n2. **Budget Discipline:** Cap non-essential spending at 30% of net income.\n3. **Step-up SIP:** Automatically allocate 50% of your surplus into index funds.`,
          widgetType: 'none' as const,
          voiceReply: `Your current monthly surplus is ${formattedSurplus} with a ${savingsRate} percent savings rate.`,
          lang: 'en' as const,
        };
      }

      if (q.includes('sub') || q.includes('netflix') || q.includes('prime') || q.includes('renew')) {
        return {
          text: `You have **${activeSubs.length} active subscriptions** totaling **₹${activeSubsCost.toLocaleString('en-IN')}/mo**.\n\n${
            activeSubs.length > 0
              ? activeSubs.slice(0, 4).map((s) => `- **${s.name}:** ₹${s.amount} (${s.billing_cycle}) - Renewal: ${s.next_renewal_date}`).join('\n')
              : 'No active recurring subscriptions found.'
          }`,
          widgetType: 'subscription_alert' as const,
          widgetData: activeSubs.slice(0, 4),
          voiceReply: `You have ${activeSubs.length} active subscriptions totaling ${activeSubsCost} rupees per month.`,
          lang: 'en' as const,
        };
      }

      if (q.includes('invest') || q.includes('growth') || q.includes('sip') || q.includes('tax')) {
        return {
          text: `Based on your **${profile.risk_tolerance || 'Moderate'}** risk tolerance and **${formattedSurplus}** surplus:\n\n- **Broad Index SIPs:** Recommended for disciplined compounding.\n- **Emergency Cushion:** Target 3 to 6 months of expenses (₹${(totalOutflow * 6).toLocaleString('en-IN')}).\n- **Insurance Safety Net:** ${insurances.length > 0 ? `${insurances.length} active policies connected` : 'Add your term & health policies to track coverage gaps'}.`,
          widgetType: 'investment_tip' as const,
          voiceReply: `Based on your risk profile and surplus, index SIPs and a solid emergency cushion are your best next steps.`,
          lang: 'en' as const,
        };
      }

      return {
        text: `Hello ${userName}! Your monthly income is **${formattedIncome}**, total outflow is **${formattedOutflow}**, and net surplus is **${formattedSurplus}** (${savingsRate}% savings rate). How can I assist your finances today?`,
        widgetType: 'none' as const,
        voiceReply: `Hello ${userName}, I am your DhanMITR assistant. How can I help with your finances today?`,
        lang: 'en' as const,
      };
    }
  };

  // Send message from chat box
  const sendMessage = async (text: string, language?: 'en' | 'hi' | 'hinglish') => {
    if (!text.trim()) return;

    // Check free chat limit for guests
    if (!isAuthenticated) {
      const allowed = incrementFreeChatCount();
      if (!allowed) {
        return;
      }
    }

    const effectiveLang = language || selectedLanguage;

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: effectiveLang,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGeneratingResponse(true);

    await new Promise((resolve) => setTimeout(resolve, 600));

    const result = generateDynamicAssistantResponse(text, effectiveLang);

    const assistantMsg: ChatMessage = {
      id: `msg_a_${Date.now()}`,
      sender: 'assistant',
      text: result.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: result.lang,
      widgetType: result.widgetType,
      widgetData: result.widgetData,
    };

    setMessages((prev) => [...prev, assistantMsg]);
    setIsGeneratingResponse(false);
  };

  const triggerPrompt = (promptText: string, lang?: 'en' | 'hi' | 'hinglish') => {
    sendMessage(promptText, lang);
  };

  const resetChat = () => {
    setMessages(initialChatMessages);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
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
