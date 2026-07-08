"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
  sessions = [],
  activeChatId,
  onSelectChat,
  onNewChat,
  creditsUsed = 0,
  creditLimit = 0.1,
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="w-full flex-1 flex flex-col md:flex-row relative overflow-hidden">
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-100 w-full z-30">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-50 cursor-pointer"
          aria-label="Toggle Menu"
        >
          <svg
            className="w-6 h-6 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <span className="text-lg font-extrabold tracking-tight text-slate-800">
          <span className="text-[#FF9933]">जन</span>
          <span className="text-slate-400 font-light">-</span>
          <span className="text-[#138808]">साथी</span>
        </span>
        <div className="w-10"></div> {/* Spacer for symmetry */}
      </div>

      {/* Backdrop overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/40 z-30 md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        sessions={sessions}
        activeChatId={activeChatId}
        onSelectChat={onSelectChat}
        onNewChat={onNewChat}
        creditsUsed={creditsUsed}
        creditLimit={creditLimit}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 min-w-0 bg-slate-50/50 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
