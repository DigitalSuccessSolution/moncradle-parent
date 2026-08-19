"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar, ChevronLeft, CheckCircle2, Award, Target, Footprints, MessageCircle, Heart, Brain, Lightbulb, Baby, Check, ChevronRight, X, ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { getBabies, BabyProfile } from "@/lib/api/babiesApi";
import { getMilestones, addMilestone, Milestone, deleteMilestone } from "@/lib/api/milestonesApi";

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
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [isLogMilestoneOpen, setIsLogMilestoneOpen] = useState(false);
  
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [achievedMilestones, setAchievedMilestones] = useState<Milestone[]>([]);
  
  const [newEntry, setNewEntry] = useState({
    selectedTitle: "",
    customTitle: "",
    category: "Motor",
    date: new Date().toISOString().split('T')[0],
    notes: ""
  });

  const fetchData = async () => {
    try {
      const babyRes = await getBabies();
      const babies = babyRes.data || babyRes;
      if (babies && babies.length > 0) {
        setBaby(babies[0]);
        const mRes = await getMilestones(babies[0]._id);
        setAchievedMilestones(mRes || []);
      }
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      setIsLogMilestoneOpen(false);
      setNewEntry({ selectedTitle: "", customTitle: "", category: "Motor", date: new Date().toISOString().split('T')[0], notes: "" });
      fetchData();
    } catch(err) {
      console.error(err);
    }
  };

  const handleQuickLog = async (milestone: any) => {
    if (!baby) return;
    try {
      await addMilestone({
        babyId: baby._id!,
        title: milestone.title,
        category: milestone.category,
        dateAchieved: new Date().toISOString().split('T')[0],
        notes: "",
      });
      fetchData();
    } catch(err) {
      console.error(err);
    }
  };

  const handleUndo = async (milestoneId: string) => {
    try {
      await deleteMilestone(milestoneId);
      fetchData();
    } catch(err) {
      console.error(err);
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
      const dob = new Date(baby.dateOfBirth || Date.now());
      const now = new Date();
      const ageInMonths = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
      
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
    <div className="min-h-screen bg-white font-sans pb-24 md:pb-0 relative selection:bg-[var(--color-primary)]/20">
            <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6 relative z-10">
        
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">Milestones</h1>
          </div>
          <button onClick={() => setIsLogMilestoneOpen(true)} className="text-[var(--color-primary)] font-semibold text-sm active:scale-95 transition-transform mr-1">
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center mb-2 -ml-3 md:ml-0 justify-between">
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1 px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="font-semibold text-[15px]">Back</span>
          </button>
          
          <button onClick={() => setIsLogMilestoneOpen(true)} className="bg-[var(--color-primary)] text-white px-4 md:px-5 py-2 md:py-2.5 rounded-full font-semibold flex items-center justify-center gap-1.5 hover:bg-[var(--color-primary)]/90 transition-all text-xs md:text-sm active:scale-95 shadow-sm">
            <Plus className="w-3.5 h-3.5" /> Log Milestone
          </button>
        </div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }} className="hidden md:block mb-4">
          <h1 className="text-3xl md:text-4xl font-semibold text-[#122B54]">Developmental Milestones</h1>
          <p className="text-sm md:text-base font-medium text-gray-500 mt-2">Check off important developmental steps</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10 w-full max-w-4xl">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2, type: "spring" }} className="bg-purple-100/50 p-5 rounded-lg flex items-center gap-5 md:gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="stroke-purple-100" strokeWidth="10" fill="none" />
                <motion.circle cx="50" cy="50" r="42" className="stroke-purple-500" strokeWidth="10" fill="none" strokeDasharray="264" initial={{ strokeDashoffset: 264 }} animate={{ strokeDashoffset }} transition={{ duration: 1.2, delay: 0.4, ease: "easeOut" }} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, delay: 0.8, type: "spring" }} className="text-xl md:text-2xl font-semibold text-gray-900 leading-none">
                  {progressPct}%
                </motion.span>
                <span className="text-[10px] md:text-xs text-gray-500 font-medium mt-1">Complete</span>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-baseline gap-1.5 mb-1">
                <span className="text-2xl md:text-3xl font-semibold text-[#1c1c28]">{completedCount}/{totalCount}</span>
              </div>
              <p className="text-xs md:text-sm text-gray-500 font-medium mb-3">Milestones achieved</p>
              <div className="inline-flex items-center gap-1.5 bg-[#e8f7ed] text-[#2e9154] px-2.5 py-1 rounded-full w-fit">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span className="text-[11px] md:text-xs font-semibold">On Track</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3, type: "spring" }} className="bg-[#FFF6F0] p-6 rounded-lg flex items-center justify-between relative overflow-hidden group cursor-pointer">
            {upcomingMilestone ? (
              <div className="flex flex-col z-10">
                <h4 className="text-[#E67A3D] text-[11px] md:text-xs font-semibold mb-1.5 tracking-wide">Upcoming Milestone</h4>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">{upcomingMilestone.title}</h3>
                <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed">
                  {expectedTimeText.startsWith("Expected in next") ? (
                    <>
                      Expected in next<br />
                      <span className="text-gray-700 font-semibold">{expectedTimeText.replace(/Expected in next /i, "")}</span>
                    </>
                  ) : (
                    <span className="text-gray-700 font-semibold">{expectedTimeText}</span>
                  )}
                </p>
              </div>
            ) : (
              <div className="flex flex-col z-10">
                <h4 className="text-[#E67A3D] text-[11px] md:text-xs font-semibold mb-1.5 tracking-wide">Status</h4>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2">All Caught Up!</h3>
                <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed">
                  Amazing progress!
                </p>
              </div>
            )}
            <div className="absolute right-0 bottom-0 h-[115%] w-[60%] pointer-events-none flex items-end justify-end">
              <img src="/images/happybabymilestone.png" alt="Upcoming Milestone Baby" className="w-full h-full object-contain object-right-bottom drop-shadow-sm" />
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex flex-nowrap overflow-x-auto no-scrollbar items-center gap-2 mb-8 md:mb-10 w-full pb-2">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.label;
            return (
              <button key={cat.label} onClick={() => setActiveCategory(cat.label)} className={`whitespace-nowrap shrink-0 px-4 py-2 rounded-full text-[11px] md:text-xs font-semibold transition-all border flex items-center gap-1.5 ${isActive ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:border-[var(--color-primary)]/50 hover:bg-gray-50"}`}>
                <Icon className="w-3.5 h-3.5 md:w-4 md:h-4" /> {cat.label}
              </button>
            )
          })}
        </motion.div>

        <motion.div key="milestones-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5, type: "spring", bounce: 0.3 }} className="w-full max-w-4xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="font-semibold text-xl md:text-2xl text-[#122B54]">Developmental Timeline</h3>
              <p className="text-sm font-medium text-gray-500 mt-1">Track important steps grouped by age</p>
            </div>
          </div>

          <div className="space-y-12">
            <AnimatePresence mode="popLayout">
              {Object.entries(groupedMilestones).map(([ageGroup, items]) => (
                <motion.div key={ageGroup} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <h4 className="text-sm md:text-base font-semibold text-gray-400 uppercase tracking-wider mb-6 pl-4">{ageGroup}</h4>
                  <div className="relative border-l-2 border-gray-200 ml-4 space-y-8">
                    {items.map((milestone, i) => (
                      <div key={milestone.id} className="relative pl-8 group">
                        <div className={`absolute -left-[11px] top-4 w-5 h-5 rounded-full flex items-center justify-center transition-colors ${milestone.status === 'completed' ? 'bg-emerald-500 ring-4 ring-[#F8FAFC]' : 'bg-gray-300 ring-4 ring-[#F8FAFC]'}`}></div>
                        <div className="bg-white hover:bg-gray-50/50 transition-colors p-5 md:p-6 rounded-lg border border-gray-100">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                            <div className="flex items-start gap-3">
                              <button 
                                onClick={() => milestone.status === 'completed' ? handleUndo(milestone.id) : handleQuickLog(milestone)}
                                className={`mt-0.5 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                                  milestone.status === 'completed' 
                                    ? 'bg-emerald-500 border-emerald-500 hover:bg-emerald-600 hover:border-emerald-600' 
                                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                              >
                                {milestone.status === 'completed' && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                              </button>
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-[9px] md:text-[10px] font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2.5 py-1 rounded-full uppercase tracking-widest">
                                    {milestone.category}
                                  </span>
                                </div>
                                <h4 className={`font-semibold text-base md:text-lg ${milestone.status === 'completed' ? 'text-gray-900' : 'text-gray-600'}`}>{milestone.title}</h4>
                              </div>
                            </div>
                            {milestone.status === 'completed' ? (
                              <span className="bg-emerald-50 border border-emerald-100 text-emerald-600 text-[10px] md:text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 w-fit shrink-0">
                                Achieved
                              </span>
                            ) : (
                              <span className="bg-orange-50 border border-orange-100 text-orange-600 text-[10px] md:text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 w-fit shrink-0">
                                Pending
                              </span>
                            )}
                          </div>
                          {milestone.date !== "Upcoming" && (
                            <div className="flex items-center gap-1.5 text-xs md:text-sm text-gray-400 font-semibold mb-3">
                              <Calendar className="w-4 h-4" /> {milestone.date}
                            </div>
                          )}
                          <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-4">{milestone.desc}</p>
                          {milestone.status === 'completed' && milestone.imageUrl && (
                            <div className="mt-4 rounded-lg overflow-hidden border border-gray-100 h-32 md:h-48 w-full md:w-2/3 lg:w-1/2 relative group/img cursor-pointer">
                              <img src={milestone.imageUrl} alt={milestone.title} className="w-full h-full object-cover transition-transform duration-500 group-hover/img:scale-105" />
                            </div>
                          )}
                          {milestone.status === 'pending' && milestone.tip && (
                            <div className="mt-4 flex items-start gap-2.5 bg-blue-50/50 text-blue-700/80 p-3 md:p-4 rounded-lg border border-blue-100">
                              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                              <p className="text-xs md:text-sm font-medium leading-relaxed">{milestone.tip}</p>
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
              <div className="text-center py-12"><p className="text-gray-400 font-medium">No milestones found.</p></div>
            )}
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {isLogMilestoneOpen && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLogMilestoneOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-xl overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-extrabold text-[#122B54] flex items-center gap-2"><Award className="w-5 h-5 text-[var(--color-primary)]" /> Log Milestone</h3>
                <button onClick={() => setIsLogMilestoneOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X className="w-4 h-4" /></button>
              </div>

              <div className="px-6 py-6 space-y-5 overflow-y-auto max-h-[55dvh] pb-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Milestone Achieved</label>
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all appearance-none"
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
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Custom Title</label>
                    <input 
                      type="text" 
                      value={newEntry.customTitle} 
                      onChange={e => setNewEntry({...newEntry, customTitle: e.target.value})} 
                      placeholder="e.g. Clapped hands for the first time" 
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all placeholder:text-gray-400" 
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</label>
                    <select value={newEntry.category} onChange={e => setNewEntry({...newEntry, category: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all appearance-none">
                      <option value="Motor">Motor</option>
                      <option value="Language">Language</option>
                      <option value="Social">Social</option>
                      <option value="Cognitive">Cognitive</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="date" value={newEntry.date} onChange={e => setNewEntry({...newEntry, date: e.target.value})} className="w-full pl-9 pr-3 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all" />
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Story / Notes</label>
                  <textarea rows={2} value={newEntry.notes} onChange={e => setNewEntry({...newEntry, notes: e.target.value})} placeholder="Describe this special moment..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all resize-none placeholder:text-gray-400"></textarea>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 bg-white flex justify-center">
                <button onClick={handleSave} disabled={!newEntry.selectedTitle || (newEntry.selectedTitle === 'Other' && !newEntry.customTitle)} className="bg-[var(--color-primary)] text-white px-8 py-2.5 rounded-full font-semibold text-sm hover:bg-[var(--color-primary)]/90 active:scale-95 transition-all shadow-sm disabled:opacity-50">
                  Save Milestone
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
          </div>
  );
}
