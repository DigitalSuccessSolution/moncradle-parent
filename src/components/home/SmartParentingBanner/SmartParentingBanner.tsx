import { CheckCircle2, ShieldCheck, Clock, ArrowRight, Bell, TrendingUp } from "lucide-react";
import Image from "next/image";

export function SmartParentingBanner() {
  return (
    <section className="bg-[#f0f4f8] rounded-[2rem] overflow-hidden relative flex flex-col lg:flex-row items-center justify-between mt-6 md:mt-8 p-6 md:p-8 lg:p-12 shadow-sm border border-gray-200/60">

      {/* Decorative Blob */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[var(--color-primary)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

      {/* Left Content */}
      <div className="z-10 max-w-sm w-full mb-10 lg:mb-0 text-center lg:text-left">
        <div className="inline-flex items-center gap-1.5 bg-white shadow-sm px-3 py-1.5 rounded-full text-[10px] font-extrabold text-[var(--color-primary)] uppercase tracking-wider mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-primary)] animate-pulse"></span>
          Moncradel App
        </div>
        <h3 className="text-3xl md:text-[2.5rem] font-black text-[#122B54] leading-[1.1] mb-4 tracking-tight">
          Smarter Care for <br />
          <span className="text-[var(--color-primary)]">Your Little One</span>
        </h3>
        <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8 max-w-[280px] mx-auto lg:mx-0">
          Get personalized insights, expert tips & reminders tailored precisely for your baby's healthy growth.
        </p>
        <button className="inline-flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white px-8 py-3.5 rounded-full font-bold shadow-[0_8px_20px_-6px_var(--color-primary)] hover:bg-[#527d89] transition-all hover:-translate-y-0.5 text-sm w-full sm:w-auto">
          Explore Features
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Center Graphics (Premium Phone Mockup with Real UI) */}
      <div className="relative z-0 hidden lg:flex items-center justify-center flex-1 h-[400px] mx-4">
        {/* Device Frame */}
        <div className="absolute -bottom-16 w-[250px] h-[480px] bg-white rounded-[3rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] border-[10px] border-gray-900 overflow-hidden flex flex-col group hover:-translate-y-4 transition-transform duration-700 ease-out">
          {/* Top Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20 flex justify-center items-end pb-1.5 gap-1">
             <div className="w-1 h-1 rounded-full bg-gray-800"></div>
             <div className="w-8 h-1 rounded-full bg-gray-800"></div>
          </div>
          
          {/* Screen Content - Mini App */}
          <div className="w-full h-full bg-[#f4f7fb] pt-10 px-4 flex flex-col gap-3 relative z-10 overflow-hidden">
            
            {/* Header */}
            <div className="flex justify-between items-center mb-1 mt-2">
               <div className="flex gap-2 items-center">
                 <div className="w-9 h-9 rounded-full bg-blue-100 overflow-hidden relative border-2 border-white shadow-sm">
                    <Image src="/images/hero_baby.png" alt="Baby" fill className="object-cover object-top" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[8px] text-gray-400 font-extrabold uppercase tracking-wide">Good Morning</span>
                   <span className="text-[13px] font-black text-[#122B54] leading-tight">Aarav</span>
                 </div>
               </div>
               <div className="w-7 h-7 rounded-full bg-white shadow-sm flex items-center justify-center border border-gray-100">
                 <Bell className="w-3.5 h-3.5 text-gray-400" />
               </div>
            </div>

            {/* Growth Stat Card */}
            <div className="bg-white rounded-[1.25rem] p-3 shadow-sm border border-gray-100 flex items-center justify-between group-hover:border-[var(--color-primary)]/30 transition-colors">
               <div>
                 <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wide">Current Weight</span>
                 <p className="text-lg font-black text-[#122B54] leading-none mt-1">8.5 <span className="text-[10px] font-semibold text-gray-400">kg</span></p>
               </div>
               <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
                 <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
               </div>
            </div>

            {/* Upcoming Task Card */}
            <div className="bg-gradient-to-br from-[var(--color-primary)] to-[#5c8a98] rounded-[1.25rem] p-4 shadow-md shadow-[var(--color-primary)]/20 text-white mt-1 relative overflow-hidden">
               <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
               <div className="flex items-center gap-1.5 mb-2 relative z-10">
                 <Clock className="w-3 h-3 text-white/80" />
                 <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest">Today, 10:30 AM</span>
               </div>
               <h4 className="text-sm font-black relative z-10 leading-tight">Vaccination Due</h4>
               <p className="text-[10px] text-white/80 mt-1 font-medium relative z-10">Polio Drops (3rd Dose)</p>
            </div>
            
            {/* Articles Mock */}
            <div className="mt-2">
               <span className="text-[10px] font-bold text-gray-800 ml-1 mb-2 block">Recommended Reads</span>
               <div className="flex gap-2 overflow-hidden">
                 <div className="w-24 h-24 rounded-2xl bg-white shadow-sm border border-gray-100 p-2 flex flex-col shrink-0">
                    <div className="w-full h-12 bg-orange-50 rounded-lg mb-2 relative overflow-hidden"><Image src="/images/meal_food.png" alt="food" fill className="object-cover"/></div>
                    <div className="h-2 w-full bg-gray-100 rounded-full mb-1"></div>
                    <div className="h-2 w-2/3 bg-gray-100 rounded-full"></div>
                 </div>
                 <div className="w-24 h-24 rounded-2xl bg-white shadow-sm border border-gray-100 p-2 flex flex-col shrink-0">
                    <div className="w-full h-12 bg-blue-50 rounded-lg mb-2 relative overflow-hidden"><Image src="/images/before_baby_3m.png" alt="baby" fill className="object-cover object-top"/></div>
                    <div className="h-2 w-full bg-gray-100 rounded-full mb-1"></div>
                    <div className="h-2 w-1/2 bg-gray-100 rounded-full"></div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </div>

      {/* Right Content - Floating Cards */}
      <div className="z-10 flex flex-col gap-4 w-full lg:w-auto">
        <div className="bg-white/90 backdrop-blur-md px-5 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:-translate-x-2 hover:shadow-md cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-gray-900 mb-0.5">Personalized Insights</h4>
            <p className="text-[11.5px] font-medium text-gray-500">Track milestones easily</p>
          </div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-md px-5 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:-translate-x-2 lg:-translate-x-6 hover:shadow-md cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-gray-900 mb-0.5">Expert Guidance</h4>
            <p className="text-[11.5px] font-medium text-gray-500">Tips from pediatricians</p>
          </div>
        </div>
        
        <div className="bg-white/90 backdrop-blur-md px-5 py-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:-translate-x-2 hover:shadow-md cursor-pointer group">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center text-[var(--color-primary)] shrink-0 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-[15px] font-bold text-gray-900 mb-0.5">Timely Reminders</h4>
            <p className="text-[11.5px] font-medium text-gray-500">Vaccination schedules</p>
          </div>
        </div>
      </div>

    </section>
  );
}
