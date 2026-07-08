"use client";

export default function CreditProgress({ creditsUsed = 0, creditLimit = 0.1 }) {
  const percentage = Math.min((creditsUsed / creditLimit) * 100, 100);
  const formattedUsed = creditsUsed.toFixed(3);
  const formattedLimit = creditLimit.toFixed(2);

  return (
    <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-2xl space-y-2.5">
      <div className="flex justify-between items-center text-xs font-bold text-slate-600">
        <span>क्रेडिट उपयोग (Credits)</span>
        <span>
          ${formattedUsed} / ${formattedLimit}
        </span>
      </div>
      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            percentage >= 90
              ? "bg-red-500 animate-pulse"
              : percentage >= 70
              ? "bg-amber-500"
              : "bg-green-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {percentage >= 90 && (
        <p className="text-[10px] text-red-500 font-bold leading-normal">
          ⚠ आपकी लिमिट खत्म होने वाली है।
        </p>
      )}
    </div>
  );
}
