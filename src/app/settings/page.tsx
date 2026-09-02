"use client";

import { useAppSelector } from "@/store/hooks";
import { useState } from "react";



import {  ChevronLeft, User, Lock, Globe, HelpCircle, FileText, LogOut, ChevronRight, MapPin , Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);

  const router = useRouter();

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0">
      

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">
        
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white mb-4">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-semibold text-[#0F172A] ml-1">Settings</h1>
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

        {/* Page Header */}
        <div className="hidden md:flex flex-col mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 px-1">Settings</h1>
          <p className="text-sm text-gray-500 font-semibold mt-1 px-1">Manage your account preferences and app configurations.</p>
        </div>

        <div className="space-y-6">

          {/* Account Section */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">Account</h2>
            <div className="space-y-1">
              <Link href="/profile/edit" className="flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                     <User className="w-5 h-5 text-blue-500 group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-semibold text-gray-900">Personal Information</h3>
                    <p className="text-xs text-gray-500 font-semibold">Update your name, email, and phone</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </Link>

              <Link href="/address" className="flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                     <MapPin className="w-5 h-5 text-indigo-500 group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-semibold text-gray-900">Manage Addresses</h3>
                    <p className="text-xs text-gray-500 font-semibold">Delivery addresses for meal plans</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </Link>
            </div>
          </section>


          {/* Support Section */}
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">About & Support</h2>
            <div className="space-y-1">
              
              <Link href="/help-support" className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                     <HelpCircle className="w-5 h-5 text-gray-600 group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm md:text-base font-semibold text-gray-900">Help Center</h3>
                    <p className="text-xs text-gray-500 font-semibold">FAQs and customer support</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </Link>

              <button className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                     <FileText className="w-5 h-5 text-gray-600 group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm md:text-base font-semibold text-gray-900">Privacy Policy & Terms</h3>
                    <p className="text-xs text-gray-500 font-semibold">Legal information</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </section>

        </div>

      </main>

      
      
    </div>
  );
}
