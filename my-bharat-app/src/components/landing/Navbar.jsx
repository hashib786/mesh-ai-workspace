"use client";

import Link from "next/link";
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header className="w-full bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo / Brand Name */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-extrabold tracking-tight text-slate-800">
            <span className="text-[#FF9933]">जन</span>
            <span className="text-slate-400 font-light">-</span>
            <span className="text-[#138808]">साथी</span>
          </span>
          <span className="text-[10px] text-slate-500 font-bold bg-slate-100 px-2 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
            Beta
          </span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer">
                Login
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all transform active:scale-95 duration-200 cursor-pointer">
                Sign Up
              </button>
            </SignUpButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/app"
              className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer mr-2"
            >
              Go to Dashboard
            </Link>
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
