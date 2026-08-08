"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header/Header";

import { Footer } from "@/components/layout/Footer/Footer";
import { 
  ArrowLeft, User, Bell, Lock, Globe, HelpCircle, 
  FileText, LogOut, ChevronRight 
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Reusable Toggle Component
const Toggle = ({ enabled, onChange }: { enabled: boolean, onChange: () => void }) => {
  return (
    <button 
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${enabled ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`}
    >
      <span 
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
      />
    </button>
  );
};

export default function SettingsPage() {
  const router = useRouter();
  
  // Mock Settings State (Mapped to backend Key-Value schema later)
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailAlerts: false,
    whatsappUpdates: true,
    twoFactorAuth: false
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0">
      <Header />

      {/* Mobile Back Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Settings</h1>
        </div>
      </div>

      <main className="max-w-[700px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
        
        {/* Desktop Header */}
        <div className="hidden md:flex flex-col mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage your account preferences and app configurations.</p>
        </div>

        <div className="space-y-6">

          {/* Account Section */}
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Account</h2>
            <div className="space-y-1">
              <Link href="/profile/edit" className="flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                     <User className="w-5 h-5 text-blue-500 group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-gray-900">Personal Information</h3>
                    <p className="text-xs text-gray-500 font-medium">Update your name, email, and phone</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </Link>
              
              <button className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                     <Globe className="w-5 h-5 text-indigo-500 group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm md:text-base font-bold text-gray-900">Language</h3>
                    <p className="text-xs text-gray-500 font-medium">English (US)</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </section>

          {/* Notifications Section */}
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Notifications</h2>
            <div className="space-y-1">
              
              <div className="flex items-center justify-between p-4 md:p-5 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                     <Bell className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-gray-900">Push Notifications</h3>
                    <p className="text-xs text-gray-500 font-medium">Get instant alerts on your phone</p>
                  </div>
                </div>
                <Toggle enabled={settings.pushNotifications} onChange={() => toggleSetting("pushNotifications")} />
              </div>

              <div className="flex items-center justify-between p-4 md:p-5 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                     <Bell className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-gray-900">Email Alerts</h3>
                    <p className="text-xs text-gray-500 font-medium">Receive weekly summaries via email</p>
                  </div>
                </div>
                <Toggle enabled={settings.emailAlerts} onChange={() => toggleSetting("emailAlerts")} />
              </div>

              <div className="flex items-center justify-between p-4 md:p-5 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center">
                     <Bell className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-gray-900">WhatsApp Updates</h3>
                    <p className="text-xs text-gray-500 font-medium">Order tracking and appointment reminders</p>
                  </div>
                </div>
                <Toggle enabled={settings.whatsappUpdates} onChange={() => toggleSetting("whatsappUpdates")} />
              </div>

            </div>
          </section>

          {/* Security Section */}
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Security</h2>
            <div className="space-y-1">
              
              <button className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                     <Lock className="w-5 h-5 text-rose-500 group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm md:text-base font-bold text-gray-900">Change Password</h3>
                    <p className="text-xs text-gray-500 font-medium">Update your account password</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>

              <div className="flex items-center justify-between p-4 md:p-5 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center">
                     <Lock className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-bold text-gray-900">Two-Factor Authentication</h3>
                    <p className="text-xs text-gray-500 font-medium">Add an extra layer of security</p>
                  </div>
                </div>
                <Toggle enabled={settings.twoFactorAuth} onChange={() => toggleSetting("twoFactorAuth")} />
              </div>

            </div>
          </section>

          {/* Support Section */}
          <section>
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">About & Support</h2>
            <div className="space-y-1">
              
              <button className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                     <HelpCircle className="w-5 h-5 text-gray-600 group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm md:text-base font-bold text-gray-900">Help Center</h3>
                    <p className="text-xs text-gray-500 font-medium">FAQs and customer support</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>

              <button className="w-full flex items-center justify-between p-4 md:p-5 hover:bg-gray-50 rounded-xl transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-[var(--color-primary)]/10 transition-colors">
                     <FileText className="w-5 h-5 text-gray-600 group-hover:text-[var(--color-primary)] transition-colors" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm md:text-base font-bold text-gray-900">Privacy Policy & Terms</h3>
                    <p className="text-xs text-gray-500 font-medium">Legal information</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </button>
            </div>
          </section>

        </div>

      </main>

      <Footer />
      
    </div>
  );
}
