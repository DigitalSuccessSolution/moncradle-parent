"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, ChevronLeft, Award, Footprints, MessageCircle, Heart, Brain, Lightbulb, Check, X, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getBabies, BabyProfile } from "@/lib/api/babiesApi";
import { getMilestones, addMilestone, Milestone, deleteMilestone } from "@/lib/api/milestonesApi";
import { useAuth } from "@/context/AuthContext";
import { useAppSelector } from "@/store/hooks";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";
import { calculateBabyAgeMonths } from "@/lib/utils/babyAge";

type Category = "All" | "Motor" | "Language" | "Social" | "Cognitive";

const categories: { label: Category; icon: any }[] = [
  { label: "All", icon: Award },
  { label: "Motor", icon: Footprints },
  { label: "Language", icon: MessageCircle },
  { label: "Social", icon: Heart },
  { label: "Cognitive", icon: Brain },
];

const STANDARD_MILESTONES = [
  { title: "First Steps", desc: "Walking independently", category: "Motor", ageGroup: "12-18 Months", tip: "Encourage by holding their hands" },
  { title: "First Word", desc: "Saying meaningful words", category: "Language", ageGroup: "6-12 Months", tip: "Talk to them frequently" },
  { title: "Sits without support", desc: "Sitting up straight", category: "Motor", ageGroup: "6-12 Months", tip: "Use pillows for safety" },
  { title: "Crawling", desc: "Moving on hands and knees", category: "Motor", ageGroup: "6-12 Months", tip: "Place toys just out of reach" },
  { title: "Uses pincer grasp", desc: "Picking up small objects", category: "Motor", ageGroup: "6-12 Months", tip: "Offer safe, finger foods" },
  { title: "Waves bye-bye", desc: "Understanding social gestures", category: "Social", ageGroup: "6-12 Months", tip: "Practice waving when people leave" },
];

export default function MilestonesPage() {
  const router = useRouter();
  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [isLogMilestoneOpen, setIsLogMilestoneOpen] = useState(false);
  
  const [babies, setBabies] = useState<BabyProfile[]>([]);
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [achievedMilestones, setAchievedMilestones] = useState<Milestone[]>([]);
  
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [newEntry, setNewEntry] = useState({
    selectedTitle: "",
    customTitle: "",
    category: "Motor",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const fetchData = async () => {
    try {
      if (isAuthenticated) {
        const babyRes = await getBabies();
        const babiesList: BabyProfile[] = babyRes.data || babyRes || [];
        if (babiesList && babiesList.length > 0) {
          setBabies(babiesList);
          const current = baby ? (babiesList.find(b => b._id === baby._id) || babiesList[0]) : babiesList[0];
          if (current._id) {
            const mRes = await getMilestones(current._id);
            setAchievedMilestones(mRes || []);
          }
          return;
        }
      }
      setBabies([]);
      setBaby(null);
      setAchievedMilestones([]);
    } catch(err) {
      console.error("Failed to load milestones:", err);
    }
  };

  useEffect(() => {
    if (!isAuthLoading) {
      if (isAuthenticated) {
        fetchData();
      } else {
        setBabies([]);
        setBaby(null);
        setAchievedMilestones([]);
      }
    }
  }, [isAuthenticated, isAuthLoading]);

  const handleSelectBaby = async (b: BabyProfile) => {
    if (b._id === baby?._id) return;
    setBaby(b);
    if (b._id) {
      try {
        const mRes = await getMilestones(b._id);
        setAchievedMilestones(mRes || []);
      } catch (err) {
        console.error("Failed to load baby milestones:", err);
      }
    }
  };

  const handleOpenLogModal = () => {
    if (!isAuthenticated) {
      toast("Please login to log milestones", { icon: "🔒" });
      router.push("/login?redirect=/growth/milestones");
      return;
    }
    if (!baby) {
      toast("Please add a baby profile first", { icon: "👶" });
      router.push("/baby-profile");
      return;
    }
    setIsLogMilestoneOpen(true);
  };

  const handleSave = async () => {
    const finalTitle = newEntry.selectedTitle === "Other" ? newEntry.customTitle : newEntry.selectedTitle;
    if (!baby || !finalTitle) return;
    try {
      await addMilestone({
        babyId: baby._id!,
        title: finalTitle,
        dateAchieved: newEntry.date,
        category: newEntry.category,
        notes: newEntry.notes,
      });
      toast.success("Milestone recorded!");
      setIsLogMilestoneOpen(false);
      setNewEntry({ selectedTitle: "", customTitle: "", category: "Motor", date: new Date().toISOString().split('T')[0], notes: "" });
      fetchData();
    } catch(err) {
      console.error(err);
      toast.error("Failed to save milestone");
    }
  };

  const handleQuickLog = async (milestone: any) => {
    if (!isAuthenticated) {
      toast("Please login to log milestones", { icon: "🔒" });
      router.push("/login?redirect=/growth/milestones");
      return;
    }
    if (!baby) {
      toast("Please add a baby profile first", { icon: "👶" });
      router.push("/baby-profile");
      return;
    }
    try {
      await addMilestone({
        babyId: baby._id!,
        title: milestone.title,
        category: milestone.category,
        dateAchieved: new Date().toISOString().split('T')[0],
        notes: "",
      });
      toast.success(`Marked "${milestone.title}" as achieved!`);
      fetchData();
    } catch(err) {
      console.error(err);
      toast.error("Failed to log milestone");
    }
  };

  const handleUndo = async (milestoneId: string) => {
    if (!isAuthenticated) {
      toast("Please login to manage milestones", { icon: "🔒" });
      router.push("/login?redirect=/growth/milestones");
      return;
    }
    try {
      await deleteMilestone(milestoneId);
      toast.success("Milestone removed");
      fetchData();
    } catch(err) {
      console.error(err);
      toast.error("Failed to remove milestone");
    }
  };

  // Merge STANDARD_MILESTONES with achieved
  const combinedMilestones = STANDARD_MILESTONES.map((std, i) => {
    const achieved = achievedMilestones.find(m => m.title.toLowerCase() === std.title.toLowerCase());
    if (achieved) {
      return {
        id: achieved._id || i.toString(),
        title: achieved.title,
        date: achieved.dateAchieved,
        status: "completed",
        desc: achieved.notes || std.desc,
        category: achieved.category || std.category,
        ageGroup: std.ageGroup,
        imageUrl: achieved.photoUrl || ""
      };
    }
    return {
      id: "std-" + i,
      title: std.title,
      date: "Upcoming",
      status: "pending",
      desc: std.desc,
      category: std.category,
      ageGroup: std.ageGroup,
      tip: std.tip
    };
  });

  // Add any custom ones achieved that aren't in standard
  achievedMilestones.forEach(achieved => {
    if (!STANDARD_MILESTONES.find(std => std.title.toLowerCase() === achieved.title.toLowerCase())) {
      combinedMilestones.push({
        id: achieved._id || Math.random().toString(),
        title: achieved.title,
        date: achieved.dateAchieved,
        status: "completed",
        desc: achieved.notes || "",
        category: achieved.category || "Other",
        ageGroup: "Achieved",
        imageUrl: achieved.photoUrl || ""
      });
    }
  });

  const filteredMilestones = activeCategory === "All" ? combinedMilestones : combinedMilestones.filter(m => m.category === activeCategory);

  const groupedMilestones = filteredMilestones.reduce((acc, milestone) => {
    if (!acc[milestone.ageGroup]) acc[milestone.ageGroup] = [];
    acc[milestone.ageGroup].push(milestone as any);
    return acc;
  }, {} as Record<string, any[]>);
  
  const completedCount = combinedMilestones.filter(m => m.status === 'completed').length;
  const totalCount = combinedMilestones.length;
  const progressPct = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const strokeDashoffset = 264 - (264 * progressPct) / 100;

  let upcomingMilestone = null;
  let expectedTimeText = "";

  if (baby && combinedMilestones.length > 0) {
    const pending = combinedMilestones.find(m => m.status === 'pending');
    if (pending) {
      upcomingMilestone = pending;
      const ageInMonths = calculateBabyAgeMonths(baby.dateOfBirth, baby.ageInMonths);
      
      const match = pending.ageGroup.match(/(\d+)/);
      if (match) {
        const targetMinMonth = parseInt(match[1]);
        const diff = targetMinMonth - ageInMonths;
        if (diff > 0) {
          expectedTimeText = `Expected in next ${diff} month${diff > 1 ? 's' : ''}`;
        } else {
          expectedTimeText = `Expected at ${pending.ageGroup}`;
        }
      } else {
         expectedTimeText = `Expected at ${pending.ageGroup}`;
      }
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-28 md:pb-12 relative selection:bg-[var(--color-primary)]/20">
      
      {/* Mobile Sticky Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-2xs">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all cursor-pointer">
            <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2} />
          </button>
          <h1 className="text-[17px] font-semibold text-gray-900 ml-1 tracking-tight">Developmental Milestones</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={handleOpenLogModal} className="text-[var(--color-primary)] font-semibold p-1.5 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <button onClick={() => router.push('/notifications')} className="relative p-2 -mr-1 rounded-full hover:bg-gray-100 transition-colors cursor-pointer group">
            <Bell className="w-6 h-6 text-gray-800 group-hover:text-black transition-colors" />
            {unreadNotificationsCount > 0 && <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>}
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-3.5 sm:px-4 md:px-8 pt-2 sm:pt-3 md:pt-6 space-y-6 sm:space-y-8">
        
        {/* Desktop Navigation & Baby Profile Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div className="hidden md:flex items-center -ml-2">
            <button 
              onClick={() => router.back()} 
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-semibold text-sm">Back</span>
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            {babies.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">Baby:</span>
                {babies.map((b) => (
                  <button
                    key={b._id}
                    onClick={() => handleSelectBaby(b)}
                    className={`text-xs px-3.5 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${
                      baby?._id === b._id
                        ? "bg-[var(--color-primary)] text-white font-semibold shadow-xs"
                        : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {b.name || "Baby"}
                  </button>
                ))}
              </div>
            )}
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleOpenLogModal}
              className="hidden md:inline-flex text-xs font-medium cursor-pointer"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Log Milestone
            </Button>
          </div>
        </div>

        {/* Header Title */}
        <div className="hidden md:block">
          <h1 className="text-2xl sm:text-3xl font-normal text-black tracking-tight leading-tight">Developmental Milestones</h1>
          <p className="text-xs sm:text-sm font-light text-gray-500 mt-1 leading-relaxed">Check off important physical, cognitive, and social milestones.</p>
        </div>

        {/* Stat Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4 md:gap-6 w-full">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="bg-purple-100/50 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-purple-100 flex items-center gap-3.5 sm:gap-5 md:gap-6">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="stroke-purple-100" strokeWidth="10" fill="none" />
                <motion.circle cx="50" cy="50" r="42" className="stroke-purple-500" strokeWidth="10" fill="none" strokeDasharray="264" initial={{ strokeDashoffset: 264 }} animate={{ strokeDashoffset }} transition={{ duration: 1.2, delay: 0.2, ease: "easeOut" }} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.4 }} className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 leading-none">
                  {progressPct}%
                </motion.span>
                <span className="text-[9px] sm:text-[10px] md:text-xs text-gray-500 font-normal mt-0.5 sm:mt-1">Complete</span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-baseline gap-1.5 mb-0.5 sm:mb-1">
                <span className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800">{completedCount}/{totalCount}</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 font-light mb-2 sm:mb-3">Milestones achieved</p>
              <div className="inline-flex items-center gap-1.5 bg-[#e8f7ed] text-[#2e9154] px-2.5 py-1 rounded-full w-fit">
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="text-[11px] sm:text-xs font-medium">On Track</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="bg-[#FFF6F0] p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-orange-100 flex items-center justify-between relative overflow-hidden group min-h-[110px] sm:min-h-0">
            {upcomingMilestone ? (
              <div className="flex flex-col z-10 pr-16 sm:pr-0">
                <h4 className="text-[#E67A3D] text-[10px] sm:text-[11px] md:text-xs font-medium mb-1 tracking-wide uppercase">Upcoming Milestone</h4>
                <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-1 sm:mb-1.5 truncate max-w-[200px] sm:max-w-none">{upcomingMilestone.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
                  {expectedTimeText.startsWith("Expected in next") ? (
                    <>
                      Expected in next <span className="text-gray-800 font-semibold">{expectedTimeText.replace(/Expected in next /i, "")}</span>
                    </>
                  ) : (
                    <span className="text-gray-800 font-semibold">{expectedTimeText}</span>
                  )}
                </p>
              </div>
            ) : (
              <div className="flex flex-col z-10 pr-16 sm:pr-0">
                <h4 className="text-[#E67A3D] text-[10px] sm:text-[11px] md:text-xs font-medium mb-1 tracking-wide uppercase">Status</h4>
                <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-800 mb-1">All Caught Up!</h3>
                <p className="text-xs sm:text-sm text-gray-500 font-light">Amazing progress on milestones!</p>
              </div>
            )}
            <div className="absolute right-0 bottom-0 h-[105%] sm:h-[115%] w-[38%] sm:w-[45%] pointer-events-none flex items-end justify-end">
              <img src="/images/happybabymilestone.png" alt="Milestone Baby" className="w-full h-full object-contain object-right-bottom drop-shadow-sm" />
            </div>
          </motion.div>
        </div>

        {/* Categories Bar */}
        <div className="flex flex-nowrap overflow-x-auto no-scrollbar items-center gap-2 w-full pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.label;
            return (
              <button
                key={cat.label}
                onClick={() => setActiveCategory(cat.label)}
                className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all border flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-xs"
                    : "bg-white text-gray-600 border-gray-200 hover:border-[var(--color-primary)]/50 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" /> {cat.label}
              </button>
            );
          })}
        </div>

        {/* Milestones Content Timeline */}
        <div className="w-full space-y-8">
          <div>
            <h2 className="text-lg sm:text-xl font-normal text-black tracking-tight">Developmental Timeline</h2>
            <p className="text-xs sm:text-sm font-light text-gray-500 mt-0.5">Track important steps grouped by developmental age</p>
          </div>

          <div className="space-y-10">
            <AnimatePresence mode="popLayout">
              {Object.entries(groupedMilestones).map(([ageGroup, items]) => (
                <motion.div key={ageGroup} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }}>
                  <h4 className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 pl-4">{ageGroup}</h4>
                  <div className="relative border-l-2 border-gray-200 ml-4 space-y-6">
                    {items.map((milestone) => (
                      <div key={milestone.id} className="relative pl-7 group">
                        <div className={`absolute -left-[11px] top-4 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${milestone.status === 'completed' ? 'bg-emerald-500 ring-4 ring-white' : 'bg-gray-300 ring-4 ring-white'}`}></div>
                        <div className="bg-white hover:bg-gray-50/50 transition-colors p-4 sm:p-5 rounded-2xl border border-gray-100/90 shadow-2xs">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
                            <div className="flex items-start gap-3">
                              <button 
                                onClick={() => milestone.status === 'completed' ? handleUndo(milestone.id) : handleQuickLog(milestone)}
                                className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all cursor-pointer ${
                                  milestone.status === 'completed' 
                                    ? 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600' 
                                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                              >
                                {milestone.status === 'completed' && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                              </button>
                              <div>
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className="text-[9px] sm:text-[10px] font-medium text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                    {milestone.category}
                                  </span>
                                </div>
                                <h4 className={`text-sm sm:text-base font-medium ${milestone.status === 'completed' ? 'text-gray-900' : 'text-gray-700'}`}>{milestone.title}</h4>
                              </div>
                            </div>
                            {milestone.status === 'completed' ? (
                              <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 w-fit shrink-0">
                                Achieved
                              </span>
                            ) : (
                              <span className="bg-orange-50 border border-orange-100 text-orange-700 text-[10px] sm:text-xs font-medium px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 w-fit shrink-0">
                                Pending
                              </span>
                            )}
                          </div>
                          {milestone.date !== "Upcoming" && (
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 font-normal mb-2.5 pl-9">
                              <Calendar className="w-3.5 h-3.5" /> {milestone.date}
                            </div>
                          )}
                          <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed pl-9">{milestone.desc}</p>
                          {milestone.status === 'pending' && milestone.tip && (
                            <div className="mt-3 ml-9 flex items-start gap-2 bg-blue-50/60 text-blue-800/90 p-3 rounded-xl border border-blue-100">
                              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                              <p className="text-xs font-normal leading-relaxed">{milestone.tip}</p>
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
              <div className="text-center py-12"><p className="text-gray-400 font-medium">No milestones found in this category.</p></div>
            )}
          </div>
        </div>

      </div>

      {/* Log Milestone Modal */}
      <AnimatePresence>
        {isLogMilestoneOpen && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogMilestoneOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-xl overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2"><Award className="w-5 h-5 text-[var(--color-primary)]" /> Log Milestone</h3>
                <button onClick={() => setIsLogMilestoneOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
              </div>

              <div className="px-6 py-6 space-y-5 overflow-y-auto max-h-[55dvh] pb-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Milestone Achieved</label>
                  <select 
                    value={newEntry.selectedTitle} 
                    onChange={e => {
                      const val = e.target.value;
                      const standard = STANDARD_MILESTONES.find(m => m.title === val);
                      setNewEntry({
                        ...newEntry, 
                        selectedTitle: val,
                        category: standard ? standard.category : newEntry.category
                      });
                    }} 
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all appearance-none"
                  >
                    <option value="" disabled>Select a milestone...</option>
                    {STANDARD_MILESTONES.map((m, i) => (
                      <option key={i} value={m.title}>{m.title}</option>
                    ))}
                    <option value="Other">Other (Custom Milestone)</option>
                  </select>
                </div>

                {newEntry.selectedTitle === "Other" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Custom Title</label>
                    <input 
                      type="text" 
                      value={newEntry.customTitle} 
                      onChange={e => setNewEntry({...newEntry, customTitle: e.target.value})} 
                      placeholder="e.g. Clapped hands for the first time" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all placeholder:text-gray-400" 
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</label>
                    <select value={newEntry.category} onChange={e => setNewEntry({...newEntry, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all appearance-none">
                      <option value="Motor">Motor</option>
                      <option value="Language">Language</option>
                      <option value="Social">Social</option>
                      <option value="Cognitive">Cognitive</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="date" value={newEntry.date} onChange={e => setNewEntry({...newEntry, date: e.target.value})} className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Story / Notes</label>
                  <textarea rows={2} value={newEntry.notes} onChange={e => setNewEntry({...newEntry, notes: e.target.value})} placeholder="Describe this special moment..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-normal text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all resize-none placeholder:text-gray-400"></textarea>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 bg-white flex justify-center">
                <Button variant="primary" onClick={handleSave} disabled={!newEntry.selectedTitle || (newEntry.selectedTitle === 'Other' && !newEntry.customTitle)} className="px-8 font-semibold text-sm">
                  Save Milestone
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
