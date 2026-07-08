"use client";

import useTtsPlayer from "@/src/hooks/useTtsPlayer";
import useChatHistory from "@/src/hooks/useChatHistory";
import DashboardLayout from "@/src/components/dashboard/DashboardLayout";
import WelcomeScreen from "@/src/components/dashboard/WelcomeScreen";
import VoiceControlCard from "@/src/components/dashboard/VoiceControlCard";
import ChatHistoryCard from "@/src/components/dashboard/ChatHistoryCard";

export default function Home() {
  const { activeSpeechIndex, speakText, playAudioUrl, stopPlayback } = useTtsPlayer();

  const {
    conversationHistory,
    isAiTyping,
    error,
    setError,
    isStarted,
    handleStartConversation,
    handleTranscriptionComplete,
    clearChatHistory,
    activeChatId,
    sessions,
    creditsUsed,
    creditLimit,
    selectChatSession,
    startNewChat,
  } = useChatHistory({
    playAudioUrl,
    speakText,
    stopPlayback,
  });

  const onClearClick = () => {
    stopPlayback();
    clearChatHistory();
  };

  return (
    <div className="h-screen bg-gradient-to-tr from-sky-50 via-white to-sky-100 flex flex-col justify-between font-sans overflow-hidden">
      {/* Top Accent Flag Borders */}
      <div className="flex h-1.5 w-full shrink-0">
        <div className="bg-[#FF9933] flex-1"></div>
        <div className="bg-white flex-1"></div>
        <div className="bg-[#138808] flex-1"></div>
      </div>

      {/* Main layout scaffold */}
      <DashboardLayout
        sessions={sessions}
        activeChatId={activeChatId}
        onSelectChat={selectChatSession}
        onNewChat={startNewChat}
        creditsUsed={creditsUsed}
        creditLimit={creditLimit}
      >
        {!isStarted ? (
          <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto">
            <WelcomeScreen onStart={handleStartConversation} />
          </main>
        ) : (
          <main className="flex-1 w-full max-w-5xl mx-auto p-4 md:px-6 md:py-8 md:pt-10 flex flex-col md:flex-row gap-6 items-stretch justify-center overflow-y-auto md:overflow-hidden h-full">
            {/* Left voice controls column */}
            <VoiceControlCard handleTranscriptionComplete={handleTranscriptionComplete} />

            {/* Right chat interface column */}
            <ChatHistoryCard
              conversationHistory={conversationHistory}
              isAiTyping={isAiTyping}
              activeSpeechIndex={activeSpeechIndex}
              speakText={speakText}
              error={error}
              setError={setError}
              onClearClick={onClearClick}
            />
          </main>
        )}
      </DashboardLayout>

      {/* Footer Branding */}
      <footer className="text-center py-3 text-[10px] text-slate-400 font-medium select-none shrink-0 border-t border-slate-100/50 bg-white/50">
        <p>© 2026 जन-साथी (Jan-Sathi). राष्ट्रीय डिजिटल ग्रामीण मिशन पहल</p>
        <p className="mt-0.5 text-[9px]">National Digital Rural Mission Initiative</p>
      </footer>
    </div>
  );
}
