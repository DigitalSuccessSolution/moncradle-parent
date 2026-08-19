"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";




import { HeroSection } from "@/components/home/HeroSection/HeroSection";
import { QuickActions } from "@/components/home/QuickActions/QuickActions";
import { GrowthOverview } from "@/components/home/GrowthOverview/GrowthOverview";
import { ProductRecommendations } from "@/components/home/ProductRecommendations/ProductRecommendations";
import { MealRecommendations } from "@/components/home/MealRecommendations/MealRecommendations";
import { SmartParentingBanner } from "@/components/home/SmartParentingBanner/SmartParentingBanner";
import { ExpertConsultation } from "@/components/home/ExpertConsultation/ExpertConsultation";
import { Articles } from "@/components/home/Articles/Articles";
import { HealthRecords } from "@/components/home/HealthRecords/HealthRecords";
import { SplashScreen } from "@/components/onboarding/SplashScreen";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { BabyProfileSetup } from "@/components/onboarding/BabyProfileSetup";
import { useAuth } from "@/context/AuthContext";
import { getBabies } from "@/lib/api/babiesApi";

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [hasSeenSplash, setHasSeenSplash] = useState<boolean>(false);
  const [hasSetBabyProfile, setHasSetBabyProfile] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    setHasSeenSplash(!!localStorage.getItem("hasSeenOnboarding"));
  }, []);

  useEffect(() => {
    const checkBabyProfile = async () => {
      // Don't check if we are not authenticated yet
      if (!isAuthenticated) return;

      const localStatus = localStorage.getItem("hasSetBabyProfile");
      if (localStatus) {
        setHasSetBabyProfile(true);
      } else {
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const res = await getBabies();
            if (res.data && res.data.length > 0) {
              localStorage.setItem("hasSetBabyProfile", "true");
              setHasSetBabyProfile(true);
            }
          } catch (error) {
            console.error("Failed to fetch babies", error);
          }
        }
      }
    };
    checkBabyProfile();
  }, [isAuthenticated]);

  if (!isMounted || isLoading) return null;

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans overflow-x-hidden relative">
      <SplashScreen onComplete={() => setHasSeenSplash(true)} />

      {!isAuthenticated && hasSeenSplash && <AuthScreen />}

      {isAuthenticated && hasSeenSplash && !hasSetBabyProfile && (
        <BabyProfileSetup onComplete={() => setHasSetBabyProfile(true)} />
      )}

      

      <HeroSection />

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 md:py-12 space-y-8 md:space-y-16 pb-24 md:pb-12">
        <QuickActions />
        {/* <HealthRecords /> */}
        <GrowthOverview />
        <ProductRecommendations />
        <MealRecommendations />

        <SmartParentingBanner />

        <ExpertConsultation />

        <Articles />
      </main>

      




    </div>
  );
}
