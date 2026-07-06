"use client";

import { useState, useEffect } from "react";
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

  // Load persistent chat history from database on load
  useEffect(() => {
    async function loadHistory() {
      try {
        const response = await fetch("/api/chat");
        const data = await response.json();
        if (response.ok && data.history) {
          setConversationHistory(data.history);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
      }
    }
    loadHistory();
  }, []);

  const handleTranscriptionComplete = async (text: string) => {
    setError("");
    
    // 1. Instantly show user message in local history
    setConversationHistory((prev) => [...prev, { role: "user", content: text }]);
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

      // 3. Show AI response in conversation
      if (data.response) {
        setConversationHistory((prev) => [...prev, { role: "assistant", content: data.response }]);
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
    // Optional utility: Clear chat is convenient for testing/resetting state.
    // For this prototype, we'll reset client state.
    setConversationHistory([]);
    setError("");
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
          <div className="text-center mb-6 w-full">
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
                  className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors"
                >
                  इतिहास साफ करें (Clear)
                </button>
              )}
            </div>

            <div className="w-full border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
              <ChatBox messages={conversationHistory} isAiTyping={isAiTyping} />
            </div>
          </div>

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
