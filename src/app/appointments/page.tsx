"use client";

import { useAppSelector } from "@/store/hooks";
import { useState, useEffect } from "react";



import { Button } from "@/components/ui/Button";
import ReviewModal from "@/components/ui/ReviewModal";
import Image from "next/image";
import Link from "next/link";
import {  ChevronLeft, Calendar as CalendarIcon, Clock, Video, CheckCircle2, XCircle, FileText, Plus, X, MapPin, Phone, Banknote, Bell, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { apiClient } from "@/lib/apiClient";
import Swal from 'sweetalert2';
export default function AppointmentsPage() {
  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);

  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedApp, setSelectedApp] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewTarget, setReviewTarget] = useState<any>(null);
  // Track submitted ratings: { [appointmentId]: number }
  const [reviewedAppointments, setReviewedAppointments] = useState<Record<string, number>>({});

  useEffect(() => {
    apiClient.get('/appointments')
      .then(res => {
        if (res.data.success) {
          setAppointments(res.data.data);
        }
      })
      .catch(err => console.error("Failed to fetch appointments:", err))
      .finally(() => setLoading(false));
  }, []);

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

  const upcomingAppointments = appointments.filter(app => app.status === "scheduled");
  const pastAppointments = appointments.filter(app => app.status === "completed" || app.status === "cancelled");

  const handleSubmitReview = (rating: number) => {
    if (reviewTarget) {
      setReviewedAppointments(prev => ({ ...prev, [reviewTarget._id]: rating }));
      setReviewTarget(null);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to cancel this appointment?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, cancel it!'
    });

    if (result.isConfirmed) {
      try {
        const res = await apiClient.patch(`/appointments/${appointmentId}/status`, { status: "cancelled" });
        if (res.data.success) {
          setAppointments(prev => prev.map(app => app._id === appointmentId ? { ...app, status: "cancelled" } : app));
          setSelectedApp(null);
          Swal.fire('Cancelled!', 'Your appointment has been cancelled.', 'success');
        }
      } catch (err) {
        console.error("Failed to cancel appointment", err);
        Swal.fire('Error!', 'Failed to cancel appointment. Please try again.', 'error');
      }
    }
  };

  const formatDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateStr).toLocaleDateString('en-US', options);
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "";
    if (timeStr.toLowerCase().includes('am') || timeStr.toLowerCase().includes('pm')) {
      return timeStr;
    }
    const [hourStr, minute] = timeStr.split(':');
    let hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour ? hour : 12; 
    return `${hour}:${minute} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative">
      

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">
        
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white mb-4">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">Appointments</h1>
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
          className="hidden md:flex items-center mb-2 -ml-3 md:ml-0"
        >
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1 px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="font-semibold text-[15px]">Back</span>
          </button>
        </motion.div>

        {/* Desktop Header */}
        <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 px-1">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">My Appointments</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage your baby&apos;s clinic visits and appointments.</p>
          </div>
          <Link href="/doctor/book">
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Book Appointment
            </Button>
          </Link>
        </div>

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
              <Button variant="primary" className="rounded-full whitespace-nowrap px-3 text-[11px] font-semibold h-8 gap-1" leftIcon={<Plus className="w-3 h-3" />}>
                Book Appointment
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Content */}
        {loading && (
          <div className="flex justify-center py-20">
             <div className="w-8 h-8 border-4 border-gray-100 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
          </div>
        )}
        
        {!loading && (
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
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No Upcoming Appointments</h3>
              <p className="text-sm text-gray-500 font-medium">You have no scheduled visits at the moment.</p>
            </div>
          )}

          {activeTab === "upcoming" && upcomingAppointments.map((app) => (
            <motion.div key={app._id} variants={itemVariants} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md hover:border-[var(--color-primary)]/30 transition-all group flex flex-col justify-between">
              <div className="flex flex-col gap-5">
                
                {/* Doctor Info */}
                <div className="flex items-center gap-4 relative">
                  {/* Status Badge */}
                  <div className="absolute top-0 right-0">
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--pastel-green)] bg-[var(--pastel-green)]/10 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3" /> Confirmed
                    </span>
                  </div>

                  <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                    <Image src={app.doctorId?.avatar || "/images/doctor_profile.png"} alt={app.doctorId?.name || "Doctor"} width={56} height={56} className="object-cover" />
                  </div>
                  <div className="pr-20">
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{app.doctorId?.name || "Unknown Doctor"}</h3>
                    <p className="text-xs font-semibold text-gray-500 mb-1">{app.doctorId?.specialization || "General"}</p>
                    <div className="flex gap-2 flex-wrap">
                      <p className="text-[10px] font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-md inline-block">
                        For: {app.babyId?.name || "Baby"}
                      </p>
                      <p className="text-[10px] font-semibold text-[var(--pastel-orange)] bg-[var(--pastel-orange)]/10 px-2 py-0.5 rounded-md flex items-center gap-1">
                        In-Clinic
                      </p>
                    </div>
                  </div>
                </div>

                {/* Date/Time */}
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center gap-2 text-gray-700">
                    <CalendarIcon className="w-4 h-4 text-[var(--color-primary)]" />
                    <span className="text-sm font-semibold">{formatDate(app.date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold">{formatTime(app.time)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/doctor/book?doctorId=${app.doctorId?._id || app.doctorId}&rescheduleId=${app._id}`)}>
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
            <motion.div key={app._id} variants={itemVariants} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 opacity-90 h-full flex flex-col justify-between">
              <div className="flex flex-col gap-4">
                
                {/* Doctor Info */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 grayscale">
                    <Image src={app.doctorId?.avatar || "/images/doctor_profile.png"} alt={app.doctorId?.name || "Doctor"} width={48} height={48} className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{app.doctorId?.name || "Doctor"}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-500">{formatDate(app.date)}</span>
                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                      </div>
                      {app.status === "completed" ? (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--pastel-blue)] bg-[var(--pastel-blue)]/10 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-semibold text-[var(--pastel-coral)] bg-[var(--pastel-coral)]/10 px-2 py-0.5 rounded-md">
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
                      <h4 className="text-xs font-semibold text-gray-700 mb-1">Doctor&apos;s Notes</h4>
                      <p className="text-[13px] text-gray-600 font-medium leading-relaxed">{app.notes}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 pt-2 mt-auto">
                  <Button variant="outline" size="sm" className="flex-1 min-w-[100px] whitespace-nowrap" onClick={() => alert("View Prescription")}>
                    Records
                  </Button>
                  {app.status === "completed" && (
                    reviewedAppointments[app._id] ? (
                      <div className="flex items-center gap-0.5 px-3 py-2 rounded-xl border border-amber-100 bg-amber-50">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3.5 h-3.5 ${s <= reviewedAppointments[app._id] ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-100'}`} />
                        ))}
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewTarget(app)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-600 text-[13px] font-semibold hover:bg-amber-100 transition-colors active:scale-95"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        Rate
                      </button>
                    )
                  )}
                  <Button variant="primary" size="sm" className="flex-1 min-w-[100px] whitespace-nowrap" onClick={() => router.push(`/doctor/book?doctorId=${app.doctorId?._id || app.doctorId}`)}>
                    Book Again
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}

        </motion.div>
        )}
      </main>

      
      {/* Doctor Review Modal */}
      {reviewTarget && (
        <ReviewModal
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={(rating) => {
            setReviewedAppointments(prev => ({ ...prev, [reviewTarget._id]: rating }));
            setReviewTarget(null);
          }}
          targetType="doctor"
          targetName={reviewTarget.doctorId?.name || "Doctor"}
          targetSubtitle={`${reviewTarget.doctorId?.specialization || ""} · ${formatDate(reviewTarget.date)}`}
          doctorId={reviewTarget.doctorId?._id || reviewTarget.doctorId}
          appointmentId={reviewTarget._id}
        />
      )}

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
                <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
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
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                    <Image src={selectedApp.doctorId?.avatar || "/images/doctor_profile.png"} alt={selectedApp.doctorId?.name || "Doctor"} width={64} height={64} className="object-cover" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedApp.doctorId?.name || "Doctor"}</h3>
                    <p className="text-sm font-medium text-[var(--color-primary)]">{selectedApp.doctorId?.specialization || "Consultant"}</p>
                    {selectedApp.doctorId?.experienceYears && (
                      <p className="text-xs text-gray-500 mt-0.5">{selectedApp.doctorId.experienceYears} Years Experience</p>
                    )}
                  </div>
                </div>

                {/* Extended Doctor Info */}
                <div className="bg-gray-50 p-4 rounded-2xl flex flex-col gap-3 border border-gray-100">
                  {selectedApp.doctorId?.clinicName && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-gray-700">{selectedApp.doctorId.clinicName}</p>
                        <p className="text-xs text-gray-500 leading-tight mt-1">{selectedApp.doctorId.clinicAddress}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-gray-400" />
                      <p className="text-sm font-semibold text-gray-700">₹{selectedApp.doctorId?.consultationFee || 0}</p>
                    </div>
                    {selectedApp.doctorId?.phone && (
                       <div className="flex items-center gap-2">
                         <Phone className="w-4 h-4 text-gray-400" />
                         <p className="text-sm font-semibold text-gray-700">{selectedApp.doctorId.phone}</p>
                       </div>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">
                      {(() => {
                        const d = new Date(selectedApp.date);
                        return `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}, ${d.getFullYear()}`;
                      })()}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{formatTime(selectedApp.time)}</p>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-sm font-medium text-gray-500">Patient</span>
                    <span className="text-sm font-semibold text-gray-900">{selectedApp.babyId?.name || selectedApp.parentId?.name || "You"}</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-gray-50">
                    <span className="text-sm font-medium text-gray-500">Status</span>
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
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
                     handleCancelAppointment(selectedApp._id);
                  }}>
                    Cancel Visit
                  </Button>
                )}
                {selectedApp.status === "completed" && (
                  reviewedAppointments[selectedApp._id] ? (
                    <div className="flex-1 flex items-center justify-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= reviewedAppointments[selectedApp._id] ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                      ))}
                      <span className="text-xs font-semibold text-amber-600 ml-1">Rated!</span>
                    </div>
                  ) : (
                    <Button variant="primary" size="sm" fullWidth leftIcon={<Star className="w-3.5 h-3.5" />} onClick={() => setReviewTarget(selectedApp)}>
                      Rate Doctor
                    </Button>
                  )
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Doctor Review Modal */}
      {reviewTarget && (
        <ReviewModal
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSuccess={handleSubmitReview}
          targetType="doctor"
          targetName={reviewTarget.doctorId?.name || "Doctor"}
          targetSubtitle={reviewTarget.doctorId?.specialization || "Consultant"}
          doctorId={reviewTarget.doctorId?._id || reviewTarget.doctorId}
          appointmentId={reviewTarget._id}
        />
      )}

    </div>
  );
}
