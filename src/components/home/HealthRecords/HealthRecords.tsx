"use client";

import { HeartPulse, CheckCircle, Activity, Package, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export function HealthRecords() {
  return (
    <motion.section 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: [0.25, 1, 0.5, 1] }}
      className="w-full"
    >
      <div className="bg-teal-50/60 rounded-lg p-5 md:p-6 border border-teal-100/50 overflow-hidden relative group">
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100 rounded-full blur-3xl -z-10 opacity-30 group-hover:opacity-50 transition-opacity duration-700" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-100 rounded-full blur-2xl -z-10 opacity-30 group-hover:opacity-50 transition-opacity duration-700" />

        <div className="flex flex-col z-10 relative w-full">
          
          {/* Header Row */}
          <div className="flex items-center justify-between w-full mb-6">
            <div className="flex items-center gap-3 md:gap-5">
              <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 bg-teal-500 rounded-xl flex items-center justify-center text-white group-hover:scale-105 transition-transform duration-500">
                <HeartPulse className="w-6 h-6 md:w-7 md:h-7" />
              </div>
              <div>
                <h3 className="font-semibold md:font-normal text-lg md:text-2xl text-[#122B54] tracking-tight">
                  Health Records
                </h3>
                <p className="text-[11px] md:text-sm font-medium text-gray-500 mt-0.5 max-w-[200px] md:max-w-sm leading-tight">
                  All your baby's medical records in one place.
                </p>
              </div>
            </div>

            <Link href="/records" className="text-[11px] md:text-sm font-semibold md:font-medium text-[var(--color-primary)] flex items-center gap-1 group shrink-0 whitespace-nowrap self-start mt-2 md:mt-1">
              <span className="relative pb-0.5">
                View All
                <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--color-primary)] origin-left scale-x-0 group-hover:scale-x-100 group-active:scale-x-0 transition-transform duration-300 ease-out rounded-full"></span>
              </span>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          {/* Stats Area */}
          <div className="flex justify-between md:justify-start gap-4 md:gap-10 w-full overflow-x-auto no-scrollbar pb-1">
            
            <div className="flex items-center gap-3 flex-shrink-0 min-w-[130px] md:min-w-0">
               <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-blue-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300">
                 <CheckCircle className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
               </div>
               <div>
                 <p className="text-sm md:text-base font-semibold text-[#122B54]">Vaccination</p>
                 <p className="text-[11px] md:text-xs font-medium text-gray-500 mt-0.5">Up to date</p>
               </div>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0 min-w-[130px] md:min-w-0">
               <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-emerald-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 delay-75">
                 <Activity className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
               </div>
               <div>
                 <p className="text-sm md:text-base font-semibold text-[#122B54]">Lab Reports</p>
                 <p className="text-[11px] md:text-xs font-medium text-gray-500 mt-0.5">2 New</p>
               </div>
            </div>
            
            <div className="flex items-center gap-3 flex-shrink-0 min-w-[130px] md:min-w-0">
               <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-purple-500 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 delay-150">
                 <Package className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
               </div>
               <div>
                 <p className="text-sm md:text-base font-semibold text-[#122B54]">Prescriptions</p>
                 <p className="text-[11px] md:text-xs font-medium text-gray-500 mt-0.5">1 Active</p>
               </div>
            </div>
            
          </div>
          
        </div>
      </div>
    </motion.section>
  );
}
