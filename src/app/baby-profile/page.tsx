"use client";

import { useAppSelector } from "@/store/hooks";


import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import {  Activity, ChevronLeft, Droplet, Edit3, HeartPulse, Ruler, Stethoscope, Syringe , Bell } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getBabies, BabyProfile } from "@/lib/api/babiesApi";

export default function BabyProfilePage() {
  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);

  const router = useRouter();
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBaby = async () => {
      try {
        const response = await getBabies();
        const babies = response.data || response;
        if (babies && babies.length > 0) {
          setBaby(babies[0]);
        }
      } catch (error) {
        console.error("Failed to fetch baby profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBaby();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0">
      

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-6 sticky top-0 z-40 bg-white mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-semibold text-[#0F172A]">Baby Profile</h1>
          </div>
          <div className="flex items-center gap-3 pr-1">
            <Link href="/notifications" className="relative text-[#0F172A] active:scale-95 transition-transform">
              <Bell className="w-6 h-6" strokeWidth={2} />
              {unreadNotificationsCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
            </Link>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">Baby Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">

          {/* Left Column - Profile Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 md:p-8 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-gray-200/50 to-transparent rounded-bl-full opacity-30 pointer-events-none" />
               <Link href="/baby-profile/edit" className="absolute top-4 right-4 p-2.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-full transition-all cursor-pointer text-gray-600 z-50 hover:scale-105 active:scale-95">
                  <Edit3 className="w-4 h-4" />
               </Link>
               
               <div className="flex flex-col items-center text-center gap-3 mb-6 relative z-10">
                 <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-white flex items-center justify-center relative">
                    {baby?.avatar ? (
                      <img src={baby.avatar} alt="Baby Profile" className="w-full h-full object-cover absolute inset-0" />
                    ) : (
                      <span className="text-4xl font-semibold text-[var(--color-primary)] opacity-50">{baby?.name?.charAt(0)?.toUpperCase() || "B"}</span>
                    )}
                 </div>
                 <div>
                   <h2 className="text-xl font-semibold text-gray-900 mb-1">{baby?.name || "Baby Profile"}</h2>
                   <p className="text-sm text-gray-500 font-medium capitalize">{baby?.gender || "Not Specified"} • {baby?.ageInMonths !== undefined && baby?.ageInMonths !== null ? `${baby.ageInMonths} Months` : "Age N/A"}</p>
                   <span className="inline-block mt-3 px-3 py-1 bg-white text-[var(--color-primary)] text-[10px] font-semibold tracking-widest uppercase rounded-md border border-gray-200">Primary Profile</span>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 pt-5 border-t border-gray-200">
                 <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                   <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Date of Birth</p>
                   <p className="text-sm font-semibold text-gray-900">{baby?.dateOfBirth ? new Date(baby.dateOfBirth).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A"}</p>
                 </div>
                 <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
                   <p className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider mb-1">Diet</p>
                   <p className="text-sm font-semibold text-gray-900 capitalize">{baby?.diet || "N/A"}</p>
                 </div>
               </div>
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 space-y-8">

            {/* Vitals Grid */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Physical Vitals</h3>
              <div className="grid grid-cols-3 gap-4 md:gap-5">
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center cursor-default">
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                    <Ruler className="w-5 h-5 text-[var(--pastel-green)]" />
                  </div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-1">Height</p>
                  <p className="text-xl font-semibold text-gray-900">{baby?.height || "--"} <span className="text-xs font-semibold text-gray-400 ml-0.5">cm</span></p>
                </div>
                
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center cursor-default">
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                    <Activity className="w-5 h-5 text-[var(--pastel-orange)]" />
                  </div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-1">Weight</p>
                  <p className="text-xl font-semibold text-gray-900">{baby?.weight || "--"} <span className="text-xs font-semibold text-gray-400 ml-0.5">kg</span></p>
                </div>
                
                <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center cursor-default">
                  <div className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center mb-3">
                    <Droplet className="w-5 h-5 text-[var(--pastel-coral)]" />
                  </div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-widest mb-1">Blood</p>
                  <p className="text-xl font-semibold text-gray-900">{baby?.bloodType || "--"}</p>
                </div>
              </div>
            </section>

            {/* Medical Info */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                
                <div className="flex gap-4 p-5 md:p-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[var(--pastel-indigo)]">
                    <Syringe className="w-5 h-5" />
                  </div>
                  <div className="pt-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Allergies</h4>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                      {baby?.allergies && baby.allergies.length > 0 
                        ? baby.allergies.join(", ") 
                        : "No known allergies reported."}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-5 md:p-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-blue-600">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div className="pt-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Special Medical Conditions</h4>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                      {baby?.medicalCondition || "No special medical conditions reported."}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-5 md:p-6">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-600">
                     <Stethoscope className="w-5 h-5" />
                  </div>
                  <div className="pt-1">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Primary Pediatrician</h4>
                    <p className="text-sm text-gray-600 font-medium">
                      {baby?.assignedDoctorId 
                        ? (baby.assignedDoctorId.name.startsWith('Dr') ? baby.assignedDoctorId.name : `Dr. ${baby.assignedDoctorId.name}`) 
                        : "No primary pediatrician assigned yet."}
                    </p>
                  </div>
                </div>
                
              </div>
            </section>

          </motion.div>
        </div>
      </main>

      
    </div>
  );
}
