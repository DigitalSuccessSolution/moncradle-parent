"use client";

import { useState } from "react";
import { Header } from "@/components/layout/Header/Header";

import { Footer } from "@/components/layout/Footer/Footer";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Check, Clock, Calendar, ChefHat, HeartPulse, CreditCard, ChevronRight, Utensils, Apple, Stethoscope, CalendarDays, Star } from "lucide-react";
import { useRouter } from "next/navigation";

// Dummy data matching backend: subscription.model.js
const ACTIVE_SUBSCRIPTION = {
  id: "sub_123",
  planType: "monthly_meals",
  status: "active",
  startDate: "2026-08-01T00:00:00.000Z",
  endDate: "2026-08-31T23:59:59.000Z",
};

const EXPLORE_PLANS = [
  {
    id: "weekly_meals",
    title: "Weekly Meals",
    icon: <Apple className="w-6 h-6" />,
    price: "₹999",
    duration: "/week",
    description: "Perfect for trying out our fresh, nutritious baby meals.",
    features: [
      "7 Days of Fresh Meals",
      "Standard Delivery",
      "Basic Nutrition Tracking",
      "Cancel Anytime"
    ],
    popular: false,
    color: "bg-blue-500",
    lightBg: "bg-blue-50"
  },
  {
    id: "monthly_meals",
    title: "Monthly Meals",
    icon: <Utensils className="w-6 h-6" />,
    price: "₹3,499",
    duration: "/month",
    description: "Our most popular plan! Hassle-free nutrition for a whole month.",
    features: [
      "30 Days of Fresh Meals",
      "Priority Free Delivery",
      "Advanced Nutrition Insights",
      "1 Free Dietitian Consult",
      "Cancel Anytime"
    ],
    popular: true,
    color: "bg-[var(--color-primary)]",
    lightBg: "bg-[var(--color-primary)]/10"
  },
  {
    id: "consultation_pack",
    title: "Consultation Pack",
    icon: <Stethoscope className="w-6 h-6" />,
    price: "₹1,999",
    duration: "/pack",
    description: "A bundle of 5 pediatric or nutritionist consultations.",
    features: [
      "5 Video Consultations",
      "Valid for 6 Months",
      "Access to Top Specialists",
      "Detailed Health Reports",
      "Priority Booking"
    ],
    popular: false,
    color: "bg-emerald-500",
    lightBg: "bg-emerald-50"
  }
];

export default function SubscriptionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my_plans" | "explore">("my_plans");

  // Calculate days remaining for active plan
  const calculateDaysRemaining = (endDateStr: string) => {
    const end = new Date(endDateStr);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const daysRemaining = calculateDaysRemaining(ACTIVE_SUBSCRIPTION.endDate);
  const totalDays = 30; // Assuming monthly for the mock progress bar
  const progressPercent = Math.max(0, Math.min(100, ((totalDays - daysRemaining) / totalDays) * 100));

  return (
    <div className="min-h-screen bg-white font-sans pb-24 md:pb-0">
      <Header />

      {/* Mobile Back Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Subscriptions</h1>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
        
        {/* Desktop Header */}
        <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Subscriptions</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">View your active plans or explore new ones for your baby's needs.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 w-full mb-8">
          <button 
            onClick={() => setActiveTab("my_plans")}
            className={`px-6 py-2.5 rounded-lg text-[15px] font-bold transition-all duration-300 ${activeTab === "my_plans" ? "bg-gray-900 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800"}`}
          >
            My Plans
          </button>
          <button 
            onClick={() => setActiveTab("explore")}
            className={`px-6 py-2.5 rounded-lg text-[15px] font-bold transition-all duration-300 ${activeTab === "explore" ? "bg-gray-900 text-white shadow-md" : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800"}`}
          >
            Explore Plans
          </button>
        </div>

        {/* Content */}
        <div className="pt-2">
          
          {/* MY PLANS TAB */}
          {activeTab === "my_plans" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              <div className="bg-white rounded-lg p-6 md:p-8 border border-gray-200 shadow-xl shadow-gray-200/50 flex flex-col transition-all duration-300 hover:-translate-y-1">
                
                <div className="flex flex-wrap items-center gap-3 mb-4 mt-2">
                  <h2 className="text-xl font-bold text-gray-900">Monthly Meals Plan</h2>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md">
                    Active
                  </span>
                </div>
                
                <p className="text-sm text-gray-500 font-medium mb-8">
                  You are currently receiving fresh, daily meals tailored to your baby's nutritional needs.
                </p>
                
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Days Remaining</span>
                     <span className="text-lg font-black text-gray-900">{daysRemaining} / 30</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                    <div 
                      className="bg-[var(--color-primary)] h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  <p className="text-xs font-semibold text-gray-400 mt-2">Renews on {new Date(ACTIVE_SUBSCRIPTION.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric'})}</p>
                </div>

                <div className="mt-auto flex flex-row gap-3 pt-6 border-t border-gray-100">
                  <button className="flex-1 bg-[var(--color-primary)] hover:opacity-90 text-white font-bold text-[13px] sm:text-[14px] py-3 rounded-lg transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer">
                    <CreditCard className="w-3.5 h-3.5 hidden sm:block" />
                    Renew
                  </button>
                  <button className="flex-1 bg-white hover:bg-gray-50 text-[var(--color-primary)] border border-[var(--color-primary)] font-bold text-[13px] sm:text-[14px] py-3 rounded-lg transition-all flex items-center justify-center cursor-pointer">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* EXPLORE PLANS TAB */}
          {activeTab === "explore" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {EXPLORE_PLANS.map((plan) => (
                <div 
                  key={plan.id} 
                  className={`relative flex flex-col bg-white rounded-lg p-6 md:p-8 border transition-all duration-300 hover:-translate-y-1 ${
                    plan.popular 
                      ? "border-[var(--color-primary)] shadow-2xl shadow-[var(--color-primary)]/20 ring-4 ring-[var(--color-primary)]/10" 
                      : "border-gray-200 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:border-gray-300"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-[var(--color-primary)] text-white text-[10px] font-black uppercase tracking-widest py-1.5 px-4 rounded-full shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <h3 className="text-2xl font-bold text-gray-900 mb-2 mt-4">{plan.title}</h3>
                  <p className="text-sm text-gray-500 font-medium mb-6 h-10">{plan.description}</p>
                  
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-black text-gray-900">{plan.price}</span>
                    <span className="text-sm font-bold text-gray-400">{plan.duration}</span>
                  </div>

                  <div className="flex-1">
                    <ul className="space-y-4 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${plan.popular ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'bg-gray-100 text-gray-500'}`}>
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button 
                    className={`w-full font-bold text-[14px] py-3 rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      plan.popular 
                        ? "bg-[var(--color-primary)] hover:opacity-90 text-white shadow-md shadow-[var(--color-primary)]/20" 
                        : "bg-white hover:bg-gray-50 text-[var(--color-primary)] border border-[var(--color-primary)]"
                    }`}
                  >
                    Subscribe Now
                    {plan.popular && <ChevronRight className="w-4 h-4" />}
                  </button>

                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
      
    </div>
  );
}
