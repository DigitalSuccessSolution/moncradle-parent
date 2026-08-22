"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const slides = [
  {
    id: 1,
    image: "/images/splashscreen1.png",
    logo: "moncradle",
    tagline: "Nurturing Little Lives",
    title1: "Smart Care For",
    title2: "Little Ones",
    description: "Helping you nurture, track and celebrate every milestone of your baby."
  },
  {
    id: 2,
    image: "/images/splashscreen2.png",
    logo: "moncradle",
    tagline: "Healthy & Happy",
    title1: "Track Growth",
    title2: "Seamlessly",
    description: "Monitor milestones, vaccinations, and health records effortlessly."
  }
];

interface SplashScreenProps {
  onComplete?: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const handleComplete = () => {
    localStorage.setItem("hasSeenOnboarding", "true");

    // Unlock scroll
    document.body.style.overflow = "";
    document.body.style.position = "";
    document.body.style.width = "";
    document.body.style.height = "";
    document.body.style.top = "";
    document.body.style.left = "";

    setIsVisible(false);
    if (onComplete) onComplete();
  };

  useEffect(() => {
    setIsMounted(true);
    const hasSeen = localStorage.getItem("hasSeenOnboarding");

    // Show only on mobile devices
    const isMobile = window.innerWidth < 768;

    if (!hasSeen) {
      if (isMobile) {
        setIsVisible(true);
        // Lock scroll completely so main website is not scrollable/visible behind
        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.width = "100%";
        document.body.style.height = "100%";
        document.body.style.top = "0";
        document.body.style.left = "0";
      } else {
        // Bypass splash screen entirely on desktop and trigger auth flow
        handleComplete();
      }
    }

    // Cleanup in case of unmount
    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.top = "";
      document.body.style.left = "";
    };
  }, []);

  if (!isMounted || !isVisible) return null;

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col overflow-hidden h-[100dvh] w-full">

      {/* Full Screen Image Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={slide.image}
              alt="Onboarding"
              fill
              priority
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Gradient Shadow for Text Readability */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-none bg-gradient-to-t from-white via-white/90 to-transparent" style={{ backgroundSize: '100% 65%', backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom' }}></div>

      {/* Content wrapper anchored to bottom */}
      <div className="relative z-20 flex flex-col justify-end h-full w-full pointer-events-none">

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col items-center px-6 pointer-events-auto"
          >
            {/* Logo area */}
            <div className="flex flex-col items-center mb-4">
              <h1 className="text-[#3A3368] font-black tracking-widest text-lg md:text-xl mb-1">{slide.logo}</h1>
              <div className="flex items-center gap-2">
                <div className="w-6 h-[1px] bg-gray-300"></div>
                <p className="text-[10px] sm:text-xs text-[#3A3368] font-medium tracking-wide">{slide.tagline}</p>
                <div className="w-6 h-[1px] bg-gray-300"></div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center mb-3">
              <h2 className="text-2xl sm:text-[28px] leading-tight font-medium text-[#3A3368]">
                {slide.title1}
              </h2>
              <h2 className="text-3xl sm:text-[32px] leading-tight font-medium text-[#ED7A9C]">
                {slide.title2}
              </h2>
            </div>

            {/* Description */}
            <p className="text-center text-xs sm:text-sm text-gray-500 max-w-[280px] mx-auto mb-2 leading-relaxed font-medium">
              {slide.description}
            </p>

          </motion.div>
        </AnimatePresence>

        {/* Bottom Controls */}
        <div className="px-6 pb-8 pt-4 pointer-events-auto">
          {/* Pagination Dots */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {slides.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === idx
                  ? "w-4 bg-[#7E57C2]"
                  : "w-1.5 bg-[#D1CDE0]"
                  }`}
              />
            ))}
          </div>

          {/* Next / Get Started Button */}
          <button
            onClick={handleNext}
            className="w-full bg-[#ED7A9C] text-white text-base sm:text-lg font-semibold py-3.5 rounded-2xl shadow-[0_8px_30px_rgba(237,122,156,0.15)] border border-pink-50 active:scale-[0.98] transition-transform duration-200"
          >
            {currentSlide === slides.length - 1 ? "Get Started" : "Next"}
          </button>
        </div>

      </div>
    </div>
  );
}
