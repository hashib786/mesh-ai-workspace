"use client";

import { useState, useEffect, useRef } from "react";
import VoiceRecorder from "@/src/components/VoiceRecorder";
import ChatBox from "@/src/components/ChatBox";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Home() {
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [isStarted, setIsStarted] = useState<boolean>(false);
  const [activeSpeechIndex, setActiveSpeechIndex] = useState<number | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load persistent chat history from database on load
  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/chat");
        const data = await response.json();
        if (response.ok && data.history) {
          setConversationHistory(data.history);
          // If history exists, we can show the chat right away
          if (data.history.length > 0) {
            setIsStarted(true);
          }
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    }
    loadHistory();
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const speakText = async (text: string, index: number) => {
    if (!text) return;

    if (activeSpeechIndex === index) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setActiveSpeechIndex(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    try {
      setActiveSpeechIndex(index);
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error("Failed to synthesize speech");
      }

      const blob = await response.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setActiveSpeechIndex(null);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setActiveSpeechIndex(null);
        audioRef.current = null;
      };

      await audio.play();
    } catch (err) {
      console.error("TTS playback error:", err);
      setActiveSpeechIndex(null);
      audioRef.current = null;
    }
  };

  const handleStartConversation = async () => {
    setError("");
    
    // 1. Pick a random greeting
    const greetings = [
      "नमस्ते! मेरा नाम अमन है, मैं 24 साल का हूँ। क्या मैं आपका नाम और उम्र जान सकता हूँ?",
      "प्रणाम! मैं अमन हूँ, आपका सरकारी गाइड। आपकी उम्र क्या है, और मैं आपकी क्या मदद कर सकता हूँ?",
      "हेलो! मेरा नाम अमन है। आप मुझे अपनी उम्र और नाम बताएँ, फिर हम काम की बात शुरू करते हैं।"
    ];
    const randomGreeting = greetings[Math.floor(Math.random() * greetings.length)];

    // 2. Clear history and initialize database in one call
    try {
      await fetch("/api/chat", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ greeting: randomGreeting }),
      });
    } catch (err) {
      console.error("Failed to reset and initialize chat history:", err);
    }

    // 3. Update client state
    setConversationHistory([{ role: "assistant", content: randomGreeting } as Message]);
    setIsStarted(true);

    // 4. Play greeting immediately
    speakText(randomGreeting, 0);
  };

  const handleTranscriptionComplete = async (text: string) => {
    setError("");
    
    // Stop any playing TTS audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setActiveSpeechIndex(null);

    // 1. Instantly show user message in local history
    setConversationHistory((prev) => [...prev, { role: "user", content: text } as Message]);
    setIsAiTyping(true);

    // 2. POST query to AI Chat Agent endpoint
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "सहायक से जवाब पाने में विफलता (Failed to receive AI response)");
      }

      // 3. Show AI response in conversation and trigger TTS play
      if (data.response) {
        setConversationHistory((prev) => {
          const updated: Message[] = [...prev, { role: "assistant", content: data.response } as Message];
          speakText(data.response, updated.length - 1);
          return updated;
        });
      }
    } catch (err: any) {
      console.error("Chat Agent Error:", err);
      setError(
        err.message || "सर्वर से कनेक्ट करने में त्रुटि। कृपया पुनः प्रयास करें। (Failed to connect to chat agent.)"
      );
    } finally {
      setIsAiTyping(false);
    }
  };

  const clearChatHistory = async () => {
    try {
      await fetch("/api/chat", { method: "DELETE" });
    } catch (err) {
      console.error("Failed to clear chat history:", err);
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setActiveSpeechIndex(null);
    setConversationHistory([]);
    setError("");
    setIsStarted(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-tr from-sky-50 via-white to-sky-100 flex flex-col justify-between font-sans">
      {/* Top Accent Flag Borders */}
      <div className="flex h-1.5 w-full">
        <div className="bg-[#FF9933] flex-1"></div>
        <div className="bg-white flex-1"></div>
        <div className="bg-[#138808] flex-1"></div>
      </div>

      {/* Main Content Dashboard */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100/50 p-6 md:p-8 flex flex-col items-center relative overflow-hidden">
          
          {/* Subtle design accents */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-full filter blur-2xl opacity-40 -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100 rounded-full filter blur-2xl opacity-40 -ml-16 -mb-16"></div>

          {/* App Header Banner */}
          <div className="text-center mb-6 w-full sticky top-0 z-50 bg-white/90 backdrop-blur-md py-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 flex items-center justify-center gap-2">
              <span className="text-[#FF9933]">जन</span>
              <span className="text-slate-400 font-light">-</span>
              <span className="text-[#138808]">साथी</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold tracking-wide mt-1 uppercase">
              Jan-Sathi Voice-First AI
            </p>
            <div className="h-[1px] bg-slate-100 w-24 mx-auto my-2" />
            <p className="text-sm text-slate-600 font-medium">
              सरकारी दस्तावेज़ों की सहायता (आधार, पैन, पासपोर्ट)
            </p>
            <p className="text-xxs text-slate-400 mt-0.5">
              Government Document Assistance (Aadhar, PAN, Passport)
            </p>
          </div>

          {!isStarted ? (
            /* Welcome / Start Screen */
            <div className="flex flex-col items-center justify-center py-10 w-full z-10">
              <div className="relative mb-8">
                {/* Triple pulsing rings */}
                <div className="absolute inset-0 bg-[#FF9933]/20 rounded-full animate-ping opacity-75 duration-1000"></div>
                <div className="absolute inset-2 bg-sky-200/50 rounded-full animate-pulse"></div>
                <div className="relative bg-gradient-to-tr from-[#FF9933] via-white to-[#138808] p-[3px] rounded-full shadow-lg">
                  <div className="bg-white rounded-full p-6 flex items-center justify-center w-24 h-24">
                    {/* Voice helper icon */}
                    <svg className="h-12 w-12 text-sky-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                    </svg>
                  </div>
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-800 text-center mb-2">
                नमस्ते! मैं हूँ आपका <span className="text-sky-600">जन-साथी</span>
              </h2>
              <p className="text-sm text-slate-500 text-center max-w-sm mb-8 leading-relaxed font-medium">
                सरकारी दस्तावेज़ों (जैसे आधार, पैन, पासपोर्ट) से संबंधित किसी भी सहायता के लिए आवाज़ से बातचीत शुरू करें।
              </p>

              <button
                onClick={handleStartConversation}
                className="relative group overflow-hidden bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 flex items-center gap-3 cursor-pointer"
              >
                {/* Light reflection effect */}
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
                
                <svg className="h-6 w-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
                </svg>
                <span>बातचीत शुरू करें</span>
              </button>
            </div>
          ) : (
            /* Chat Interface */
            <div className="w-full z-10">
              {/* Voice Recorder Component */}
              <div className="w-full mb-6 py-2 border-b border-slate-100">
                <VoiceRecorder onTranscriptionComplete={handleTranscriptionComplete} />
              </div>

              {/* Error Message Box */}
              {error && (
                <div className="w-full bg-red-50 border-l-4 border-red-500 rounded-lg p-3 mb-4 flex items-start gap-2 relative">
                  <div className="text-xs text-red-700 font-medium pr-5">{error}</div>
                  <button
                    onClick={() => setError("")}
                    className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Conversations Section */}
              <div className="w-full">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    बातचीत का इतिहास (Chat History)
                  </h3>
                  {conversationHistory.length > 0 && (
                    <button
                      onClick={clearChatHistory}
                      className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                    >
                      इतिहास साफ करें (Clear)
                    </button>
                  )}
                </div>

                <div className="w-full border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                  <ChatBox
                    messages={conversationHistory}
                    isAiTyping={isAiTyping}
                    activeSpeechIndex={activeSpeechIndex}
                    speakText={speakText}
                  />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="text-center py-4 text-[10px] text-slate-400 font-medium select-none">
        <p>© 2026 जन-साथी (Jan-Sathi). राष्ट्रीय डिजिटल ग्रामीण मिशन पहल</p>
        <p className="mt-0.5 text-[9px]">National Digital Rural Mission Initiative</p>
      </footer>
    </div>
  );
}
