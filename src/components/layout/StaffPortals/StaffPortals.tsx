"use client";

import { usePathname } from "next/navigation";
import { Stethoscope, ChefHat, Truck, ExternalLink, ArrowRight } from "lucide-react";

export function StaffPortals() {
  const pathname = usePathname();
  const authRoutes = ["/login", "/signup", "/forgot-password"];
  
  if (authRoutes.some(route => pathname?.startsWith(route))) {
    return null;
  }

  return (
    <section className="bg-white relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-16 md:py-24 border-t border-gray-100">
        <div className="mb-10 md:mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
              Partner <span className="text-[var(--color-primary)]">Hub</span>
            </h3>
            <p className="text-base md:text-lg text-gray-500 leading-relaxed">
              Secure and quick access to Moncradle ecosystem portals for our doctors, kitchen staff, and delivery partners.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {/* Doctor Portal */}
          <a href="https://doctor.moncradle.com" target="_blank" rel="noopener noreferrer" className="group relative flex flex-col p-6 md:p-8 rounded-[24px] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[var(--color-primary)]/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden" aria-label="Open Doctor Portal">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-primary)]/10 transition-colors duration-500" />
            <div className="relative w-14 h-14 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Stethoscope className="w-7 h-7" />
            </div>
            <h4 className="relative font-bold text-xl text-gray-900 mb-3 flex items-center justify-between">
              Doctor Portal
              <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-[var(--color-primary)] transition-colors" />
            </h4>
            <p className="relative text-[15px] text-gray-500 mb-8 flex-1 leading-relaxed">
              Access the Doctor portal to manage appointments, patient records, and doctor-related activities seamlessly.
            </p>
            <span className="relative text-[15px] font-bold text-[var(--color-primary)] flex items-center gap-2 group-hover:gap-3 transition-all">
              Open Portal 
              <ArrowRight className="w-4 h-4" />
            </span>
          </a>

          {/* Kitchen Portal */}
          <a href="https://kitchen.moncradle.com" target="_blank" rel="noopener noreferrer" className="group relative flex flex-col p-6 md:p-8 rounded-[24px] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[var(--color-primary)]/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden" aria-label="Open Kitchen Portal">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-primary)]/10 transition-colors duration-500" />
            <div className="relative w-14 h-14 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500">
              <ChefHat className="w-7 h-7" />
            </div>
            <h4 className="relative font-bold text-xl text-gray-900 mb-3 flex items-center justify-between">
              Kitchen Portal
              <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-[var(--color-primary)] transition-colors" />
            </h4>
            <p className="relative text-[15px] text-gray-500 mb-8 flex-1 leading-relaxed">
              Access the Kitchen portal to view active orders, manage inventory, and streamline meal preparation.
            </p>
            <span className="relative text-[15px] font-bold text-[var(--color-primary)] flex items-center gap-2 group-hover:gap-3 transition-all">
              Open Portal 
              <ArrowRight className="w-4 h-4" />
            </span>
          </a>

          {/* Delivery Portal */}
          <a href="https://delivery.moncradle.com" target="_blank" rel="noopener noreferrer" className="group relative flex flex-col p-6 md:p-8 rounded-[24px] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[var(--color-primary)]/10 hover:-translate-y-2 transition-all duration-500 overflow-hidden" aria-label="Open Delivery Portal">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-primary)]/5 rounded-full blur-3xl group-hover:bg-[var(--color-primary)]/10 transition-colors duration-500" />
            <div className="relative w-14 h-14 rounded-2xl bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Truck className="w-7 h-7" />
            </div>
            <h4 className="relative font-bold text-xl text-gray-900 mb-3 flex items-center justify-between">
              Delivery Portal
              <ExternalLink className="w-5 h-5 text-gray-300 group-hover:text-[var(--color-primary)] transition-colors" />
            </h4>
            <p className="relative text-[15px] text-gray-500 mb-8 flex-1 leading-relaxed">
              Access the Delivery portal to track assignments, update statuses, and optimize your delivery routes.
            </p>
            <span className="relative text-[15px] font-bold text-[var(--color-primary)] flex items-center gap-2 group-hover:gap-3 transition-all">
              Open Portal 
              <ArrowRight className="w-4 h-4" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
