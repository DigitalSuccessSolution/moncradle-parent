"use client";

import { Header } from "@/components/layout/Header/Header";
import { Footer } from "@/components/layout/Footer/Footer";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import Link from "next/link";
import { 
  Activity, ArrowLeft, Droplet, Edit3, HeartPulse, 
  Ruler, Stethoscope, Syringe
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getBabies, BabyProfile } from "@/lib/api/babiesApi";

export default function BabyProfilePage() {
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
      <Header />

      {/* Mobile Back Header */}
      <div className="md:hidden flex items-center px-6 py-4 sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 ml-2">Baby Profile</h1>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
        
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">Baby Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          
          {/* Left Column - Profile Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm relative">
               <Link href="/baby-profile/edit" className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-500">
                  <Edit3 className="w-4 h-4" />
               </Link>
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-50 flex-shrink-0 flex items-center justify-center">
                    <span className="text-3xl font-medium text-gray-400">{baby?.name?.charAt(0)?.toUpperCase() || "B"}</span>
                 </div>
                 <div>
                   <h2 className="text-lg font-semibold text-gray-900 pr-8">{baby?.name || "Baby"}</h2>
                   <p className="text-xs text-gray-500 font-medium capitalize">{baby?.gender || "Baby"} • {baby?.ageInMonths || 0} Months</p>
                   <span className="inline-block mt-1 px-2 py-0.5 bg-rose-50 text-rose-600 text-[10px] font-semibold rounded border border-rose-100">Baby Account</span>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                 <div>
                   <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Date of Birth</p>
                   <p className="text-sm font-semibold text-gray-900">{baby?.dateOfBirth ? new Date(baby.dateOfBirth).toLocaleDateString() : "N/A"}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Diet</p>
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
              <div className="grid grid-cols-3 gap-4 md:gap-6">
                <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <Ruler className="w-6 h-6 text-orange-500 mb-2" />
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Height</p>
                  <p className="text-lg font-bold text-gray-900">{baby?.height || "--"} <span className="text-xs font-medium text-gray-400">cm</span></p>
                </div>
                
                <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <Activity className="w-6 h-6 text-emerald-500 mb-2" />
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Weight</p>
                  <p className="text-lg font-bold text-gray-900">{baby?.weight || "--"} <span className="text-xs font-medium text-gray-400">kg</span></p>
                </div>
                
                <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                  <Droplet className="w-6 h-6 text-red-500 mb-2" />
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Blood</p>
                  <p className="text-lg font-bold text-gray-900">{baby?.bloodType || "O+"}</p>
                </div>
              </div>
            </section>

            {/* Medical Info */}
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical Information</h3>
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm divide-y divide-gray-100">
                
                <div className="flex gap-4 p-5 md:p-6">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-purple-500">
                    <Syringe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Allergies</h4>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                      Peanuts, Dust Mites. Ensure peanut-free meals at all times.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-5 md:p-6">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-blue-500">
                    <HeartPulse className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Special Medical Conditions</h4>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                      Mild asthma. Needs inhaler during peak allergy seasons or heavy dust exposure.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 p-5 md:p-6">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center text-gray-500">
                     <Stethoscope className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Primary Pediatrician</h4>
                    <p className="text-sm text-gray-900 font-semibold">Dr. Ananya Sharma</p>
                    <p className="text-xs text-gray-500 font-medium">Apollo Cradle Hospital, Sector 14</p>
                  </div>
                </div>
                
              </div>
            </section>

          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
