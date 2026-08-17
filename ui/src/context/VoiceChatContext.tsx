'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChatMessage, VoiceState } from '@/types';
import { initialChatMessages } from '@/data/mockData';
import { useFinance } from './FinanceContext';

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
  const { spendingCategories, subscriptions, totalIncome, totalOutflow, netSurplus, savingsRate } = useFinance();

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
          // Do not abruptly terminate; let the fallback flow proceed smoothly
        };

        recognition.onend = () => {
          // Handled via sequence controller
        };

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

  // Start voice listening with guaranteed 3-stage lifecycle animation sequence
  const startVoiceListening = () => {
    if (listeningTimeoutRef.current) clearTimeout(listeningTimeoutRef.current);
    setActiveTranscript('');
    setAssistantVoiceReply('');
    setVoiceState('listening');

    // Attempt browser recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.lang = selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
      } catch (e) {}
    }

    // Set default query placeholder based on language
    const sampleQuery =
      selectedLanguage === 'hi'
        ? 'मेरे खर्चों का विश्लेषण करें और बचत के तरीके बताएं'
        : 'Analyze my spending and show how I can save more';

    // Keep listening active for 3.5 seconds to showcase listening animation
    listeningTimeoutRef.current = setTimeout(() => {
      const queryToProcess = activeTranscript.trim() || sampleQuery;
      setActiveTranscript(queryToProcess);
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
      processQuerySequence(queryToProcess);
    }, 3200);
  };

  // Process query transitioning into Processing state -> Speaking state -> Idle
  const processQuerySequence = async (query: string) => {
    // 1. Enter Processing State (Particle orbit constellation animation)
    setVoiceState('processing');

    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language: selectedLanguage,
    };

    setMessages((prev) => [...prev, userMsg]);

    // Keep processing visible for 2.2 seconds so user sees the particle orbit animation
    await new Promise((resolve) => setTimeout(resolve, 2200));

    const result = generateAssistantResponse(query, selectedLanguage);
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

    // 2. Enter Speaking State (Glowing audio waveform + voice playback)
    speakText(result.voiceReply, result.lang);
  };

  // Stop voice recording immediately and trigger processing
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
      const query = activeTranscript.trim() || (selectedLanguage === 'hi' ? 'मेरे खर्चों का विश्लेषण करें' : 'How can I save more money this month?');
      setActiveTranscript(query);
      processQuerySequence(query);
    } else {
      setVoiceState('idle');
    }
  };

  // Intelligent Financial Query Processor
  const generateAssistantResponse = (query: string, langHint?: 'en' | 'hi' | 'hinglish') => {
    const q = query.toLowerCase().trim();
    const isHindi =
      langHint === 'hi' ||
      /[\u0900-\u097F]/.test(query) ||
      q.includes('खर्च') ||
      q.includes('बचत') ||
      q.includes('सब्सक्रिप्शन') ||
      q.includes('निवेश');

    const formattedSurplus = `₹${netSurplus.toLocaleString('en-IN')}`;
    const formattedIncome = `₹${totalIncome.toLocaleString('en-IN')}`;
    const formattedOutflow = `₹${totalOutflow.toLocaleString('en-IN')}`;

    if (isHindi) {
      if (q.includes('विश्लेषण') || q.includes('खर्च') || q.includes('expenses') || q.includes('spend')) {
        return {
          text: `जरूर Rahul! पिछले महीने आपके कुल खर्च **${formattedOutflow}** थे। यहाँ आपके खर्चों का सारांश है:\n\nक्या आप किसी विशेष श्रेणी पर और विस्तार से जानना चाहेंगे?`,
          widgetType: 'expense_summary' as const,
          widgetData: spendingCategories,
          voiceReply: `जरूर राहुल! पिछले महीने आपके कुल खर्च 40 हजार 993 रुपये थे। हाउसिंग और इन्वेस्टमेंट आपके मुख्य खर्च हैं।`,
          lang: 'hi' as const,
        };
      }

      if (q.includes('सब्सक्रिप्शन') || q.includes('ott') || q.includes('subscription')) {
        return {
          text: `आपके पास कुल **${subscriptions.length} OTT और सब्सक्रिप्शन प्लान** सक्रिय हैं, जिनका कुल मासिक खर्च **₹4,980** है।\n\n- **Netflix Standard:** ₹499 (24 Aug को देय)\n- **Amazon Prime:** ₹1,499 (25 Aug को देय)\n- **Spotify:** ₹119 (25 Aug को देय)\n\nसलाह: अप्रयुक्त प्लान्स जैसे Claude Pro को पॉज करके आप प्रति माह ₹1,999 बचा सकते हैं।`,
          widgetType: 'subscription_alert' as const,
          widgetData: subscriptions.slice(0, 4),
          voiceReply: `आपके पास कुल 10 एक्टिव सब्सक्रिप्शन हैं जिनका मासिक खर्च 4980 रुपये है। नेटफ्लिक्स और अमेज़न प्राइम के नवीनीकरण जल्द ही देय हैं।`,
          lang: 'hi' as const,
        };
      }

      if (q.includes('बचत') || q.includes('save') || q.includes('कम')) {
        return {
          text: `आपकी वर्तमान मासिक बचत दर **${savingsRate}%** (${formattedSurplus}) है जो बहुत शानदार है! 🎉\n\nऔर अधिक बचत के 3 स्मार्ट सुझाव:\n1. **OTT बंडलिंग:** अप्रयुक्त 2 AI और एंटरटेनमेंट प्लान्स को समेकित करें (बचत: ~₹2,200/माह)\n2. **यूटिलिटी ऑप्टिमाइज़ेशन:** पीक ऑवर बिजली व ब्रॉडबैंड प्लान को पुनर्गठित करें (बचत: ~₹800/माह)\n3. **स्वचालित SIP:** वेतन आते ही 1 तारीख को अतिरिक्त ₹3,000 ऑटो-डेबिट करें।`,
          widgetType: 'none' as const,
          voiceReply: `आपकी मासिक बचत दर 37 प्रतिशत है। अगर आप अप्रयुक्त सब्सक्रिप्शन को पॉज करते हैं तो 2200 रुपये और बचा सकते हैं।`,
          lang: 'hi' as const,
        };
      }

      if (q.includes('निवेश') || q.includes('invest') || q.includes('म्यूचुअल फंड')) {
        return {
          text: `आपके मध्यम जोखिम प्रोफाइल (Moderate Risk) के आधार पर अनुशंसित निवेश रणनीति:\n\n- **Nifty 50 इंडेक्स फंड:** ₹5,000/माह (दीर्घकालिक विकास)\n- **फ्लेक्सी-कैप फंड:** ₹3,500/माह (स्थिर रिटर्न)\n- **आपातकालीन फंड:** 6 महीने का खर्च सुरक्षित है (₹2,10,000)।\n\nआप अपने टैक्स-सेविंग के लिए सेक्शन 80C के तहत PPF या ELSS में ₹1.5 लाख का लाभ ले सकते हैं।`,
          widgetType: 'investment_tip' as const,
          voiceReply: `आपकी रिस्क प्रोफाइल के अनुसार निफ्टी 50 और फ्लेक्सी कैप फंड में एसआईपी सबसे अनुकूल विकल्प हैं।`,
          lang: 'hi' as const,
        };
      }

      return {
        text: `नमस्ते Rahul! आपकी मासिक आय **${formattedIncome}** और कुल खर्च **${formattedOutflow}** है। मैं आपके बजट, खर्च विश्लेषण और निवेश योजना में कैसे सहायता कर सकता हूँ?`,
        widgetType: 'none' as const,
        voiceReply: `नमस्ते राहुल, मैं आपकी वित्तीय सहायता के लिए तैयार हूँ। आप मुझसे बजट या खर्चों के बारे में पूछ सकते हैं।`,
        lang: 'hi' as const,
      };
    } else {
      // English responses
      if (q.includes('expense') || q.includes('spending') || q.includes('biggest') || q.includes('cost')) {
        return {
          text: `Sure Rahul! Here is the breakdown of your total monthly outflow of **${formattedOutflow}**:\n\n- **Housing:** ₹15,800 (38.5%)\n- **Investments:** ₹8,500 (20.7%)\n- **Bills & Utilities:** ₹6,200 (15.1%)\n- **Subscriptions:** ₹4,980 (12.1%)\n- **Insurance:** ₹3,513 (8.6%)\n- **Others:** ₹2,000 (4.9%)\n\nWould you like to drill down into any specific category?`,
          widgetType: 'expense_summary' as const,
          widgetData: spendingCategories,
          voiceReply: `Here is your expense breakdown. Your total outflow is ₹40,993 with housing and investments taking the largest share.`,
          lang: 'en' as const,
        };
      }

      if (q.includes('save') || q.includes('more') || q.includes('budget')) {
        return {
          text: `Great financial health! Your current savings rate is **${savingsRate}%** (${formattedSurplus}/month). 🚀\n\n**Top 3 AI Recommendations to Save More:**\n1. **Audit OTT & Subs:** Pause inactive plans to save ~₹2,200/mo.\n2. **Utility Cashbacks:** Enable auto-pay on credit cards for 5% bill cashbacks.\n3. **Increase Step-up SIP:** Allocate 10% of annual appraisal directly to index funds.`,
          widgetType: 'none' as const,
          voiceReply: `You have a healthy savings rate of 37%. By pruning unused subscriptions, you can easily save an additional ₹2,200 every month.`,
          lang: 'en' as const,
        };
      }

      if (q.includes('sub') || q.includes('netflix') || q.includes('prime') || q.includes('renew')) {
        return {
          text: `You have **${subscriptions.length} active subscriptions** totaling **₹4,980/mo**.\n\n⚠️ **Urgent Renewals Alert:**\n- **Netflix Standard HD:** ₹499 (Due: 24 Aug 2026, in 8 days)\n- **Amazon Prime:** ₹1,499 (Due: 25 Aug 2026, in 9 days)\n- **Spotify Premium:** ₹119 (Due: 25 Aug 2026, in 9 days)`,
          widgetType: 'subscription_alert' as const,
          widgetData: subscriptions.slice(0, 4),
          voiceReply: `You have 10 subscriptions totaling ₹4,980 per month. Netflix and Amazon Prime renewals are due in the next 8 to 9 days.`,
          lang: 'en' as const,
        };
      }

      if (q.includes('invest') || q.includes('growth') || q.includes('sip') || q.includes('tax')) {
        return {
          text: `Based on your **Moderate Risk Tolerance** and **₹24,007 monthly surplus**:\n\n- **Equity SIP:** ₹8,500/month (Allocated: Parag Parikh Flexi Cap + Nifty 50)\n- **Emergency Fund:** Healthy at ₹2.1 Lakhs (5.1 months runway)\n- **Insurance Coverage:** ₹1.5 Cr Term Life + ₹15 Lakhs Health Insurance active.\n\nNext step: Consider investing the additional ₹5,000 surplus in Gold/Sovereign Bonds for balanced diversification.`,
          widgetType: 'investment_tip' as const,
          voiceReply: `Your investments are on track with ₹8,500 in monthly SIPs and a solid emergency fund of 2.1 lakh rupees.`,
          lang: 'en' as const,
        };
      }

      return {
        text: `Hello Rahul! Your total monthly income is **${formattedIncome}** and current surplus is **${formattedSurplus}** (${savingsRate}% savings rate). How can I assist you with your finances today?`,
        widgetType: 'none' as const,
        voiceReply: `Hello Rahul, I am your DhanMITR assistant. How can I help with your finances today?`,
        lang: 'en' as const,
      };
    }
  };

  // Send message from chat box
  const sendMessage = async (text: string, language?: 'en' | 'hi' | 'hinglish') => {
    if (!text.trim()) return;
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

    const result = generateAssistantResponse(text, effectiveLang);

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
