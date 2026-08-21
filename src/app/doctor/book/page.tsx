"use client";

import { useAppSelector } from "@/store/hooks";
import { useState, useEffect } from "react";


import { Button } from "@/components/ui/Button";
import Image from "next/image";
import {  ChevronLeft, CheckCircle2, ChevronRight, Check, ShieldCheck, Clock, Stethoscope, Calendar as CalendarIcon , Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/apiClient";

// Generate next 14 days
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  return dates;
};

const DATES = generateDates();

export default function BookAppointmentPage() {
  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);

  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [doctors, setDoctors] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<{morning: string[], afternoon: string[], evening: string[]}>({morning: [], afternoon: [], evening: []});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [babies, setBabies] = useState<any[]>([]);

  useEffect(() => {
    // Fetch doctors
    apiClient.get('/doctors').then(res => {
      if (res.data.success) {
        let fetchedDoctors = res.data.data.map((d: any) => ({
          id: d.user?._id || d._id,
          name: d.user?.name || "Unknown",
          spec: d.specialization || "",
          fee: d.consultationFee || 0,
          image: d.user?.avatar || "/images/doctor_profile.png"
        }));
        
        // Auto-select doctor if provided in URL
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const doctorId = params.get('doctorId');
          const reschedId = params.get('rescheduleId');
          if (reschedId) {
            setRescheduleId(reschedId);
          }
          if (doctorId) {
            setSelectedDoctor(doctorId);
            // If booked from a profile, only show that specific doctor
            fetchedDoctors = fetchedDoctors.filter((d: any) => d.id === doctorId);
          }
        }
        
        setDoctors(fetchedDoctors);
      }
    });

    // Fetch babies (need one to book)
    apiClient.get('/babies').then(res => {
      if (res.data.success) {
        setBabies(res.data.data);
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      setLoadingSlots(true);
      // Ensure we format the date correctly for the local timezone
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      apiClient.get(`/doctors/${selectedDoctor}/available-slots?date=${dateStr}`)
        .then(res => {
           if (res.data.success) {
             const slots = res.data.data;
             const morning = slots.filter((s: string) => s.includes('AM'));
             const after12 = slots.filter((s: string) => s.includes('PM'));
             const afternoon = after12.filter((s: string) => {
               const hour = parseInt(s.split(':')[0]);
               return hour === 12 || (hour >= 1 && hour < 4);
             });
             const evening = after12.filter((s: string) => {
               const hour = parseInt(s.split(':')[0]);
               return hour !== 12 && hour >= 4;
             });
             setAvailableSlots({ morning, afternoon, evening });
           }
        })
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedDoctor, selectedDate]);

  const docDetails = doctors.find(d => d.id === selectedDoctor);

  const canProceedStep1 = selectedDoctor !== null;
  const canProceedStep2 = selectedDate && selectedTime;
  const canProceedStep3 = reason.trim().length > 0;

  const handleNext = () => {
    if (step === 1 && canProceedStep1) setStep(2);
    else if (step === 2 && canProceedStep2) setStep(3);
    else if (step === 3 && canProceedStep3) handleBook();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else router.back();
  };

  const handleBook = async () => {
    try {
      setBookingLoading(true);
      
      const year = selectedDate!.getFullYear();
      const month = String(selectedDate!.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate!.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      // If parent has no babies registered, we could fail or pass a dummy. 
      // Assuming they have at least one baby if they are on this app.
      const babyIdToUse = babies.length > 0 ? babies[0]._id : undefined;
      
      const payload: any = {
        doctorId: selectedDoctor,
        date: dateStr,
        time: selectedTime,
        notes: reason
      };
      
      if (babyIdToUse) {
        payload.babyId = babyIdToUse;
      }
      
      let res;
      if (rescheduleId) {
        res = await apiClient.put(`/appointments/${rescheduleId}`, payload);
      } else {
        res = await apiClient.post('/appointments', payload);
      }
      
      if (res.data.success) {
        setShowSuccess(true);
        setTimeout(() => {
          router.replace("/appointments");
        }, 2500);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to book appointment. The slot might have been taken.');
    } finally {
      setBookingLoading(false);
    }
  };



  const steps = [
    { num: 1, label: "Choose Service" },
    { num: 2, label: "Date & Time" },
    { num: 3, label: "Your Details" }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24 md:pb-0">

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">

        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">Book Appointment</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => router.push('/notifications')} className="relative p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer group">
              <Bell className="w-6 h-6 text-gray-800 group-hover:text-black transition-colors" />
              {unreadNotificationsCount > 0 && <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center -ml-3"
        >
          <button
            onClick={handleBack}
            className="flex items-center gap-1 px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="font-semibold text-[15px]">Back</span>
          </button>
        </motion.div>

        {/* Desktop Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4 px-1"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Book Appointment</h1>
            <p className="text-sm md:text-base text-gray-500 font-medium mt-1">Complete the steps below to confirm your consultation.</p>
          </div>
        </motion.div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
            
            {/* Stepper Header */}
            <div className="p-4 md:p-6 border-b border-gray-50">
              <div className="flex items-center justify-between relative max-w-lg mx-auto">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-gray-100 -z-10"></div>
                {/* Active progress line */}
                <div 
                   className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] bg-[var(--color-primary)] -z-10 transition-all duration-500"
                   style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((s) => {
                  const isActive = step === s.num;
                  const isPast = step > s.num;
                  return (
                    <div key={s.num} className="flex flex-col items-center bg-white px-2">
                      <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-semibold text-xs md:text-sm transition-all duration-300 border ${
                        isActive 
                          ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5" 
                          : isPast 
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" 
                            : "border-gray-200 text-gray-400 bg-white"
                      }`}>
                        {isPast ? <Check className="w-3 h-3 md:w-4 md:h-4" /> : s.num}
                      </div>
                      <span className={`mt-1 text-[9px] md:text-[13px] font-semibold uppercase tracking-wider ${isActive || isPast ? "text-gray-900" : "text-gray-400"}`}>{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Content */}
            <div className="p-5 md:p-6 flex-1">
              <AnimatePresence mode="wait">
                
                {/* STEP 1: Service & Mode */}
                {step === 1 && (
                  <motion.div 
                    key="step1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-4"
                  >
                    <div>
                      <h2 className="text-base md:text-xl font-semibold text-gray-900 mb-0.5">Select a Specialist</h2>
                      <p className="text-xs md:text-base text-gray-500 mb-3">Choose the doctor you would like to consult with.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                        {doctors.map((doc) => (
                          <button 
                            key={doc.id}
                            onClick={() => setSelectedDoctor(doc.id)}
                            className={`flex p-3 md:p-4 rounded-lg border transition-all duration-200 text-left relative overflow-hidden group cursor-pointer ${
                              selectedDoctor === doc.id 
                                ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)] ring-1 ring-[var(--color-primary)] shadow-sm" 
                                : "bg-white border-gray-100 hover:border-[var(--color-primary)]/30 hover:bg-gray-50/50"
                            }`}
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg overflow-hidden border border-gray-100 bg-white flex-shrink-0">
                                <Image src={doc.image} alt={doc.name} width={48} height={48} className="object-cover w-full h-full" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`text-sm font-semibold truncate transition-colors ${selectedDoctor === doc.id ? "text-[var(--color-primary)]" : "text-gray-900"}`}>{doc.name}</h3>
                                <p className="text-[11px] md:text-sm text-gray-500 mt-0.5 truncate">{doc.spec}</p>
                                <p className="text-sm font-semibold text-gray-900 mt-1">₹{doc.fee}</p>
                              </div>
                              {selectedDoctor === doc.id && (
                                <div className="shrink-0 w-5 h-5 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                                  <Check className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 2: Date & Time */}
                {step === 2 && (
                  <motion.div 
                    key="step2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3">Select Date</h2>
                      <div className="flex overflow-x-auto gap-2 pb-2 no-scrollbar -mx-5 px-5 md:mx-0 md:px-0">
                        {DATES.map((date, idx) => {
                          const isSelected = selectedDate?.toDateString() === date.toDateString();
                          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                          const dayNum = date.getDate();
                          const monthName = date.toLocaleDateString('en-US', { month: 'short' });

                          return (
                            <button
                              key={idx}
                              onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                              className={`flex-shrink-0 w-16 py-3 rounded-lg flex flex-col items-center justify-center transition-all duration-200 border cursor-pointer ${
                                isSelected 
                                  ? "bg-[var(--color-primary)] border-[var(--color-primary)] shadow-sm text-white" 
                                  : "bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              <span className={`text-[9px] md:text-[11px] font-semibold uppercase tracking-wide mb-1 ${isSelected ? "text-white/80" : "text-gray-400"}`}>{monthName}</span>
                              <span className={`text-lg md:text-xl font-semibold mb-0.5 ${isSelected ? "text-white" : "text-gray-900"}`}>{dayNum}</span>
                              <span className={`text-[10px] md:text-[12px] font-medium ${isSelected ? "text-white/90" : "text-gray-500"}`}>{dayName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className={`transition-opacity duration-300 ${!selectedDate ? "opacity-50 pointer-events-none" : ""}`}>
                       <div className="flex items-center justify-between mb-4">
                         <h2 className="text-lg md:text-xl font-semibold text-gray-900">Select Time</h2>
                         {loadingSlots && <div className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>}
                       </div>
                       
                       {!loadingSlots && availableSlots.morning.length === 0 && availableSlots.afternoon.length === 0 && availableSlots.evening.length === 0 && (
                         <div className="text-sm text-gray-500 py-4 text-center bg-gray-50 rounded-lg">No slots available for this date.</div>
                       )}

                       <div className="space-y-5">
                        {/* Morning */}
                        {availableSlots.morning.length > 0 && (
                          <div>
                            <h3 className="text-[10px] md:text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                              Morning <span className="flex-1 h-[1px] bg-gray-50"></span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {availableSlots.morning.map(time => (
                                <button
                                  key={time}
                                  onClick={() => setSelectedTime(time)}
                                  className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                                    selectedTime === time 
                                      ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm" 
                                      : "bg-white border-gray-100 text-gray-600 hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/5"
                                  }`}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Afternoon */}
                        {availableSlots.afternoon.length > 0 && (
                          <div>
                            <h3 className="text-[10px] md:text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                              Afternoon <span className="flex-1 h-[1px] bg-gray-50"></span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {availableSlots.afternoon.map(time => (
                                <button
                                  key={time}
                                  onClick={() => setSelectedTime(time)}
                                  className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                                    selectedTime === time 
                                      ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm" 
                                      : "bg-white border-gray-100 text-gray-600 hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/5"
                                  }`}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Evening */}
                        {availableSlots.evening.length > 0 && (
                          <div>
                            <h3 className="text-[10px] md:text-[12px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                              Evening <span className="flex-1 h-[1px] bg-gray-50"></span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                              {availableSlots.evening.map(time => (
                                <button
                                  key={time}
                                  onClick={() => setSelectedTime(time)}
                                  className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                                    selectedTime === time 
                                      ? "bg-[var(--color-primary)] border-[var(--color-primary)] text-white shadow-sm" 
                                      : "bg-white border-gray-100 text-gray-600 hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-primary)]/5"
                                  }`}
                                >
                                  {time}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3: Details */}
                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="space-y-5"
                  >
                    <div>
                      <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-1">Reason for Visit</h2>
                      <p className="text-sm md:text-base text-gray-500 mb-3">Briefly describe the symptoms or reason for this appointment so the doctor is prepared.</p>
                      <textarea 
                         className="w-full bg-gray-50/50 border border-gray-100 rounded-lg p-3 text-sm md:text-base font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]/50 min-h-[120px] resize-none transition-all"
                         placeholder="E.g. Baby has mild fever since last night, and needs routine vaccination."
                         value={reason}
                         onChange={(e) => setReason(e.target.value)}
                      ></textarea>
                    </div>

                    <div className="bg-orange-50/50 rounded-lg p-3 border border-orange-100/50 flex gap-3">
                      <div className="mt-0.5">
                        <ShieldCheck className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="text-sm md:text-base font-semibold text-gray-800 mb-0.5">Secure & Confidential</h4>
                        <p className="text-xs md:text-sm text-gray-500 leading-relaxed">Your medical information is secure and only shared with your doctor.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
              </AnimatePresence>
            </div>

            {/* Stepper Footer */}
            <div className="flex px-4 py-3 md:px-6 md:py-4 border-t border-gray-50 bg-gray-50/30 justify-between items-center">
              <button
                onClick={handleBack}
                className="flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-gray-800 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
               <Button 
                 variant="primary" 
                 size="sm"
                 className="px-5 py-2 rounded-lg font-medium shadow-sm text-sm"
                 onClick={handleNext}
                 disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2) || (step === 3 && !canProceedStep3) || bookingLoading}
                 rightIcon={step < 3 ? <ChevronRight className="w-4 h-4" /> : undefined}
               >
                 {step === 3 ? (bookingLoading ? "Booking..." : "Confirm Booking") : "Next"}
               </Button>
            </div>
          </div>

          {/* Right Column - Booking Summary Sidebar (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-4">
             <div className="sticky top-24">
               {/* Dark header summary card */}
               <div className="bg-[#1a2530] rounded-t-lg p-4 md:p-5 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                    <Stethoscope className="w-20 h-20 md:w-24 md:h-24 transform rotate-12 translate-x-2 -translate-y-2" />
                 </div>
                 
                 <div className="flex items-center justify-between mb-3 md:mb-5 relative z-10">
                   <h3 className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Booking Summary</h3>
                   <span className="bg-white/10 px-2.5 py-1 rounded-md text-[9px] font-semibold tracking-wider">STEP {step}/3</span>
                 </div>

                 {docDetails ? (
                   <div className="relative z-10 space-y-0.5 md:space-y-1 mb-1 md:mb-2">
                     <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold mb-1 md:mb-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                       {docDetails.name}
                     </div>
                     <p className="text-xl md:text-2xl font-semibold">₹{docDetails.fee}</p>
                     <p className="text-[10px] md:text-[13px] text-gray-400 font-medium pt-0.5 md:pt-1">In-Clinic Consultation</p>
                   </div>
                 ) : (
                   <div className="relative z-10 space-y-0.5 md:space-y-1 mb-1 md:mb-2">
                     <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold mb-1 md:mb-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                       Select a Service
                     </div>
                     <p className="text-xl md:text-2xl font-semibold">₹ 0</p>
                     <p className="text-[10px] md:text-[13px] text-gray-400 font-medium pt-0.5 md:pt-1">Pending selection</p>
                   </div>
                 )}
               </div>

               {/* White body summary card */}
               <div className="bg-white rounded-b-lg border border-t-0 border-gray-100 shadow-sm p-4 md:p-5 space-y-4 md:space-y-5">
                 
                 <div className="bg-orange-50/30 rounded-lg border border-orange-50 p-3 md:p-4">
                   <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Price Breakdown</h4>
                   <div className="flex justify-between items-center text-xs md:text-sm font-medium text-gray-600 mb-3">
                     <span>Consultation Fee</span>
                     <span className="font-semibold text-gray-900">₹{docDetails?.fee || 0}</span>
                   </div>
                   <div className="h-[1px] w-full bg-orange-100/50 mb-3"></div>
                   <div className="flex justify-between items-center">
                     <span className="text-xs md:text-sm font-semibold text-gray-900">Total</span>
                     <span className="text-sm md:text-base font-semibold text-orange-500">₹{docDetails?.fee || 0}</span>
                   </div>
                 </div>

                 <div className="space-y-2 md:space-y-3 pt-1 px-1">
                   <div className="flex items-center gap-3">
                     <div className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
                       <ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-500" />
                     </div>
                     <span className="text-[11px] md:text-sm font-medium text-gray-600">Secure checkout process</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
                       <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-500" />
                     </div>
                     <span className="text-[11px] md:text-sm font-medium text-gray-600">WhatsApp & email confirmation</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
                       <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-500" />
                     </div>
                     <span className="text-[11px] md:text-sm font-medium text-gray-600">Session scheduled instantly</span>
                   </div>
                 </div>

               </div>
             </div>
          </div>
        </div>


      </main>
      
      

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              {/* Top colored band */}
              <div className="bg-[var(--color-primary)] px-6 pt-8 pb-10 flex flex-col items-center text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <Stethoscope className="w-40 h-40 absolute -right-6 -top-6 rotate-12" />
                </div>
                {/* Checkmark */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2, stiffness: 200 }}
                  className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4 relative z-10"
                >
                  <CheckCircle2 className="w-9 h-9 text-white" strokeWidth={2} />
                </motion.div>
                <h2 className="text-xl font-bold text-white mb-1 relative z-10">
                  {rescheduleId ? "Rescheduled!" : "Booking Confirmed!"}
                </h2>
                <p className="text-white/80 text-sm font-medium relative z-10">
                  {rescheduleId
                    ? "Your appointment time has been updated."
                    : "We'll send you a reminder before your visit."}
                </p>
              </div>

              {/* White body — pulled up to overlap band */}
              <div className="px-5 pb-6 -mt-4 relative">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
                  <p className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-widest mb-3">Appointment Details</p>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-9 h-9 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-4 h-4 text-[var(--color-primary)]" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{docDetails?.name}</p>
                      <p className="text-[11px] text-gray-500 font-medium">{docDetails?.spec}</p>
                    </div>
                  </div>
                  <div className="h-[1px] bg-gray-100 my-3" />
                  <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                    <CalendarIcon className="w-4 h-4 text-[var(--color-primary)]" />
                    <span>
                      {selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})} at {selectedTime}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)]/30 border-t-[var(--color-primary)] animate-spin"></div>
                  <p className="text-xs font-semibold text-gray-400">Redirecting to appointments...</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
