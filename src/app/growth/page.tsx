"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Plus, Calendar, Activity, ArrowUpRight, ChevronLeft, Ruler, Scale, Baby, ShieldCheck, TrendingUp, CheckCircle2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getBabies, BabyProfile } from "@/lib/api/babiesApi";
import { getGrowthRecords, addGrowthRecord, GrowthRecord } from "@/lib/api/growthApi";
import { useAuth } from "@/context/AuthContext";

export default function GrowthPage() {
  const router = useRouter();
  const [chartType, setChartType] = useState<"height" | "weight">("height");
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);

  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [records, setRecords] = useState<GrowthRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  const [newEntry, setNewEntry] = useState({
    weight: "",
    height: "",
    headCircumference: "",
    notes: "",
    date: new Date().toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      const babyRes = await getBabies();
      const babies = babyRes.data || babyRes;
      if (babies && babies.length > 0) {
        setBaby(babies[0]);
        const recordsRes = await getGrowthRecords(babies[0]._id);
        // sort by created at or date
        const sorted = (recordsRes || []).sort((a, b) => new Date(a.recordedDate || a.createdAt || 0).getTime() - new Date(b.recordedDate || b.createdAt || 0).getTime());
        setRecords(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAddEntryOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isAddEntryOpen]);

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
      setIsAddEntryOpen(false);
      setNewEntry({ weight: "", height: "", headCircumference: "", notes: "", date: new Date().toISOString().split('T')[0] });
      fetchData(); // refresh
    } catch (err) {
      console.error(err);
    }
  };

  const latestRecord = records.length > 0 ? records[records.length - 1] : null;

  // Compute age in months
  let ageMonths = 0;
  if (baby && baby.dateOfBirth) {
    const dob = new Date(baby.dateOfBirth);
    const now = new Date();
    ageMonths = (now.getFullYear() - dob.getFullYear()) * 12 + now.getMonth() - dob.getMonth();
    if (ageMonths < 0) ageMonths = 0;
  }

  let statusText = "No Data";
  let statusColor = "blue";
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

  const standardBoysW = [{m:0,p3:2.5,p50:3.3,p97:4.4},{m:2,p3:4.3,p50:5.6,p97:7.1},{m:4,p3:5.6,p50:7.0,p97:8.7},{m:6,p3:6.4,p50:7.9,p97:9.8},{m:9,p3:7.1,p50:8.9,p97:11.0},{m:12,p3:7.7,p50:9.6,p97:12.0},{m:18,p3:8.6,p50:10.9,p97:13.7},{m:24,p3:9.7,p50:12.2,p97:15.3}];
  const standardGirlsW = [{m:0,p3:2.4,p50:3.2,p97:4.2},{m:2,p3:3.9,p50:5.1,p97:6.6},{m:4,p3:5.0,p50:6.4,p97:8.2},{m:6,p3:5.7,p50:7.3,p97:9.3},{m:9,p3:6.5,p50:8.2,p97:10.5},{m:12,p3:7.0,p50:8.9,p97:11.5},{m:18,p3:8.1,p50:10.2,p97:13.2},{m:24,p3:9.0,p50:11.5,p97:14.8}];
  const standardBoysH = [{m:0,p3:46.1,p50:49.9,p97:53.7},{m:2,p3:54.4,p50:58.4,p97:62.4},{m:4,p3:59.7,p50:63.9,p97:68.0},{m:6,p3:63.3,p50:67.6,p97:71.9},{m:9,p3:67.7,p50:72.0,p97:76.2},{m:12,p3:71.0,p50:75.7,p97:80.5},{m:18,p3:76.9,p50:82.3,p97:87.7},{m:24,p3:81.7,p50:87.8,p97:93.9}];
  const standardGirlsH = [{m:0,p3:45.4,p50:49.1,p97:52.9},{m:2,p3:53.0,p50:57.1,p97:61.1},{m:4,p3:58.0,p50:62.1,p97:66.2},{m:6,p3:61.2,p50:65.7,p97:70.3},{m:9,p3:65.3,p50:70.1,p97:75.0},{m:12,p3:68.9,p50:74.0,p97:79.2},{m:18,p3:74.9,p50:80.7,p97:86.5},{m:24,p3:80.0,p50:86.4,p97:92.9}];

  const isBoy = baby?.gender === 'Boy';
  const standardW = isBoy ? standardBoysW : standardGirlsW;
  const standardH = isBoy ? standardBoysH : standardGirlsH;
  const standardData = chartType === 'height' ? standardH : standardW;

  let chartDataMap = new Map();
  standardData.forEach(d => {
    chartDataMap.set(d.m, { month: d.m, range: [d.p3, d.p97], p50: d.p50 });
  });

  if (baby && baby.dateOfBirth) {
    const dob = new Date(baby.dateOfBirth);
    records.forEach(r => {
       const rDate = new Date(r.recordedDate || r.createdAt || Date.now());
       const rAgeMonths = (rDate.getFullYear() - dob.getFullYear()) * 12 + rDate.getMonth() - dob.getMonth();
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl">
          <p className="font-semibold text-gray-900 mb-1">{label} Months Old</p>
          {payload.map((p: any, idx: number) => {
            if (p.dataKey === 'actual') {
              return <p key={idx} className={`font-semibold ${chartType === 'height' ? 'text-purple-600' : 'text-emerald-600'} text-sm`}>Baby's {chartType === 'height' ? 'Height' : 'Weight'}: {p.value} {chartType === 'height' ? 'cm' : 'kg'}</p>;
            } else if (p.dataKey === 'p50') {
              return <p key={idx} className="text-gray-500 text-sm">Average (WHO 50th): {p.value} {chartType === 'height' ? 'cm' : 'kg'}</p>;
            }
            return null;
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24 md:pb-0 relative selection:bg-[var(--color-primary)]/20">
      
      <section className="relative w-full min-h-[350px] md:min-h-[450px] flex items-center justify-start overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/growth.png" alt="Baby Growth" className="w-full h-full object-cover object-[center_20%] md:hidden" />
          <img src="/images/growth2.png" alt="Baby Growth" className="w-full h-full object-cover object-[center_40%] hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
        </div>

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
            className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] md:text-xs font-semibold uppercase tracking-wider px-3 md:px-3.5 py-1.5 md:py-2 rounded-full shadow-sm mb-4"
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
            <Link href="/growth/milestones" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 bg-white text-[#122B54] hover:bg-gray-100">
              Explore Milestones
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6 md:space-y-8 relative z-10">
        <motion.div key="summary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 md:space-y-8">
          
          <motion.div
            initial="hidden" animate="visible"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } } }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
          >
            {/* Height Card */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-purple-100/60 p-3 md:p-5 rounded-lg flex flex-col justify-center">
              <div className="flex items-center gap-2.5 md:gap-4 mb-2 md:mb-4">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-purple-400 flex items-center justify-center flex-shrink-0">
                  <Ruler className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-semibold text-purple-600 leading-tight">Height</h3>
                  <p className="text-lg md:text-3xl font-semibold text-gray-900 leading-tight">{latestRecord ? latestRecord.height : '--'} <span className="text-lg md:text-base font-semibold text-gray-500">cm</span></p>
                </div>
              </div>
            </motion.div>

            {/* Weight Card */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-emerald-100/60 p-3 md:p-5 rounded-lg flex flex-col justify-center">
              <div className="flex items-center gap-2.5 md:gap-4 mb-2 md:mb-4">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Scale className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-semibold text-emerald-600 leading-tight">Weight</h3>
                  <p className="text-lg md:text-3xl font-semibold text-gray-900 leading-tight">{latestRecord ? latestRecord.weight : '--'} <span className="text-lg md:text-base font-semibold text-gray-500">kg</span></p>
                </div>
              </div>
            </motion.div>

            {/* Age Card */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="bg-orange-100/60 p-3 md:p-5 rounded-lg flex flex-col justify-center">
              <div className="flex items-center gap-2.5 md:gap-4 mb-2 md:mb-4">
                <div className="w-8 h-8 md:w-12 md:h-12 rounded-full bg-orange-400 flex items-center justify-center flex-shrink-0">
                  <Baby className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xs md:text-sm font-semibold text-orange-600 leading-tight">Age</h3>
                  <p className="text-lg md:text-3xl font-semibold text-gray-900 leading-tight">{ageMonths} <span className="text-lg md:text-base font-semibold text-gray-500">Months</span></p>
                </div>
              </div>
            </motion.div>

            {/* Status Card */}
            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className={`${statusColor === 'orange' ? 'bg-orange-100/60' : statusColor === 'emerald' ? 'bg-emerald-100/60' : 'bg-blue-100/60'} p-3 md:p-5 rounded-lg flex flex-col justify-center`}>
              <div className="flex items-center gap-2.5 md:gap-4 mb-2 md:mb-4">
                <div className={`w-8 h-8 md:w-12 md:h-12 rounded-full ${statusColor === 'orange' ? 'bg-orange-400' : statusColor === 'emerald' ? 'bg-emerald-400' : 'bg-blue-400'} flex items-center justify-center flex-shrink-0`}>
                  <ShieldCheck className="w-4 h-4 md:w-6 md:h-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-xs md:text-sm font-semibold ${statusColor === 'orange' ? 'text-orange-600' : statusColor === 'emerald' ? 'text-emerald-600' : 'text-blue-600'} leading-tight`}>Status</h3>
                  <p className="text-lg md:text-2xl font-semibold text-gray-900 leading-tight">{statusText}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          <div className="mt-8 md:mt-12">
            <div className="mb-8 md:mb-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 shrink-0">
                  Growth Chart
                </h2>

                <div className="flex flex-nowrap overflow-x-auto no-scrollbar items-center gap-2 w-full md:w-auto">
                  <button onClick={() => setChartType("height")} className={`whitespace-nowrap shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[11px] md:text-xs font-semibold transition-all border ${chartType === "height" ? "bg-purple-600 text-white border-purple-600 shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:border-purple-300"}`}>Height Chart</button>
                  <button onClick={() => setChartType("weight")} className={`whitespace-nowrap shrink-0 px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[11px] md:text-xs font-semibold transition-all border ${chartType === "weight" ? "bg-emerald-600 text-white border-emerald-600 shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:border-emerald-300"}`}>Weight Chart</button>
                  <button onClick={() => setIsAddEntryOpen(true)} className="whitespace-nowrap shrink-0 bg-[var(--color-primary)] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full font-semibold flex items-center justify-center gap-1 hover:bg-[var(--color-primary)]/90 transition-all text-[11px] md:text-xs shadow-sm ml-auto md:ml-0"><Plus className="w-3 h-3 md:w-3.5 md:h-3.5" /> Add Entry</button>
                </div>
              </div>
            </div>

            <div className="relative min-h-[350px] md:min-h-[400px] mt-6 bg-white p-4 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-4 mb-4 text-xs font-semibold text-gray-500">
                <div className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded-full ${chartType === 'height' ? 'bg-purple-600' : 'bg-emerald-600'}`}></div> Baby's Growth</div>
                <div className="flex items-center gap-1.5"><div className={`w-3 h-3 rounded ${chartType === 'height' ? 'bg-[#e9d5ff]' : 'bg-[#a7f3d0]'}`}></div> WHO Normal Range (3rd - 97th)</div>
                <div className="flex items-center gap-1.5"><div className="w-3 border-t-2 border-dashed border-gray-400"></div> WHO Average (50th)</div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}m`} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="range" fill={chartType === 'height' ? '#f3e8ff' : '#d1fae5'} stroke="none" connectNulls />
                  <Line type="monotone" dataKey="p50" stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="4 4" dot={false} connectNulls />
                  <Line type="monotone" dataKey="actual" stroke={chartType === 'height' ? '#9333ea' : '#059669'} strokeWidth={3} dot={{r: 5, strokeWidth: 2, fill: '#fff'}} connectNulls />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </main>

      <AnimatePresence>
        {isAddEntryOpen && (
          <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddEntryOpen(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-xl overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h3 className="text-lg font-extrabold text-[#122B54] flex items-center gap-2"><Plus className="w-5 h-5 text-[var(--color-primary)]" /> Add New Entry</h3>
                <button onClick={() => setIsAddEntryOpen(false)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><X className="w-4 h-4" /></button>
              </div>

              <div className="px-6 py-6 space-y-5 overflow-y-auto max-h-[55dvh] pb-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date of Measurement</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" value={newEntry.date} onChange={e => setNewEntry({...newEntry, date: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Scale className="w-3.5 h-3.5" /> Weight (kg)</label>
                    <input type="number" step="0.1" value={newEntry.weight} onChange={e => setNewEntry({...newEntry, weight: e.target.value})} placeholder="e.g. 10.5" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all placeholder:text-gray-400" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5" /> Height (cm)</label>
                    <input type="number" step="0.1" value={newEntry.height} onChange={e => setNewEntry({...newEntry, height: e.target.value})} placeholder="e.g. 78.5" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all placeholder:text-gray-400" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Baby className="w-3.5 h-3.5" /> Head (cm) <span className="text-gray-400 font-medium normal-case text-[10px] ml-auto">Optional</span></label>
                  <input type="number" step="0.1" value={newEntry.headCircumference} onChange={e => setNewEntry({...newEntry, headCircumference: e.target.value})} placeholder="e.g. 46.2" className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all placeholder:text-gray-400" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</label>
                  <textarea rows={2} value={newEntry.notes} onChange={e => setNewEntry({...newEntry, notes: e.target.value})} placeholder="Doctor's notes or observations..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] transition-all resize-none placeholder:text-gray-400"></textarea>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 bg-white flex justify-center">
                <button onClick={handleSaveEntry} className="bg-[var(--color-primary)] text-white px-8 py-2.5 rounded-full font-semibold text-sm hover:bg-[var(--color-primary)]/90 active:scale-95 transition-all shadow-sm disabled:opacity-50" disabled={!newEntry.height || !newEntry.weight}>
                  Save Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

          </div>
  );
}
