"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ShoppingCart, Menu, HeartPulse, ChevronDown, Search, LogOut, Heart } from "lucide-react";
import { ProfileDropdown } from "../ProfileDropdown";
import { useAppSelector } from "@/store/hooks";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const pathname = usePathname();

  const authRoutes = ["/login", "/signup", "/forgot-password"];
  if (authRoutes.some(route => pathname?.startsWith(route))) {
    return null;
  }
  const { isAuthenticated, logout } = useAuth();
  const cartTotalCount = useAppSelector(state => state.cart.totalCount);
  const wishlistTotalCount = useAppSelector(state => state.wishlist.items?.length || 0);

  const navLinks = [
    { name: "Home", href: "/", color: "var(--pastel-indigo)" },
    { name: "Growth", href: "/growth", color: "var(--pastel-green)" },
    { name: "Nutrition", href: "/nutrition", color: "var(--pastel-blue)" },
    { name: "Shop", href: "/shop", color: "var(--pastel-purple)" },
    { name: "Doctor", href: "/doctor", color: "var(--pastel-coral)" },
  ];

  return (
    <>
      {/* Desktop Header */}
      <header className="hidden md:flex sticky top-0 z-[100] shrink-0 bg-white/70 backdrop-blur-2xl py-3 md:py-4 transition-all duration-300 w-full shadow-sm">
        <div className="max-w-7xl mx-auto w-full px-4 lg:px-8 xl:px-12 flex items-center justify-between gap-2 lg:gap-4">
          {/* Left: Logo */}
          <div className="flex-1 flex justify-start">
            <Link href="/" className="flex items-center group cursor-pointer -ml-1 lg:-ml-2 py-1 shrink-0">
              <Image src="/logo.png" alt="moncradle Logo" width={220} height={60} className="w-auto h-5 md:h-6 lg:h-7 xl:h-8 object-contain scale-100 lg:scale-[1.15] xl:scale-125 origin-left transition-transform" priority />
            </Link>
          </div>

          {/* Center: Nav */}
          <nav className="flex items-center justify-center gap-2 lg:gap-5 xl:gap-8 px-1 lg:px-2 shrink-0">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative py-1 text-[13px] lg:text-sm xl:text-base whitespace-nowrap transition-all duration-300 group ${isActive ? "font-semibold" : "text-black font-semibold"}`}
                >
                  <span
                    className={`transition-colors duration-300 ${isActive ? '' : 'group-hover:text-transparent group-hover:bg-clip-text'}`}
                    style={isActive ? { color: link.color } : { WebkitTextFillColor: 'currentColor', transition: 'color 0.3s' }}
                    onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = link.color; }}
                    onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = ''; }}
                  >
                    {link.name}
                  </span>
                  <span
                    className={`absolute left-0 bottom-0 w-full h-[2px] transition-transform duration-300 origin-center ${isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                    style={{ backgroundColor: link.color }}
                  ></span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="flex-1 flex items-center justify-end gap-2 lg:gap-4 shrink-0">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-1.5 lg:gap-3">
                  <Link href="/notifications" className="relative cursor-pointer hover:bg-gray-100 p-1.5 lg:p-2 rounded-full transition-all duration-300 group">
                    <Bell className="w-4 h-4 lg:w-5 lg:h-5 text-black group-hover:scale-110 transition-transform" />
                  </Link>
                  <Link href="/shop/wishlist" className="relative cursor-pointer hover:bg-gray-100 p-1.5 lg:p-2 rounded-full transition-all duration-300 group">
                    <Heart className="w-4 h-4 lg:w-5 lg:h-5 text-black group-hover:scale-110 transition-transform" />
                    {wishlistTotalCount > 0 && (
                      <span className="absolute top-0 right-0 lg:-top-0.5 lg:-right-0.5 bg-red-500 text-white text-[9px] lg:text-[10px] font-semibold h-3.5 min-w-[14px] lg:h-4 lg:min-w-[16px] px-1 flex items-center justify-center rounded-full shadow-sm">
                        {wishlistTotalCount}
                      </span>
                    )}
                  </Link>
                  <Link href="/shop/cart" className="relative cursor-pointer hover:bg-gray-100 p-1.5 lg:p-2 rounded-full transition-all duration-300 group">
                    <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 text-black group-hover:scale-110 transition-transform" />
                    {cartTotalCount > 0 && (
                      <span className="absolute top-0 right-0 lg:-top-0.5 lg:-right-0.5 bg-red-500 text-white text-[9px] lg:text-[10px] font-semibold h-3.5 min-w-[14px] lg:h-4 lg:min-w-[16px] px-1 flex items-center justify-center rounded-full shadow-sm">
                        {cartTotalCount}
                      </span>
                    )}
                  </Link>
                </div>

                <div className="h-6 lg:h-8 w-[1px] bg-gray-200"></div>

                <ProfileDropdown />
              </>
            ) : (
              <Link
                href="/login"
                className="group relative inline-flex items-center justify-center px-6 py-1.5 md:py-2 font-semibold text-white rounded-full overflow-hidden bg-[var(--color-primary)] transition-all duration-300 active:scale-95"
              >
                <span className="absolute inset-0 w-full h-full bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></span>
                <span className="relative tracking-wide">Login</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      {pathname === "/" && (
        <header className="md:hidden relative w-full bg-transparent px-4 py-2 flex items-center justify-between">
          {/* Left: Logo */}
          <Link href="/" className="flex items-center drop-shadow-md">
            <Image src="/logo.png" alt="moncradle Logo" width={160} height={44} className="w-auto h-10 object-contain" priority />
          </Link>

          {/* Right: Icons */}
          <div className="flex items-center gap-1">
            <Link href="/notifications" className="relative p-2 rounded-full hover:bg-black/5 active:scale-95 transition-all">
              <Bell className="w-5 h-5 text-gray-800" />
            </Link>
            <Link href="/shop/cart" className="relative p-2 rounded-full hover:bg-black/5 active:scale-95 transition-all">
              <ShoppingCart className="w-5 h-5 text-gray-800" />
              {cartTotalCount > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[9px] font-bold h-3.5 min-w-[14px] px-0.5 flex items-center justify-center rounded-full shadow-sm">
                  {cartTotalCount}
                </span>
              )}
            </Link>
          </div>
        </header>
      )}
    </>
  );
}

