"use client";

import { motion, Variants } from "framer-motion";
import { Star, MapPin, ArrowRight, Stethoscope, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getDoctors, Doctor } from "@/lib/api/doctorsApi";

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
      <div className="mb-6 md:mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black leading-tight">
            Consult Top Pediatricians
          </h2>
          <Link href="/doctor" className="text-[11px] md:text-sm font-semibold md:font-medium text-[var(--color-primary)] flex items-center gap-1 group shrink-0 whitespace-nowrap">
            <span className="relative pb-0.5">
              View All
              <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--color-primary)] origin-left scale-x-0 group-hover:scale-x-100 group-active:scale-x-0 transition-transform duration-300 ease-out rounded-full"></span>
            </span>
            <ChevronRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
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
            className="bg-white rounded-[1.5rem] p-5 border border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.03)] hover:shadow-md transition-shadow duration-300 w-[85vw] min-w-[85vw] snap-center sm:w-full sm:min-w-full md:w-auto md:min-w-0 shrink-0 flex flex-col"
          >
            <div className="flex gap-4">
              {/* Image */}
              <div className="w-[72px] h-[72px] rounded-full overflow-hidden shrink-0 bg-slate-100 relative shadow-sm">
                {doc.user?.avatar ? (
                  <img src={doc.user.avatar} alt={doc.user.name || "Doctor"} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xl uppercase">
                    {doc.user?.name?.charAt(0) || "D"}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col min-w-0">
                <h3 className="font-semibold text-slate-800 text-[17px] leading-tight truncate">
                  {doc.user?.name || "Unknown Doctor"}
                </h3>
                <p className="text-[13px] text-slate-500 truncate mt-0.5">
                  {doc.specialization || 'Pediatrician'}
                </p>

                {/* Pills */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 bg-amber-50/80 border border-amber-100/50 px-2 py-0.5 rounded text-amber-600">
                    <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span className="text-[11px] font-medium">{doc.rating ? doc.rating.toFixed(1) : "0.0"}</span>
                  </div>
                  {doc.experienceYears !== undefined && (
                    <div className="flex items-center bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-slate-500">
                      <span className="text-[11px] font-medium">{doc.experienceYears} yrs exp</span>
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div className="flex items-center gap-1.5 mt-2.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-xs font-medium text-emerald-600">
                    {doc.isAvailable !== false ? 'Available Today' : 'Advance Booking'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="flex items-center gap-3 mt-5">
              <Link href={`/doctor`} className="flex-1 flex items-center justify-center py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
                Profile
              </Link>
              <Link href={`/doctor`} className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl bg-[#8c82c6] hover:bg-[#786cb0] text-white text-sm font-semibold transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                Book
              </Link>
            </div>
          </motion.div>
        ))}
      </motion.div>

    </section>
  );
}
