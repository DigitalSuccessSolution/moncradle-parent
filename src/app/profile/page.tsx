"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header/Header";
import { Footer } from "@/components/layout/Footer/Footer";
import { Settings, LogOut, FileText, Activity, ShieldCheck, ChevronRight, Download, UploadCloud, MapPin, Stethoscope, Edit3, Phone, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { getUserProfile, UserProfile } from "@/lib/api/usersApi";

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Backend returns response.data directly or wrapped in data/user object depending on setup
        // We handle whatever object comes back
        const response = await getUserProfile();
        // Assuming backend sends user object in data or directly
        const userData = response.data || response.user || response;
        setUser(userData);
      } catch (error) {
        console.error("Failed to fetch profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }
  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0">
      <Header />

      {/* Mobile Back Header */}
      <div className="md:hidden flex items-center px-6 py-4 sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 active:scale-95 transition-all">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 ml-2">My Profile</h1>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
        
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8 tracking-tight">
          Profile & Records
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-10">
          
          {/* Left Column - Profile Card & Menus */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-1 space-y-6">
            
            {/* Parent Profile Card */}
            <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm relative">
               <Link href="/profile/edit" className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-500">
                  <Edit3 className="w-4 h-4" />
               </Link>
               <div className="flex items-center gap-4 mb-6">
                 <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-50 flex-shrink-0">
                    <Image src="/images/doctor_profile.png" alt="Profile" width={64} height={64} className="object-cover" />
                 </div>
                 <div>
                   <h2 className="text-lg font-semibold text-gray-900 pr-8">{user?.name || "Parent Name"}</h2>
                   <p className="text-xs text-gray-500 font-medium">{user?.email || "No email provided"}</p>
                   <span className="inline-block mt-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-semibold rounded border border-purple-100">Parent Account</span>
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                 <div>
                   <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Phone Number</p>
                   <p className="text-sm font-semibold text-gray-900">+91 {user?.phone || "N/A"}</p>
                 </div>
                 <div>
                   <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider mb-0.5">Member Since</p>
                   <p className="text-sm font-semibold text-gray-900">2026</p>
                 </div>
               </div>
            </div>

            {/* Saved Delivery Address */}
            <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
               <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2">
                   <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                   <h3 className="text-sm font-semibold text-gray-900">Saved Address</h3>
                 </div>
                 <Link href="/profile/edit" className="text-[10px] font-bold text-[var(--color-primary)] hover:underline uppercase tracking-wider">Edit</Link>
               </div>
               <p className="text-xs text-gray-600 leading-relaxed font-medium mt-2 whitespace-pre-wrap">
                 {user?.address || "No delivery address saved yet. Please edit profile to add."}
               </p>
            </div>

            {/* Primary Pediatrician */}
            <div className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm">
               <div className="flex items-center justify-between mb-3">
                 <div className="flex items-center gap-2">
                   <Stethoscope className="w-4 h-4 text-emerald-600" />
                   <h3 className="text-sm font-semibold text-gray-900">Primary Doctor</h3>
                 </div>
               </div>
               <div className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-bold text-gray-900">Dr. Ananya Singh</p>
                   <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Pediatrician</p>
                 </div>
                 <button className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors cursor-pointer">
                   <Phone className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </motion.div>

          {/* Right Column - Digital Health Vault */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
            <div className="bg-white rounded-lg p-6 md:p-8 border border-gray-100 shadow-sm min-h-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">Digital Health Vault</h3>
                  <p className="text-xs text-gray-500 font-medium mt-1">Securely store prescriptions, reports, and vaccination charts.</p>
                </div>
                <button className="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors text-xs border border-blue-100 w-full md:w-auto cursor-pointer">
                  <UploadCloud className="w-4 h-4" /> Upload Document
                </button>
              </div>

              {/* Folders/Categories */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-10">
                 <div className="bg-purple-50 border border-purple-100 p-3 md:p-4 rounded-lg cursor-pointer hover:border-purple-300 transition-colors flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-3">
                    <FileText className="w-6 h-6 md:w-8 md:h-8 text-purple-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-purple-900 text-xs md:text-sm">Prescriptions</h4>
                      <p className="text-[10px] text-purple-600/70 font-semibold mt-0.5">12 Files</p>
                    </div>
                 </div>
                 <div className="bg-emerald-50 border border-emerald-100 p-3 md:p-4 rounded-lg cursor-pointer hover:border-emerald-300 transition-colors flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-3">
                    <Activity className="w-6 h-6 md:w-8 md:h-8 text-emerald-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-emerald-900 text-xs md:text-sm">Lab Reports</h4>
                      <p className="text-[10px] text-emerald-600/70 font-semibold mt-0.5">4 Files</p>
                    </div>
                 </div>
                 <div className="bg-orange-50 border border-orange-100 p-3 md:p-4 rounded-lg cursor-pointer hover:border-orange-300 transition-colors flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-2 md:gap-3 col-span-2 md:col-span-1">
                    <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-orange-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-orange-900 text-xs md:text-sm">Vaccinations</h4>
                      <p className="text-[10px] text-orange-600/70 font-semibold mt-0.5">1 File</p>
                    </div>
                 </div>
              </div>

              {/* Recent Files */}
              <h4 className="font-semibold text-gray-900 mb-4">Recent Documents</h4>
              <div className="space-y-3">
                 {[
                   { name: "Fever_Prescription_DrAnanya.pdf", date: "28 May 2026", type: "PDF", size: "1.2 MB" },
                   { name: "Blood_Test_Report_May.jpg", date: "15 May 2026", type: "IMG", size: "2.4 MB" },
                   { name: "Vaccination_Chart_Update.pdf", date: "10 Apr 2026", type: "PDF", size: "800 KB" },
                 ].map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-3 md:p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors group cursor-pointer gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center text-gray-400 flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-800 truncate">{file.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-semibold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded flex-shrink-0">{file.type}</span>
                            <span className="text-[10px] font-medium text-gray-400 truncate">{file.size} • {file.date}</span>
                          </div>
                        </div>
                      </div>
                      <button className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-[var(--color-primary)] hover:text-white transition-colors cursor-pointer flex-shrink-0">
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                 ))}
              </div>

            </div>
          </motion.div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
