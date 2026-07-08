"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-slate-50 border-t border-slate-100 mt-auto">
      {/* Tricolor accent line at the top of footer */}
      <div className="flex h-1.5 w-full">
        <div className="bg-[#FF9933] flex-1"></div>
        <div className="bg-white flex-1"></div>
        <div className="bg-[#138808] flex-1"></div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left Side: Copyright */}
        <div className="text-sm font-medium text-slate-500 text-center md:text-left">
          <p>© {currentYear} जन-साथी (Jan-Sathi). सर्वाधिकार सुरक्षित।</p>
          <p className="text-xs text-slate-400 mt-0.5">राष्ट्रीय डिजिटल ग्रामीण मिशन पहल</p>
        </div>

        {/* Right Side: Made with love in India */}
        <div className="flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
          <span>मेड विथ</span>
          <span className="text-red-500 text-base">❤️</span>
          <span>इन इंडिया</span>
        </div>
      </div>
    </footer>
  );
}
