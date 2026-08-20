"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  User, Baby, LineChart, Apple, ShoppingBag, Package, Stethoscope,
  FileText, Calendar, HeartPulse, Bell, Settings, CreditCard, LifeBuoy, LogOut, ChevronDown,
  Clock, Utensils, ShoppingCart, Heart
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function ProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    window.location.reload();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { icon: User, label: "My Profile", href: "/profile" },
    { icon: Baby, label: "Baby Profile", href: "/baby-profile" },
    { icon: Clock, label: "Baby Tracker", href: "/tracking" },
    { icon: Utensils, label: "Meal Plan", href: "/nutrition/meal-plans" },
    { icon: Package, label: "Orders", href: "/orders" },
    { icon: Stethoscope, label: "Doctor", href: "/doctor" },
    { icon: FileText, label: "Health Records", href: "/health-records" },
    { icon: Calendar, label: "Appointments", href: "/appointments" },
    { icon: HeartPulse, label: "Subscriptions", href: "/subscriptions" },
    { icon: FileText, label: "Blog & Articles", href: "/articles" },
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: LifeBuoy, label: "Help & Support", href: "/help-support" },
  ];

  return (
    <div className="relative" ref={dropdownRef} onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
      {/* Trigger */}
      <button
        className="flex items-center gap-1.5 lg:gap-3 cursor-pointer group hover:bg-gray-50 p-1 lg:p-1.5 lg:pr-4 rounded-full transition-all duration-300 border border-transparent hover:border-gray-100"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="relative overflow-hidden rounded-full transform group-hover:scale-105 transition-transform duration-300 bg-indigo-50 border-2 border-white shadow-sm w-8 h-8 lg:w-9 lg:h-9 flex items-center justify-center shrink-0">
          {user?.avatar ? (
            <Image
              src={user.avatar}
              alt="Profile"
              width={36}
              height={36}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-indigo-600 font-semibold text-xs lg:text-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'P'}
            </span>
          )}
        </div>
        <div className="flex flex-col text-left hidden lg:flex max-w-[100px] xl:max-w-[140px]">
          <span className="text-[13px] xl:text-sm font-medium text-black transition-colors truncate">{user?.name || 'Parent'}</span>
          <span className="text-[10px] text-gray-500 font-normal leading-tight capitalize truncate">{user?.role || 'Parent'}</span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 lg:w-4 lg:h-4 text-black transition-transform duration-300 ml-0.5 lg:ml-1 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 top-[100%] mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 origin-top-right py-2"
          >
            {/* Menu Items */}
            <div className="px-2 space-y-0.5 max-h-[70vh] overflow-y-auto no-scrollbar">
              {menuItems.map((item, idx) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                
                return (
                  <Link
                    key={idx}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
                      isActive 
                        ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10' 
                        : 'text-gray-700 hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5'
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon className={`w-4 h-4 transition-colors ${
                      isActive 
                        ? 'text-[var(--color-primary)]' 
                        : 'text-gray-500 group-hover:text-[var(--color-primary)]'
                    }`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Logout Button */}
            <div className="px-2 mt-2 pt-2 border-t border-gray-100">
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-2.5 w-full rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors group"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
