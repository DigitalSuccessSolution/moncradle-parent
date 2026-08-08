"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header/Header";

import { Footer } from "@/components/layout/Footer/Footer";
import { ChevronRight, Plus, Calendar, Activity, ArrowUpRight, ArrowLeft, Ruler, Scale, Baby, ShieldCheck, TrendingUp, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function GrowthPage() {
  const router = useRouter();
  const [chartType, setChartType] = useState<"height" | "weight">("height");
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);

  useEffect(() => {
    if (isAddEntryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isAddEntryOpen]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24 md:pb-0 relative selection:bg-[var(--color-primary)]/20">
      <Header />

      {/* Mobile Back Button Removed */}

      {/* Full Width Hero Section */}
      <section className="relative w-full min-h-[350px] md:min-h-[450px] flex items-center justify-start overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          {/* Mobile Image */}
          <img
            src="/images/growth.png"
            alt="Baby Growth"
            className="w-full h-full object-cover object-[center_20%] md:hidden"
          />
          {/* Laptop Image */}
          <img
            src="/images/growth2.png"
            alt="Baby Growth"
            className="w-full h-full object-cover object-[center_40%] hidden md:block"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
        </div>

        {/* Hero Content */}
        <motion.div
          className="relative z-10 w-full max-w-[1200px] mx-auto px-4 md:px-8 mb-8 md:mb-0"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-xs font-bold uppercase tracking-wider px-3 md:px-3.5 py-1.5 md:py-2 rounded-full shadow-sm mb-4"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Healthy Growth
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-semibold text-white leading-tight tracking-tight mb-3"
          >
            Growth & <br />
            <span className="text-blue-300">Development</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-white/90 text-sm md:text-base max-w-[280px] md:max-w-md font-medium leading-relaxed mb-6"
          >
            Monitor your baby's physical<br className="md:hidden" /> milestones, height, and weight<br className="md:hidden" /> progress effortlessly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link
              href="/growth/milestones"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 bg-white text-[#122B54] hover:bg-gray-100"
            >
              Explore Milestones
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8 relative z-10">

        <motion.div
          key="summary"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="space-y-6 md:space-y-8"
        >
          {/* 4 Stats Cards */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } }
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
          >

            {/* Height Card */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="bg-purple-100/60 p-3 md:p-5 rounded-lg flex flex-col justify-center"
            >
              <div className="flex items-center gap-2.5 md:gap-4 mb-2 md:mb-4">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-purple-400 flex items-center justify-center flex-shrink-0">
                  <Ruler className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-purple-600 leading-tight">Height</h3>
                  <p className="text-lg md:text-3xl font-bold text-gray-900 leading-tight">78.5 <span className="text-lg md:text-base font-semibold text-gray-500">cm</span></p>
                </div>
              </div>
            </motion.div>

            {/* Weight Card */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="bg-emerald-100/60 p-3 md:p-5 rounded-lg flex flex-col justify-center"
            >
              <div className="flex items-center gap-2.5 md:gap-4 mb-2 md:mb-4">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-emerald-600 leading-tight">Weight</h3>
                  <p className="text-lg md:text-3xl font-bold text-gray-900 leading-tight">10.2 <span className="text-lg md:text-base font-semibold text-gray-500">kg</span></p>
                </div>
              </div>
            </motion.div>

            {/* Age Card */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="bg-orange-100/60 p-3 md:p-5 rounded-lg flex flex-col justify-center"
            >
              <div className="flex items-center gap-2.5 md:gap-4 mb-2 md:mb-4">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0">
                  <Baby className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-orange-600 leading-tight">Age</h3>
                  <p className="text-lg md:text-3xl font-bold text-gray-900 leading-tight">18 <span className="text-lg md:text-base font-semibold text-gray-500">Months</span></p>
                </div>
              </div>
            </motion.div>

            {/* Status Card */}
            <motion.div
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              className="bg-blue-100/60 p-3 md:p-5 rounded-lg flex flex-col justify-center"
            >
              <div className="flex items-center gap-2.5 md:gap-4 mb-2 md:mb-4">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-blue-400 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-bold text-blue-600 leading-tight">Status</h3>
                  <p className="text-lg md:text-2xl font-bold text-gray-900 leading-tight">On Track</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Chart Area */}
          <div className="mt-8 md:mt-12">

            {/* Chart Header */}
            <div className="mb-8 md:mb-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 shrink-0">
                  Growth Chart <span className="text-sm font-medium text-gray-500">(WHO)</span>
                </h2>

                <div className="flex flex-nowrap overflow-x-auto no-scrollbar items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setChartType("height")}
                    className={`whitespace-nowrap shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[11px] md:text-xs font-bold transition-all border ${chartType === "height"
                      ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:border-purple-300"
                      }`}
                  >
                    Height Chart
                  </button>
                  <button
                    onClick={() => setChartType("weight")}
                    className={`whitespace-nowrap shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[11px] md:text-xs font-bold transition-all border ${chartType === "weight"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                      : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300"
                      }`}
                  >
                    Weight Chart
                  </button>
                  <button
                    onClick={() => setIsAddEntryOpen(true)}
                    className="whitespace-nowrap shrink-0 bg-[var(--color-primary)] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full font-bold flex items-center justify-center gap-1 hover:bg-[var(--color-primary)]/90 transition-all text-[11px] md:text-xs shadow-sm ml-auto md:ml-0"
                  >
                    <Plus className="w-3 h-3 md:w-3.5 md:h-3.5" /> Add Entry
                  </button>
                </div>
              </div>
            </div>

            {/* Chart Visualization */}
            <div className="relative min-h-[280px] md:min-h-[360px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={chartType}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="h-64 md:h-80 w-full relative flex items-end justify-between pl-8 md:pl-10 pr-2 pb-8 mt-4 border-b border-gray-100"
                >
                  {/* Horizontal Dashed Lines */}
                  <div className="absolute inset-0 pl-8 md:pl-10 flex flex-col justify-between pb-8 opacity-40 pointer-events-none">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="w-full border-t border-dashed border-gray-200"></div>
                    ))}
                  </div>

                  {/* Y-Axis Labels */}
                  <div className="absolute left-0 top-0 h-full flex flex-col justify-between pb-8 pointer-events-none w-8 text-right pr-2">
                    {(chartType === 'height' ? [100, 90, 80, 70, 60] : [14, 12, 10, 8, 6]).map(val => (
                      <span key={val} className="text-[10px] text-gray-400 font-medium">{val}</span>
                    ))}
                  </div>

                  <div className="absolute -top-6 left-0 text-[10px] text-gray-500 font-medium">
                    {chartType === 'height' ? 'Height (cm)' : 'Weight (kg)'}
                  </div>

                  {/* Bars */}
                  {(chartType === 'height' ? [40, 55, 60, 75, 80, 95] : [30, 45, 55, 65, 85, 90]).map((h, i) => (
                    <div key={i} className="relative flex flex-col items-center justify-end h-full w-6 md:w-10 group">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.5, delay: i * 0.1 }}
                        className={`w-2 md:w-3 rounded-full relative ${chartType === 'height' ? 'bg-purple-600/20' : 'bg-emerald-600/20'}`}
                      >
                        <div className={`absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-white ${chartType === 'height' ? 'bg-purple-600' : 'bg-emerald-600'}`} />
                      </motion.div>

                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#122B54] text-white text-[10px] py-1.5 px-3 rounded-lg whitespace-nowrap z-10 pointer-events-none">
                        Month {i + 1}
                      </div>
                    </div>
                  ))}

                  {/* X-Axis Labels */}
                  <div className="absolute bottom-0 left-8 md:left-10 right-2 flex justify-between">
                    {[0, 3, 6, 9, 12, 15].map((month, i) => (
                      <span key={i} className="text-xs font-medium text-gray-400 w-6 md:w-10 text-center">{month}</span>
                    ))}
                  </div>

                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-gray-500 font-medium">
                    Age (Months)
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

      </main>

      {/* Add Entry Modal / Bottom Sheet */}
      <AnimatePresence>
        {isAddEntryOpen && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddEntryOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-extrabold text-[#122B54] flex items-center gap-2">
                  <Plus className="w-5 h-5 text-[var(--color-primary)]" /> Add New Entry
                </h3>
                <button
                  onClick={() => setIsAddEntryOpen(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <div className="px-6 py-6 space-y-5 overflow-y-auto max-h-[55dvh] pb-2">
                {/* Date */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date of Measurement</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      defaultValue={new Date().toISOString().split('T')[0]}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>
                </div>

                {/* Grid for Height/Weight */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Weight */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" /> Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 10.5"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all placeholder:text-gray-400"
                    />
                  </div>
                  {/* Height */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5" /> Height (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 78.5"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                {/* Head Circumference */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Baby className="w-3.5 h-3.5" /> Head (cm) <span className="text-gray-400 font-medium normal-case text-[10px] ml-auto">Optional</span></label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 46.2"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Doctor's notes or observations..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all resize-none placeholder:text-gray-400"
                  ></textarea>
                </div>
              </div>

              {/* Footer Action */}
              <div className="px-6 pb-6 pt-2 bg-white flex justify-center">
                <button
                  onClick={() => setIsAddEntryOpen(false)}
                  className="bg-[var(--color-primary)] text-white px-8 py-2.5 rounded-full font-bold text-sm hover:bg-[var(--color-primary)]/90 active:scale-95 transition-all shadow-sm"
                >
                  Save Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
