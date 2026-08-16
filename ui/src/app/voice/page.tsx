"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VoiceVisualizer } from "@/components/VoiceVisualizer";
import { useVoiceRecorder } from "@/hooks/useVoiceRecorder";
import { sendVoiceQuery } from "@/lib/api";
import { Mic, MicOff, Volume2, Sparkles, RefreshCw } from "lucide-react";

export default function VoicePage() {
  const { isRecording, startRecording, stopRecording } = useVoiceRecorder();
  const [status, setStatus] = useState<"idle" | "listening" | "processing" | "speaking">("idle");
  const [transcript, setTranscript] = useState<string>("");
  const [response, setResponse] = useState<string>("");

  const handleToggleRecord = async () => {
    if (isRecording) {
      setStatus("processing");
      const audioB64 = await stopRecording();
      try {
        const res = await sendVoiceQuery({
          audio_base64: audioB64 || undefined,
          text: "What is my emergency fund target and current savings rate?",
        });
        setTranscript(res.transcript);
        setResponse(res.reply_text || "Analysis complete.");
        setStatus("speaking");
      } catch (err) {
        console.error(err);
        setStatus("idle");
      }
    } else {
      setTranscript("");
      setResponse("");
      setStatus("listening");
      await startRecording();
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 flex flex-col items-center justify-center text-center space-y-8">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          Low-Latency Voice Mode
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Conversational Voice Financial Advisor</h1>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Tap the microphone and ask questions about your net worth, taxes, investments, or budgeting.
        </p>
      </div>

      {/* Voice Visualizer Container */}
      <div className="w-full max-w-md">
        <VoiceVisualizer isRecording={isRecording} isProcessing={status === "processing"} />
      </div>

      {/* Main Microphone Button */}
      <div>
        <button
          onClick={handleToggleRecord}
          className={`h-24 w-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
            isRecording
              ? "bg-red-500 hover:bg-red-600 ring-8 ring-red-200 dark:ring-red-950 scale-105 animate-pulse text-white"
              : "bg-emerald-600 hover:bg-emerald-700 ring-8 ring-emerald-100 dark:ring-emerald-950 text-white"
          }`}
        >
          {isRecording ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
        </button>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {status === "idle" && "Tap to Speak"}
          {status === "listening" && "Listening... Tap to Complete"}
          {status === "processing" && "Processing Audio..."}
          {status === "speaking" && "Advisory Complete"}
        </p>
      </div>

      {/* Transcript & Response Card */}
      {(transcript || response) && (
        <Card className="w-full max-w-xl text-left bg-white/90 dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-md">
          <CardContent className="p-6 space-y-4">
            {transcript && (
              <div>
                <span className="text-xs font-bold uppercase text-slate-400">You Asked:</span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white mt-0.5">"{transcript}"</p>
              </div>
            )}
            {response && (
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase text-emerald-600 flex items-center gap-1.5">
                  <Volume2 className="h-3.5 w-3.5" /> DhanMITR Response:
                </span>
                <p className="text-sm text-slate-700 dark:text-slate-200 mt-1 leading-relaxed">{response}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
