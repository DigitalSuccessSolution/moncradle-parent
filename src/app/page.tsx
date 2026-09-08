"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { HeroSection } from "@/components/home/HeroSection/HeroSection";
import { QuickActions } from "@/components/home/QuickActions/QuickActions";
import { HowMoncradleWorks } from "@/components/home/HowMoncradleWorks/HowMoncradleWorks";
import { HowItWorks } from "@/components/home/HowItWorks/HowItWorks";
import { GrowthOverview } from "@/components/home/GrowthOverview/GrowthOverview";
import { MealRecommendations } from "@/components/home/MealRecommendations/MealRecommendations";
import { ProductRecommendations } from "@/components/home/ProductRecommendations/ProductRecommendations";
// import { WhatMakesUsDifferent } from "@/components/home/WhatMakesUsDifferent/WhatMakesUsDifferent";
import { ExpertConsultation } from "@/components/home/ExpertConsultation/ExpertConsultation";
import { Articles } from "@/components/home/Articles/Articles";
import { SplashScreen } from "@/components/onboarding/SplashScreen";
// import { StaffPortals } from "@/components/layout/StaffPortals/StaffPortals";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { BabyProfileSetup } from "@/components/onboarding/BabyProfileSetup";
import { ParentProfileSetup } from "@/components/onboarding/ParentProfileSetup";
import { useAuth } from "@/context/AuthContext";
import { getBabies } from "@/lib/api/babiesApi";

import toast from "react-hot-toast";

export default function HomePage() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [hasSeenSplash, setHasSeenSplash] = useState<boolean>(false);
  const [hasSetParentProfile, setHasSetParentProfile] = useState<boolean>(false);
  const [hasSetBabyProfile, setHasSetBabyProfile] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
    setHasSeenSplash(!!localStorage.getItem("hasSeenOnboarding"));
  }, []);

  // Handle "Press back again to exit" on Android/PWA
  useEffect(() => {
    if (!isMounted) return;

    let backPressCount = 0;
    let backPressTimer: NodeJS.Timeout;

    const handlePopState = (event: PopStateEvent) => {
      if (backPressCount === 0) {
        // Prevent default exit by pushing state back
        window.history.pushState(null, "", window.location.pathname);
        backPressCount++;
        toast("Press back again to exit", {
          position: 'bottom-center',
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '100px',
            fontSize: '14px',
            padding: '10px 20px',
            marginBottom: '60px'
          }
        });

        backPressTimer = setTimeout(() => {
          backPressCount = 0;
        }, 2000);
      } else {
        // Let it exit normally on second press
        window.history.back();
      }
    };

    // Push initial state so the first back press is trapped
    window.history.pushState(null, "", window.location.pathname);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      clearTimeout(backPressTimer);
    };
  }, [isMounted]);

  useEffect(() => {
    const checkProfiles = async () => {
      if (!isAuthenticated) return;

      // 1. Check Parent Profile (Name)
      if (user?.name) {
        setHasSetParentProfile(true);
        localStorage.setItem("hasSetParentProfile", "true");
      } else {
        const localParentStatus = localStorage.getItem("hasSetParentProfile");
        if (localParentStatus) setHasSetParentProfile(true);
      }

      // 2. Check Baby Profile
      const localBabyStatus = localStorage.getItem("hasSetBabyProfile");
      if (localBabyStatus) {
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
    checkProfiles();
  }, [isAuthenticated, user]);

  if (!isMounted || isLoading) return null;

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans overflow-x-clip relative">
      <SplashScreen onComplete={() => setHasSeenSplash(true)} />

      {!isAuthenticated && hasSeenSplash && <AuthScreen />}

      {isAuthenticated && hasSeenSplash && !hasSetParentProfile && (
        <ParentProfileSetup onComplete={() => setHasSetParentProfile(true)} />
      )}

      {isAuthenticated && hasSeenSplash && hasSetParentProfile && !hasSetBabyProfile && (
        <BabyProfileSetup onComplete={() => setHasSetBabyProfile(true)} />
      )}

      <HeroSection />

      <main className="max-w-[1400px] mx-auto px-3.5 sm:px-4 md:px-8 py-3 sm:py-5 md:py-8 space-y-6 sm:space-y-8 md:space-y-12 pb-28 md:pb-12">
        {/* 1. Quick Icon Actions */}
        <QuickActions />

        {/* 2. Visual Platform Explainer: How Moncradle Cares for Your Baby (With Real Images) */}
        <HowMoncradleWorks />

        {/* 3. Growth Velocity & Milestone Progress */}
        <GrowthOverview />

        {/* 4. Fresh Purees & Meals Recommendations */}
        <MealRecommendations />

        {/* 5. Subscription & Delivery: How it Works (3 Steps) */}
        <HowItWorks />

        {/* 6. Curated Baby Essentials */}
        <ProductRecommendations />

        {/* 7. What Makes Moncradle Different (Product Lineup & Benefit Badges) */}
        {/* <WhatMakesUsDifferent /> */}

        {/* 8. Consult Top Pediatricians */}
        <ExpertConsultation />

        {/* 9. Parenting Tips & Articles */}
        <Articles />
      </main>

      {/* <StaffPortals /> */}
    </div>
  );
}
