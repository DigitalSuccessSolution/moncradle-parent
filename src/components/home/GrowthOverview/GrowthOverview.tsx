"use client";

import { TrendingUp, Brain, ShieldCheck, Scale, Ruler, Star, ChevronsRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
export function GrowthOverview() {
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1], staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] } }
  };

  return (
    <section className="w-full">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex flex-col xl:flex-row items-center justify-between gap-6 md:gap-12 xl:gap-8 w-full"
      >
        {/* Left Side: Text Content */}
        <div className="flex-1 w-full flex flex-col items-center xl:items-start text-center xl:text-left justify-center py-2 md:py-6">



          {/* Mobile Heading */}
          <motion.h2 variants={itemVariants} className="md:hidden text-2xl font-semibold text-black leading-tight">
            Baby's Growth Journey
          </motion.h2>
          
          {/* Desktop Heading */}
          <motion.h2 variants={itemVariants} className="hidden md:block text-4xl lg:text-5xl font-normal text-black leading-tight mb-4">
            Watch Every Milestone <br />
            <span className="text-[var(--color-primary)]">Step By Step</span>
          </motion.h2>

          <motion.p variants={itemVariants} className="hidden md:block text-sm md:text-base text-gray-500 max-w-[400px] leading-relaxed font-medium mb-6 xl:mb-0 mx-auto xl:mx-0">
            From tiny beginnings to big achievements, seamlessly track how your little one is growing, learning, and shining every single day.
          </motion.p>

        </div>

        {/* Right Side: Before/After Cards */}
        <div className="flex-[1.2] w-full relative flex flex-row items-stretch justify-center gap-2 sm:gap-6 lg:gap-8 mt-4 md:mt-8 lg:mt-0">

          {/* Center Arrow Connector */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center text-[var(--color-primary)]">
            <ChevronsRight className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 opacity-80" />
          </div>

          {/* BEFORE CARD */}
          <motion.div variants={itemVariants} className="flex-1 w-full max-w-[50%] md:max-w-[300px] bg-white rounded-lg p-2.5 sm:p-5 shadow-[var(--shadow-soft)] border border-gray-100 flex flex-col relative z-10 transition-transform hover:-translate-y-1 duration-300">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3 mb-2.5 sm:mb-4">
              <div className="inline-flex bg-[var(--pastel-coral)]/10 text-[var(--pastel-coral)] font-semibold text-[8px] sm:text-[10px] tracking-widest px-2 sm:px-3 py-0.5 sm:py-1 rounded-md uppercase">Before</div>
              <h3 className="font-semibold text-gray-800 text-[10px] sm:text-sm md:text-base">At 3 Months</h3>
            </div>

            {/* Image */}
            <div className="w-full h-[110px] sm:h-[180px] md:h-[200px] relative rounded-lg overflow-hidden mb-3 sm:mb-5 bg-gray-50">
              <Image src="/images/before_baby_3m.png" alt="Before" fill className="object-cover object-center" />
            </div>

            {/* Stats Container */}
            <div className="flex items-center justify-between pt-1 sm:pt-2">
              <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5 flex-1">
                <div className="text-[var(--pastel-coral)]"><Scale className="w-3 h-3 sm:w-4 sm:h-4" /></div>
                <span className="font-semibold text-[9px] sm:text-xs text-gray-800">5.2 kg</span>
                <span className="text-[7px] sm:text-[9px] font-medium text-gray-400 uppercase">Weight</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5 flex-1 px-0.5 sm:px-1">
                <div className="text-[var(--pastel-coral)]"><Ruler className="w-3 h-3 sm:w-4 sm:h-4" /></div>
                <span className="font-semibold text-[9px] sm:text-xs text-gray-800">58 cm</span>
                <span className="text-[7px] sm:text-[9px] font-medium text-gray-400 uppercase">Height</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5 flex-1">
                <div className="text-[var(--pastel-coral)]"><Star className="w-3 h-3 sm:w-4 sm:h-4" /></div>
                <span className="font-semibold text-[9px] sm:text-xs text-gray-800 leading-[1.1]">Just starting</span>
                <span className="text-[7px] sm:text-[9px] font-medium text-gray-400 uppercase">Milestones</span>
              </div>
            </div>
          </motion.div>

          {/* AFTER CARD */}
          <motion.div variants={itemVariants} className="flex-1 w-full max-w-[50%] md:max-w-[300px] bg-white rounded-lg p-2.5 sm:p-5 shadow-[var(--shadow-soft)] border border-gray-100 flex flex-col relative z-10 transition-transform hover:-translate-y-1 duration-300">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1.5 sm:gap-3 mb-2.5 sm:mb-4">
              <div className="inline-flex bg-[var(--pastel-green)]/10 text-[var(--pastel-green)] font-semibold text-[8px] sm:text-[10px] tracking-widest px-2 sm:px-3 py-0.5 sm:py-1 rounded-md uppercase">After</div>
              <h3 className="font-semibold text-gray-800 text-[10px] sm:text-sm md:text-base">At 12 Months</h3>
            </div>

            {/* Image */}
            <div className="w-full h-[110px] sm:h-[180px] md:h-[200px] relative rounded-lg overflow-hidden mb-3 sm:mb-5 bg-gray-50">
              <Image src="/images/hero_baby.png" alt="After" fill className="object-cover object-center" />
            </div>

            {/* Stats Container */}
            <div className="flex items-center justify-between pt-1 sm:pt-2">
              <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5 flex-1">
                <div className="text-[var(--pastel-green)]"><Scale className="w-3 h-3 sm:w-4 sm:h-4" /></div>
                <span className="font-semibold text-[9px] sm:text-xs text-gray-800">9.6 kg</span>
                <span className="text-[7px] sm:text-[9px] font-medium text-gray-400 uppercase">Weight</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5 flex-1 px-0.5 sm:px-1">
                <div className="text-[var(--pastel-green)]"><Ruler className="w-3 h-3 sm:w-4 sm:h-4" /></div>
                <span className="font-semibold text-[9px] sm:text-xs text-gray-800">76 cm</span>
                <span className="text-[7px] sm:text-[9px] font-medium text-gray-400 uppercase">Height</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1 sm:gap-1.5 flex-1">
                <div className="text-[var(--pastel-green)]"><Star className="w-3 h-3 sm:w-4 sm:h-4" /></div>
                <span className="font-semibold text-[9px] sm:text-[10px] text-gray-800 leading-[1.1] pb-0.5">Walking,<br />Babbling</span>
                <span className="text-[7px] sm:text-[9px] font-medium text-gray-400 uppercase">Milestones</span>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
