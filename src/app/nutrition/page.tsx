"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header/Header";

import { Footer } from "@/components/layout/Footer/Footer";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft, CheckCircle2, ChevronRight, Leaf, Droplet, ShieldCheck,
  ShoppingBag, Calendar, X as XIcon, Clock, Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NutritionDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // trigger the nutrient bars + reveal animations after first paint
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const mealSnapshot = [
    { id: 1, name: "Apple & Oat Puree", type: "Breakfast", time: "09:00 AM", portion: "1 Small Bowl", img: "/images/food/apple_oat_puree.png" },
    { id: 2, name: "Mashed Sweet Potato", type: "Lunch", time: "01:00 PM", portion: "1/2 Cup", img: "/images/food/sweet_potato_mash.png" }
  ];

  const allowedFoods = ["Mashed Banana", "Soft Boiled Apple", "Oatmeal Cereal", "Sweet Potato"];
  const avoidFoods = ["Honey", "Cow's Milk", "Nuts (Whole)", "Added Salt/Sugar"];

  const nutrients = [
    { label: "Protein", value: 11, max: 13, unit: "g", color: "var(--color-primary)", track: "bg-blue-100", icon: Leaf },
    { label: "Iron", value: 8, max: 11, unit: "mg", color: "#f59e0b", track: "bg-amber-100", icon: Droplet },
    { label: "Calcium", value: 260, max: 260, unit: "mg", color: "#10b981", track: "bg-emerald-100", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative selection:bg-[var(--color-primary)]/20">
      <Header />

      {/* Mobile Back Button Removed */}

      {/* --- Full Width Hero Section --- */}
      <section
        className={`relative w-full min-h-[460px] md:min-h-[540px] flex items-start transition-all duration-1000 ease-out ${mounted ? "opacity-100" : "opacity-0"}`}
      >
        {/* Background image + overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/image copy.png"
            alt="Fresh baby food bowls"
            layout="fill"
            priority
            className="scale-105 object-cover object-[15%_center] md:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-[1400px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-12 pt-6 pb-12 md:pt-12 md:pb-16 items-start">

          {/* Left: text on image */}
          <div className="space-y-6 lg:mt-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm md:text-xs font-bold uppercase tracking-wider px-3.5 md:px-3 py-2 md:py-1.5 rounded-full shadow-sm">
                <CheckCircle2 className="w-4 h-4 md:w-3.5 md:h-3.5" /> Good Nutrition
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-white/40"></span>
              <span className="text-base md:text-sm font-semibold text-white/90">6-8 Months</span>
            </div>

            <h1 className="text-5xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-tight">
              Solid Foods <br />
              <span className="text-emerald-400 drop-shadow-sm">Diet Plan</span>
            </h1>
          </div>

          {/* Right: floating Daily Goals card */}
          <div
            className={`bg-white rounded-lg p-6 md:p-8 w-full max-w-md ml-auto -mb-80 md:mb-0 md:mt-6 lg:mt-16 relative z-20 transition-all duration-700 ease-out delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl md:text-xl font-bold text-gray-900">Daily Goals</h3>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="space-y-6">
              {nutrients.map((n, i) => {
                const pct = Math.min(100, Math.round((n.value / n.max) * 100));
                const Icon = n.icon;
                return (
                  <div key={n.label}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex items-center gap-2 text-base md:text-sm font-bold text-gray-800">
                        <Icon className="w-5 h-5 md:w-4 md:h-4" style={{ color: n.color }} />
                        {n.label}
                      </span>
                      <span className="text-sm md:text-xs font-semibold text-gray-500">
                        {n.value}{n.unit} <span className="text-gray-300 mx-1">/</span> {n.max}{n.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: mounted ? `${pct}%` : "0%",
                          backgroundColor: n.color,
                          transition: "width 1.2s cubic-bezier(0.22, 1, 0.36, 1)",
                          transitionDelay: `${400 + i * 150}ms`,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* --- Main Page Content --- */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 md:space-y-10 relative z-10 mt-16 md:-mt-6">

        {/* --- Today's Meals & Dietary Guidelines --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

          {/* Today's Meals (No wrapper card) */}
          <div className={`transition-all duration-700 ease-out delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Today&apos;s Meals</h2>
              <Link href="/nutrition/meal-plans">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-full px-3.5 py-2 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer">
                  <Calendar className="w-3.5 h-3.5" /> View Schedule
                </span>
              </Link>
            </div>

            <div className="space-y-4">
              {mealSnapshot.map((meal, i) => (
                <div
                  key={meal.id}
                  onClick={() => router.push('/nutrition/meal-plans')}
                  className={`bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-lg p-2.5 flex gap-3 md:gap-4 cursor-pointer transition-all ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`}
                  style={{ transitionDelay: mounted ? `${400 + i * 120}ms` : "0ms", transitionDuration: "500ms" }}
                >
                  {/* Image */}
                  <div className="w-[85px] h-[105px] md:w-[95px] md:h-[115px] rounded-lg bg-gray-100 relative overflow-hidden flex-shrink-0">
                    <Image src={meal.img} alt={meal.name} layout="fill" objectFit="cover" className="hover:scale-105 transition-transform duration-500" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col py-0 justify-center">

                    <div className="flex justify-between items-start mb-1.5">
                      <span className="text-[10px] md:text-xs font-extrabold text-[var(--color-primary)] uppercase tracking-wider bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full">
                        {meal.type}
                      </span>
                      <span className="text-[10px] md:text-xs font-bold text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {meal.time}
                      </span>
                    </div>

                    <h3 className="text-sm md:text-base font-bold text-gray-900 leading-tight mb-1">{meal.name}</h3>

                    <p className="text-[11px] md:text-xs font-semibold text-gray-500 mb-2">
                      Portion: <span className="text-gray-700">{meal.portion}</span>
                    </p>

                    <div className="h-[1px] w-full bg-[var(--color-primary)]/10 mb-2.5 mt-auto"></div>

                    <div className="flex gap-2">
                      <button className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white text-[11px] md:text-xs font-bold py-1.5 md:py-2 rounded-full transition-colors flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Eaten
                      </button>
                      <button className="flex-1 bg-white border border-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-gray-50 text-[11px] md:text-xs font-bold py-1.5 md:py-2 rounded-full transition-colors">
                        Recipe
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dietary Guidelines card */}
          <section
            className={`bg-white rounded-lg p-6 md:p-8 border border-gray-100 transition-all duration-700 ease-out delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-50">Dietary Guidelines</h2>

            <div className="space-y-5">
              <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-5">
                <h4 className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-4 uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> Add to Diet
                </h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  {allowedFoods.map((food, i) => (
                    <div key={food} className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold text-gray-700 transition-all ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
                        style={{ transitionDelay: mounted ? `${500 + i * 60}ms` : "0ms", transitionDuration: "400ms" }}
                      >
                        {food}
                      </span>
                      {i !== allowedFoods.length - 1 && <span className="w-1 h-1 rounded-full bg-gray-300"></span>}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-red-50/50 border border-red-100/50 rounded-xl p-5">
                <h4 className="flex items-center gap-2 text-xs font-bold text-red-500 mb-4 uppercase tracking-wider">
                  <XIcon className="w-4 h-4" /> Strictly Avoid
                </h4>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                  {avoidFoods.map((food, i) => (
                    <div key={food} className="flex items-center gap-2">
                      <span
                        className={`text-sm font-semibold text-gray-600 transition-all ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
                        style={{ transitionDelay: mounted ? `${650 + i * 60}ms` : "0ms", transitionDuration: "400ms" }}
                      >
                        {food}
                      </span>
                      {i !== avoidFoods.length - 1 && <span className="w-1 h-1 rounded-full bg-gray-300"></span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

        </div>



        {/* --- Shop CTA Banner --- */}
        <section
          className={`bg-[var(--color-primary)] rounded-lg p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-700 ease-out delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* subtle pattern or gradient */}
          <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-white rounded-full blur-[110px] opacity-20 -mr-32 -mt-32 pointer-events-none"></div>

          <div className="relative z-10 flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShoppingBag className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-1.5">
                Expert-Approved Baby Nutrition
              </h2>
              <p className="text-white/80 font-medium text-sm md:text-base">
                Fresh, organic, and perfectly portioned meals delivered directly to your doorstep.
              </p>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-auto flex-shrink-0">
            <Button
              variant="outline"
              size="lg"
              rightIcon={<ChevronRight className="w-4 h-4" />}
              className="w-full md:w-auto px-8 py-4 text-base bg-white text-[var(--color-primary)] border-transparent hover:bg-gray-50 active:scale-95 transition-transform duration-300 rounded-lg"
              onClick={() => router.push('/shop')}
            >
              Explore Shop
            </Button>
          </div>
        </section>

      </main>

      <Footer />

    </div>
  );
}
