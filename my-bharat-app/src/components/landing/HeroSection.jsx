"use client";

import Link from "next/link";
import Image from "next/image";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-50/40 via-white to-green-50/20 py-16 md:py-24 px-6">
      {/* Decorative background blur objects */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-100 rounded-full filter blur-3xl opacity-30 -mr-20 -mt-20"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-100 rounded-full filter blur-3xl opacity-30 -ml-20 -mb-20"></div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Side: Content */}
        <div className="md:col-span-7 space-y-6 text-left">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            नयी शुरुआत
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 leading-tight">
            मिलिए <span className="text-[#FF9933]">सुहानी</span> से, <br />
            आपकी <span className="text-[#138808]">24x7</span> सरकारी डिजिटल साथी।
          </h1>
          <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-xl">
            आधार, पैन या पासपोर्ट—किसी भी सरकारी काम की जानकारी अब सिर्फ बोलकर पाएं। ना टाइप करने की झंझट, ना दलालों का डर।
          </p>
          <div className="pt-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-lg px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all transform active:scale-95 duration-200 cursor-pointer"
            >
              <svg className="w-6 h-6 stroke-current" fill="none" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
              </svg>
              <span>सुहानी से बात करें</span>
            </Link>
          </div>
        </div>

        {/* Right Side: Image */}
        <div className="md:col-span-5 flex justify-center relative">
          <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white/50 backdrop-blur-sm transform hover:scale-105 transition-transform duration-300">
            <Image
              src="/assets/landing/hero-suhani.png"
              alt="Suhani - Your Digital Assistant"
              fill
              priority
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
