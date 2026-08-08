"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header/Header";

import { Footer } from "@/components/layout/Footer/Footer";
import { Plus, Calendar, ArrowLeft, CheckCircle2, Award, Target, Footprints, MessageCircle, Heart, Brain, Lightbulb, Baby, Check, ChevronRight, X, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Category = "All" | "Motor" | "Language" | "Social" | "Cognitive";

const categories: { label: Category; icon: any }[] = [
  { label: "All", icon: Award },
  { label: "Motor", icon: Footprints },
  { label: "Language", icon: MessageCircle },
  { label: "Social", icon: Heart },
  { label: "Cognitive", icon: Brain },
];

export default function MilestonesPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [isLogMilestoneOpen, setIsLogMilestoneOpen] = useState(false);

  const milestones = [
    {
      id: 1, title: "First Steps", date: "15 May 2026", status: "completed", desc: "Riya took her first 3 independent steps today!",
      category: "Motor", ageGroup: "12-18 Months",
      imageUrl: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=400&h=300"
    },
    {
      id: 2, title: "First Word", date: "02 Apr 2026", status: "completed", desc: "Said 'Dada' looking at her dad.",
      category: "Language", ageGroup: "6-12 Months"
    },
    {
      id: 3, title: "Sits without support", date: "10 Feb 2026", status: "completed", desc: "Started sitting up straight without falling over.",
      category: "Motor", ageGroup: "6-12 Months"
    },
    {
      id: 4, title: "Crawling", date: "Upcoming", status: "pending", desc: "Expected in the next few weeks based on current activity.",
      category: "Motor", ageGroup: "6-12 Months",
      tip: "Place toys just out of reach during tummy time to encourage forward movement."
    },
    {
      id: 5, title: "Uses pincer grasp", date: "Upcoming", status: "pending", desc: "Picking up small objects with thumb and forefinger.",
      category: "Motor", ageGroup: "6-12 Months",
      tip: "Offer safe, finger foods like small puffs to practice this grasp."
    },
    {
      id: 6, title: "Waves bye-bye", date: "Upcoming", status: "pending", desc: "Understanding social gestures.",
      category: "Social", ageGroup: "6-12 Months"
    },
  ];

  const filteredMilestones = activeCategory === "All" ? milestones : milestones.filter(m => m.category === activeCategory);

  // Group by age group
  const groupedMilestones = filteredMilestones.reduce((acc, milestone) => {
    if (!acc[milestone.ageGroup]) {
      acc[milestone.ageGroup] = [];
    }
    acc[milestone.ageGroup].push(milestone);
    return acc;
  }, {} as Record<string, typeof milestones>);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24 md:pb-0 relative selection:bg-[var(--color-primary)]/20">
      <Header />

      {/* Mobile Back Button Removed */}

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8 relative z-10">

        {/* Top Actions (Back + Log Milestone) - Scrolls with page */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between w-full mb-2"
        >
          <button
            onClick={() => router.back()}
            className="text-[#122B54] p-1 -ml-1 hover:opacity-80 active:scale-95 transition-all"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => setIsLogMilestoneOpen(true)}
            className="bg-[var(--color-primary)] text-white px-4 md:px-5 py-2 md:py-2.5 rounded-full font-bold flex items-center justify-center gap-1.5 hover:bg-[var(--color-primary)]/90 transition-all text-xs md:text-sm active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> Log Milestone
          </button>
        </motion.div>

        {/* Top Header Section (Desktop only heading) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="hidden md:block mb-4"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-[#122B54]">Developmental Milestones</h1>
          <p className="text-sm md:text-base font-medium text-gray-500 mt-2">Check off important developmental steps</p>
        </motion.div>
        {/* Custom Stats Cards based on User Image */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10 w-full max-w-4xl">

          {/* Card 1: Progress */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring" }}
            className="bg-purple-100/50 p-5 rounded-lg flex items-center gap-5 md:gap-6"
          >
            {/* Circular Progress SVG */}
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="stroke-purple-100" strokeWidth="10" fill="none" />
                <motion.circle
                  cx="50" cy="50" r="42"
                  className="stroke-purple-500"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray="264"
                  initial={{ strokeDashoffset: 264 }}
                  animate={{ strokeDashoffset: 52.8 }}
                  transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.8, type: "spring" }}
                  className="text-xl md:text-2xl font-bold text-gray-900 leading-none"
                >
                  80%
                </motion.span>
                <span className="text-[10px] md:text-xs text-gray-500 font-medium mt-1">Complete</span>
              </div>
            </div>

            {/* Text content */}
            <div className="flex flex-col justify-center">
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-2xl md:text-3xl font-bold text-[#1c1c28]">12/15</span>

              </div>
              <p className="text-xs md:text-sm text-gray-500 font-medium mb-3">Milestones achieved</p>
              <div className="inline-flex items-center gap-1.5 bg-[#e8f7ed] text-[#2e9154] px-2.5 py-1 rounded-full w-fit">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="text-[11px] md:text-xs font-bold">On Track</span>
              </div>
            </div>
          </motion.div>

          {/* Card 2: Upcoming */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
            className="bg-[#FFF6F0] p-6 rounded-lg flex items-center justify-between relative overflow-hidden group cursor-pointer"
          >
            <div className="flex flex-col z-10">
              <h4 className="text-[#E67A3D] text-[11px] md:text-xs font-bold mb-1.5 tracking-wide">Upcoming Milestone</h4>
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">First Words</h3>
              <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed">
                Expected in next<br />
                <span className="text-gray-700 font-bold">1 - 2 months</span>
              </p>
            </div>

            {/* Decorative Baby Icon */}
            <div className="absolute right-0 bottom-0 h-[115%] w-[60%] pointer-events-none flex items-end justify-end">
              <img
                src="/images/happybabymilestone.png"
                alt="Upcoming Milestone Baby"
                className="w-full h-full object-contain object-right-bottom drop-shadow-sm"
              />
            </div>
          </motion.div>

        </div>

        {/* Category Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-nowrap overflow-x-auto no-scrollbar items-center gap-2 mb-8 md:mb-10 w-full pb-2"
        >
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-full text-[11px] md:text-xs font-bold transition-all border flex items-center gap-1.5 ${isActive
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-[var(--color-primary)]/50 hover:bg-gray-50"
                  }`}
              >
                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                {cat.label}
              </button>
            )
          })}
        </motion.div>

        <motion.div
          key="milestones-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, type: "spring", bounce: 0.3 }}
          className="w-full max-w-4xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="font-bold text-xl md:text-2xl text-[#122B54]">Developmental Timeline</h3>
              <p className="text-sm font-medium text-gray-500 mt-1">Track important steps grouped by age</p>
            </div>
          </div>

          <div className="space-y-12">
            <AnimatePresence mode="popLayout">
              {Object.entries(groupedMilestones).map(([ageGroup, items]) => (
                <motion.div
                  key={ageGroup}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <h4 className="text-sm md:text-base font-bold text-gray-400 uppercase tracking-wider mb-6 pl-4">{ageGroup}</h4>

                  <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
                    {items.map((milestone, i) => (
                      <div key={milestone.id} className="relative pl-8 group">
                        {/* Timeline dot */}
                        <div className={`absolute -left-[11px] top-4 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${milestone.status === 'completed' ? 'bg-emerald-500 ring-4 ring-[#F8FAFC]' : 'bg-gray-300 ring-4 ring-[#F8FAFC]'}`}>
                        </div>

                        <div className="bg-white hover:bg-gray-50/50 transition-colors p-5 md:p-6 rounded-lg border border-gray-100">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-[9px] md:text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-full uppercase tracking-widest">
                                  {milestone.category}
                                </span>
                              </div>
                              <h4 className={`font-bold text-base md:text-lg ${milestone.status === 'completed' ? 'text-gray-900' : 'text-gray-600'}`}>{milestone.title}</h4>
                            </div>

                            {milestone.status === 'completed' ? (
                              <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 w-fit shrink-0">
                                <CheckCircle2 className="w-4 h-4" /> Achieved
                              </span>
                            ) : (
                              <span className="bg-orange-50 border border-orange-100 text-orange-600 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 w-fit shrink-0">
                                Pending
                              </span>
                            )}
                          </div>

                          {milestone.date !== "Upcoming" && (
                            <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-400 font-bold mb-3">
                              <Calendar className="w-4 h-4" /> {milestone.date}
                            </div>
                          )}

                          <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-4">
                            {milestone.desc}
                          </p>

                          {/* Image Placeholder if completed */}
                          {milestone.status === 'completed' && milestone.imageUrl && (
                            <div className="mt-4 rounded-lg overflow-hidden border border-gray-100 h-32 md:h-48 w-full md:w-2/3 lg:w-1/2 relative group/img cursor-pointer">
                              <img src={milestone.imageUrl} alt={milestone.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                            </div>
                          )}

                          {/* Tip if pending */}
                          {milestone.status === 'pending' && milestone.tip && (
                            <div className="mt-4 flex items-start gap-2.5 bg-blue-50/50 text-blue-700/80 p-3 md:p-4 rounded-lg border border-blue-100">
                              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                              <p className="text-xs md:text-sm font-medium leading-relaxed">
                                {milestone.tip}
                              </p>
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {Object.keys(groupedMilestones).length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-400 font-medium">No milestones found for this category.</p>
              </div>
            )}
          </div>
        </motion.div>

      </main>

      {/* Log Milestone Modal / Bottom Sheet */}
      <AnimatePresence>
        {isLogMilestoneOpen && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsLogMilestoneOpen(false)}
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
                  <Award className="w-5 h-5 text-[var(--color-primary)]" /> Log Milestone
                </h3>
                <button
                  onClick={() => setIsLogMilestoneOpen(false)}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <div className="px-6 py-6 space-y-5 overflow-y-auto max-h-[55dvh] pb-2">

                {/* Milestone Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Milestone Achieved</label>
                  <input
                    type="text"
                    placeholder="e.g. First steps, Said 'Mama'"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all placeholder:text-gray-400"
                  />
                </div>

                {/* Category & Date */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Category</label>
                    <select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all appearance-none">
                      <option value="Motor">Motor</option>
                      <option value="Language">Language</option>
                      <option value="Social">Social</option>
                      <option value="Cognitive">Cognitive</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="date"
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Photo Upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                    Add a Photo <span className="text-gray-400 font-medium normal-case text-[10px]">Optional</span>
                  </label>
                  <div className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors text-gray-400">
                    <ImageIcon className="w-6 h-6" />
                    <span className="text-xs font-semibold">Tap to upload a memory</span>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Story / Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Describe this special moment..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all resize-none placeholder:text-gray-400"
                  ></textarea>
                </div>
              </div>

              {/* Footer Action */}
              <div className="px-6 pb-6 pt-2 bg-white flex justify-center">
                <button
                  onClick={() => setIsLogMilestoneOpen(false)}
                  className="bg-[var(--color-primary)] text-white px-8 py-2.5 rounded-full font-bold text-sm hover:bg-[var(--color-primary)]/90 active:scale-95 transition-all shadow-sm"
                >
                  Save Milestone
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
