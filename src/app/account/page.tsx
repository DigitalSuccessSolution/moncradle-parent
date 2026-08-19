"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  LineChart, Apple, ShoppingBag, Package, Stethoscope,
  FileText, Calendar, HeartPulse, Bell, Settings, CreditCard, LifeBuoy, LogOut, ChevronRight, ShoppingCart,
  ChevronLeft, Edit3, Utensils, Heart
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserProfile, UserProfile } from "@/lib/api/usersApi";
import { getBabies, BabyProfile } from "@/lib/api/babiesApi";
import { useAppSelector } from "@/store/hooks";

export default function MobileProfileMenuPage() {
  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);
  const router = useRouter();
  const { logout } = useAuth();
  const cartItemCount = useAppSelector(state => state.cart.totalCount);
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
    { icon: Utensils, imageSrc: "/images/icons/meal.png", imageBg: "bg-[#D5EAF7]", label: "Meal Plan", href: "/nutrition/meal-plans", bgColor: "bg-[var(--pastel-blue)]/10", textColor: "text-[var(--pastel-blue)]" },
    { icon: ShoppingCart, imageSrc: "/images/icons/shop.png", imageBg: "bg-[#E6D7F9]", label: "My Cart", href: "/shop/cart", bgColor: "bg-[var(--pastel-orange)]/10", textColor: "text-[var(--pastel-orange)]" },
    { icon: Heart, imageSrc: "/images/icons/wishlist.png", imageBg: "bg-[#F6E1F9]", label: "Wishlist", href: "/shop/wishlist", bgColor: "bg-[var(--pastel-purple)]/10", textColor: "text-[var(--pastel-purple)]" },
    { icon: Package, imageSrc: "/images/icons/orders.png", imageBg: "bg-[#FDE2DF]", label: "Orders", href: "/orders", bgColor: "bg-[var(--pastel-coral)]/10", textColor: "text-[var(--pastel-coral)]" },
    { icon: FileText, imageSrc: "/images/icons/blog.png", imageBg: "bg-[#E6F4EA]", label: "Blog & Articles", href: "/articles", bgColor: "bg-[var(--pastel-green)]/10", textColor: "text-[var(--pastel-green)]" },
    { icon: Stethoscope, imageSrc: "/images/icons/doctor.png", imageBg: "bg-[#D8F2E3]", label: "Doctor", href: "/doctor", bgColor: "bg-[var(--pastel-green)]/10", textColor: "text-[var(--pastel-green)]" },
    { icon: FileText, imageSrc: "/images/icons/records.png", imageBg: "bg-[#FCE2C2]", label: "Health Records", href: "/health-records", bgColor: "bg-[var(--pastel-orange)]/10", textColor: "text-[var(--pastel-orange)]" },
    { icon: Calendar, imageSrc: "/images/icons/appointments.png", imageBg: "bg-[#FAC7BA]", label: "Appointments", href: "/appointments", bgColor: "bg-[var(--pastel-indigo)]/10", textColor: "text-[var(--pastel-indigo)]" },
    { icon: HeartPulse, imageSrc: "/images/icons/subscriptions.png", imageBg: "bg-[#D9CCFA]", label: "Subscriptions", href: "/subscriptions", bgColor: "bg-[var(--pastel-coral)]/10", textColor: "text-[var(--pastel-coral)]" },
    { icon: Settings, imageSrc: "/images/icons/settings.png", imageBg: "bg-[#EAE2F8]", label: "Settings", href: "/settings", bgColor: "bg-[var(--pastel-purple)]/10", textColor: "text-[var(--pastel-purple)]" },
    { icon: LifeBuoy, imageSrc: "/images/icons/help.png", imageBg: "bg-[#D6F0FA]", label: "Help & Support", href: "/help-support", bgColor: "bg-[var(--pastel-blue)]/10", textColor: "text-[var(--pastel-blue)]" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:hidden relative">

      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-[var(--color-background)] mb-4">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
          </button>
          <h1 className="text-[17px] font-semibold text-[#0F172A] ml-1">Account</h1>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/shop/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer group">
            <ShoppingCart className="w-6 h-6 text-gray-800 group-hover:text-black transition-colors" />
            {cartItemCount > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                {cartItemCount}
              </span>
            )}
          </Link>
          <Link href="/notifications" className="relative p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer group">
            <Bell className="w-6 h-6 text-gray-800 group-hover:text-black transition-colors" />
            {unreadNotificationsCount > 0 && <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>}
          </Link>
        </div>
      </header>

      <main className="px-4 py-2">

        {/* Profiles Row */}
        <div className="flex gap-8 mb-10 pl-2">

          {/* Parent Profile */}
          <div className="flex flex-col items-center group">
            <div className="relative mb-3">
              <Link href="/profile" className="block w-[84px] h-[84px] rounded-full border border-indigo-600 relative overflow-hidden bg-white flex flex-col items-center justify-center hover:bg-indigo-50 transition-colors">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Parent Profile" className="w-full h-full object-cover absolute inset-0" />
                ) : (
                  <span className="text-[40px] font-semibold text-gray-400 font-sans mb-3">{user?.name?.charAt(0)?.toUpperCase() || "P"}</span>
                )}
                <div className="absolute bottom-0 left-0 w-full h-[24px] bg-indigo-600 flex items-center justify-center text-white text-[10px] font-semibold tracking-wide">
                  Parent
                </div>
              </Link>
              <Link href="/profile/edit" className="absolute top-1 -right-2 bg-white border border-gray-100 rounded flex items-center justify-center shadow-sm w-6 h-6 hover:bg-gray-50 cursor-pointer">
                <Edit3 className="w-3.5 h-3.5 text-black" />
              </Link>
            </div>
            <span className="font-semibold text-gray-900 text-sm">{user?.name ? user.name.split(" ")[0] : "Parent"}</span>
          </div>

          {/* Baby Profile */}
          <div className="flex flex-col items-center group">
            <div className="relative mb-3">
              <Link href="/baby-profile" className="block w-[84px] h-[84px] rounded-full border border-rose-500 relative overflow-hidden bg-white flex flex-col items-center justify-center hover:bg-rose-50 transition-colors">
                {baby?.avatar ? (
                  <img src={baby.avatar} alt="Baby Profile" className="w-full h-full object-cover absolute inset-0" />
                ) : (
                  <span className="text-[40px] font-semibold text-gray-400 font-sans mb-3">{baby?.name?.charAt(0)?.toUpperCase() || "B"}</span>
                )}
                <div className="absolute bottom-0 left-0 w-full h-[24px] bg-rose-500 flex items-center justify-center text-white text-[10px] font-semibold tracking-wide">
                  Baby
                </div>
              </Link>
              <Link href="/baby-profile/edit" className="absolute top-1 -right-2 bg-white border border-gray-100 rounded flex items-center justify-center shadow-sm w-6 h-6 hover:bg-gray-50 cursor-pointer">
                <Edit3 className="w-3.5 h-3.5 text-black" />
              </Link>
            </div>
            <span className="font-semibold text-gray-900 text-sm">{baby?.name ? baby.name.split(" ")[0] : "Baby"}</span>
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
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  {item.imageSrc ? (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center relative ${item.imageBg} transition-transform group-hover:scale-110`}>
                      <div className="relative w-[95%] h-[95%]">
                        <Image src={item.imageSrc} alt={item.label} fill className="object-contain" sizes="40px" />
                      </div>
                    </div>
                  ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.bgColor} ${item.textColor} transition-transform group-hover:scale-110`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  )}
                  <span className="font-semibold text-gray-800 text-[15px]">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            logout();
            window.location.href = "/"; // Navigate to home and hard reload so states reset
          }}
          className="mt-4 flex items-center gap-4 p-4 w-full rounded-xl hover:bg-red-50 transition-all group cursor-pointer"
        >
          <div className="text-red-500">
            <LogOut className="w-6 h-6" />
          </div>
          <span className="font-semibold text-red-500 text-[15px]">Logout</span>
        </button>

        {/* Footer Links */}
        <div className="mt-8 mb-6 flex flex-col items-center justify-center gap-3 text-[13px] font-medium text-gray-400">
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
          </div>
          <p>v0.1.0 • © {new Date().getFullYear()} moncradle.</p>
        </div>
      </main>
    </div>
  );
}
