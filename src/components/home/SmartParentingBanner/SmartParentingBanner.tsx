"use client";

import { Clock, ArrowRight, Bell, TrendingUp } from "lucide-react";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";

export function SmartParentingBanner() {
  const router = useRouter();
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <section className="bg-[#F8FAFC] rounded-[1.5rem] md:rounded-[2rem] relative flex flex-col lg:flex-row items-center justify-between mt-6 md:mt-12 p-6 sm:p-10 md:p-10 lg:p-8 xl:p-12 border border-slate-100 shadow-sm overflow-hidden gap-8 lg:gap-4 max-h-[600px] lg:max-h-[480px]">

      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      {/* Left Content */}
      <div className="z-10 max-w-xl w-full text-center lg:text-left relative mx-auto lg:mx-0">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100/50 px-3.5 py-1.5 rounded-full text-[10px] md:text-[11px] font-semibold text-indigo-600 uppercase tracking-wide mb-4 md:mb-5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
          moncradle App
        </motion.div>

        <motion.h3
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-3xl sm:text-4xl md:text-[2.75rem] font-bold text-slate-800 leading-[1.2] md:leading-[1.15] mb-3 md:mb-4 tracking-tight"
        >
          Smarter Care for <br className="hidden sm:block" />
          <span className="text-[var(--color-primary)]">Your Little One</span>
        </motion.h3>

        <motion.p
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="text-sm md:text-base font-normal text-slate-500 leading-relaxed mb-5 md:mb-7 max-w-[400px] mx-auto lg:mx-0"
        >
          Track your baby's milestones, get tips from expert pediatricians, and never miss a vaccination date again.
        </motion.p>

        <motion.button
          onClick={() => router.push('/growth')}
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          className="group inline-flex items-center justify-center gap-2 bg-slate-900 text-white px-6 md:px-7 py-3 md:py-3.5 rounded-full font-medium transition-transform hover:-translate-y-0.5 text-sm w-full sm:w-auto shadow-md shadow-slate-900/10 mx-auto lg:mx-0"
        >
          Explore Features
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* Center Graphics (Clean Phone Mockup) */}
      <div className="relative z-0 flex items-center justify-center w-full lg:flex-1 py-2 md:py-4 lg:py-0">
        <div className="relative w-[230px] h-[440px] bg-white rounded-[2.25rem] shadow-2xl shadow-slate-200/50 border-[8px] border-slate-900 overflow-hidden flex flex-col transform lg:hover:-translate-y-2 transition-transform duration-500 scale-[0.9] sm:scale-95 md:scale-100 origin-center">
          {/* Top Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-slate-900 rounded-b-[10px] z-20 flex justify-center items-end pb-1 gap-1">
            <div className="w-1 h-1 rounded-full bg-slate-700"></div>
            <div className="w-6 h-1 rounded-full bg-slate-700"></div>
          </div>

          {/* Screen Content - Mini App */}
          <div className="w-full h-full bg-slate-50 pt-8 px-3.5 flex flex-col gap-2.5 relative z-10 overflow-hidden">

            {/* Header */}
            <div className="flex justify-between items-center mb-0.5">
              <div className="flex gap-2 items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-50 overflow-hidden relative border border-slate-200">
                  <Image src="/images/hero_baby.png" alt="Baby" fill className="object-cover object-top" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] text-slate-400 font-semibold uppercase tracking-wider">Good Morning</span>
                  <span className="text-[12px] font-bold text-slate-800 leading-none mt-0.5">Aarav</span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                <Bell className="w-3 h-3 text-slate-400" />
              </div>
            </div>

            {/* Growth Stat Card */}
            <div className="bg-white rounded-[0.8rem] p-2.5 shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[8px] text-slate-400 font-medium uppercase tracking-wider">Current Weight</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <p className="text-[16px] font-bold text-slate-800 leading-none">8.5</p>
                  <span className="text-[9px] font-medium text-slate-400">kg</span>
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              </div>
            </div>

            {/* Upcoming Task Card */}
            <div className="bg-indigo-600 rounded-[0.8rem] p-3.5 shadow-sm text-white relative overflow-hidden">
              <div className="absolute right-0 top-0 w-16 h-16 bg-white/10 rounded-full blur-xl translate-x-1/2 -translate-y-1/2"></div>
              <div className="flex items-center gap-1.5 mb-1.5 relative z-10">
                <Clock className="w-[11px] h-[11px] text-indigo-200" />
                <span className="text-[8px] font-medium text-indigo-100 uppercase tracking-wider">Today, 10:30 AM</span>
              </div>
              <h4 className="text-[12px] font-semibold relative z-10 leading-tight mb-0.5">Vaccination Due</h4>
              <p className="text-[9px] text-indigo-200 font-normal relative z-10">Polio Drops (3rd Dose)</p>
            </div>

            {/* Articles Mock */}
            <div className="mt-1">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-semibold text-slate-800">Recommended</span>
                <span className="text-[8px] font-semibold text-indigo-500 uppercase tracking-wider">All</span>
              </div>
              <div className="flex gap-2 overflow-hidden">
                <div className="w-[90px] h-[100px] rounded-[0.8rem] bg-white shadow-sm border border-slate-100 p-2 flex flex-col shrink-0">
                  <div className="w-full h-[42px] bg-slate-100 rounded-md mb-2 relative overflow-hidden">
                    <Image src="/images/meal_food.png" alt="food" fill className="object-cover" />
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full mb-1"></div>
                  <div className="h-1.5 w-2/3 bg-slate-100 rounded-full"></div>
                </div>
                <div className="w-[90px] h-[100px] rounded-[0.8rem] bg-white shadow-sm border border-slate-100 p-2 flex flex-col shrink-0">
                  <div className="w-full h-[42px] bg-slate-100 rounded-md mb-2 relative overflow-hidden">
                    <Image src="/images/before_baby_3m.png" alt="baby" fill className="object-cover object-top" />
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full mb-1"></div>
                  <div className="h-1.5 w-1/2 bg-slate-100 rounded-full"></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

    </section>
  );
}

