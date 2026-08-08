"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header/Header";

import { Footer } from "@/components/layout/Footer/Footer";

import { HeroSection } from "@/components/home/HeroSection/HeroSection";
import { QuickActions } from "@/components/home/QuickActions/QuickActions";
import { GrowthOverview } from "@/components/home/GrowthOverview/GrowthOverview";
import { ProductRecommendations } from "@/components/home/ProductRecommendations/ProductRecommendations";
import { SmartParentingBanner } from "@/components/home/SmartParentingBanner/SmartParentingBanner";
import { Articles } from "@/components/home/Articles/Articles";
import { NewsletterSection } from "@/components/home/NewsletterSection/NewsletterSection";
import { HealthRecords } from "@/components/home/HealthRecords/HealthRecords";
import { SplashScreen } from "@/components/onboarding/SplashScreen";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { BabyProfileSetup } from "@/components/onboarding/BabyProfileSetup";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasSeenSplash, setHasSeenSplash] = useState<boolean>(false);
  const [hasSetBabyProfile, setHasSetBabyProfile] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    setHasSeenSplash(!!localStorage.getItem("hasSeenOnboarding"));
    setHasSetBabyProfile(!!localStorage.getItem("hasSetBabyProfile"));
  }, []);

  if (!isMounted || isLoading) return null;

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans overflow-x-hidden">
      <SplashScreen onComplete={() => setHasSeenSplash(true)} />
      
      {!isAuthenticated && hasSeenSplash && <AuthScreen />}

      {isAuthenticated && hasSeenSplash && !hasSetBabyProfile && (
        <BabyProfileSetup onComplete={() => setHasSetBabyProfile(true)} />
      )}

      <Header />

      <HeroSection />

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-12 space-y-8 md:space-y-16 pb-24 md:pb-12">
        <QuickActions />
        {/* <HealthRecords /> */}
        <GrowthOverview />
        <ProductRecommendations />
        
        <SmartParentingBanner />
        
        <Articles />
        
        <NewsletterSection />
      </main>

      <Footer />
      
      {/* Temporary Reset Button for Testing */}
      <div className="flex justify-center pb-24 pt-4">
        <button 
          onClick={() => {
            localStorage.removeItem("hasSeenOnboarding");
            localStorage.removeItem("hasSetBabyProfile");
            window.location.reload();
          }}
          className="text-xs bg-red-100 text-red-600 px-4 py-2 rounded-full font-bold shadow-sm"
        >
          Reset App State (Testing)
        </button>
      </div>

      
    </div>
  );
}
