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
        className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 border border-slate-100 shadow-xs flex flex-col xl:flex-row items-center justify-between gap-6 md:gap-8 xl:gap-12 w-full"
      >
        {/* Left Side: Text Content */}
        <div className="flex-1 w-full flex flex-col items-center xl:items-start text-center xl:text-left justify-center space-y-3">
          
          <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-normal text-black leading-tight">
            Watch Every Milestone <br />
            Step By Step
          </motion.h2>

          <motion.p variants={itemVariants} className="text-sm md:text-base text-gray-500 font-light max-w-md leading-relaxed">
            From tiny beginnings to big achievements, seamlessly track how your little one is growing, learning, and shining every single day.
          </motion.p>

          <div className="pt-2">
            <a href="/growth" className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-[var(--color-primary)] hover:brightness-95 hover:-translate-y-0.5 text-white text-sm font-semibold transition-all shadow-xs">
              <span>Explore Growth Tracker</span>
              <ChevronsRight className="w-4 h-4" />
            </a>
          </div>

        </div>

        {/* Right Side: Before/After Cards */}
        <div className="flex-[1.2] w-full relative flex flex-row items-stretch justify-center gap-2.5 sm:gap-4 md:gap-6">

          {/* Center Arrow Connector */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 text-[var(--color-primary)]">
            <ChevronsRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          {/* BEFORE CARD */}
          <motion.div variants={itemVariants} className="flex-1 w-full max-w-[50%] md:max-w-[280px] bg-slate-50/60 rounded-2xl p-3 sm:p-4 shadow-2xs border border-slate-100 flex flex-col relative z-10 transition-transform hover:-translate-y-1 duration-300">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-2.5">
              <span className="bg-orange-100 text-orange-700 font-semibold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase">Stage 1</span>
              <h3 className="font-semibold text-slate-800 text-xs sm:text-sm">At 3 Months</h3>
            </div>

            {/* Image */}
            <div className="w-full h-[110px] sm:h-[150px] md:h-[170px] relative rounded-xl overflow-hidden mb-2.5 bg-white border border-slate-100 shadow-2xs">
              <Image src="/images/before_baby_3m.png" alt="Before" fill className="object-cover object-center" />
            </div>

            {/* Stats Container */}
            <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-200/60 text-center">
              <div className="flex flex-col items-center">
                <Scale className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-semibold text-[11px] text-slate-800 mt-0.5">5.2 kg</span>
                <span className="text-[8px] font-medium text-slate-400 uppercase">Weight</span>
              </div>
              <div className="flex flex-col items-center border-x border-slate-200/60 px-0.5">
                <Ruler className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-semibold text-[11px] text-slate-800 mt-0.5">58 cm</span>
                <span className="text-[8px] font-medium text-slate-400 uppercase">Height</span>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-3.5 h-3.5 text-orange-500" />
                <span className="font-semibold text-[11px] text-slate-800 mt-0.5">Head Lift</span>
                <span className="text-[8px] font-medium text-slate-400 uppercase">Milestone</span>
              </div>
            </div>
          </motion.div>

          {/* AFTER CARD */}
          <motion.div variants={itemVariants} className="flex-1 w-full max-w-[50%] md:max-w-[280px] bg-slate-50/60 rounded-2xl p-3 sm:p-4 shadow-2xs border border-slate-100 flex flex-col relative z-10 transition-transform hover:-translate-y-1 duration-300">
            {/* Header Row */}
            <div className="flex items-center justify-between mb-2.5">
              <span className="bg-emerald-100 text-emerald-700 font-semibold text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full uppercase">Stage 2</span>
              <h3 className="font-semibold text-slate-800 text-xs sm:text-sm">At 12 Months</h3>
            </div>

            {/* Image */}
            <div className="w-full h-[110px] sm:h-[150px] md:h-[170px] relative rounded-xl overflow-hidden mb-2.5 bg-white border border-slate-100 shadow-2xs">
              <Image src="/images/hero_baby.png" alt="After" fill className="object-cover object-center" />
            </div>

            {/* Stats Container */}
            <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-200/60 text-center">
              <div className="flex flex-col items-center">
                <Scale className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-[11px] text-slate-800 mt-0.5">9.6 kg</span>
                <span className="text-[8px] font-medium text-slate-400 uppercase">Weight</span>
              </div>
              <div className="flex flex-col items-center border-x border-slate-200/60 px-0.5">
                <Ruler className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-[11px] text-slate-800 mt-0.5">76 cm</span>
                <span className="text-[8px] font-medium text-slate-400 uppercase">Height</span>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold text-[11px] text-slate-800 mt-0.5">Walking</span>
                <span className="text-[8px] font-medium text-slate-400 uppercase">Milestone</span>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
