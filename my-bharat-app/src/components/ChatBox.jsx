"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";

export default function ChatBox({ messages, isAiTyping, activeSpeechIndex, speakText }) {
  const messagesEndRef = useRef(null);
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Auto scroll to bottom when messages or typing state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  const copyToClipboard = (text, index) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full flex flex-col h-full">
      {/* Scrollable messages area */}
      <div className="w-full h-full min-h-[200px] overflow-y-auto px-1 py-3 space-y-4 flex flex-col scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 select-none py-10">
            <svg className="h-10 w-10 stroke-current opacity-40 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.625.625 0 11-1.25 0 .625.625 0 011.25 0zm4.5 0a.625.625 0 11-1.25 0 .625.625 0 011.25 0zm4.5 0a.625.625 0 11-1.25 0 .625.625 0 011.25 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-5.108 4.062-9.25 9.25-9.25s9.25 4.142 9.25 9.25-4.062 9.25-9.25 9.25a9.253 9.253 0 01-5.382-1.728l-3.211.803 1.073-3.211A9.233 9.233 0 012.25 12z" />
            </svg>
            <p className="text-sm font-medium">कोई बातचीत नहीं हुई है।</p>
            <p className="text-xxs text-slate-400">No conversation history. Speak above to start.</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={index}
                className={`flex flex-col max-w-[85%] ${
                  isUser ? "self-end items-end" : "self-start items-start"
                }`}
              >
                {/* Bubble content and soundwave container */}
                <div className="flex items-center gap-2 w-full">
                  <div
                    className={`p-4 rounded-2xl text-base font-medium shadow-sm leading-relaxed ${
                      isUser
                        ? "bg-sky-100 text-sky-950 rounded-br-none whitespace-pre-wrap"
                        : "bg-emerald-50 text-emerald-950 border border-emerald-100 rounded-bl-none"
                    }`}
                  >
                    {isUser ? (
                      msg.content
                    ) : (
                      <ReactMarkdown
                        components={{
                          p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-2" {...props} />,
                          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-2" {...props} />,
                          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-bold text-emerald-950" {...props} />
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>

                  {/* soundwave playing indicator for AI bubble */}
                  {!isUser && activeSpeechIndex === index && (
                    <div className="flex items-end gap-[3px] h-5 justify-center bg-emerald-50 border border-emerald-100 rounded-full shadow-sm px-2 py-1.5 shrink-0 self-center">
                      <span className="w-[3px] bg-emerald-600 rounded-full animate-soundwave-1 h-1"></span>
                      <span className="w-[3px] bg-emerald-600 rounded-full animate-soundwave-2 h-1"></span>
                      <span className="w-[3px] bg-emerald-600 rounded-full animate-soundwave-3 h-1"></span>
                    </div>
                  )}
                </div>

                {/* Bubble Action buttons */}
                <div className="flex gap-2.5 mt-1 px-1">
                  {/* Read Aloud (Only for AI) */}
                  {!isUser && (
                    <button
                      onClick={() => speakText(msg.content, index)}
                      className={`text-[10px] font-bold transition-all cursor-pointer ${
                        activeSpeechIndex === index ? "text-red-500 hover:text-red-600" : "text-sky-600 hover:text-sky-700"
                      }`}
                      title={activeSpeechIndex === index ? "रोकें (Stop)" : "सुनें (Listen)"}
                    >
                      {activeSpeechIndex === index ? "रोकें (Stop)" : "सुनें (Listen)"}
                    </button>
                  )}

                  {/* Copy Button */}
                  <button
                    onClick={() => copyToClipboard(msg.content, index)}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-all cursor-pointer mr-1"
                    title="Copy text"
                  >
                    {copiedIndex === index ? "कॉपी हुआ!" : "कॉपी करें (Copy)"}
                  </button>

                  {/* Cost display */}
                  {!isUser && msg.cost !== undefined && msg.cost > 0 && (
                    <span className="text-[10px] text-slate-400 font-medium select-none">
                      • लागत (Cost): ${msg.cost.toFixed(3)}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Dynamic AI typing indicator */}
        {isAiTyping && (
          <div className="flex flex-col max-w-[85%] self-start items-start">
            <div className="bg-emerald-50 border border-emerald-100 text-slate-500 rounded-2xl rounded-bl-none p-4 flex items-center space-x-1 shadow-sm">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold mt-1 px-1">जन-साथी सोच रहा है... (Thinking...)</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
