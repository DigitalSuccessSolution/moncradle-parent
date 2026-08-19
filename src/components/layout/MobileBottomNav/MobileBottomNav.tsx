"use client";

import { useState, useEffect } from "react";
import { Home, Activity, Apple, ShoppingBag, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function MobileBottomNav({ isHidden = false }: { isHidden?: boolean }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Growth", href: "/growth", icon: Activity },
    { name: "Nutrition", href: "/nutrition", icon: Apple },
    { name: "Shop", href: "/shop", icon: ShoppingBag },
    { name: "Account", href: "/account", icon: User },
  ];

  // Hide on account page and its sub-pages (linked from the account menu)
  const hideOnPaths = [
    "/account",
    "/orders",
    "/doctor",
    "/health-records",
    "/appointments",
    "/notifications",
    "/subscriptions",
    "/settings",
    "/help-support",
    "/nutrition/meal-plans",
    "/shop/"
  ];

  if (!mounted) {
    return null;
  }

  if (hideOnPaths.some(path => pathname?.startsWith(path))) {
    return null;
  }

  return (
    <nav 
      className={`md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-[var(--color-border)] px-6 py-4 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] transition-transform duration-300 ease-in-out ${isHidden ? 'translate-y-full' : 'translate-y-0'}`}
    >
      {navItems.map((item) => {
        const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link 
            key={item.name} 
            href={item.href} 
            className={`flex flex-col items-center gap-1.5 transition-colors cursor-pointer ${isActive ? "text-[var(--color-primary)]" : "text-gray-600 hover:text-gray-900"}`}
          >
            <Icon className="w-6 h-6" />
            <span className={`text-[10px] ${isActive ? "font-semibold" : "font-semibold"}`}>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
