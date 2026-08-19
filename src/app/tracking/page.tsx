"use client";

import { useAppSelector } from "@/store/hooks";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, Moon, Droplets, Coffee, Plus, Bell, X, Clock, AlertCircle, Play, Square, Pause } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/apiClient";
import { getBabies } from "@/lib/api/babiesApi";

type ActivityType = 'sleep' | 'diaper' | 'feeding' | 'other';

interface ActivityLog {
  _id: string;
  type: ActivityType;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  details?: string;
  amount?: number;
  unit?: string;
}

export default function TrackingPage() {
  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);
  const router = useRouter();
  
  const [babyId, setBabyId] = useState<string | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeType, setActiveType] = useState<ActivityType>('sleep');
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  
  // Form State
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [logDetails, setLogDetails] = useState("");
  
  // Specific Form States
  const [diaperType, setDiaperType] = useState<string>("Wet");
  const [feedType, setFeedType] = useState<string>("Breast");
  const [feedAmount, setFeedAmount] = useState<string>("");
  const [feedUnit, setFeedUnit] = useState<string>("ml");

  // --- LIVE TIMER LOGIC ---
  const [activeTimer, setActiveTimer] = useState<{ type: 'sleep' | 'nursingL' | 'nursingR', startTime: number } | null>(null);
  const [elapsed, setElapsed] = useState(0);

  // Load timer from local storage
  useEffect(() => {
    const saved = localStorage.getItem('moncradel_active_timer');
    if (saved) {
      const parsed = JSON.parse(saved);
      setActiveTimer(parsed);
    }
  }, []);

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeTimer) {
      interval = setInterval(() => {
        setElapsed(Math.floor((Date.now() - activeTimer.startTime) / 1000));
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const toggleTimer = (type: 'sleep' | 'nursingL' | 'nursingR') => {
    if (activeTimer?.type === type) {
      // STOP TIMER and OPEN MODAL to save
      handleOpenModal(type === 'sleep' ? 'sleep' : 'feeding', true);
      setActiveTimer(null);
      localStorage.removeItem('moncradel_active_timer');
    } else {
      // START TIMER
      const newTimer = { type, startTime: Date.now() };
      setActiveTimer(newTimer);
      localStorage.setItem('moncradel_active_timer', JSON.stringify(newTimer));
    }
  };

  const formatElapsed = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m}m ${s}s`;
  };
  // ------------------------

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        const babyRes = await getBabies();
        const babies = babyRes.data || babyRes;
        if (babies && babies.length > 0) {
          const bId = babies[0]._id;
          setBabyId(bId);
          fetchLogs(bId);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to fetch baby:", err);
        setIsLoading(false);
      }
    };
    fetchInitData();
  }, []);

  const fetchLogs = async (bId: string) => {
    try {
      const res = await apiClient.get(`/activity-logs/baby/${bId}`);
      if (res.data.success) {
        setLogs(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch logs:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (type: ActivityType, fromTimer = false, existingLog?: ActivityLog) => {
    setActiveType(type);
    
    if (existingLog) {
      setEditingLogId(existingLog._id);
      
      const start = new Date(existingLog.startTime);
      start.setMinutes(start.getMinutes() - start.getTimezoneOffset());
      setStartTime(start.toISOString().slice(0,16));
      
      if (existingLog.endTime) {
        const end = new Date(existingLog.endTime);
        end.setMinutes(end.getMinutes() - end.getTimezoneOffset());
        setEndTime(end.toISOString().slice(0,16));
      } else {
        setEndTime("");
      }
      
      if (type === 'diaper') {
         setDiaperType(existingLog.details || 'Wet');
         setLogDetails("");
      } else if (type === 'feeding') {
         let fType = 'Breast';
         let fDet = existingLog.details || '';
         if (existingLog.details?.includes('Bottle')) { fType = 'Bottle'; fDet = fDet.replace('Bottle - ', '').replace('Bottle', '').trim(); }
         if (existingLog.details?.includes('Solids')) { fType = 'Solids'; fDet = fDet.replace('Solids - ', '').replace('Solids', '').trim(); }
         setFeedType(fType);
         setLogDetails(fDet);
         setFeedAmount(existingLog.amount ? String(existingLog.amount) : "");
         setFeedUnit(existingLog.unit || "ml");
      } else {
         setLogDetails(existingLog.details || "");
      }
    } else {
      setEditingLogId(null);
      const now = new Date();
      
      if (fromTimer && activeTimer) {
      // If coming from timer, set start time to when timer started, and end time to now
      const start = new Date(activeTimer.startTime);
      start.setMinutes(start.getMinutes() - start.getTimezoneOffset());
      setStartTime(start.toISOString().slice(0,16));
      
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setEndTime(now.toISOString().slice(0,16));
      
      if (activeTimer.type === 'nursingL') setLogDetails("Left Breast");
      if (activeTimer.type === 'nursingR') setLogDetails("Right Breast");
      if (type === 'feeding') setFeedType('Breast');
    } else {
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      setStartTime(now.toISOString().slice(0,16));
      
      if (type === 'sleep') {
         const end = new Date(now.getTime() + 60 * 60 * 1000);
         setEndTime(end.toISOString().slice(0,16));
      } else {
         setEndTime("");
      }
      setLogDetails("");
    }
    }
    
    // Reset states
    setDiaperType("Wet");
    if (!fromTimer) setFeedType("Breast");
    setFeedAmount("");
    
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!babyId || !startTime) return;
    
    let finalDetails = logDetails;
    let amount: number | undefined = undefined;
    let unit: string | undefined = undefined;

    if (activeType === 'diaper') {
      finalDetails = diaperType;
    } else if (activeType === 'feeding') {
      finalDetails = logDetails ? `${feedType} - ${logDetails}` : feedType;
      if (feedType !== 'Breast' && feedAmount) {
         amount = parseFloat(feedAmount);
         unit = feedUnit;
      }
    }

    try {
      const payload = {
        babyId,
        type: activeType,
        startTime: new Date(startTime).toISOString(),
        endTime: endTime ? new Date(endTime).toISOString() : undefined,
        details: finalDetails,
        amount,
        unit
      };

      if (editingLogId) {
        await apiClient.put(`/activity-logs/${editingLogId}`, payload);
      } else {
        await apiClient.post('/activity-logs', payload);
      }
      
      setIsModalOpen(false);
      fetchLogs(babyId);
    } catch (err) {
      console.error("Failed to save log:", err);
    }
  };

  // Calculate Today's Summary
  const todaySummary = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const todaysLogs = logs.filter(log => new Date(log.startTime) >= today);
    
    let sleepMins = 0;
    let diapers = 0;
    let lastFedTime = "N/A";
    let lastFedDate = 0;

    todaysLogs.forEach(log => {
      if (log.type === 'sleep' && log.durationMinutes) sleepMins += log.durationMinutes;
      if (log.type === 'diaper') diapers += 1;
      if (log.type === 'feeding') {
         const t = new Date(log.startTime).getTime();
         if (t > lastFedDate) {
            lastFedDate = t;
            lastFedTime = new Date(t).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
         }
      }
    });

    const sleepHrs = Math.floor(sleepMins / 60);
    const sleepRem = sleepMins % 60;
    const sleepStr = sleepHrs > 0 ? `${sleepHrs}h ${sleepRem}m` : `${sleepRem}m`;

    return { sleep: sleepStr, diapers, lastFed: lastFedTime };
  }, [logs]);

  // Group logs by Date
  const groupedLogs = useMemo(() => {
    const groups: { [key: string]: ActivityLog[] } = {};
    logs.forEach(log => {
      const dateStr = new Date(log.startTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      if (!groups[dateStr]) groups[dateStr] = [];
      groups[dateStr].push(log);
    });
    return groups;
  }, [logs]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-32 md:pb-10 relative">
      <main className="max-w-[800px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">
        
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white border-b border-gray-100 mb-4">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6 text-[#0F172A]" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-semibold text-[#0F172A] ml-1">Daily Tracker</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => router.push('/notifications')} className="relative p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer group">
              <Bell className="w-6 h-6 text-[#0F172A]" strokeWidth={2} />
              {unreadNotificationsCount > 0 && <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 px-1">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Baby Tracker</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Keep an eye on sleep, feeding, and diaper changes.</p>
          </div>
        </div>

        {/* --- LIVE TIMERS (Industry Standard) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sleep Timer */}
          <div className="bg-white border border-[var(--pastel-indigo)] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--pastel-indigo)] text-white rounded-full flex items-center justify-center">
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Sleep Timer</h3>
                <p className="text-sm font-semibold text-gray-500 w-20">
                  {activeTimer?.type === 'sleep' ? formatElapsed(elapsed) : 'Ready'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => toggleTimer('sleep')}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors active:scale-95 ${activeTimer?.type === 'sleep' ? 'bg-[#FF3B30] text-white' : 'bg-[var(--color-primary)] text-white'}`}
            >
              {activeTimer?.type === 'sleep' ? <Square className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
            </button>
          </div>

          {/* Nursing Timers */}
          <div className="bg-white border border-[var(--pastel-blue)] rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[var(--pastel-blue)] text-white rounded-full flex items-center justify-center">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Nursing</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-semibold text-gray-500 w-12">{activeTimer?.type === 'nursingL' ? formatElapsed(elapsed) : 'L Side'}</span>
                  <span className="text-[11px] font-semibold text-gray-500 w-12">{activeTimer?.type === 'nursingR' ? formatElapsed(elapsed) : 'R Side'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => toggleTimer('nursingL')}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95 ${activeTimer?.type === 'nursingL' ? 'bg-[#FF3B30] text-white' : 'bg-[var(--pastel-blue)] text-white'}`}
              >
                {activeTimer?.type === 'nursingL' ? <Square className="w-4 h-4 fill-current" /> : <span className="font-bold text-sm">L</span>}
              </button>
              <button 
                onClick={() => toggleTimer('nursingR')}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors active:scale-95 ${activeTimer?.type === 'nursingR' ? 'bg-[#FF3B30] text-white' : 'bg-[var(--pastel-blue)] text-white'}`}
              >
                {activeTimer?.type === 'nursingR' ? <Square className="w-4 h-4 fill-current" /> : <span className="font-bold text-sm">R</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Today's Summary Dashboard */}
        <div className="bg-white rounded-xl p-5 border border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 uppercase tracking-wider mb-4 px-1">Today's Summary</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <Moon className="w-5 h-5 text-[var(--pastel-indigo)] mb-2" />
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Sleep</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{todaySummary.sleep}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <Coffee className="w-5 h-5 text-[var(--pastel-blue)] mb-2" />
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Last Fed</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{todaySummary.lastFed}</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <Droplets className="w-5 h-5 text-[var(--pastel-orange)] mb-2" />
              <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">Diapers</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{todaySummary.diapers}</p>
            </div>
          </div>
        </div>

        {/* Timeline Feed */}
        <div className="mt-8 px-1 pb-10">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Activity Timeline</h2>
          
          {isLoading ? (
             <div className="flex justify-center py-10">
               <div className="w-8 h-8 border-4 border-gray-100 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
             </div>
          ) : Object.keys(groupedLogs).length === 0 ? (
             <div className="bg-white rounded-xl border border-gray-100 p-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-gray-900 font-semibold">No activities yet</p>
                <p className="text-gray-500 text-sm mt-1 font-medium">Tap a button below to log your first activity.</p>
             </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedLogs).map(([date, dayLogs]) => (
                <div key={date}>
                  <div className="sticky top-[60px] md:top-4 z-20 bg-[var(--color-background)]/90 backdrop-blur-sm py-2 mb-4">
                     <span className="bg-white border border-gray-200 text-gray-600 text-[11px] font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider">{date === new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) ? 'Today' : date}</span>
                  </div>
                  
                  <div className="relative border-l-2 border-gray-100 ml-[19px] space-y-6">
                    {dayLogs.map((log) => (
                      <div key={log._id} className="relative pl-8 pr-2">
                        {/* Timeline Node */}
                        <div className={`absolute -left-[19px] top-0.5 w-[36px] h-[36px] rounded-full flex items-center justify-center border-2 border-white
                          ${log.type === 'sleep' ? 'bg-[var(--pastel-indigo)]' : 
                            log.type === 'feeding' ? 'bg-[var(--pastel-blue)]' : 
                            log.type === 'diaper' ? 'bg-[var(--pastel-orange)]' : 'bg-gray-300'}
                        `}>
                          {log.type === 'sleep' && <Moon className="w-4 h-4 text-white" />}
                          {log.type === 'feeding' && <Coffee className="w-4 h-4 text-white" />}
                          {log.type === 'diaper' && <Droplets className="w-4 h-4 text-white" />}
                        </div>
                        
                        {/* Timeline Card */}
                        <div 
                          onClick={() => handleOpenModal(log.type, false, log)}
                          className="bg-white p-4 rounded-xl border border-gray-100 transition-colors hover:border-gray-300 cursor-pointer"
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <h3 className="font-semibold text-gray-900 capitalize text-[15px]">{log.type}</h3>
                            <span className="text-[11px] font-semibold text-gray-400">
                              {new Date(log.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                            </span>
                          </div>
                          
                          {/* Rich Details */}
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            {log.details && (
                              <span className="bg-gray-50 text-gray-600 text-[11px] font-semibold px-2.5 py-1 rounded border border-gray-100">
                                {log.details}
                              </span>
                            )}
                            {log.durationMinutes ? (
                              <span className="bg-gray-50 text-gray-600 text-[11px] font-semibold px-2.5 py-1 rounded border border-gray-100">
                                {log.durationMinutes} mins
                              </span>
                            ) : null}
                            {log.amount && (
                              <span className="bg-gray-50 text-gray-600 text-[11px] font-semibold px-2.5 py-1 rounded border border-gray-100">
                                {log.amount} {log.unit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Bar (Bottom Quick Logs) */}
      <div className="fixed bottom-[80px] md:bottom-6 left-0 right-0 px-4 pointer-events-none z-50 flex justify-center">
        <div className="bg-white p-2.5 rounded-full border border-gray-200 flex items-center gap-2 md:gap-4 pointer-events-auto">
          <button onClick={() => handleOpenModal('sleep')} className="flex items-center gap-2 hover:bg-gray-50 px-5 md:px-6 py-2.5 rounded-full transition-colors active:scale-95">
            <Moon className="w-5 h-5 text-[var(--pastel-indigo)] fill-[var(--pastel-indigo)]/20" />
            <span className="font-semibold text-gray-800 text-sm">Sleep</span>
          </button>
          <div className="w-[1px] h-6 bg-gray-200" />
          <button onClick={() => handleOpenModal('feeding')} className="flex items-center gap-2 hover:bg-gray-50 px-5 md:px-6 py-2.5 rounded-full transition-colors active:scale-95">
            <Coffee className="w-5 h-5 text-[var(--pastel-blue)] fill-[var(--pastel-blue)]/20" />
            <span className="font-semibold text-gray-800 text-sm">Feed</span>
          </button>
          <div className="w-[1px] h-6 bg-gray-200" />
          <button onClick={() => handleOpenModal('diaper')} className="flex items-center gap-2 hover:bg-gray-50 px-5 md:px-6 py-2.5 rounded-full transition-colors active:scale-95">
            <Droplets className="w-5 h-5 text-[var(--pastel-orange)] fill-[var(--pastel-orange)]/20" />
            <span className="font-semibold text-gray-800 text-sm">Diaper</span>
          </button>
        </div>
      </div>

      {/* Dynamic Log Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            
            <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }} className="relative w-full md:max-w-md bg-white rounded-t-3xl md:rounded-2xl flex flex-col max-h-[90vh]">
              
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white
                    ${activeType === 'sleep' ? 'bg-[var(--pastel-indigo)]' : 
                      activeType === 'feeding' ? 'bg-[var(--pastel-blue)]' : 
                      'bg-[var(--pastel-orange)]'}
                  `}>
                    {activeType === 'sleep' && <Moon className="w-5 h-5" />}
                    {activeType === 'feeding' && <Coffee className="w-5 h-5" />}
                    {activeType === 'diaper' && <Droplets className="w-5 h-5" />}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900 capitalize">{editingLogId ? 'Edit' : 'Log'} {activeType}</h2>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5" /></button>
              </div>
              
              <div className="p-6 overflow-y-auto custom-scrollbar">
                
                {/* ---------------- TYPE SPECIFIC UI ---------------- */}
                
                {/* DIAPER SELECTOR */}
                {activeType === 'diaper' && (
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</label>
                    <div className="grid grid-cols-3 gap-3">
                      {['Wet', 'Dirty', 'Mixed'].map((t) => (
                        <button key={t} onClick={() => setDiaperType(t)} className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${diaperType === t ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]' : 'border-gray-200 bg-white text-gray-600'}`}>
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* FEEDING SELECTOR */}
                {activeType === 'feeding' && (
                  <div className="mb-6 space-y-6">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Feed Type</label>
                      <div className="grid grid-cols-3 gap-3">
                        {['Breast', 'Bottle', 'Solids'].map((t) => (
                          <button key={t} onClick={() => setFeedType(t)} className={`py-2.5 rounded-xl text-sm font-semibold transition-all border ${feedType === t ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)]' : 'border-gray-200 bg-white text-gray-600'}`}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {feedType !== 'Breast' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Amount</label>
                          <input type="number" value={feedAmount} onChange={(e) => setFeedAmount(e.target.value)} placeholder="0" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-[var(--color-primary)] transition-colors outline-none" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Unit</label>
                          <select value={feedUnit} onChange={(e) => setFeedUnit(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:border-[var(--color-primary)] transition-colors outline-none">
                            <option value="ml">ml</option>
                            <option value="oz">oz</option>
                            <option value="g">g</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* COMMON TIME INPUTS */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Start Time</label>
                    <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none" />
                  </div>
                  
                  {activeType === 'sleep' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">End Time</label>
                      <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none" />
                    </div>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex gap-3">
                  <Button variant="primary" fullWidth size="lg" className="h-12 flex-1" onClick={handleSave} disabled={!startTime}>
                    {editingLogId ? 'Update' : 'Save'} {activeType}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
