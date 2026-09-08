"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle2, ChevronRight, Leaf, Flame, Beef,
  ShoppingBag, Calendar, X as XIcon, Wheat,
  ChevronLeft, Bell, AlertCircle, ShieldAlert, HeartPulse, Utensils
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBabies, BabyProfile } from "@/lib/api/babiesApi";
import { getNutritionPlan, NutritionPlan, toggleMealEaten } from "@/lib/api/nutritionPlanApi";
import { getMeals, Meal } from "@/lib/api/mealsApi";
import { useAuth } from "@/context/AuthContext";
import { useAppSelector } from "@/store/hooks";
import toast from "react-hot-toast";
import { calculateBabyAgeMonths } from "@/lib/utils/babyAge";

interface TodayMealEntry {
  entryId: string;
  eaten: boolean;
  meal: Meal;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Helper: Determine age bracket for meal queries and recommendations
function getAgeGroup(months: number): string {
  if (months < 6) return "0-6 months";
  if (months < 12) return "6-12 months";
  if (months < 36) return "1-3 years";
  return "3+ years";
}

// Helper: Pediatric daily nutritional intake targets dynamically based on baby's age in months
function getAgeNutritionalGoals(months: number) {
  if (months < 6) {
    return [
      { label: "Calories", value: 0, max: 550, unit: "kcal", color: "var(--color-primary)", icon: Flame },
      { label: "Protein", value: 0, max: 9, unit: "g", color: "#f59e0b", icon: Beef },
      { label: "Carbs", value: 0, max: 60, unit: "g", color: "#10b981", icon: Wheat },
      { label: "Fat", value: 0, max: 30, unit: "g", color: "#8b5cf6", icon: Leaf },
    ];
  } else if (months < 12) {
    return [
      { label: "Calories", value: 0, max: 750, unit: "kcal", color: "var(--color-primary)", icon: Flame },
      { label: "Protein", value: 0, max: 12, unit: "g", color: "#f59e0b", icon: Beef },
      { label: "Carbs", value: 0, max: 95, unit: "g", color: "#10b981", icon: Wheat },
      { label: "Fat", value: 0, max: 30, unit: "g", color: "#8b5cf6", icon: Leaf },
    ];
  } else if (months < 24) {
    return [
      { label: "Calories", value: 0, max: 950, unit: "kcal", color: "var(--color-primary)", icon: Flame },
      { label: "Protein", value: 0, max: 13, unit: "g", color: "#f59e0b", icon: Beef },
      { label: "Carbs", value: 0, max: 130, unit: "g", color: "#10b981", icon: Wheat },
      { label: "Fat", value: 0, max: 35, unit: "g", color: "#8b5cf6", icon: Leaf },
    ];
  } else if (months < 36) {
    return [
      { label: "Calories", value: 0, max: 1100, unit: "kcal", color: "var(--color-primary)", icon: Flame },
      { label: "Protein", value: 0, max: 16, unit: "g", color: "#f59e0b", icon: Beef },
      { label: "Carbs", value: 0, max: 145, unit: "g", color: "#10b981", icon: Wheat },
      { label: "Fat", value: 0, max: 38, unit: "g", color: "#8b5cf6", icon: Leaf },
    ];
  } else {
    return [
      { label: "Calories", value: 0, max: 1300, unit: "kcal", color: "var(--color-primary)", icon: Flame },
      { label: "Protein", value: 0, max: 19, unit: "g", color: "#f59e0b", icon: Beef },
      { label: "Carbs", value: 0, max: 160, unit: "g", color: "#10b981", icon: Wheat },
      { label: "Fat", value: 0, max: 42, unit: "g", color: "#8b5cf6", icon: Leaf },
    ];
  }
}

export default function NutritionDashboard() {
  const router = useRouter();
  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [babies, setBabies] = useState<BabyProfile[]>([]);
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [todaysMeals, setTodaysMeals] = useState<TodayMealEntry[]>([]);
  const [fallbackMeals, setFallbackMeals] = useState<Meal[]>([]);
  const [availableMeals, setAvailableMeals] = useState<Meal[]>([]);

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Compute baby's effective age in months (defaults to 8m for guests)
  const babyAgeMonths = useMemo(() => {
    return calculateBabyAgeMonths(baby?.dateOfBirth, baby?.ageInMonths);
  }, [baby?.dateOfBirth, baby?.ageInMonths]);

  // Load data for selected baby
  const loadBabyData = useCallback(async (currentBaby: BabyProfile | null) => {
    if (!currentBaby) return;
    setIsLoading(true);
    try {
      const ageMonths = calculateBabyAgeMonths(currentBaby.dateOfBirth, currentBaby.ageInMonths);
      const ageBracket = getAgeGroup(ageMonths);

      // Fetch dynamic meals suited for this baby's age bracket from backend
      const ageMealsRes = await getMeals({ suitableForAgeGroup: ageBracket, limit: 6 });
      const ageMealsList = ageMealsRes.data || ageMealsRes.meals || (Array.isArray(ageMealsRes) ? ageMealsRes : []);
      setAvailableMeals(ageMealsList);

      // Fetch nutrition plan for the baby
      if (currentBaby._id) {
        const nutritionPlan = await getNutritionPlan(currentBaby._id);
        setPlan(nutritionPlan);

        if (nutritionPlan && nutritionPlan.weeklySchedule?.length > 0) {
          const todayName = DAYS_OF_WEEK[new Date().getDay()];
          const todaySchedules = nutritionPlan.weeklySchedule.filter(
            (s) => s.day === todayName && s.mealId
          );

          const mealsToday: TodayMealEntry[] = todaySchedules
            .map((s) => ({
              entryId: s._id || "",
              eaten: !!s.eaten,
              meal: s.mealId as Meal,
            }))
            .filter((m) => m.meal && m.meal._id);

          setTodaysMeals(mealsToday);

          if (mealsToday.length === 0) {
            setFallbackMeals(ageMealsList.slice(0, 2));
          }
        } else {
          setTodaysMeals([]);
          setFallbackMeals(ageMealsList.slice(0, 2));
        }
      } else {
        setPlan(null);
        setTodaysMeals([]);
        setFallbackMeals(ageMealsList.slice(0, 2));
      }
    } catch (err) {
      console.error("Nutrition page load error:", err);
      try {
        const mealRes = await getMeals({ limit: 4 });
        const generalMeals = mealRes.data || mealRes.meals || (Array.isArray(mealRes) ? mealRes : []);
        setAvailableMeals(generalMeals);
        setFallbackMeals(generalMeals.slice(0, 2));
      } catch (e) {
        console.error("Meals fallback error:", e);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load: supports both authenticated parents and guest users
  useEffect(() => {
    if (isAuthLoading) return;
    const t = setTimeout(() => setMounted(true), 100);

    const init = async () => {
      setIsLoading(true);
      try {
        if (isAuthenticated) {
          // Logged in: fetch user's babies
          const babyRes = await getBabies();
          const babiesList: BabyProfile[] = babyRes.data || babyRes || [];
          setBabies(babiesList);

          if (babiesList.length > 0) {
            const initialBaby = babiesList[0];
            setBaby(initialBaby);
            await loadBabyData(initialBaby);
            return;
          }
        }

        // Guest or user without a baby profile: fetch general featured meals
        const mealRes = await getMeals({ limit: 4 });
        const generalMeals = mealRes.data || mealRes.meals || (Array.isArray(mealRes) ? mealRes : []);
        setAvailableMeals(generalMeals);
        setFallbackMeals(generalMeals.slice(0, 2));
      } catch (err) {
        console.error("Failed to initialize nutrition data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    init();
    return () => clearTimeout(t);
  }, [isAuthenticated, isAuthLoading, loadBabyData]);

  // Handle switching baby profile
  const handleSelectBaby = async (b: BabyProfile) => {
    if (b._id === baby?._id) return;
    setBaby(b);
    await loadBabyData(b);
  };

  const handleToggleEaten = async (e: React.MouseEvent, entryId: string, currentlyEaten: boolean) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast("Please login to track your baby's meals", { icon: "🔒" });
      router.push("/login?redirect=/nutrition");
      return;
    }

    if (!baby?._id || !entryId) {
      toast.error("Cannot mark meal without an active plan");
      return;
    }

    // Optimistic update
    setTodaysMeals(prev => prev.map(item =>
      item.entryId === entryId ? { ...item, eaten: !currentlyEaten } : item
    ));

    try {
      const updatedPlan = await toggleMealEaten(baby._id, entryId);
      if (updatedPlan) {
        setPlan(updatedPlan);
        toast.success(currentlyEaten ? "Marked as not eaten" : "Marked as eaten!");
      }
    } catch (error) {
      toast.error("Failed to update meal status");
      // Revert on error
      setTodaysMeals(prev => prev.map(item =>
        item.entryId === entryId ? { ...item, eaten: currentlyEaten } : item
      ));
    }
  };

  const handleWeeklyScheduleClick = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      toast("Please login to customize weekly schedule", { icon: "🔒" });
      router.push("/login?redirect=/nutrition/meal-plans");
    }
  };

  // Dynamic nutrient calculation based on age goals and actual consumed/planned meals
  const nutrients = useMemo(() => {
    const goals = getAgeNutritionalGoals(babyAgeMonths);
    const totals = { Calories: 0, Protein: 0, Carbs: 0, Fat: 0 };

    const activeMealsList = todaysMeals.length > 0
      ? todaysMeals.map(t => t.meal)
      : fallbackMeals;

    activeMealsList.forEach(meal => {
      if (meal && meal.nutritionalInfo) {
        totals.Calories += Number(meal.nutritionalInfo.calories) || 0;
        totals.Protein += Number(meal.nutritionalInfo.protein) || 0;
        totals.Carbs += Number(meal.nutritionalInfo.carbs) || 0;
        totals.Fat += Number(meal.nutritionalInfo.fat) || 0;
      }
    });

    return goals.map(g => ({
      ...g,
      value: totals[g.label as keyof typeof totals] || 0,
    }));
  }, [babyAgeMonths, todaysMeals, fallbackMeals]);

  // Dynamic dietary guidance (foods recommended vs strictly avoid)
  const dietaryGuidance = useMemo(() => {
    const age = babyAgeMonths;

    // 1. Recommended items dynamically extracted from available backend meals or age bracket
    const mealIngredients = Array.from(
      new Set(
        availableMeals
          .flatMap(m => m.ingredients || [])
          .filter(Boolean)
      )
    ).slice(0, 6);

    const recommendedFoods = mealIngredients.length > 0
      ? mealIngredients
      : (age < 6
        ? ["Mother's Milk", "Infant Formula", "Pediatric Vitamin D Drops"]
        : age < 12
          ? ["Mashed Banana", "Soft Boiled Apple", "Oatmeal Cereal", "Sweet Potato", "Steamed Carrot Puree", "Lentil Soup (Dal)"]
          : age < 24
            ? ["Soft Khichdi", "Mashed Paneer", "Steamed Veggies", "Ragi Porridge", "Soft Dosa / Idli", "Boiled Egg Yolk"]
            : ["Whole Grains", "Fresh Seasonal Fruits", "Legumes & Pulses", "Dairy & Paneer", "Green Leafy Veggies"]
      );

    // 2. Strictly avoid items dynamically derived from baby allergies + clinical age safety rules
    const avoidList: { label: string; isAllergy?: boolean }[] = [];

    // Add baby's recorded medical allergies first
    if (baby?.allergies && baby.allergies.length > 0) {
      baby.allergies.forEach(allergy => {
        if (allergy && !avoidList.some(a => a.label.toLowerCase() === allergy.toLowerCase())) {
          avoidList.push({ label: `${allergy} (Baby Allergy)`, isAllergy: true });
        }
      });
    }

    // Add age-specific safety recommendations
    if (age < 12) {
      if (!avoidList.some(a => a.label.toLowerCase().includes("honey"))) {
        avoidList.push({ label: "Raw Honey (under 1 yr)" });
      }
      if (!avoidList.some(a => a.label.toLowerCase().includes("cow"))) {
        avoidList.push({ label: "Unpasteurized Cow's Milk" });
      }
      avoidList.push({ label: "Whole Hard Nuts (Choking Hazard)" });
      avoidList.push({ label: "Added Refined Sugar & Salt" });
    } else if (age < 24) {
      avoidList.push({ label: "Whole Hard Nuts & Hard Candy" });
      avoidList.push({ label: "High-Sodium Processed Foods" });
      avoidList.push({ label: "Unpasteurized Dairy" });
    } else {
      avoidList.push({ label: "Ultra-Processed Snacks" });
      avoidList.push({ label: "High-Caffeine / Fizzy Drinks" });
      avoidList.push({ label: "Excess Refined Sugars" });
    }

    return {
      recommendedFoods,
      avoidList,
    };
  }, [baby, babyAgeMonths, availableMeals]);

  const displayMeals: TodayMealEntry[] = todaysMeals.length > 0
    ? todaysMeals
    : fallbackMeals.map(m => ({ entryId: "", eaten: false, meal: m }));

  const todayName = DAYS_OF_WEEK[new Date().getDay()];

  // Doctor name helper
  const doctorDisplayName = useMemo(() => {
    if (!plan?.assignedBy?.name) return null;
    const name = plan.assignedBy.name;
    return name.toLowerCase().startsWith("dr") ? name : `Dr. ${name}`;
  }, [plan?.assignedBy?.name]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative selection:bg-[var(--color-primary)]/20">

      {/* Mobile Back Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all cursor-pointer">
            <ChevronLeft className="w-6 h-6 text-gray-800" strokeWidth={2} />
          </button>
          <h1 className="text-[17px] font-medium text-black ml-1 tracking-tight">Baby Nutrition</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => router.push('/notifications')} className="relative p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer group">
            <Bell className="w-6 h-6 text-gray-800 group-hover:text-black transition-colors" />
            {unreadNotificationsCount > 0 && <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>}
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-3.5 sm:px-4 md:px-8 pt-2 sm:pt-3 md:pt-6">

        {/* Desktop Top Navigation & Baby Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="hidden md:flex items-center -ml-2">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="font-semibold text-sm">Back</span>
            </button>
          </div>

          {/* Baby profile selector (if parent has multiple registered babies) */}
          {babies.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">Baby:</span>
              {babies.map((b) => (
                <button
                  key={b._id}
                  onClick={() => handleSelectBaby(b)}
                  className={`text-xs px-3 py-1 rounded-full transition-all cursor-pointer whitespace-nowrap ${baby?._id === b._id
                      ? "bg-[var(--color-primary)] text-white font-semibold shadow-xs"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  {b.name || "Baby"}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* --- Modern Clean Hero Section --- */}
        <section
          className={`relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-[#8A84C8]/12 via-[#FAF8FF] to-[#E9F7EF] border border-gray-100/90 shadow-xs transition-all duration-700 ease-out p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* Subtle Ambient Glow */}
          <div className="hidden sm:block absolute -top-20 -right-20 w-72 h-72 bg-[var(--color-primary)]/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="hidden sm:block absolute -bottom-20 -left-20 w-72 h-72 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 space-y-4 sm:space-y-5">

            {/* Header: Title + Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1 text-xs font-medium text-[var(--color-primary)] flex-wrap">
                  <span className="flex items-center gap-1 font-medium text-[11px] sm:text-xs uppercase tracking-wide">
                    <Utensils className="w-3.5 h-3.5 text-[var(--color-primary)]" /> Pediatric Nutrition Plan
                  </span>
                  {plan?.guidelines ? (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-emerald-600 flex items-center gap-1 font-medium text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Doctor Approved
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-500 flex items-center gap-1 font-medium text-[11px]">
                        Age-Tailored Standard Plan
                      </span>
                    </>
                  )}
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-normal text-black tracking-tight leading-tight">
                  {baby?.name ? `${baby.name}'s Nutrition & Diet Guide` : "Fresh Nutrition & Diet Guide"}
                </h1>

                <p className="text-xs sm:text-sm text-gray-500 font-light mt-1 max-w-xl leading-relaxed">
                  {plan?.guidelines || "Age-stage balanced organic purees, daily nutrition targets, and personalized pediatrician meal guidance."}
                </p>
              </div>

              {/* Desktop Only Action Buttons */}
              <div className="hidden sm:flex items-center gap-2 sm:gap-2.5 shrink-0">
                <Link href="/nutrition/meal-plans" onClick={handleWeeklyScheduleClick}>
                  <Button variant="primary" size="sm" className="font-medium whitespace-nowrap text-xs cursor-pointer" leftIcon={<Calendar className="w-3.5 h-3.5" />}>
                    Weekly Schedule
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-white/90 border-gray-200 hover:bg-white text-gray-700 font-medium whitespace-nowrap text-xs cursor-pointer"
                  onClick={() => {
                    const el = document.getElementById("dietary-guidelines");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Doctor Guidelines
                </Button>
              </div>
            </div>

            {/* Daily Nutrient Macro Status Grid (Responsive Mobile-to-Desktop Grid) */}
            <div className="pt-1 sm:pt-1.5">
              <div className="flex items-center justify-between mb-2 sm:mb-2.5">
                <span className="text-[11px] sm:text-xs md:text-sm font-medium text-gray-700 flex items-center gap-1.5 truncate">
                  <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500 shrink-0" />
                  Daily Nutritional Intake Goals ({babyAgeMonths}m Target)
                </span>
                {todaysMeals.length > 0 && (
                  <span className="text-[10px] sm:text-xs font-medium text-emerald-700 bg-emerald-50 px-2 sm:px-2.5 py-0.5 rounded-full border border-emerald-100 whitespace-nowrap shrink-0 ml-1">
                    {todaysMeals.filter(m => m.eaten).length === todaysMeals.length ? "100% Goal Met" : "In Progress"}
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse bg-white/80 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-gray-100 h-24 sm:h-28"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-5">
                  {nutrients.map((n, i) => {
                    const pct = n.max > 0 ? Math.min(100, Math.round((n.value / n.max) * 100)) : 0;
                    const Icon = n.icon;
                    return (
                      <div
                        key={n.label}
                        className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 border border-gray-100/90 shadow-xs flex flex-col justify-between hover:shadow-sm transition-all min-h-[96px] sm:min-h-[115px] md:min-h-[120px]"
                      >
                        <div className="flex items-center justify-between mb-1.5 sm:mb-2 md:mb-3">
                          <span className="text-xs sm:text-sm font-medium text-gray-700 flex items-center gap-1.5 sm:gap-2">
                            <span className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg sm:rounded-xl flex items-center justify-center bg-gray-50 shrink-0 border border-gray-100/80">
                              <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" style={{ color: n.color }} />
                            </span>
                            <span>{n.label}</span>
                          </span>
                          <span className="text-[10px] sm:text-[11px] md:text-xs font-semibold text-gray-600 bg-gray-50 px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg border border-gray-100/80 shrink-0">
                            {pct}%
                          </span>
                        </div>

                        <div>
                          <div className="flex items-baseline justify-between mb-1 sm:mb-1.5 md:mb-2">
                            <span className="text-sm sm:text-base md:text-xl font-bold text-gray-900">{n.value}{n.unit}</span>
                            <span className="text-[10px] sm:text-xs md:text-sm text-gray-400 font-normal">/{n.max}{n.unit}</span>
                          </div>

                          <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2 md:h-2.5 overflow-hidden p-[1px]">
                            <div
                              className="h-full rounded-full transition-all duration-1000 ease-out"
                              style={{
                                width: mounted ? `${pct}%` : "0%",
                                backgroundColor: n.color,
                                transitionDelay: `${150 + i * 100}ms`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Quick Action Pills */}
            <div className="sm:hidden grid grid-cols-2 gap-2 pt-1">
              <Link href="/nutrition/meal-plans" onClick={handleWeeklyScheduleClick} className="w-full">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full font-medium text-xs py-2.5 px-2 shadow-xs whitespace-nowrap justify-center"
                  leftIcon={<Calendar className="w-3.5 h-3.5" />}
                >
                  Weekly Schedule
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-white border-gray-200 text-gray-700 font-medium text-xs py-2.5 px-2 shadow-xs whitespace-nowrap justify-center"
                onClick={() => {
                  const el = document.getElementById("dietary-guidelines");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Doctor Guidelines
              </Button>
            </div>

          </div>
        </section>

      </div>

      {/* --- Main Page Content --- */}
      <main className="max-w-[1400px] mx-auto px-3.5 sm:px-4 md:px-8 pb-8 md:pb-12 space-y-6 sm:space-y-8 md:space-y-10 relative z-10">

        {/* --- Today's Meals & Dietary Guidelines --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 md:gap-8 items-start">

          {/* Today's Meals */}
          <div className={`transition-all duration-700 ease-out delay-200 flex flex-col ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center justify-between mb-3 sm:mb-3.5">
              <div>
                <h2 className="text-lg sm:text-xl font-normal text-black tracking-tight">Today&apos;s Meals</h2>
                {todaysMeals.length > 0 ? (
                  <p className="text-[11px] sm:text-xs text-gray-500 font-light mt-0.5">{todayName} · Assigned from nutrition plan</p>
                ) : (
                  <p className="text-[11px] sm:text-xs text-gray-500 font-light mt-0.5">{todayName} · Recommended for {babyAgeMonths} months</p>
                )}
              </div>
              <Link href="/nutrition/meal-plans">
                <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-semibold text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/15 rounded-full px-3 py-1.5 transition-colors cursor-pointer whitespace-nowrap">
                  <Calendar className="w-3.5 h-3.5" /> Full Schedule
                </span>
              </Link>
            </div>

            <div className="space-y-3">
              {isLoading ? (
                [1, 2].map(i => (
                  <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-2xl p-4 flex gap-3.5">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-xl shrink-0"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-100 rounded w-full"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                    </div>
                  </div>
                ))
              ) : displayMeals.length > 0 ? displayMeals.slice(0, 3).map((item, i) => {
                const meal = item.meal;
                const isEaten = item.eaten;
                const mealImage = meal.imageUrl || meal.images?.[0];
                return (
                  <div
                    key={meal._id || i}
                    onClick={() => router.push(`/nutrition/meal-plans/${meal._id}`)}
                    className={`bg-white border border-gray-100 hover:border-[var(--color-primary)]/40 rounded-2xl p-3.5 sm:p-4 flex gap-3.5 sm:gap-4 items-center cursor-pointer transition-all hover:shadow-sm group ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`}
                    style={{ transitionDelay: mounted ? `${400 + i * 120}ms` : "0ms", transitionDuration: "500ms" }}
                  >
                    {/* Meal Image */}
                    <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-gray-50 relative overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center">
                      {mealImage ? (
                        <Image src={mealImage} alt={meal.name || "Meal"} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <Utensils className="w-7 h-7 text-gray-300" />
                      )}
                    </div>

                    {/* Meal Content */}
                    <div className="min-w-0 flex-1 flex flex-col justify-between py-0.5">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold text-[var(--color-primary)] uppercase tracking-wider bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-md">
                            {meal.category || "Nutritious Meal"}
                          </span>
                          {meal.nutritionalInfo?.calories ? (
                            <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                              🔥 {meal.nutritionalInfo.calories} kcal
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium">Fresh Meal</span>
                          )}
                        </div>

                        <h3 className="text-sm sm:text-base font-normal text-black leading-snug truncate group-hover:text-[var(--color-primary)] transition-colors">
                          {meal.name}
                        </h3>

                        <p className="text-xs text-gray-500 font-light truncate mt-0.5">
                          Contains: <span className="text-gray-700 font-normal">{meal.ingredients?.slice(0, 3).join(', ') || "Organic wholesome foods"}</span>
                        </p>
                      </div>

                      {/* Action Row */}
                      <div className="flex items-center justify-between gap-2 pt-2 mt-1">
                        <span className="text-[11px] text-gray-400 font-light">
                          {meal.nutritionalInfo?.protein ? `${meal.nutritionalInfo.protein}g protein` : "Organic & pediatrician curated"}
                        </span>

                        {item.entryId ? (
                          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={e => handleToggleEaten(e, item.entryId, isEaten)}
                              className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${isEaten
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90'
                                }`}
                            >
                              <CheckCircle2 className="w-3 h-3" /> {isEaten ? 'Eaten' : 'Mark Eaten'}
                            </button>
                            <button
                              onClick={() => router.push(`/nutrition/meal-plans/${meal._id}`)}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 transition-colors"
                            >
                              Details
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); router.push(`/nutrition/meal-plans/${meal._id}`); }}
                            className="text-[11px] font-semibold text-[var(--color-primary)] hover:text-white bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)] px-3 py-1 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                          >
                            View Recipe <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8 sm:py-10 bg-white rounded-2xl border border-dashed border-gray-200 p-4">
                  <Calendar className="w-9 h-9 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-semibold text-gray-500">No meals scheduled for today</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Explore our nutritious meals tailored for your baby</p>
                  <Link href="/nutrition/meal-plans">
                    <button className="mt-3 px-4 py-1.5 rounded-full bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                      Explore Meals
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Dietary Guidelines card */}
          <section
            id="dietary-guidelines"
            className={`bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-100 transition-all duration-700 ease-out delay-300 shadow-xs flex flex-col ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <div>
              <div className="flex items-center justify-between mb-3.5 sm:mb-4 pb-3 border-b border-gray-50">
                <h2 className="text-lg sm:text-xl font-normal text-black tracking-tight">Dietary Guidelines</h2>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Pediatric Advice
                </span>
              </div>

              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-100 rounded w-full"></div>
                  <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {/* Doctor's Custom Guidelines (if assigned) */}
                  {plan?.guidelines && (
                    <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3.5 sm:p-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Doctor&apos;s Prescription Notes
                        </span>
                        {doctorDisplayName && (
                          <span className="text-[11px] text-gray-500 font-medium">
                            By {doctorDisplayName}
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-medium">
                        {plan.guidelines}
                      </p>
                    </div>
                  )}

                  {/* Medical Condition & Allergy Notice if baby has any */}
                  {baby?.medicalCondition && (
                    <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3 sm:p-3.5 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[11px] font-bold text-amber-800 uppercase tracking-wide">
                          Medical Condition: {baby.medicalCondition}
                        </h4>
                        <p className="text-xs text-amber-700 mt-0.5">
                          Ensure all food preparations comply with clinical recommendations for {baby.name}.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recommended Items for Baby's Age Bracket */}
                  <div className="bg-emerald-50/50 border border-emerald-100/70 rounded-xl p-3 sm:p-3.5">
                    <h4 className="text-[11px] font-bold text-emerald-700 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Recommended For {babyAgeMonths} Months Old
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {dietaryGuidance.recommendedFoods.map((food) => (
                        <span
                          key={food}
                          className="text-[11px] sm:text-xs font-semibold text-gray-700 bg-white border border-emerald-100/80 px-2.5 py-1 rounded-lg shadow-2xs"
                        >
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Strictly Avoid Items & Known Allergens */}
                  <div className="bg-rose-50/50 border border-rose-100/70 rounded-xl p-3 sm:p-3.5">
                    <h4 className="text-[11px] font-bold text-rose-600 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Strictly Avoid &amp; Allergens
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {dietaryGuidance.avoidList.map((item) => (
                        <span
                          key={item.label}
                          className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg shadow-2xs ${item.isAllergy
                              ? "bg-rose-100 text-rose-800 border border-rose-300 font-bold"
                              : "text-gray-700 bg-white border border-rose-100/80"
                            }`}
                        >
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-400 text-center pt-3 mt-2 border-t border-gray-50">
              Personalized dynamically for {baby?.name || "baby"} based on pediatric nutrition standards.
            </p>
          </section>

        </div>

        {/* --- Shop CTA Banner --- */}
        <section
          className={`bg-[var(--color-primary)] rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-5 sm:gap-6 text-center sm:text-left transition-all duration-700 ease-out delay-500 shadow-sm ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* subtle gradient */}
          <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-white rounded-full blur-[110px] opacity-20 -mr-32 -mt-32 pointer-events-none"></div>

          <div className="relative z-10 flex items-center gap-4 sm:gap-5 flex-col sm:flex-row">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-normal text-white mb-1 tracking-tight">
                Expert-Approved <span className="text-emerald-200">Baby Nutrition</span>
              </h2>
              <p className="text-white/85 font-light text-xs sm:text-sm md:text-base max-w-lg leading-relaxed">
                Fresh, organic, and perfectly portioned meals delivered directly to your doorstep.
              </p>
            </div>
          </div>

          <div className="relative z-10 w-full sm:w-auto shrink-0">
            <Button
              variant="outline"
              size="lg"
              fullWidth
              rightIcon={<ChevronRight className="w-4 h-4" />}
              className="sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold bg-white text-[var(--color-primary)] border-transparent hover:bg-gray-50 active:scale-95 transition-transform duration-300 rounded-xl cursor-pointer"
              onClick={() => router.push('/nutrition/meal-plans')}
            >
              Explore Meals
            </Button>
          </div>
        </section>

      </main>

    </div>
  );
}
