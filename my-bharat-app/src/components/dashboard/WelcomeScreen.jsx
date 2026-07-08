"use client";

import { UserButton } from "@clerk/nextjs";

export default function WelcomeScreen({ onStart }) {
  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-sky-100/50 p-6 md:p-8 flex flex-col items-center relative overflow-hidden">
      {/* Clerk Profile Control */}
      <div className="absolute top-4 right-4 z-[30]">
        <UserButton />
      </div>

      {/* Subtle design accents */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-sky-100 rounded-full filter blur-2xl opacity-40 -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-100 rounded-full filter blur-2xl opacity-40 -ml-16 -mb-16"></div>

      {/* App Header Banner */}
      <div className="text-center mb-6 w-full py-3 z-10">
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
      </div>

      {/* Start Button & Icon */}
      <div className="flex flex-col items-center justify-center py-6 w-full z-10">
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-[#FF9933]/20 rounded-full animate-ping opacity-75 duration-1000"></div>
          <div className="absolute inset-2 bg-sky-200/50 rounded-full animate-pulse"></div>
          <div className="relative bg-gradient-to-tr from-[#FF9933] via-white to-[#138808] p-[3px] rounded-full shadow-lg">
            <div className="bg-white rounded-full p-6 flex items-center justify-center w-24 h-24">
              <svg
                className="h-12 w-12 text-sky-600 animate-bounce"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
                />
              </svg>
            </div>
          </div>
        </div>

        <h2 className="text-2xl font-black text-slate-800 text-center mb-2">
          नमस्ते! मैं हूँ <span className="text-sky-600">सुहानी</span>, आपकी जन-साथी
        </h2>
        <p className="text-sm text-slate-500 text-center max-w-sm mb-8 leading-relaxed font-medium">
          सरकारी दस्तावेज़ों (जैसे आधार, पैन, पासपोर्ट) से संबंधित किसी भी सहायता के लिए आवाज़ से बातचीत शुरू करें।
        </p>

        <button
          onClick={onStart}
          className="relative group overflow-hidden bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-600 hover:to-emerald-600 text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-95 flex items-center gap-3 cursor-pointer"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
          <svg
            className="h-6 w-6 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z"
            />
          </svg>
          <span>बातचीत शुरू करें</span>
        </button>
      </div>
    </div>
  );
}
