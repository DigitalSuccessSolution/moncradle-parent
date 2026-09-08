"use client";

import { motion, Variants } from "framer-motion";
import { Star, MapPin, ArrowRight, Stethoscope, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDoctors, Doctor, getDoctorAvailabilityStatus } from "@/lib/api/doctorsApi";

export function ExpertConsultation() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await getDoctors();
        // Limit to 3 doctors for the landing page section
        setDoctors(data.slice(0, 3));
      } catch (error) {
        console.error("Failed to fetch doctors", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const containerVars: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVars: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  if (isLoading) {
    return (
      <section className="w-full relative z-10 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-64 mb-2"></div>
        <div className="h-4 bg-slate-200 rounded w-96 mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-[1.5rem] p-5 h-[180px] border border-slate-100 shadow-sm"></div>
          ))}
        </div>
      </section>
    );
  }

  if (doctors.length === 0) {
    return null;
  }

  return (
    <section className="w-full relative z-10">
      <div className="flex items-center justify-between mb-3 sm:mb-5 md:mb-6 gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-normal text-black tracking-tight leading-snug truncate sm:overflow-visible">
            Consult <span className="text-[var(--color-primary)]">Top Pediatricians</span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-gray-500 font-light mt-0.5 hidden md:block">
            Expert medical advice and clinic appointments from verified pediatric specialists.
          </p>
        </div>
        <Link href="/doctor" className="text-xs md:text-sm font-medium text-[var(--color-primary)] flex items-center gap-0.5 group shrink-0 whitespace-nowrap">
          <span className="relative pb-0.5">
            View All
            <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--color-primary)] origin-left scale-x-0 group-hover:scale-x-100 group-active:scale-x-0 transition-transform duration-300 ease-out rounded-full"></span>
          </span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <motion.div
        variants={containerVars}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="flex overflow-x-auto items-stretch snap-x snap-mandatory gap-4 pb-4 px-4 -mx-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {doctors.map((doc) => (
          <motion.div
            key={doc._id}
            variants={itemVars}
            className="bg-white rounded-2xl md:rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all duration-300 w-[85vw] min-w-[85vw] snap-center sm:w-full sm:min-w-full md:w-auto md:min-w-0 shrink-0 flex flex-col justify-between"
          >
            <div className="flex gap-3.5 sm:gap-4">
              {/* Image with online badge */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100 shadow-2xs">
                  {doc.user?.avatar ? (
                    <img src={doc.user.avatar} alt={doc.user.name || "Doctor"} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl uppercase">
                      {doc.user?.name?.charAt(0) || "D"}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-2xs" />
              </div>

              {/* Info */}
              <div className="flex flex-col min-w-0 flex-1">
                <h3 className="font-normal text-black text-sm sm:text-base leading-tight truncate">
                  {doc.user?.name || "Unknown Doctor"}
                </h3>
                <p className="text-xs text-gray-500 font-light truncate mt-0.5">
                  {doc.specialization || 'Pediatrician'}
                </p>

                {/* Pills */}
                <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                  <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-100/60 px-1.5 py-0.5 rounded-md text-amber-600">
                    <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    <span className="text-[10px] font-medium">{doc.rating ? doc.rating.toFixed(1) : "5.0"}</span>
                  </div>
                  {doc.experienceYears !== undefined && (
                    <div className="flex items-center bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded-md text-gray-600">
                      <span className="text-[10px] font-light">{doc.experienceYears}y exp</span>
                    </div>
                  )}
                  {doc.state && (
                    <div className="flex items-center gap-0.5 bg-purple-50 border border-purple-100 px-1.5 py-0.5 rounded-md text-[var(--color-primary)] max-w-[100px] truncate" title={doc.state}>
                      <MapPin className="w-2.5 h-2.5 shrink-0" />
                      <span className="text-[10px] font-light truncate">{doc.state}</span>
                    </div>
                  )}
                </div>

                {/* Availability */}
                {(() => {
                  const avail = getDoctorAvailabilityStatus(doc);
                  return (
                    <div className="flex items-center gap-1 mt-2">
                      <Clock className={`w-3 h-3 ${avail.isToday ? 'text-emerald-500' : 'text-blue-500'}`} />
                      <span className={`text-[11px] font-light ${avail.isToday ? 'text-emerald-600' : 'text-blue-600'}`}>
                        {avail.status}
                      </span>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex items-center gap-2 pt-4 mt-2 border-t border-slate-50">
              <Link href={`/doctor`} className="flex-1 flex items-center justify-center py-2 rounded-xl border border-slate-200 text-black text-xs font-normal hover:bg-slate-50 transition-colors">
                Profile
              </Link>
              <Link href={`/doctor`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[var(--color-primary)] hover:brightness-95 text-white text-xs font-semibold transition-all shadow-2xs active:scale-95">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span>Book Visit</span>
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
