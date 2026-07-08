"use client";

import VoiceRecorder from "@/src/components/VoiceRecorder";
import { UserButton } from "@clerk/nextjs";

export default function VoiceControlCard({ handleTranscriptionComplete }) {
  return (
    <div className="w-full md:max-w-xs bg-white rounded-3xl shadow-xl border border-sky-100/50 p-6 flex flex-col items-center justify-center relative shrink-0">
      {/* Clerk Profile Control */}
      <div className="absolute top-4 right-4 z-[30]">
        <UserButton />
      </div>

      {/* Subtle design accents */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-sky-100 rounded-full filter blur-2xl opacity-35 -mr-12 -mt-12"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-100 rounded-full filter blur-2xl opacity-35 -ml-12 -mb-12"></div>

      {/* App Header Banner */}
      <div className="text-center mb-6 w-full z-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 flex items-center justify-center gap-1.5">
          <span className="text-[#FF9933]">जन</span>
          <span className="text-slate-400 font-light">-</span>
          <span className="text-[#138808]">साथी</span>
        </h1>
        <p className="text-[9px] text-slate-500 font-bold tracking-wide mt-0.5 uppercase">
          Voice Control Center
        </p>
        <div className="h-[1px] bg-slate-100 w-16 mx-auto my-1.5" />
        <p className="text-xs text-slate-500 font-medium">
          नमस्ते! मैं हूँ सुहानी
        </p>
      </div>

      {/* Voice Recorder Component */}
      <div className="w-full py-4 border-t border-b border-slate-100 flex flex-col items-center justify-center z-10">
        <VoiceRecorder onTranscriptionComplete={handleTranscriptionComplete} />
      </div>

      <p className="text-[10px] text-slate-400 text-center mt-4">
        माइक दबाएं और हिंदी में बात करें
      </p>
    </div>
  );
}
