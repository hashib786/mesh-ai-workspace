"use client";

import Image from "next/image";

export default function FeaturesSection() {
  const features = [
    {
      title: "सिर्फ बोलकर सवाल पूछें",
      description: "ग्रामीण भारत के लिए विशेष रूप से डिज़ाइन की गई आवाज़-प्रथम तकनीक। बिना किसी टाइपिंग झंझट के अपनी भाषा में बात करें।",
      image: "/assets/landing/feature-voice.png",
      borderColor: "border-orange-100",
      bgColor: "bg-orange-50/30",
      badgeColor: "bg-orange-500",
    },
    {
      title: "सरकारी कागज़ात की सटीक जानकारी",
      description: "आधार, पैन, और पासपोर्ट जैसे महत्वपूर्ण दस्तावेज़ों से जुड़ी हर प्रक्रिया की सही और आसान जानकारी सीधे पाएं।",
      image: "/assets/landing/feature-docs.png",
      borderColor: "border-sky-100",
      bgColor: "bg-sky-50/30",
      badgeColor: "bg-sky-500",
    },
    {
      title: "दलालों से बचाव",
      description: "सीधे आधिकारिक स्रोतों से जानकारी प्राप्त करें और किसी भी प्रकार की धोखाधड़ी या अतिरिक्त शुल्क देने से बचें।",
      icon: (
        <div className="w-full h-48 bg-gradient-to-tr from-green-500 to-emerald-600 rounded-2xl flex flex-col items-center justify-center text-white shadow-inner p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8"></div>
          <svg className="w-16 h-16 stroke-current mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span className="font-extrabold text-lg tracking-wide uppercase">100% सुरक्षित</span>
        </div>
      ),
      borderColor: "border-green-100",
      bgColor: "bg-green-50/30",
      badgeColor: "bg-green-600",
    },
  ];

  return (
    <section className="py-20 px-6 bg-white relative">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800">
            मुख्य <span className="text-[#FF9933]">विशेषताएं</span>
          </h2>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">
            Jan-Sathi Benefits
          </p>
          <div className="h-1 bg-gradient-to-r from-orange-400 via-yellow-400 to-green-500 w-24 mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, index) => (
            <div
              key={index}
              className={`border ${feat.borderColor} ${feat.bgColor} rounded-3xl p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
            >
              <div className="space-y-6">
                {/* Visual Header */}
                {feat.image ? (
                  <div className="relative w-full h-48 bg-white rounded-2xl overflow-hidden shadow-inner border border-slate-100">
                    <Image
                      src={feat.image}
                      alt={feat.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  feat.icon
                )}

                {/* Info */}
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${feat.badgeColor}`}></span>
                    {feat.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-medium">
                    {feat.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
