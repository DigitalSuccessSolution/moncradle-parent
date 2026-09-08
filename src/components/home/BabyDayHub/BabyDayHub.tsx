"use client";

import { useState, useEffect } from "react";
import { 
  Milk, Moon, Baby as BabyIcon, HeartPulse, Lightbulb, 
  Syringe, Utensils, ArrowRight, ShieldCheck, ChevronRight, Play, Pause
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { getBabies, BabyProfile } from "@/lib/api/babiesApi";
import { calculateBabyAgeMonths, formatBabyAge } from "@/lib/utils/babyAge";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

const AGE_TIPS: Record<number, { title: string; tip: string; activity: string }> = {
  0: {
    title: "High-Contrast Visuals & Skin-to-Skin",
    tip: "Newborns see best at 8-12 inches. High-contrast patterns stimulate optic nerve development.",
    activity: "3-5 mins gentle skin-to-skin touch and black & white visual cards."
  },
  1: {
    title: "Focusing on Mom & Dad's Face",
    tip: "Your baby recognizes parents' voices. Gentle talking builds auditory connection.",
    activity: "Maintain gentle eye contact while speaking quietly during alert moments."
  },
  2: {
    title: "First Social Smiles & Head Lifts",
    tip: "Babies at 2 months begin social smiling and holding head up 45° during tummy time.",
    activity: "Place a colorful rattle at eye level during tummy time to encourage lifting."
  },
  3: {
    title: "Hand-Eye Coordination & Cooing",
    tip: "Hands are opening from fists. Baby starts batting toys and making melodic coos.",
    activity: "Hang a soft safe toy above playmat and guide baby's hands to explore textures."
  },
  6: {
    title: "Sitting Up & First Solid Tastes",
    tip: "Core stability allows sitting with slight support; curiosity about purees peaks.",
    activity: "Introduce single-ingredient smooth purees like steamed apple or carrot."
  },
  9: {
    title: "Pincer Grasp & Peek-a-Boo",
    tip: "Using index finger and thumb to pick up small objects. Object permanence emerges!",
    activity: "Play peek-a-boo with a soft cotton cloth to build memory and spatial skills."
  },
  12: {
    title: "First Steps & Word Explorations",
    tip: "Cruising along furniture, saying first words, and understanding simple instructions.",
    activity: "Encourage independent walking by holding a favorite toy two steps away."
  }
};

const NEXT_VACCINES: Record<number, { name: string; dueAge: string; protects: string }> = {
  0: { name: "BCG, OPV-0 & Hep B", dueAge: "At Birth", protects: "Tuberculosis, Polio, Hepatitis B" },
  1: { name: "Pentavalent-1 & Rota-1", dueAge: "6 Weeks", protects: "DTP, Hib, Hepatitis B, Rotavirus" },
  2: { name: "Pentavalent-2 & Rota-2", dueAge: "10 Weeks", protects: "DTP, Hib, Rotavirus" },
  3: { name: "Pentavalent-3, IPV & PCV", dueAge: "14 Weeks", protects: "Polio, Pneumonia, Meningitis" },
  6: { name: "Influenza (Flu Dose 1)", dueAge: "6 Months", protects: "Seasonal Influenza Viruses" },
  9: { name: "MR-1 & Vitamin A", dueAge: "9 Months", protects: "Measles, Rubella & Immunity" },
  12: { name: "Hepatitis A & Typhoid", dueAge: "12 Months", protects: "Hepatitis A, Typhoid Fever" },
};

interface RoutineStats {
  feedsCount: number;
  lastFeedTime: string | null;
  diaperCount: number;
  lastDiaperType: "wet" | "dirty" | "both" | null;
  tummyTimeMinutes: number;
  sleepMinutes: number;
}

export function BabyDayHub() {
  const { isAuthenticated } = useAuth();
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [activeTab, setActiveTab] = useState<"insight" | "vaccine" | "meal">("insight");
  
  // Routine Logger State
  const [stats, setStats] = useState<RoutineStats>({
    feedsCount: 3,
    lastFeedTime: "2 hrs ago",
    diaperCount: 4,
    lastDiaperType: "wet",
    tummyTimeMinutes: 12,
    sleepMinutes: 380,
  });

  const [activeModal, setActiveModal] = useState<"feed" | "diaper" | "sleep" | "tummy" | null>(null);
  const [isNapTimerRunning, setIsNapTimerRunning] = useState(false);
  const [napSeconds, setNapSeconds] = useState(0);

  useEffect(() => {
    try {
      const todayKey = `routine_${new Date().toISOString().split("T")[0]}`;
      const saved = localStorage.getItem(todayKey);
      if (saved) setStats(JSON.parse(saved));
    } catch {}

    if (isAuthenticated) {
      getBabies()
        .then((res) => {
          const list = res.data || res || [];
          if (list.length > 0) setBaby(list[0]);
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const saveStats = (newStats: RoutineStats) => {
    setStats(newStats);
    try {
      const todayKey = `routine_${new Date().toISOString().split("T")[0]}`;
      localStorage.setItem(todayKey, JSON.stringify(newStats));
    } catch {}
  };

  useEffect(() => {
    let interval: any = null;
    if (isNapTimerRunning) {
      interval = setInterval(() => setNapSeconds((p) => p + 1), 1000);
    } else if (!isNapTimerRunning && napSeconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isNapTimerRunning, napSeconds]);

  const ageMonths = calculateBabyAgeMonths(baby?.dateOfBirth, baby?.ageInMonths);
  const ageDisplay = formatBabyAge(baby?.dateOfBirth, baby?.ageInMonths);
  const babyName = baby?.name || "Your Baby";

  // Tip
  const tipKeys = [0, 1, 2, 3, 6, 9, 12];
  let matchedTipKey = 2;
  for (const k of tipKeys) {
    if (ageMonths >= k) matchedTipKey = k;
  }
  const currentTip = AGE_TIPS[matchedTipKey] || AGE_TIPS[2];

  // Vaccine
  const vaccineKeys = [0, 1, 2, 3, 6, 9, 12];
  let matchedVacKey = 2;
  for (const k of vaccineKeys) {
    if (ageMonths <= k) {
      matchedVacKey = k;
      break;
    }
  }
  const currentVaccine = NEXT_VACCINES[matchedVacKey] || NEXT_VACCINES[2];

  const handleQuickFeed = (type: string) => {
    const updated = { ...stats, feedsCount: stats.feedsCount + 1, lastFeedTime: "Just now" };
    saveStats(updated);
    toast.success(`Logged ${type} session 🍼`);
    setActiveModal(null);
  };

  const handleQuickDiaper = (type: "wet" | "dirty" | "both") => {
    const updated = { ...stats, diaperCount: stats.diaperCount + 1, lastDiaperType: type };
    saveStats(updated);
    toast.success(`Logged ${type} diaper 👶`);
    setActiveModal(null);
  };

  const handleAddTummy = (mins: number) => {
    const updated = { ...stats, tummyTimeMinutes: stats.tummyTimeMinutes + mins };
    saveStats(updated);
    toast.success(`Added ${mins}m tummy time ⏱️`);
    setActiveModal(null);
  };

  const handleStopNap = () => {
    setIsNapTimerRunning(false);
    const added = Math.max(1, Math.round(napSeconds / 60));
    const updated = { ...stats, sleepMinutes: stats.sleepMinutes + added };
    saveStats(updated);
    setNapSeconds(0);
    toast.success(`Saved ${added}m nap 😴`);
    setActiveModal(null);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <section className="w-full">
      <div className="bg-white rounded-2xl md:rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        
        {/* Top Header: Baby Identity Bar */}
        <div className="p-4 sm:p-5 md:p-6 pb-3 border-b border-slate-100/80 bg-gradient-to-r from-slate-50/50 via-white to-purple-50/20">
          <div className="flex items-center justify-between gap-3">
            
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden bg-slate-100 shrink-0 relative border border-slate-100 shadow-2xs">
                <Image
                  src={baby?.photoUrl || "/images/hero_baby.png"}
                  alt={babyName}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-normal text-black truncate">
                    {babyName}
                  </h2>
                  <span className="text-[10px] sm:text-[11px] font-normal text-[var(--color-primary)] bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                    {ageDisplay}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-light truncate mt-0.5">
                  Today&apos;s Daily Routine &amp; Pediatric Care Hub
                </p>
              </div>
            </div>

            <Link href="/growth" className="shrink-0 hidden sm:inline-flex">
              <button className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-black text-xs font-normal rounded-xl flex items-center gap-1 transition-all border border-slate-200 cursor-pointer">
                <span>Growth Vitals</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </Link>

          </div>
        </div>

        {/* 4 Interactive Routine Quick Loggers */}
        <div className="p-4 sm:p-5 md:p-6 pb-4 space-y-4">
          
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            
            {/* 1. Feed */}
            <button
              onClick={() => setActiveModal("feed")}
              className="p-2.5 sm:p-3 rounded-2xl bg-slate-50/70 hover:bg-purple-50/40 border border-slate-100/90 hover:border-purple-200 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-purple-50 text-[var(--color-primary)] flex items-center justify-center">
                <Milk className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <span className="text-xs font-normal text-black leading-tight">Feed</span>
              <span className="text-[10px] text-gray-400 font-light truncate max-w-full">
                {stats.feedsCount} feeds
              </span>
            </button>

            {/* 2. Sleep */}
            <button
              onClick={() => setActiveModal("sleep")}
              className="p-2.5 sm:p-3 rounded-2xl bg-slate-50/70 hover:bg-blue-50/40 border border-slate-100/90 hover:border-blue-200 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <span className="text-xs font-normal text-black leading-tight">Sleep</span>
              <span className="text-[10px] text-gray-400 font-light truncate max-w-full">
                {isNapTimerRunning ? formatTimer(napSeconds) : `${Math.floor(stats.sleepMinutes / 60)}h ${stats.sleepMinutes % 60}m`}
              </span>
            </button>

            {/* 3. Diaper */}
            <button
              onClick={() => setActiveModal("diaper")}
              className="p-2.5 sm:p-3 rounded-2xl bg-slate-50/70 hover:bg-amber-50/40 border border-slate-100/90 hover:border-amber-200 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <BabyIcon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <span className="text-xs font-normal text-black leading-tight">Diaper</span>
              <span className="text-[10px] text-gray-400 font-light truncate max-w-full">
                {stats.diaperCount} changed
              </span>
            </button>

            {/* 4. Tummy */}
            <button
              onClick={() => setActiveModal("tummy")}
              className="p-2.5 sm:p-3 rounded-2xl bg-slate-50/70 hover:bg-emerald-50/40 border border-slate-100/90 hover:border-emerald-200 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 active:scale-95 group"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <HeartPulse className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </div>
              <span className="text-xs font-normal text-black leading-tight">Tummy</span>
              <span className="text-[10px] text-gray-400 font-light truncate max-w-full">
                {stats.tummyTimeMinutes}m / 20m
              </span>
            </button>

          </div>

          {/* Integrated Dynamic Context Card: 3 Tabs (Insight / Vaccine / Meal) */}
          <div className="bg-slate-50/80 rounded-2xl p-3.5 sm:p-4 border border-slate-100 space-y-3">
            
            {/* Tab Pill Selectors */}
            <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-100 shadow-2xs">
              <button
                onClick={() => setActiveTab("insight")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "insight"
                    ? "bg-[var(--color-primary)] text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Today&apos;s Insight</span>
              </button>

              <button
                onClick={() => setActiveTab("vaccine")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "vaccine"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Syringe className="w-3.5 h-3.5" />
                <span>Next Vaccine</span>
              </button>

              <button
                onClick={() => setActiveTab("meal")}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === "meal"
                    ? "bg-orange-500 text-white shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                <span>Nutrition</span>
              </button>
            </div>

            {/* Tab 1: Pediatric Tip & Sensory Activity */}
            {activeTab === "insight" && (
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 pt-0.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                    {currentTip.title}
                  </h4>
                  <Link href="/growth/milestones" className="text-[11px] font-medium text-[var(--color-primary)] hover:underline shrink-0 flex items-center gap-0.5">
                    <span>Milestones</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
                <p className="text-xs text-slate-600 font-normal leading-relaxed">
                  {currentTip.tip}
                </p>
                <div className="flex items-start gap-2 bg-amber-50/70 border border-amber-100 rounded-xl p-2.5 text-[11px] text-amber-950 font-normal">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-amber-800 font-semibold">Activity:</strong> {currentTip.activity}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Tab 2: Next Vaccine Alert */}
            {activeTab === "vaccine" && (
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 pt-0.5"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-medium text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Due: {currentVaccine.dueAge}
                    </span>
                    <span className="text-xs font-semibold text-slate-900 truncate">
                      {currentVaccine.name}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-normal flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span className="truncate">Protects: {currentVaccine.protects}</span>
                  </p>
                </div>

                <Link href="/doctor" className="shrink-0">
                  <button className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-2xs">
                    <span>Book</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
              </motion.div>
            )}

            {/* Tab 3: Meal Recommendation */}
            {activeTab === "meal" && (
              <motion.div
                initial={{ opacity: 0, y: 3 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-3 pt-0.5"
              >
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                    {ageMonths < 6 ? "Breast Milk / Formula" : ageMonths < 12 ? "Stage 2 Weaning Puree" : "Junior Solids"}
                  </span>
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {ageMonths < 6 ? "Nutrient-Dense Milk Feeding" : ageMonths < 12 ? "Moong Dal & Carrot Khichdi" : "Paneer Ragi Mash"}
                  </p>
                  <p className="text-[11px] text-slate-500 font-normal">
                    High DHA, gentle digestion, and complete pediatric nutrients.
                  </p>
                </div>

                <Link href="/nutrition" className="shrink-0">
                  <button className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-2xs">
                    <span>Menu</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
              </motion.div>
            )}

          </div>

        </div>

      </div>

      {/* Routine Logging Bottom Sheet Modal */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="relative w-full max-w-sm bg-white rounded-t-3xl sm:rounded-3xl p-5 shadow-xl space-y-4"
            >
              {activeModal === "feed" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Log Baby Feeding</h3>
                    <button onClick={() => setActiveModal(null)} className="text-xs text-slate-400 hover:text-slate-700">Cancel</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleQuickFeed("Bottle Feed")}
                      className="p-3 bg-slate-50 hover:bg-purple-50 rounded-2xl text-center space-y-1 transition-colors cursor-pointer border border-slate-100"
                    >
                      <Milk className="w-5 h-5 text-[var(--color-primary)] mx-auto" />
                      <p className="text-xs font-bold text-slate-800">Bottle</p>
                      <p className="text-[10px] text-slate-400">120ml</p>
                    </button>
                    <button
                      onClick={() => handleQuickFeed("Nursing")}
                      className="p-3 bg-slate-50 hover:bg-pink-50 rounded-2xl text-center space-y-1 transition-colors cursor-pointer border border-slate-100"
                    >
                      <HeartPulse className="w-5 h-5 text-pink-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">Nursing</p>
                      <p className="text-[10px] text-slate-400">15 min</p>
                    </button>
                    <button
                      onClick={() => handleQuickFeed("Solid Meal")}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-2xl text-center space-y-1 transition-colors cursor-pointer border border-slate-100"
                    >
                      <Utensils className="w-5 h-5 text-emerald-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">Solids</p>
                      <p className="text-[10px] text-slate-400">Meal</p>
                    </button>
                  </div>
                </div>
              )}

              {activeModal === "diaper" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Log Diaper Change</h3>
                    <button onClick={() => setActiveModal(null)} className="text-xs text-slate-400 hover:text-slate-700">Cancel</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleQuickDiaper("wet")}
                      className="p-3 bg-slate-50 hover:bg-blue-50 rounded-2xl text-center space-y-1 transition-colors cursor-pointer border border-slate-100"
                    >
                      <BabyIcon className="w-5 h-5 text-blue-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">Wet</p>
                    </button>
                    <button
                      onClick={() => handleQuickDiaper("dirty")}
                      className="p-3 bg-slate-50 hover:bg-amber-50 rounded-2xl text-center space-y-1 transition-colors cursor-pointer border border-slate-100"
                    >
                      <BabyIcon className="w-5 h-5 text-amber-600 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">Dirty</p>
                    </button>
                    <button
                      onClick={() => handleQuickDiaper("both")}
                      className="p-3 bg-slate-50 hover:bg-orange-50 rounded-2xl text-center space-y-1 transition-colors cursor-pointer border border-slate-100"
                    >
                      <BabyIcon className="w-5 h-5 text-orange-500 mx-auto" />
                      <p className="text-xs font-bold text-slate-800">Both</p>
                    </button>
                  </div>
                </div>
              )}

              {activeModal === "sleep" && (
                <div className="space-y-4 text-center">
                  <h3 className="text-sm font-bold text-slate-900">Nap Timer</h3>
                  <div className="w-24 h-24 rounded-full bg-slate-50 text-blue-600 flex items-center justify-center text-2xl font-bold mx-auto border border-slate-100">
                    {formatTimer(napSeconds)}
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    {!isNapTimerRunning ? (
                      <button
                        onClick={() => setIsNapTimerRunning(true)}
                        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Play className="w-3.5 h-3.5" /> Start Nap
                      </button>
                    ) : (
                      <button
                        onClick={handleStopNap}
                        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Pause className="w-3.5 h-3.5" /> Stop &amp; Save
                      </button>
                    )}
                  </div>
                </div>
              )}

              {activeModal === "tummy" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">Add Tummy Time</h3>
                    <button onClick={() => setActiveModal(null)} className="text-xs text-slate-400 hover:text-slate-700">Cancel</button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleAddTummy(5)}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-2xl text-center transition-colors cursor-pointer border border-slate-100"
                    >
                      <p className="text-sm font-bold text-emerald-700">+5 min</p>
                    </button>
                    <button
                      onClick={() => handleAddTummy(10)}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-2xl text-center transition-colors cursor-pointer border border-slate-100"
                    >
                      <p className="text-sm font-bold text-emerald-700">+10 min</p>
                    </button>
                    <button
                      onClick={() => handleAddTummy(15)}
                      className="p-3 bg-slate-50 hover:bg-emerald-50 rounded-2xl text-center transition-colors cursor-pointer border border-slate-100"
                    >
                      <p className="text-sm font-bold text-emerald-700">+15 min</p>
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
