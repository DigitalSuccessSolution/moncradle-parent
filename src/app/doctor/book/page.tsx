"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header/Header";
import { Footer } from "@/components/layout/Footer/Footer";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, ChevronRight, Check, ShieldCheck, Clock, Stethoscope } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_DOCTORS = [
  { id: "doc1", name: "Dr. Ananya Sharma", spec: "Pediatrician", exp: "12 yrs exp", image: "/images/doctor_profile.png", rating: "4.9", fee: 500 },
  { id: "doc2", name: "Dr. Rahul Verma", spec: "Child Nutritionist", exp: "8 yrs exp", image: "/images/doctor_profile.png", rating: "4.8", fee: 400 },
  { id: "doc3", name: "Dr. Smriti Gupta", spec: "Dermatologist", exp: "15 yrs exp", image: "/images/doctor_profile.png", rating: "5.0", fee: 600 },
];

const TIME_SLOTS = {
  morning: ["09:00 AM", "09:30 AM", "10:00 AM", "11:30 AM"],
  afternoon: ["12:00 PM", "01:30 PM", "03:00 PM"],
  evening: ["04:00 PM", "05:30 PM", "06:00 PM"]
};

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
  const router = useRouter();
  
  const [step, setStep] = useState(1);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const docDetails = MOCK_DOCTORS.find(d => d.id === selectedDoctor);

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

  const handleBook = () => {
    setShowSuccess(true);
    setTimeout(() => {
      router.push("/appointments");
    }, 2500);
  };

  const steps = [
    { num: 1, label: "Choose Service" },
    { num: 2, label: "Date & Time" },
    { num: 3, label: "Your Details" }
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-10">
      <Header />

      {/* Mobile Back Header */}
      <div className="md:hidden flex items-center px-4 py-4 sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <button onClick={handleBack} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 ml-2">Book Appointment</h1>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-8">
        
        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-4 mb-6">
          <button onClick={handleBack} className="p-2 bg-white rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors shadow-sm cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Book Appointment</h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">Complete the steps below to confirm your consultation.</p>
          </div>
        </div>

        <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-6">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-8 bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
            
            {/* Stepper Header */}
            <div className="p-5 md:p-6 border-b border-gray-50">
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 border ${
                        isActive 
                          ? "border-[var(--color-primary)] text-[var(--color-primary)] bg-[var(--color-primary)]/5" 
                          : isPast 
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white" 
                            : "border-gray-200 text-gray-400 bg-white"
                      }`}>
                        {isPast ? <Check className="w-4 h-4" /> : s.num}
                      </div>
                      <span className={`mt-1.5 text-[10px] md:text-xs font-semibold uppercase tracking-wider ${isActive || isPast ? "text-gray-900" : "text-gray-400"}`}>{s.label}</span>
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
                    className="space-y-6"
                  >
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">Select a Specialist</h2>
                      <p className="text-sm text-gray-500 mb-4">Choose the doctor you would like to consult with.</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {MOCK_DOCTORS.map((doc) => (
                          <button 
                            key={doc.id}
                            onClick={() => setSelectedDoctor(doc.id)}
                            className={`flex flex-col p-4 rounded-lg border transition-all duration-200 text-left relative overflow-hidden group cursor-pointer ${
                              selectedDoctor === doc.id 
                                ? "bg-[var(--color-primary)]/5 border-[var(--color-primary)] ring-1 ring-[var(--color-primary)] shadow-sm" 
                                : "bg-white border-gray-100 hover:border-[var(--color-primary)]/30 hover:bg-gray-50/50"
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-white flex-shrink-0">
                                <Image src={doc.image} alt={doc.name} width={48} height={48} className="object-cover" />
                              </div>
                              <div className="flex-1">
                                <h3 className={`text-sm font-semibold transition-colors ${selectedDoctor === doc.id ? "text-[var(--color-primary)]" : "text-gray-900"}`}>{doc.name}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">{doc.spec}</p>
                                <p className="text-sm font-semibold text-gray-900 mt-1.5">₹{doc.fee}</p>
                              </div>
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
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">Select Date</h2>
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
                              <span className={`text-[9px] font-semibold uppercase tracking-wide mb-1 ${isSelected ? "text-white/80" : "text-gray-400"}`}>{monthName}</span>
                              <span className={`text-lg font-semibold mb-0.5 ${isSelected ? "text-white" : "text-gray-900"}`}>{dayNum}</span>
                              <span className={`text-[10px] font-medium ${isSelected ? "text-white/90" : "text-gray-500"}`}>{dayName}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className={`transition-opacity duration-300 ${!selectedDate ? "opacity-50 pointer-events-none" : ""}`}>
                       <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Time</h2>
                       <div className="space-y-5">
                        {/* Morning */}
                        <div>
                          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            Morning <span className="flex-1 h-[1px] bg-gray-50"></span>
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {TIME_SLOTS.morning.map(time => (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer ${
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

                        {/* Afternoon */}
                        <div>
                          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            Afternoon <span className="flex-1 h-[1px] bg-gray-50"></span>
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {TIME_SLOTS.afternoon.map(time => (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer ${
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

                        {/* Evening */}
                        <div>
                          <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                            Evening <span className="flex-1 h-[1px] bg-gray-50"></span>
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {TIME_SLOTS.evening.map(time => (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer ${
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
                      <h2 className="text-lg font-semibold text-gray-900 mb-1">Reason for Visit</h2>
                      <p className="text-sm text-gray-500 mb-3">Briefly describe the symptoms or reason for this appointment so the doctor is prepared.</p>
                      <textarea 
                         className="w-full bg-gray-50/50 border border-gray-100 rounded-lg p-3 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)]/50 min-h-[120px] resize-none transition-all"
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
                        <h4 className="text-sm font-semibold text-gray-800 mb-0.5">Secure & Confidential</h4>
                        <p className="text-xs text-gray-500 leading-relaxed">Your medical information is secure and only shared with your doctor.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
                
              </AnimatePresence>
            </div>

            {/* Stepper Footer */}
            <div className="px-5 py-4 md:px-6 md:py-4 border-t border-gray-50 bg-gray-50/30 flex justify-end">
               <Button 
                 variant="primary" 
                 size="sm"
                 className="px-6 py-2 rounded-lg font-medium shadow-sm"
                 onClick={handleNext}
                 disabled={(step === 1 && !canProceedStep1) || (step === 2 && !canProceedStep2) || (step === 3 && !canProceedStep3)}
                 rightIcon={step < 3 ? <ChevronRight className="w-4 h-4" /> : undefined}
               >
                 {step === 3 ? "Complete Booking" : "Proceed"}
               </Button>
            </div>
          </div>

          {/* Right Column - Booking Summary Sidebar */}
          <div className="lg:col-span-4">
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
                     <p className="text-xl md:text-2xl font-bold">₹{docDetails.fee}</p>
                     <p className="text-[10px] md:text-[11px] text-gray-400 font-medium pt-0.5 md:pt-1">In-Clinic Consultation</p>
                   </div>
                 ) : (
                   <div className="relative z-10 space-y-0.5 md:space-y-1 mb-1 md:mb-2">
                     <div className="flex items-center gap-2 text-orange-400 text-xs font-semibold mb-1 md:mb-2">
                       <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                       Select a Service
                     </div>
                     <p className="text-xl md:text-2xl font-bold">₹ 0</p>
                     <p className="text-[10px] md:text-[11px] text-gray-400 font-medium pt-0.5 md:pt-1">Pending selection</p>
                   </div>
                 )}
               </div>

               {/* White body summary card */}
               <div className="bg-white rounded-b-lg border border-t-0 border-gray-100 shadow-sm p-4 md:p-5 space-y-4 md:space-y-5">
                 
                 <div className="bg-orange-50/30 rounded-lg border border-orange-50 p-3 md:p-4">
                   <h4 className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Price Breakdown</h4>
                   <div className="flex justify-between items-center text-xs font-medium text-gray-600 mb-3">
                     <span>Consultation Fee</span>
                     <span className="font-semibold text-gray-900">₹{docDetails?.fee || 0}</span>
                   </div>
                   <div className="h-[1px] w-full bg-orange-100/50 mb-3"></div>
                   <div className="flex justify-between items-center">
                     <span className="text-xs font-semibold text-gray-900">Total</span>
                     <span className="text-sm font-bold text-orange-500">₹{docDetails?.fee || 0}</span>
                   </div>
                 </div>

                 <div className="space-y-2 md:space-y-3 pt-1 px-1">
                   <div className="flex items-center gap-3">
                     <div className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
                       <ShieldCheck className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-500" />
                     </div>
                     <span className="text-[11px] md:text-xs font-medium text-gray-600">Secure checkout process</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
                       <CheckCircle2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-500" />
                     </div>
                     <span className="text-[11px] md:text-xs font-medium text-gray-600">WhatsApp & email confirmation</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <div className="w-5 h-5 md:w-6 md:h-6 rounded-md bg-gray-50 flex items-center justify-center border border-gray-100 flex-shrink-0">
                       <Clock className="w-2.5 h-2.5 md:w-3 md:h-3 text-gray-500" />
                     </div>
                     <span className="text-[11px] md:text-xs font-medium text-gray-600">Session scheduled instantly</span>
                   </div>
                 </div>

               </div>
             </div>
          </div>
        </div>

      </main>
      
      <Footer />

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="relative w-full max-w-sm bg-white rounded-lg shadow-xl p-6 flex flex-col items-center text-center border border-gray-100"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-xs text-gray-500 font-medium mb-6 leading-relaxed">
                Your appointment has been successfully scheduled. We will send you a reminder soon.
              </p>
              
              <div className="w-full bg-gray-50 rounded-lg p-4 mb-5 border border-gray-100">
                 <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">Appointment Details</p>
                 <p className="text-sm font-semibold text-[var(--color-primary)]">{docDetails?.name}</p>
                 <p className="text-xs font-medium text-gray-600 mt-1">{selectedDate?.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric'})} at {selectedTime}</p>
              </div>

              <div className="w-5 h-5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin"></div>
              <p className="text-[10px] font-semibold text-gray-400 mt-3">Redirecting...</p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
