"use client";

import CreditProgress from "./CreditProgress";

export default function Sidebar({
  sessions = [],
  activeChatId,
  onSelectChat,
  onNewChat,
  creditsUsed = 0,
  creditLimit = 0.1,
  isOpen,
  onClose,
}) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-100 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static md:shrink-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex-1 flex flex-col p-4 overflow-hidden space-y-4">
        {/* New Chat Button */}
        <button
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-sm py-3 px-4 rounded-xl shadow-sm hover:shadow transition-all duration-200 transform active:scale-95 cursor-pointer"
        >
          <svg
            className="w-5 h-5 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span>नया चैट (New Chat)</span>
        </button>

        {/* Scrollable list of chats */}
        <div className="flex-1 overflow-y-auto space-y-1.5 scrollbar-thin pr-1">
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">
            पिछली बातचीत (Past Chats)
          </h3>
          {sessions.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-6">
              कोई इतिहास नहीं है
            </div>
          ) : (
            sessions.map((sess) => (
              <button
                key={sess.chatId}
                onClick={() => {
                  onSelectChat(sess.chatId);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all truncate block cursor-pointer ${
                  activeChatId === sess.chatId
                    ? "bg-orange-50 text-orange-700 border-l-4 border-orange-500 font-bold"
                    : "hover:bg-slate-50 text-slate-600"
                }`}
              >
                {sess.title || "बिना नाम की चैट"}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Credit Progress at bottom */}
      <div className="p-4 border-t border-slate-100">
        <CreditProgress creditsUsed={creditsUsed} creditLimit={creditLimit} />
      </div>
    </aside>
  );
}
