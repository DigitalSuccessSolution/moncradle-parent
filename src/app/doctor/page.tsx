"use client";

import { useState, useEffect } from "react";

import { apiClient } from "@/lib/apiClient";

import { Button } from "@/components/ui/Button";
import { Calendar as CalendarIcon, Video, Star, Clock, ChevronLeft, X, Shield, Award, MapPin, Bell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function DoctorPage() {
  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const cartTotalCount = useAppSelector(state => state.cart.totalCount);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All Specialists");

  const filteredDoctors = doctors.filter(doc => {
    if (activeCategory === "All Specialists") return true;
    return doc.spec.toLowerCase().includes(activeCategory.toLowerCase());
  });

  const handleBookClick = (e: React.MouseEvent, doctorId: string) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast("Please login to book an appointment", { icon: "🔒" });
      router.push("/login");
    } else {
      router.push(`/doctor/book?doctorId=${doctorId}`);
    }
  };

  const dynamicCategories = ["All Specialists", ...Array.from(new Set(doctors.map(doc => doc.spec).filter(Boolean)))];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await apiClient.get('/doctors');
        if (response.data.success) {
          const formattedDoctors = response.data.data.map((doc: any) => ({
            id: doc.user?._id || doc._id,
            name: doc.user?.name || "",
            spec: doc.specialization || "",
            exp: doc.experienceYears ? `${doc.experienceYears} yrs exp` : "",
            rating: doc.rating ? doc.rating.toFixed(1) : "0.0",
            reviews: doc.reviewsCount || 0,
            slots: doc.isAvailable ? "Available Today" : "Unavailable",
            img: doc.user?.avatar || "/images/doctor_profile.png",
            languages: doc.languagesSpoken?.join(", ") || "",
            education: (doc.qualifications?.length ? doc.qualifications : doc.degrees)?.join(", ") || "",
            about: doc.about || "",
            fee: doc.consultationFee || 0,
            clinicName: doc.clinicName || "",
            clinicAddress: doc.clinicAddress || ""
          }));
          setDoctors(formattedDoctors);
        }
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedDoctor]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
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
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">Find a Doctor</h1>
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

        {/* Desktop Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 px-1"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Find a Doctor</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Book a clinic consultation with top pediatric specialists.</p>
          </div>
          <div className="bg-[var(--pastel-green)]/10 text-[var(--pastel-green)] px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 border shadow-sm" style={{ borderColor: 'var(--pastel-green)' }}>
            <Shield className="w-4 h-4" /> {doctors.length} Doctors
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0"
        >
          {dynamicCategories.map((cat, i) => (
            <button
              key={i}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${activeCategory === cat ? 'bg-[var(--color-primary)] text-white shadow-sm' : 'bg-white border border-[var(--color-border)] text-gray-600 hover:bg-[#E8F3ED] hover:text-[var(--color-primary)] hover:border-[#17573A]/30'}`}>
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Doctor List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 pt-2"
        >
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="w-8 h-8 border-4 border-gray-100 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="col-span-full text-center py-20 bg-white rounded-lg border border-gray-100">
              <p className="text-gray-500 font-medium">No doctors available for this category.</p>
            </div>
          ) : filteredDoctors.map((doc, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 hover:shadow-md hover:border-[var(--color-primary)]/30 transition-all group flex flex-col h-full cursor-pointer">
              <div className="flex flex-col gap-3 h-full">

                <div className="flex items-start gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border border-gray-100 bg-blue-50/50">
                    <Image src={doc.img} alt={doc.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex-1 min-w-0 pt-0.5">
                    <h3 className="font-semibold text-base text-gray-900 leading-tight truncate group-hover:text-[var(--color-primary)] transition-colors capitalize">{doc.name || "Doctor"}</h3>
                    <p className="text-[11px] font-medium text-gray-500 mb-1.5 truncate min-h-[16px]">{doc.spec || "General Practice"}</p>

                    <div className="flex items-center gap-1.5 flex-wrap mb-1 min-h-[22px]">
                      <div className="flex items-center gap-1 bg-amber-50/50 border border-amber-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-amber-600">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {doc.rating}
                      </div>
                      {doc.exp && <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">{doc.exp}</span>}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-1.5">
                      <Clock className="w-3 h-3" /> {doc.slots}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-auto pt-3">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedDoctor(doc)}>
                    Profile
                  </Button>
                  <Button variant="primary" size="sm" className="flex-1" leftIcon={<CalendarIcon className="w-3.5 h-3.5" />} onClick={(e) => handleBookClick(e, doc.id)}>
                    Book
                  </Button>
                </div>

              </div>
            </motion.div>
          ))}
        </motion.div>

      </main>




      {/* Doctor Profile Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedDoctor(null)}
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.4 }}
              className="relative w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
                <h2 className="text-lg font-semibold text-gray-900">Doctor Profile</h2>
                <button
                  onClick={() => setSelectedDoctor(null)}
                  className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-6">

                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-50 mb-4">
                    <Image src={selectedDoctor.img} alt={selectedDoctor.name} width={96} height={96} className="object-cover" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{selectedDoctor.name}</h3>
                  <p className="text-sm font-semibold text-[var(--color-primary)] mb-3">{selectedDoctor.spec}</p>

                  <div className="flex items-center justify-center gap-4 w-full mt-4">
                    <div className="flex-1 border-r border-gray-50">
                      <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
                        <Star className="w-4 h-4 fill-amber-500" />
                        <span className="font-semibold text-base text-gray-900">{selectedDoctor.rating}</span>
                      </div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">{selectedDoctor.reviews} Reviews</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-center gap-1 text-[var(--color-primary)] mb-0.5">
                        <Award className="w-4 h-4" />
                        <span className="font-semibold text-base text-gray-900">{selectedDoctor.exp.split(' ')[0]}</span>
                      </div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Experience</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-[var(--color-primary)]" /> About Doctor
                    </h4>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                      {selectedDoctor.about}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Education</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedDoctor.education}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Languages Spoken</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedDoctor.languages}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Consultation Fee</p>
                      <p className="text-sm font-semibold text-[var(--color-primary)]">₹{selectedDoctor.fee}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">Clinic Details</p>
                      <p className="text-sm font-semibold text-gray-900">{selectedDoctor.clinicName || 'Online Consultation'}</p>
                      {selectedDoctor.clinicAddress && <p className="text-xs text-slate-500 mt-0.5">{selectedDoctor.clinicAddress}</p>}
                    </div>
                  </div>
                </div>

              </div>

              {/* Actions */}
              <div className="p-4 bg-white sticky bottom-0 flex justify-center">
                <div className="flex gap-3 w-full">
                  <Button variant="primary" className="flex-1" fullWidth leftIcon={<CalendarIcon className="w-4 h-4" />} onClick={(e) => handleBookClick(e, selectedDoctor.id)}>
                    Book Appointment
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
