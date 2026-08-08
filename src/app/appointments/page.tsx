"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header/Header";

import { Footer } from "@/components/layout/Footer/Footer";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, Calendar as CalendarIcon, Clock, 
  Video, CheckCircle2, XCircle, FileText, Plus, X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Dummy data matching backend: appointment.model.js
const MOCK_APPOINTMENTS = [
  {
    _id: "60d5ec49f1b2c8a14c8b4567",
    doctorId: {
      _id: "doc1",
      name: "Dr. Ananya Sharma",
      specialization: "Pediatrician",
      image: "/images/doctor_profile.png"
    },
    babyId: {
      _id: "baby1",
      name: "Aarav Sharma"
    },
    date: "2026-08-15",
    time: "10:30",
    status: "scheduled",
    meetingLink: "https://meet.google.com/abc-defg-hij",
    notes: ""
  },
  {
    _id: "60d5ec49f1b2c8a14c8b4568",
    doctorId: {
      _id: "doc2",
      name: "Dr. Rahul Verma",
      specialization: "Child Nutritionist",
      image: "/images/doctor_profile.png" // using same dummy image for now
    },
    babyId: {
      _id: "baby1",
      name: "Aarav Sharma"
    },
    date: "2026-08-20",
    time: "14:00",
    status: "scheduled",
    meetingLink: "", // In-person or not generated yet
    notes: ""
  },
  {
    _id: "60d5ec49f1b2c8a14c8b4569",
    doctorId: {
      _id: "doc1",
      name: "Dr. Ananya Sharma",
      specialization: "Pediatrician",
      image: "/images/doctor_profile.png"
    },
    babyId: {
      _id: "baby1",
      name: "Aarav Sharma"
    },
    date: "2026-07-28",
    time: "09:15",
    status: "completed",
    meetingLink: "",
    notes: "Aarav is doing great. Keep up with the current diet plan. Next vaccination due in 2 months."
  },
  {
    _id: "60d5ec49f1b2c8a14c8b4570",
    doctorId: {
      _id: "doc3",
      name: "Dr. Smriti Gupta",
      specialization: "Dermatologist",
      image: "/images/doctor_profile.png"
    },
    babyId: {
      _id: "baby1",
      name: "Aarav Sharma"
    },
    date: "2026-07-15",
    time: "16:00",
    status: "cancelled",
    meetingLink: "",
    notes: ""
  }
];

export default function AppointmentsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedApp, setSelectedApp] = useState<any>(null);

  useEffect(() => {
    if (selectedApp) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedApp]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const upcomingAppointments = MOCK_APPOINTMENTS.filter(app => app.status === "scheduled");
  const pastAppointments = MOCK_APPOINTMENTS.filter(app => app.status === "completed" || app.status === "cancelled");

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeStr: string) => {
    const [hourStr, minute] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; 
    return `${hour}:${minute} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative">
      <Header />

      {/* Mobile Back Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Appointments</h1>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
        
        {/* Desktop Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="hidden md:flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Appointments</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage your baby's clinic visits and appointments.</p>
          </div>
          <Link href="/doctor/book">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Book Appointment
            </Button>
          </Link>
        </motion.div>

        {/* Tabs & Mobile Book Button */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between w-full pb-2"
        >
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab("upcoming")}
              className={`px-3 md:px-5 py-1.5 md:py-2 text-[13px] md:text-base font-semibold rounded-full transition-all border whitespace-nowrap ${activeTab === "upcoming" ? "bg-gray-900 text-white border-gray-900 shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
            >
              Upcoming
            </button>
            <button 
              onClick={() => setActiveTab("past")}
              className={`px-3 md:px-5 py-1.5 md:py-2 text-[13px] md:text-base font-semibold rounded-full transition-all border whitespace-nowrap ${activeTab === "past" ? "bg-gray-900 text-white border-gray-900 shadow-sm" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
            >
              Past
            </button>
          </div>
          
          <div className="md:hidden flex-shrink-0 ml-auto pl-2 border-l border-gray-100">
            <Link href="/doctor/book">
              <Button variant="primary" className="rounded-full whitespace-nowrap px-3 text-[11px] font-bold h-8 gap-1" leftIcon={<Plus className="w-3 h-3" />}>
                Book Appointment
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          key={activeTab} // To trigger animation on tab change
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 pt-2"
        >
          
          {activeTab === "upcoming" && upcomingAppointments.length === 0 && (
            <div className="bg-white rounded-3xl p-10 text-center border border-gray-100 shadow-sm md:col-span-2">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No Upcoming Appointments</h3>
              <p className="text-sm text-gray-500 font-medium">You have no scheduled visits at the moment.</p>
            </div>
          )}

          {activeTab === "upcoming" && upcomingAppointments.map((app) => (
            <motion.div key={app._id} variants={itemVariants} className="bg-white rounded-lg p-5 border border-gray-100 shadow-[var(--shadow-soft)] hover:border-gray-200 transition-colors group flex flex-col justify-between">
              <div className="flex flex-col gap-5">
                
                {/* Doctor Info */}
                <div className="flex items-center gap-4 relative">
                  {/* Status Badge */}
                  <div className="absolute top-0 right-0">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3" /> Confirmed
                    </span>
                  </div>

                  <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                    <Image src={app.doctorId.image} alt={app.doctorId.name} width={56} height={56} className="object-cover" />
                  </div>
                  <div className="pr-20">
                    <h3 className="text-base font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{app.doctorId.name}</h3>
                    <p className="text-xs font-semibold text-gray-500 mb-1">{app.doctorId.specialization}</p>
                    <div className="flex gap-2 flex-wrap">
                      <p className="text-[10px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-md inline-block">
                        For: {app.babyId.name}
                      </p>
                      <p className="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md flex items-center gap-1">
                        In-Clinic
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date/Time */}
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarIcon className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="text-sm font-bold">{formatDate(app.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold">{formatTime(app.time)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => alert("Reschedule Flow")}>
                    Reschedule
                  </Button>
                  <Button variant="primary" size="sm" className="flex-1" fullWidth onClick={() => setSelectedApp(app)}>
                    View Details
                  </Button>
                </div>

              </div>
            </motion.div>
          ))}

          {activeTab === "past" && pastAppointments.map((app) => (
            <motion.div key={app._id} variants={itemVariants} className="bg-white rounded-lg p-5 border border-gray-100 shadow-[var(--shadow-soft)] opacity-90 h-full flex flex-col justify-between">
              <div className="flex flex-col gap-4">
                
                {/* Doctor Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 grayscale">
                    <Image src={app.doctorId.image} alt={app.doctorId.name} width={48} height={48} className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900">{app.doctorId.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs font-semibold text-gray-500">{formatDate(app.date)}</span>
                      <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      {app.status === "completed" ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                          <XCircle className="w-3 h-3" /> Cancelled
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {app.status === "completed" && app.notes && (
                  <div className="bg-gray-50 rounded-xl p-3 flex gap-3">
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 mb-1">Doctor's Notes</h4>
                      <p className="text-[13px] text-gray-600 font-medium leading-relaxed">{app.notes}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 mt-auto">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => alert("View Prescription")}>
                    Records
                  </Button>
                  <Button variant="primary" size="sm" className="flex-1" onClick={() => alert("Book Again")}>
                    Book Again
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}

        </motion.div>
      </main>

      <Footer />
      

      {/* Appointment Details Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedApp(null)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.4 }}
              className="relative w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
                <h2 className="text-xl font-bold text-gray-900">Appointment Details</h2>
                <button 
                  onClick={() => setSelectedApp(null)}
                  className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                
                {/* Doctor Section */}
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 bg-gray-50">
                    <Image src={selectedApp.doctorId.image} alt={selectedApp.doctorId.name} width={64} height={64} className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedApp.doctorId.name}</h3>
                    <p className="text-sm font-medium text-gray-500">{selectedApp.doctorId.specialization}</p>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Date</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {(() => {
                        const d = new Date(selectedApp.date);
                        return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}, ${d.getFullYear()}`;
                      })()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Time</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{formatTime(selectedApp.time)}</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-sm font-medium text-gray-500">Patient</span>
                    <span className="text-sm font-bold text-gray-900">{selectedApp.babyId.name}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {selectedApp.status}
                    </span>
                  </div>
                </div>

              </div>

              {/* Actions */}
              <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3">
                <Button variant="outline" size="sm" fullWidth onClick={() => setSelectedApp(null)}>
                  Close
                </Button>
                {selectedApp.status === "scheduled" && (
                  <Button variant="primary" size="sm" className="bg-red-500 hover:bg-red-600 border-transparent text-white" fullWidth onClick={() => {
                     alert("Cancel appointment flow");
                     setSelectedApp(null);
                  }}>
                    Cancel Visit
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
