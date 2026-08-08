"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  LineChart, Apple, ShoppingBag, Package, Stethoscope, 
  FileText, Calendar, HeartPulse, Bell, Settings, CreditCard, LifeBuoy, LogOut, ChevronRight,
  ArrowLeft, Edit3, Utensils
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, UserProfile } from "@/lib/api/usersApi";
import { getBabies, BabyProfile } from "@/lib/api/babiesApi";

export default function MobileProfileMenuPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [baby, setBaby] = useState<BabyProfile | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await getUserProfile();
        setUser(userRes.data || userRes.user || userRes);

        const babyRes = await getBabies();
        const babies = babyRes.data || babyRes;
        if (babies && babies.length > 0) {
          setBaby(babies[0]);
        }
      } catch (error) {
        console.error("Failed to load profiles", error);
      }
    };
    fetchData();
  }, []);

  const menuItems = [
    { icon: Utensils, label: "Meal Plan", href: "/nutrition/meal-plans" },
    { icon: Package, label: "Orders", href: "/orders" },
    { icon: Stethoscope, label: "Doctor", href: "/doctor" },
    { icon: FileText, label: "Health Records", href: "/health-records" },
    { icon: Calendar, label: "Appointments", href: "/appointments" },
    { icon: HeartPulse, label: "Subscriptions", href: "/subscriptions" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: LifeBuoy, label: "Help & Support", href: "/help-support" },
  ];

  return (
    <div className="min-h-screen bg-white font-sans pb-24 md:hidden">
      
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Account</h1>
        </div>
        <Link href="/notifications" className="relative p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer group">
          <Bell className="w-6 h-6 text-gray-800 group-hover:text-black transition-colors" />
          <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>
        </Link>
      </header>

      <main className="px-6 py-6">
                
        {/* Profiles Row */}
        <div className="flex gap-8 mb-10 pl-2">
          
          {/* Parent Profile */}
          <div className="flex flex-col items-center group">
            <div className="relative mb-3">
              <Link href="/profile" className="block w-[84px] h-[84px] rounded-full border border-indigo-600 relative overflow-hidden bg-white flex items-center justify-center hover:bg-indigo-50 transition-colors">
                 <span className="text-[40px] font-medium text-gray-400 font-sans mb-3">{user?.name?.charAt(0)?.toUpperCase() || "P"}</span>
                 <div className="absolute bottom-0 left-0 w-full h-[24px] bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold tracking-wide">
                    Parent
                 </div>
              </Link>
              <Link href="/profile/edit" className="absolute top-1 -right-2 bg-white border border-gray-100 rounded flex items-center justify-center shadow-sm w-6 h-6 hover:bg-gray-50 cursor-pointer">
                 <Edit3 className="w-3.5 h-3.5 text-black" />
              </Link>
            </div>
            <span className="font-bold text-gray-900 text-sm">{user?.name ? user.name.split(" ")[0] : "Parent"}</span>
          </div>

          {/* Baby Profile */}
          <div className="flex flex-col items-center group">
            <div className="relative mb-3">
              <Link href="/baby-profile" className="block w-[84px] h-[84px] rounded-full border border-rose-500 relative overflow-hidden bg-white flex items-center justify-center hover:bg-rose-50 transition-colors">
                 <span className="text-[40px] font-medium text-gray-400 font-sans mb-3">{baby?.name?.charAt(0)?.toUpperCase() || "B"}</span>
                 <div className="absolute bottom-0 left-0 w-full h-[24px] bg-rose-500 flex items-center justify-center text-white text-[10px] font-bold tracking-wide">
                    Baby
                 </div>
              </Link>
              <Link href="/baby-profile/edit" className="absolute top-1 -right-2 bg-white border border-gray-100 rounded flex items-center justify-center shadow-sm w-6 h-6 hover:bg-gray-50 cursor-pointer">
                 <Edit3 className="w-3.5 h-3.5 text-black" />
              </Link>
            </div>
            <span className="font-bold text-gray-900 text-sm">{baby?.name ? baby.name.split(" ")[0] : "Baby"}</span>
          </div>

        </div>

        {/* Menu Items List */}
        <div className="space-y-1">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <Link 
                key={idx} 
                href={item.href}
                className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="text-gray-500 group-hover:text-[var(--color-primary)] transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-gray-800 text-[15px]">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Divider */}
        <hr className="my-6 border-gray-100" />

        {/* Logout */}
        <button 
          onClick={() => {
            logout();
            window.location.href = "/"; // Navigate to home and hard reload so states reset
          }}
          className="flex items-center gap-4 p-4 w-full rounded-2xl hover:bg-red-50 transition-colors group cursor-pointer"
        >
          <div className="text-red-500">
            <LogOut className="w-6 h-6" />
          </div>
          <span className="font-bold text-red-500 text-[15px]">Logout</span>
        </button>
      </main>
    </div>
  );
}
