import Navbar from "@/src/components/landing/Navbar";
import HeroSection from "@/src/components/landing/HeroSection";
import FeaturesSection from "@/src/components/landing/FeaturesSection";
import Footer from "@/src/components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <HeroSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}
