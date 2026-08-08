"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useState, useEffect } from "react";

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();
  const premiumEase = [0.25, 1, 0.5, 1] as const;
  const animateY = shouldReduceMotion ? 0 : 20;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  const originalSlides = [
    "/images/heroslide/ChatGPT Image Aug 5, 2026, 01_14_39 PM.png",
    "/images/heroslide/ChatGPT Image Aug 5, 2026, 01_14_31 PM.png",
    "/images/heroslide/ChatGPT Image Aug 5, 2026, 01_14_27 PM.png"
  ];

  // Clone the first slide to the end for the seamless loop
  const extendedSlides = [...originalSlides, originalSlides[0]];

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setCurrentSlide((prev) => prev + 1);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Handle the seamless jump when reaching the cloned slide
  useEffect(() => {
    if (currentSlide === originalSlides.length) {
      const timeout = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentSlide(0);
      }, 700); // This must match the CSS transition duration
      return () => clearTimeout(timeout);
    }
  }, [currentSlide, originalSlides.length]);

  return (
    <section className="w-full relative px-4 pt-20 pb-4 md:p-0">

      {/* Mobile-Only Automatic Image Slider */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: premiumEase }}
        className="md:hidden w-full aspect-video sm:aspect-[21/9] relative rounded-lg overflow-hidden shadow-sm border border-gray-100 bg-gray-50"
      >
        {/* Sliding Track */}
        <div
          className={`flex w-full h-full ${isTransitioning ? 'transition-transform duration-700 ease-in-out' : ''}`}
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {extendedSlides.map((src, index) => (
            <div
              key={index}
              className="w-full h-full shrink-0 relative"
            >
              <Image
                src={src}
                fill
                alt={`Hero Slide ${index + 1}`}
                className="object-cover object-center"
                priority={index === 0}
              />
            </div>
          ))}
        </div>
        {/* Pagination Dots */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
          {originalSlides.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${index === (currentSlide % originalSlides.length) ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Desktop-Only Layout */}
      <div className="hidden md:flex max-w-[1400px] mx-auto px-4 md:px-8 pt-16 relative z-10 flex-row items-center justify-between gap-8 min-h-[500px]">

        {/* Left Content */}
        <div className="flex-1 z-10 py-6 overflow-hidden">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.2,
                  delayChildren: 0.1
                }
              }
            }}
            className="space-y-4"
          >
            <motion.h1
              variants={{
                hidden: { opacity: 0, y: animateY },
                visible: { opacity: 1, y: 0, transition: { duration: 1, ease: premiumEase } }
              }}
              className="text-6xl font-normal text-black leading-tight"
            >
              Baby's Growth, <br />
              <span className="text-[var(--color-primary)]"> Nutrition and Care</span> <br />
              in one place
            </motion.h1>

            <motion.p
              variants={{
                hidden: { opacity: 0, y: animateY },
                visible: { opacity: 1, y: 0, transition: { duration: 1, ease: premiumEase } }
              }}
              className="text-lg text-[#122B54] max-w-lg lg:max-w-[480px] leading-relaxed font-light"
            >
              Your all-in-one companion for your baby's growth, nutrition, health & happiness.
            </motion.p>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: animateY },
                visible: { opacity: 1, y: 0, transition: { duration: 1, ease: premiumEase } }
              }}
              className="flex flex-nowrap items-center gap-4 pt-2 w-auto"
            >
              <button className="justify-center bg-[#6495a3] text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-[#6495a3]/30 hover:bg-[#527d89] transition-all hover:-translate-y-0.5 flex items-center text-sm whitespace-nowrap">
                Explore Growth
              </button>
              <button className="justify-center bg-white text-gray-700 border border-gray-200 px-8 py-3 rounded-full font-bold shadow-sm hover:shadow-md hover:border-gray-300 transition-all hover:-translate-y-0.5 flex items-center text-sm whitespace-nowrap">
                Shop Essentials
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Right Content - Hero Image */}
        <div className="flex-1 relative w-full flex items-center justify-center h-[450px]">

          {/* Large Decorative Circle */}
          <div className="absolute inset-0 flex items-center justify-center -translate-y-4">
            <div className="w-[520px] h-[520px] bg-[#F6E9F7] rounded-full"></div>
          </div>

          {/* Image */}
          <div className="absolute -bottom-4 w-[500px] h-[500px]">
            <Image
              src="/hero.png"
              alt="Mother and Baby"
              fill
              className="object-contain object-bottom drop-shadow-xl"
              priority
            />
          </div>

        </div>
      </div>
    </section>
  );
}
