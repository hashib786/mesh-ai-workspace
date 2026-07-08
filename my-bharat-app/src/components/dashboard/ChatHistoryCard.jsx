"use client";

import ChatBox from "@/src/components/ChatBox";

export default function ChatHistoryCard({
  conversationHistory,
  isAiTyping,
  activeSpeechIndex,
  speakText,
  error,
  setError,
  onClearClick,
}) {
  return (
    <div className="flex-1 bg-white rounded-3xl shadow-xl border border-sky-100/50 p-6 flex flex-col justify-between overflow-hidden relative min-h-[350px] md:h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-slate-100 shrink-0">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          बातचीत का इतिहास (Chat History)
        </h3>
        {conversationHistory.length > 0 && (
          <button
            onClick={onClearClick}
            className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            इतिहास साफ करें (Clear)
          </button>
        )}
      </div>

      {/* Error Box */}
      {error && (
        <div className="w-full bg-red-50 border-l-4 border-red-500 rounded-lg p-3 mb-3 flex items-start gap-2 relative shrink-0">
          <div className="text-xs text-red-700 font-medium pr-5">{error}</div>
          <button
            onClick={() => setError("")}
            className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-hidden bg-slate-50/50 border border-slate-100 rounded-2xl p-4 flex flex-col">
        <ChatBox
          messages={conversationHistory}
          isAiTyping={isAiTyping}
          activeSpeechIndex={activeSpeechIndex}
          speakText={speakText}
        />
      </div>
    </div>
  );
}
