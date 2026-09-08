"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus, Calendar, Ruler, Scale, Baby, ShieldCheck, CheckCircle2,
  X, Award, TrendingUp, ChevronLeft, Info, Bell,
  Footprints, MessageCircle, Heart, Brain, ChevronRight, Activity,
  Stethoscope, ArrowRight, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBabies, BabyProfile } from "@/lib/api/babiesApi";
import { getGrowthRecords, addGrowthRecord, GrowthRecord } from "@/lib/api/growthApi";
import { getMilestones, Milestone } from "@/lib/api/milestonesApi";
import { useAuth } from "@/context/AuthContext";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { calculateBabyAgeMonths, formatBabyAge } from "@/lib/utils/babyAge";

const SAMPLE_MILESTONES = [
  {
    title: "Sits without support",
    desc: "Maintains steady posture without assistance",
    category: "Motor",
    icon: Footprints,
    ageRange: "6-9 Months",
    color: "#8A84C8",
    image: "/images/happybabymilestone.png"
  },
  {
    title: "Responds to own name",
    desc: "Turns head and smiles when called",
    category: "Language",
    icon: MessageCircle,
    ageRange: "6-9 Months",
    color: "#f59e0b",
    image: "/images/hero_baby.png"
  },
  {
    title: "Passes objects between hands",
    desc: "Transfers toys from one hand to the other",
    category: "Cognitive",
    icon: Brain,
    ageRange: "6-9 Months",
    color: "#10b981",
    image: "/images/before_baby_3m.png"
  },
  {
    title: "Enjoys social games (Peek-a-boo)",
    desc: "Laughs and anticipates peek-a-boo gestures",
    category: "Social",
    icon: Heart,
    ageRange: "6-12 Months",
    color: "#ec4899",
    image: "/images/happybabymilestone.png"
  },
];

export default function GrowthPage() {
  const router = useRouter();
  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);
  const [mounted, setMounted] = useState(false);
  const [chartType, setChartType] = useState<"height" | "weight">("height");
  const [activeTab, setActiveTab] = useState<"chart" | "history" | "milestones">("chart");
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);

  const [babies, setBabies] = useState<BabyProfile[]>([]);
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [newEntry, setNewEntry] = useState({
    weight: "",
    height: "",
    headCircumference: "",
    notes: "",
    date: new Date().toISOString().split('T')[0]
  });

  const loadBabyGrowth = async (selectedBaby: BabyProfile) => {
    if (!selectedBaby._id) return;
    try {
      setIsLoading(true);
      const [recordsRes, milestonesRes] = await Promise.all([
        getGrowthRecords(selectedBaby._id),
        getMilestones(selectedBaby._id).catch(() => [])
      ]);

      const sorted = (recordsRes || []).sort(
        (a, b) => new Date(a.recordedDate || a.createdAt || 0).getTime() - new Date(b.recordedDate || b.createdAt || 0).getTime()
      );
      setRecords(sorted);
      setMilestones(milestonesRes || []);
    } catch (err) {
      console.error("Failed to load growth records for baby:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      if (isAuthenticated) {
        const babyRes = await getBabies();
        const babiesList: BabyProfile[] = babyRes.data || babyRes || [];
        if (babiesList && babiesList.length > 0) {
          setBabies(babiesList);
          const current = baby ? (babiesList.find(b => b._id === baby._id) || babiesList[0]) : babiesList[0];
          setBaby(current);
          await loadBabyGrowth(current);
          return;
        }
      }
      setBabies([]);
      setBaby(null);
      setRecords([]);
      setMilestones([]);
    } catch (err) {
      console.error("Failed to load growth data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    if (!isAuthLoading) {
      if (isAuthenticated) {
        fetchData();
      } else {
        setIsLoading(false);
        setBabies([]);
        setBaby(null);
        setRecords([]);
        setMilestones([]);
      }
    }
    return () => clearTimeout(t);
  }, [isAuthenticated, isAuthLoading]);

  useEffect(() => {
    if (isAddEntryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isAddEntryOpen]);

  const handleSelectBaby = async (b: BabyProfile) => {
    if (b._id === baby?._id) return;
    setBaby(b);
    await loadBabyGrowth(b);
  };

  const handleAddEntryClick = () => {
    if (!isAuthenticated) {
      toast("Please login to record your baby's growth", { icon: "🔒" });
      router.push("/login?redirect=/growth");
      return;
    }
    if (!baby) {
      toast("Please add a baby profile first", { icon: "👶" });
      router.push("/baby-profile");
      return;
    }
    setIsAddEntryOpen(true);
  };

  const handleSaveEntry = async () => {
    if (!baby || !newEntry.height || !newEntry.weight) return;
    try {
      await addGrowthRecord({
        babyId: baby._id!,
        weight: parseFloat(newEntry.weight),
        height: parseFloat(newEntry.height),
        headCircumference: newEntry.headCircumference ? parseFloat(newEntry.headCircumference) : undefined,
        notes: newEntry.notes,
        recordedDate: new Date(newEntry.date).toISOString()
      });
      toast.success("Growth entry recorded successfully!");
      setIsAddEntryOpen(false);
      setNewEntry({ weight: "", height: "", headCircumference: "", notes: "", date: new Date().toISOString().split('T')[0] });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save growth record");
    }
  };

  const latestRecord = records.length > 0 ? records[records.length - 1] : null;

  // Compute age in months accurately
  const ageMonths = useMemo(() => {
    return calculateBabyAgeMonths(baby?.dateOfBirth, baby?.ageInMonths);
  }, [baby?.dateOfBirth, baby?.ageInMonths]);

  let statusText = baby ? "Normal Growth" : "WHO Standard";
  let statusColor = "emerald";
  if (records.length === 1) {
    statusText = "On Track";
    statusColor = "emerald";
  } else if (records.length > 1) {
    const last = records[records.length - 1];
    const prev = records[records.length - 2];
    if (last.weight < prev.weight) {
      statusText = "Weight Drop";
      statusColor = "orange";
    } else {
      statusText = "On Track";
      statusColor = "emerald";
    }
  }

  const standardBoysW = [{ m: 0, p3: 2.5, p50: 3.3, p97: 4.4 }, { m: 2, p3: 4.3, p50: 5.6, p97: 7.1 }, { m: 4, p3: 5.6, p50: 7.0, p97: 8.7 }, { m: 6, p3: 6.4, p50: 7.9, p97: 9.8 }, { m: 9, p3: 7.1, p50: 8.9, p97: 11.0 }, { m: 12, p3: 7.7, p50: 9.6, p97: 12.0 }, { m: 18, p3: 8.6, p50: 10.9, p97: 13.7 }, { m: 24, p3: 9.7, p50: 12.2, p97: 15.3 }];
  const standardGirlsW = [{ m: 0, p3: 2.4, p50: 3.2, p97: 4.2 }, { m: 2, p3: 3.9, p50: 5.1, p97: 6.6 }, { m: 4, p3: 5.0, p50: 6.4, p97: 8.2 }, { m: 6, p3: 5.7, p50: 7.3, p97: 9.3 }, { m: 9, p3: 6.5, p50: 8.2, p97: 10.5 }, { m: 12, p3: 7.0, p50: 8.9, p97: 11.5 }, { m: 18, p3: 8.1, p50: 10.2, p97: 13.2 }, { m: 24, p3: 9.0, p50: 11.5, p97: 14.8 }];
  const standardBoysH = [{ m: 0, p3: 46.1, p50: 49.9, p97: 53.7 }, { m: 2, p3: 54.4, p50: 58.4, p97: 62.4 }, { m: 4, p3: 59.7, p50: 63.9, p97: 68.0 }, { m: 6, p3: 63.3, p50: 67.6, p97: 71.9 }, { m: 9, p3: 67.7, p50: 72.0, p97: 76.2 }, { m: 12, p3: 71.0, p50: 75.7, p97: 80.5 }, { m: 18, p3: 76.9, p50: 82.3, p97: 87.7 }, { m: 24, p3: 81.7, p50: 87.8, p97: 93.9 }];
  const standardGirlsH = [{ m: 0, p3: 45.4, p50: 49.1, p97: 52.9 }, { m: 2, p3: 54.4, p50: 57.1, p97: 61.1 }, { m: 4, p3: 58.0, p50: 62.1, p97: 66.2 }, { m: 6, p3: 61.2, p50: 65.7, p97: 70.3 }, { m: 9, p3: 65.3, p50: 70.1, p97: 75.0 }, { m: 12, p3: 68.9, p50: 74.0, p97: 79.2 }, { m: 18, p3: 74.9, p50: 80.7, p97: 86.5 }, { m: 24, p3: 80.0, p50: 86.4, p97: 92.9 }];

  const isBoy = baby ? baby.gender === 'Boy' : true;
  const standardW = isBoy ? standardBoysW : standardGirlsW;
  const standardH = isBoy ? standardBoysH : standardGirlsH;
  const standardData = chartType === 'height' ? standardH : standardW;

  const chartDataMap = new Map();
  standardData.forEach(d => {
    chartDataMap.set(d.m, { month: d.m, range: [d.p3, d.p97], p50: d.p50 });
  });

  if (baby && baby.dateOfBirth) {
    const dob = new Date(baby.dateOfBirth);
    records.forEach(r => {
      const rDate = new Date(r.recordedDate || r.createdAt || Date.now());
      let rAgeMonths = (rDate.getFullYear() - dob.getFullYear()) * 12 + rDate.getMonth() - dob.getMonth();
      if (rDate.getDate() < dob.getDate()) {
        rAgeMonths--;
      }
      rAgeMonths = Math.max(0, rAgeMonths);
      if (rAgeMonths >= 0 && rAgeMonths <= 24) {
        const key = rAgeMonths;
        if (chartDataMap.has(key)) {
          chartDataMap.get(key).actual = chartType === 'height' ? r.height : r.weight;
        } else {
          chartDataMap.set(key, { month: key, actual: chartType === 'height' ? r.height : r.weight });
        }
      }
    });
  }

  const chartData = Array.from(chartDataMap.values()).sort((a, b) => a.month - b.month);

  const whoTargetHeight = chartData.find(d => d.month === (ageMonths || 6))?.p50 || 67.6;
  const whoTargetWeight = chartData.find(d => d.month === (ageMonths || 6))?.p50 || 7.9;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md p-3 border border-gray-100 shadow-lg rounded-2xl">
          <p className="font-bold text-gray-900 text-xs mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-[var(--color-primary)]" />
            {label} Months
          </p>
          {payload.map((p: any, idx: number) => {
            if (p.dataKey === 'actual') {
              return (
                <p key={idx} className={`font-bold ${chartType === 'height' ? 'text-purple-600' : 'text-emerald-600'} text-xs mb-0.5`}>
                  Baby: {p.value} {chartType === 'height' ? 'cm' : 'kg'}
                </p>
              );
            } else if (p.dataKey === 'p50') {
              return (
                <p key={idx} className="text-gray-500 text-[11px] font-medium">
                  WHO 50th: {p.value} {chartType === 'height' ? 'cm' : 'kg'}
                </p>
              );
            }
            return null;
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-28 md:pb-12 relative selection:bg-[var(--color-primary)]/20">

      {/* Mobile Top App Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} className="p-1.5 -ml-1 rounded-full hover:bg-gray-100 active:scale-90 transition-all cursor-pointer">
            <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2.2} />
          </button>
          <div>
            <h1 className="text-[17px] font-medium text-black leading-tight tracking-tight">Growth Tracker</h1>
            <p className="text-[11px] font-light text-gray-500 leading-none mt-0.5">
              {baby?.name ? `${baby.name} · ${ageMonths}m` : "WHO Standards"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleAddEntryClick}
            className="flex items-center gap-1 bg-[var(--color-primary)] text-white text-xs font-bold px-3 py-1.5 rounded-full active:scale-95 transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add</span>
          </button>
          <button onClick={() => router.push('/notifications')} className="relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer">
            <Bell className="w-5 h-5 text-gray-700" />
            {unreadNotificationsCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>}
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-3.5 sm:px-4 md:px-8 pt-2 sm:pt-3 md:pt-6">

        {/* Desktop Top Navigation & Baby Switcher */}
        <div className="hidden md:flex flex-row items-center justify-between gap-3 mb-4">
          <div className="flex items-center -ml-2">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-semibold text-sm">Back</span>
            </button>
          </div>

          {babies.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">Baby:</span>
              {babies.map((b) => (
                <button
                  key={b._id}
                  onClick={() => handleSelectBaby(b)}
                  className={`text-xs px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${baby?._id === b._id
                      ? "bg-[var(--color-primary)] text-white font-semibold shadow-xs"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {b.name || "Baby"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Horizontal Baby Profile Switcher (if multiple) */}
        {babies.length > 1 && (
          <div className="md:hidden flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1 mb-2">
            <span className="text-xs font-bold text-gray-400 whitespace-nowrap">Baby:</span>
            {babies.map((b) => (
              <button
                key={b._id}
                onClick={() => handleSelectBaby(b)}
                className={`text-xs px-3.5 py-1.5 rounded-full transition-all cursor-pointer whitespace-nowrap font-medium ${baby?._id === b._id
                    ? "bg-[var(--color-primary)] text-white font-bold shadow-xs scale-100"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
              >
                {b.name || "Baby"}
              </button>
            ))}
          </div>
        )}

        {/* --- Modern Clean Hero Section (Mobile-First Card) --- */}
        <section
          className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#8A84C8]/12 via-[#FAF8FF] to-[#E9F7EF] border border-gray-100/90 shadow-xs transition-all duration-700 ease-out p-3.5 sm:p-6 md:p-8 mb-4 sm:mb-8 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* Subtle Ambient Glow */}
          <div className="hidden sm:block absolute -top-20 -right-20 w-72 h-72 bg-[var(--color-primary)]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="hidden sm:block absolute -bottom-20 -left-20 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-3.5 sm:space-y-5">

            {/* Header: Title + Actions + Baby Avatar Badge */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">

                {/* Baby Avatar / Visual Badge */}
                <div className="relative shrink-0">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shadow-xs relative">
                    <Image
                      src={baby?.photoUrl || "/images/hero_baby.png"}
                      alt="Baby Profile"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                      priority
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                  </span>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 text-[11px] font-medium text-[var(--color-primary)] flex-wrap">
                    <span className="flex items-center gap-1 font-medium uppercase tracking-wider text-[10px]">
                      <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-primary)]" /> WHO Standards
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-emerald-600 flex items-center gap-0.5 text-[10px] font-medium">
                      <Check className="w-3 h-3" /> Safe Percentile
                    </span>
                  </div>

                  <h1 className="text-lg sm:text-2xl md:text-3xl font-normal text-black tracking-tight leading-snug">
                    {baby?.name ? (
                      <>
                        {baby.name}&apos;s Growth Journey
                      </>
                    ) : (
                      <>
                        Baby Growth &amp; WHO Milestones
                      </>
                    )}
                  </h1>

                  <p className="text-xs sm:text-sm text-gray-500 font-light mt-0.5 truncate leading-relaxed">
                    {baby ? `${ageMonths} Months Old` : "0-24 Months"}
                    {baby?.gender ? ` · ${baby.gender}` : ""}
                    {latestRecord ? ` · ${latestRecord.height}cm, ${latestRecord.weight}kg` : " · Physical Velocity"}
                  </p>
                </div>
              </div>

              {/* Desktop Only Action Buttons */}
              <div className="hidden sm:flex items-center gap-2 sm:gap-2.5 shrink-0">
                <Button
                  variant="primary"
                  size="sm"
                  className="font-medium whitespace-nowrap text-xs cursor-pointer"
                  onClick={handleAddEntryClick}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Add Measurement
                </Button>
                <Link href="/growth/milestones">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/90 border-gray-200 hover:bg-white text-gray-700 font-medium whitespace-nowrap text-xs cursor-pointer"
                    leftIcon={<Award className="w-3.5 h-3.5 text-[var(--color-primary)]" />}
                  >
                    Milestones Guide
                  </Button>
                </Link>
              </div>
            </div>

            {/* Key Anthropometric Metrics Grid (Responsive Mobile-to-Desktop Grid) */}
            <div className="pt-1 sm:pt-1.5">
              <div className="flex items-center justify-between mb-2 sm:mb-2.5">
                <span className="text-[11px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 truncate">
                  <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--color-primary)] shrink-0" />
                  Anthropometric Vitals ({ageMonths || 6}m Target)
                </span>
                <span className="text-[10px] sm:text-xs font-medium text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap shrink-0 ml-1">
                  3rd-97th %ile
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
                {/* Height Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-gray-100/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all min-h-[96px] sm:min-h-[115px] md:min-h-[120px]">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                      <span className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg sm:rounded-xl flex items-center justify-center bg-purple-50 shrink-0 text-purple-600 border border-purple-100/80">
                        <Ruler className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                      </span>
                      <span>Height</span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] md:text-xs font-semibold text-purple-700 bg-purple-50 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border border-purple-100/80 shrink-0">
                      <span className="hidden sm:inline">WHO </span>{whoTargetHeight}cm
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between mb-1 sm:mb-1.5 md:mb-2">
                      <span className="text-sm sm:text-base md:text-xl font-bold text-gray-900">
                        {latestRecord ? `${latestRecord.height} cm` : "-- cm"}
                      </span>
                      <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 font-normal">
                        {latestRecord ? "Current" : "50th avg"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2 md:h-2.5 overflow-hidden p-[1px]">
                      <div
                        className="h-full rounded-full bg-purple-500 transition-all duration-1000 ease-out"
                        style={{
                          width: mounted ? (latestRecord ? `${Math.min(100, Math.round((latestRecord.height / (whoTargetHeight * 1.15)) * 100))}%` : "50%") : "0%",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Weight Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-gray-100/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all min-h-[96px] sm:min-h-[115px] md:min-h-[120px]">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                      <span className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg sm:rounded-xl flex items-center justify-center bg-emerald-50 shrink-0 text-emerald-600 border border-emerald-100/80">
                        <Scale className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                      </span>
                      <span>Weight</span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] md:text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border border-emerald-100/80 shrink-0">
                      <span className="hidden sm:inline">WHO </span>{whoTargetWeight}kg
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between mb-1 sm:mb-1.5 md:mb-2">
                      <span className="text-sm sm:text-base md:text-xl font-bold text-gray-900">
                        {latestRecord ? `${latestRecord.weight} kg` : "-- kg"}
                      </span>
                      <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 font-normal truncate">
                        {records.length > 1
                          ? `${(latestRecord!.weight - records[records.length - 2].weight >= 0 ? '+' : '')}${(latestRecord!.weight - records[records.length - 2].weight).toFixed(1)}kg`
                          : "50th avg"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2 md:h-2.5 overflow-hidden p-[1px]">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-1000 ease-out"
                        style={{
                          width: mounted ? (latestRecord ? `${Math.min(100, Math.round((latestRecord.weight / (whoTargetWeight * 1.2)) * 100))}%` : "50%") : "0%",
                          transitionDelay: "150ms"
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Baby Age Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-gray-100/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all min-h-[96px] sm:min-h-[115px] md:min-h-[120px]">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                      <span className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg sm:rounded-xl flex items-center justify-center bg-orange-50 shrink-0 text-orange-600 border border-orange-100/80">
                        <Baby className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
                      </span>
                      <span>Age</span>
                    </span>
                    <span className="text-[10px] sm:text-[11px] md:text-xs font-semibold text-orange-700 bg-orange-50 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border border-orange-100/80 shrink-0">
                      {records.length} Logs
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between mb-1 sm:mb-1.5 md:mb-2">
                      <span className="text-sm sm:text-base md:text-xl font-bold text-gray-900">
                        {baby ? `${ageMonths} m` : "0-24 m"}
                      </span>
                      <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 font-normal truncate">
                        {baby?.dateOfBirth ? new Date(baby.dateOfBirth).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : "Standard"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2 md:h-2.5 overflow-hidden p-[1px]">
                      <div
                        className="h-full rounded-full bg-orange-500 transition-all duration-1000 ease-out"
                        style={{
                          width: mounted ? `${Math.min(100, Math.round((ageMonths / 24) * 100))}%` : "0%",
                          transitionDelay: "300ms"
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Growth Velocity Card */}
                <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-gray-100/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all min-h-[96px] sm:min-h-[115px] md:min-h-[120px]">
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3">
                    <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                      <span className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg sm:rounded-xl flex items-center justify-center bg-blue-50 shrink-0 text-blue-600 border border-blue-100/80">
                        <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </span>
                      <span>Status</span>
                    </span>
                    <span className={`text-[10px] sm:text-[11px] md:text-xs font-semibold px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border ${statusColor === 'orange' ? 'text-orange-700 bg-orange-50 border-orange-100/80' : 'text-emerald-700 bg-emerald-50 border-emerald-100/80'} shrink-0`}>
                      {statusText === "WHO Standard" ? "Standard" : statusText}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-baseline justify-between mb-1 sm:mb-1.5 md:mb-2">
                      <span className="text-sm sm:text-base md:text-xl font-bold text-gray-900 truncate">
                        {statusText === "WHO Standard" ? "Standard" : statusText}
                      </span>
                      <span className="text-[10px] sm:text-xs md:text-sm text-emerald-600 font-medium truncate flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Normal
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2 md:h-2.5 overflow-hidden p-[1px]">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all duration-1000 ease-out"
                        style={{
                          width: mounted ? "90%" : "0%",
                          transitionDelay: "450ms"
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Quick Action Pills */}
            <div className="sm:hidden grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="primary"
                size="sm"
                className="w-full font-medium text-xs py-2.5 px-2 shadow-xs whitespace-nowrap justify-center"
                onClick={handleAddEntryClick}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Add Measurement
              </Button>
              <Link href="/growth/milestones" className="w-full">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-white border-gray-200 text-gray-700 font-medium text-xs py-2.5 px-2 shadow-xs whitespace-nowrap justify-center"
                  leftIcon={<Award className="w-3.5 h-3.5 text-[var(--color-primary)]" />}
                >
                  Milestones Guide
                </Button>
              </Link>
            </div>

          </div>
        </section>

      </div>

      {/* --- Main Content Section --- */}
      <main className="max-w-[1400px] mx-auto px-3.5 sm:px-4 md:px-8 space-y-4 sm:space-y-8 md:space-y-10 relative z-10">

        {/* --- Growth Velocity Chart Card (Mobile Touch-Optimized) --- */}
        <section className={`bg-white p-3.5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl border border-gray-100 shadow-xs space-y-3.5 sm:space-y-5 transition-all duration-700 ease-out delay-150 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
            <div>
              <h2 className="text-base sm:text-xl font-normal text-black tracking-tight flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--color-primary)]" />
                Growth Velocity Curve
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 font-light mt-0.5">
                WHO Clinical Percentiles (0 to 24 Months)
              </p>
            </div>

            {/* Chart Type Selector Switch (Thumb-Friendly Hitboxes) */}
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-full sm:w-fit">
              <button
                onClick={() => setChartType("height")}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer text-center ${chartType === "height"
                    ? "bg-white text-purple-700 shadow-xs font-extrabold"
                    : "text-gray-500 hover:text-gray-900"
                  }`}
              >
                Height (cm)
              </button>
              <button
                onClick={() => setChartType("weight")}
                className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer text-center ${chartType === "weight"
                    ? "bg-white text-emerald-700 shadow-xs font-extrabold"
                    : "text-gray-500 hover:text-gray-900"
                  }`}
              >
                Weight (kg)
              </button>
            </div>
          </div>

          {/* Chart Legend */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-6 text-[10px] sm:text-xs font-medium text-gray-500 bg-gray-50/70 p-2.5 sm:p-3 rounded-xl border border-gray-100">
            <div className="flex items-center gap-1.5">
              <div className={`w-2.5 h-2.5 rounded-full ${chartType === 'height' ? 'bg-purple-600' : 'bg-emerald-600'}`}></div>
              <span className="font-semibold text-gray-800">Baby&apos;s Logs</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-3 h-2 rounded ${chartType === 'height' ? 'bg-[#f3e8ff] border border-purple-200' : 'bg-[#d1fae5] border border-emerald-200'}`}></div>
              <span>WHO Safe Range (3-97%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 border-t-2 border-dashed border-gray-400"></div>
              <span>WHO Median (50th)</span>
            </div>
          </div>

          {/* Responsive Recharts Container (230px on mobile for fast scanning) */}
          <div className="w-full h-[220px] sm:h-[320px] md:h-[360px] pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="heightRangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8A84C8" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8A84C8" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="weightRangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickFormatter={(val) => `${val}m`}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748b', fontWeight: 500 }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  unit={chartType === 'height' ? 'cm' : 'kg'}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="range"
                  fill={chartType === 'height' ? 'url(#heightRangeGrad)' : 'url(#weightRangeGrad)'}
                  stroke="none"
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="p50"
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  connectNulls
                />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke={chartType === 'height' ? '#7c3aed' : '#059669'}
                  strokeWidth={2.5}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6 }}
                  connectNulls
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Pediatric Insight Box */}
          <div className="flex items-start gap-2.5 bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-[11px] sm:text-xs text-blue-900/80 leading-relaxed font-medium">
            <Info className="w-4 h-4 text-[var(--color-primary)] shrink-0 mt-0.5" />
            <p>
              Pediatricians consider growth within the 3rd to 97th percentile range healthy. Continuous tracking along your baby&apos;s curve is key.
            </p>
          </div>

        </section>

        {/* --- Two-Column Lower Section: Log History & Developmental Milestones --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-start">

          {/* Left Column: Recent Growth Logs History */}
          <div className={`transition-all duration-700 ease-out delay-200 flex flex-col ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center justify-between mb-2.5 sm:mb-3.5">
              <div>
                <h2 className="text-base sm:text-xl font-normal text-black tracking-tight">Measurement History</h2>
                <p className="text-[10px] sm:text-xs text-gray-500 font-light mt-0.5">
                  {records.length > 0 ? `${records.length} Recorded Entries` : "No entries logged yet"}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="text-[10px] sm:text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/15 border-transparent rounded-full px-2.5 py-1 transition-colors cursor-pointer"
                onClick={handleAddEntryClick}
                leftIcon={<Plus className="w-3 h-3" />}
              >
                New Entry
              </Button>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {isLoading ? (
                [1, 2].map(i => (
                  <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-2xl p-3.5 flex gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0"></div>
                    <div className="flex-1 space-y-1.5 py-1">
                      <div className="h-3.5 bg-gray-100 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                    </div>
                  </div>
                ))
              ) : records.length > 0 ? (
                records.slice(-4).reverse().map((rec, idx) => (
                  <div
                    key={rec._id || idx}
                    className="bg-white border border-gray-100 hover:border-[var(--color-primary)]/40 rounded-2xl p-3 sm:p-4 flex items-center justify-between transition-all hover:shadow-xs active:scale-[0.99] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-[var(--color-primary)] flex items-center justify-center font-bold text-xs shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold text-gray-900">
                            {rec.recordedDate ? new Date(rec.recordedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent Log'}
                          </span>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full">
                            Normal
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                          <strong className="text-gray-800">{rec.height} cm</strong> · <strong className="text-gray-800">{rec.weight} kg</strong>
                          {rec.headCircumference ? ` · Head: ${rec.headCircumference}cm` : ''}
                        </p>
                        {rec.notes && (
                          <p className="text-[10px] text-gray-400 italic mt-0.5 truncate max-w-[220px] sm:max-w-md">
                            &quot;{rec.notes}&quot;
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-[var(--color-primary)] shrink-0 bg-purple-50 px-2 py-1 rounded-full">
                      #{records.length - idx}
                    </span>
                  </div>
                ))
              ) : (
                <div className="bg-white border border-gray-100 rounded-2xl p-5 text-center space-y-2.5">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto shadow-2xs">
                    <Image
                      src="/images/growth_hero_baby.png"
                      alt="Baby Growth"
                      width={56}
                      height={56}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900">No Growth Records Logged</h3>
                    <p className="text-[11px] text-gray-500 max-w-xs mx-auto mt-0.5">
                      Start logging measurements to see your baby&apos;s growth velocity curve.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs font-semibold"
                    onClick={handleAddEntryClick}
                    leftIcon={<Plus className="w-3.5 h-3.5" />}
                  >
                    Add First Record
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Developmental Milestones Spotlight with Baby Images */}
          <div className={`transition-all duration-700 ease-out delay-300 flex flex-col ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center justify-between mb-2.5 sm:mb-3.5">
              <div>
                <h2 className="text-base sm:text-xl font-normal text-black tracking-tight">Milestone Spotlight</h2>
                <p className="text-[10px] sm:text-xs text-gray-500 font-light mt-0.5">
                  Key Steps (6-12 Months)
                </p>
              </div>
              <Link href="/growth/milestones">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/15 rounded-full px-2.5 py-1 transition-colors cursor-pointer whitespace-nowrap">
                  <Award className="w-3 h-3" /> Full Guide <ChevronRight className="w-3 h-3" />
                </span>
              </Link>
            </div>

            <div className="space-y-2.5 sm:space-y-3">
              {SAMPLE_MILESTONES.map((m, idx) => {
                const isAchieved = milestones.some(ach => ach.title?.toLowerCase() === m.title.toLowerCase());
                return (
                  <div
                    key={idx}
                    className="bg-white border border-gray-100 hover:border-purple-200 rounded-2xl p-2.5 sm:p-3.5 flex items-center justify-between transition-all hover:shadow-xs active:scale-[0.99] group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shrink-0 shadow-2xs">
                        <Image
                          src={m.image}
                          alt={m.title}
                          width={44}
                          height={44}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-medium text-gray-900 truncate">{m.title}</span>
                          <span
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: `${m.color}15`, color: m.color }}
                          >
                            {m.category}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-gray-500 font-light truncate">{m.desc}</p>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      {isAchieved ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                          <Check className="w-2.5 h-2.5 stroke-[2.5]" /> Done
                        </span>
                      ) : (
                        <span className="text-[9px] font-normal text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                          {m.ageRange}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Doctor Consultation & Pediatric Advice Banner */}
              <div className="bg-gradient-to-r from-purple-50 via-[#FAF8FF] to-blue-50 border border-purple-100/80 rounded-2xl p-3.5 flex items-center justify-between gap-2.5 shadow-2xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-full overflow-hidden shadow-2xs shrink-0">
                    <Image
                      src="/images/doctor_profile.png"
                      alt="Pediatric Doctor"
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1">
                      <Stethoscope className="w-3 h-3 text-[var(--color-primary)] shrink-0" /> Pediatric Guidance
                    </h4>
                    <p className="text-[10px] text-gray-500 font-medium truncate">
                      Doctor consultation on baby milestones
                    </p>
                  </div>
                </div>
                <Link href="/doctor" className="shrink-0">
                  <Button variant="primary" size="sm" className="text-[11px] font-bold px-3 py-1.5" rightIcon={<ArrowRight className="w-3 h-3" />}>
                    Consult
                  </Button>
                </Link>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Add Measurement Mobile Bottom Sheet / Modal */}
      <AnimatePresence>
        {isAddEntryOpen && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
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
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="relative w-full max-w-md bg-white rounded-t-[28px] md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85dvh]"
            >
              {/* Mobile Drag Handle */}
              <div className="md:hidden w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-3 mb-1"></div>

              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-[var(--color-primary)] stroke-[2.5]" /> Log Growth Measurement
                </h3>
                <button
                  onClick={() => setIsAddEntryOpen(false)}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 active:scale-90 rounded-full text-gray-500 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1 pb-4">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={newEntry.date}
                      onChange={e => setNewEntry({ ...newEntry, date: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Scale className="w-3 h-3" /> Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      inputMode="decimal"
                      value={newEntry.weight}
                      onChange={e => setNewEntry({ ...newEntry, weight: e.target.value })}
                      placeholder="e.g. 7.8"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all placeholder:text-gray-400"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                      <Ruler className="w-3 h-3" /> Height (cm)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      inputMode="decimal"
                      value={newEntry.height}
                      onChange={e => setNewEntry({ ...newEntry, height: e.target.value })}
                      placeholder="e.g. 68.5"
                      className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1"><Baby className="w-3 h-3" /> Head Circumference (cm)</span>
                    <span className="text-gray-400 font-normal lowercase text-[10px]">optional</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    value={newEntry.headCircumference}
                    onChange={e => setNewEntry({ ...newEntry, headCircumference: e.target.value })}
                    placeholder="e.g. 43.0"
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all placeholder:text-gray-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Notes / Observations</label>
                  <textarea
                    rows={2}
                    value={newEntry.notes}
                    onChange={e => setNewEntry({ ...newEntry, notes: e.target.value })}
                    placeholder="e.g. active, healthy appetite, doctor checkup..."
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all resize-none placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="px-5 py-3.5 bg-white border-t border-gray-100">
                <Button
                  variant="primary"
                  onClick={handleSaveEntry}
                  className="w-full py-3 font-bold text-xs sm:text-sm shadow-sm"
                  disabled={!newEntry.height || !newEntry.weight}
                >
                  Save Measurement
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
