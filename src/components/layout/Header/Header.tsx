"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ShoppingCart, Menu, HeartPulse, ChevronDown, Search, LogOut } from "lucide-react";
import { ProfileDropdown } from "../ProfileDropdown";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, logout } = useAuth();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Growth", href: "/growth" },
    { name: "Nutrition", href: "/nutrition" },
    { name: "Shop", href: "/shop" },
    { name: "Doctor", href: "/doctor" },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-[var(--color-border)] px-8 py-3.5 items-center justify-between shadow-[var(--shadow-soft)] transition-all duration-300 relative">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center group cursor-pointer">
          <h1 className="text-2xl font-black text-[var(--color-primary)] tracking-tight group-hover:text-[var(--color-primary-light)] transition-colors">MONCRADEL</h1>
        </Link>
          
        {/* Center: Nav */}
        <nav className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.name}
                  href={link.href} 
                  className={`relative py-1 text-base transition-all duration-300 group ${
                    isActive 
                      ? "text-[var(--color-primary)] font-bold" 
                      : "text-black hover:text-[var(--color-primary)] font-semibold"
                  }`}
                >
                  {link.name}
                  <span className={`absolute left-0 bottom-0 w-full h-[2px] bg-[var(--color-primary)] transition-transform duration-300 origin-center ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}></span>
                </Link>
              );
            })}
        </nav>
        
        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3">
                <Link href="/notifications" className="relative cursor-pointer hover:bg-gray-100 p-2.5 rounded-full transition-all duration-300 group">
                  <Bell className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
                </Link>
                <Link href="/shop/cart" className="relative cursor-pointer hover:bg-gray-100 p-2.5 rounded-full transition-all duration-300 group">
                  <ShoppingCart className="w-5 h-5 text-black group-hover:scale-110 transition-transform" />
                </Link>
              </div>
              
              <div className="h-8 w-[1px] bg-gray-200"></div>

              <ProfileDropdown />
            </>
          ) : (
            <Link 
              href="/login" 
              className="group relative inline-flex items-center justify-center px-8 py-2.5 font-bold text-white rounded-full overflow-hidden bg-[var(--color-primary)] transition-all duration-300 active:scale-95"
            >
              <span className="absolute inset-0 w-full h-full bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></span>
              <span className="relative tracking-wide">Login</span>
            </Link>
          )}
        </div>
      </header>

      {/* Mobile Header */}
      {pathname === "/" && (
        <header className="md:hidden absolute top-0 left-0 w-full z-50 bg-transparent px-5 py-4 flex items-center justify-center pointer-events-none">
          <Link href="/" className="flex items-center group drop-shadow-md pointer-events-auto">
            <h1 className="text-xl font-black text-[var(--color-primary)] tracking-tight">MONCRADEL</h1>
          </Link>
        </header>
      )}
    </>
  );
}

