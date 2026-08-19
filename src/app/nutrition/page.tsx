"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  CheckCircle2, ChevronRight, Leaf, Flame, Beef,
  ShoppingBag, Calendar, X as XIcon, Clock, Wheat
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getBabies, BabyProfile } from "@/lib/api/babiesApi";
import { getNutritionPlan, NutritionPlan, toggleMealEaten } from "@/lib/api/nutritionPlanApi";
import { getMeals, Meal } from "@/lib/api/mealsApi";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

interface TodayMealEntry {
  entryId: string;
  eaten: boolean;
  meal: Meal;
}

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Recommended daily values for a baby (used when no plan is found)
const DEFAULT_GOALS = {
  calories: { value: 0, max: 800, unit: "kcal", color: "var(--color-primary)", icon: Flame, label: "Calories" },
  protein: { value: 0, max: 13, unit: "g", color: "#f59e0b", icon: Beef, label: "Protein" },
  carbs: { value: 0, max: 95, unit: "g", color: "#10b981", icon: Wheat, label: "Carbs" },
  fat: { value: 0, max: 30, unit: "g", color: "#8b5cf6", icon: Leaf, label: "Fat" },
};

export default function NutritionDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Data states
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [plan, setPlan] = useState<NutritionPlan | null>(null);
  const [todaysMeals, setTodaysMeals] = useState<TodayMealEntry[]>([]);
  const [fallbackMeals, setFallbackMeals] = useState<Meal[]>([]);
  const [nutrients, setNutrients] = useState(Object.values(DEFAULT_GOALS));

  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isAuthLoading, router]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    const t = setTimeout(() => setMounted(true), 100);

    const loadData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch baby profile
        const babyRes = await getBabies();
        const babies: BabyProfile[] = babyRes.data || babyRes || [];
        if (babies.length === 0) {
          // No baby profile, just show fallback meals
          const { getMeals } = await import("@/lib/api/mealsApi");
          const mealRes = await getMeals({ limit: 2 });
          setFallbackMeals(mealRes.data || []);
          setIsLoading(false);
          return;
        }

        const firstBaby = babies[0];
        setBaby(firstBaby);

        // 2. Fetch nutrition plan for baby
        const nutritionPlan = await getNutritionPlan(firstBaby._id!);
        setPlan(nutritionPlan);

        if (nutritionPlan && nutritionPlan.weeklySchedule?.length > 0) {
          // 3. Filter today's meals
          const todayName = DAYS_OF_WEEK[new Date().getDay()];
          const todaySchedules = nutritionPlan.weeklySchedule.filter(
            (s) => s.day === todayName && s.mealId
          );

          const mealsToday: TodayMealEntry[] = todaySchedules.map((s) => ({
            entryId: s._id || "",
            eaten: !!s.eaten,
            meal: s.mealId as Meal
          })).filter(m => m.meal);
          setTodaysMeals(mealsToday);

          // 4. Calculate daily nutrient totals
          const totals = { calories: 0, protein: 0, carbs: 0, fat: 0 };
          mealsToday.forEach(({ meal }) => {
            if (meal.nutritionalInfo) {
              totals.calories += meal.nutritionalInfo.calories || 0;
              totals.protein += meal.nutritionalInfo.protein || 0;
              totals.carbs += meal.nutritionalInfo.carbs || 0;
              totals.fat += meal.nutritionalInfo.fat || 0;
            }
          });

          setNutrients([
            { ...DEFAULT_GOALS.calories, value: totals.calories },
            { ...DEFAULT_GOALS.protein, value: totals.protein },
            { ...DEFAULT_GOALS.carbs, value: totals.carbs },
            { ...DEFAULT_GOALS.fat, value: totals.fat },
          ]);
          if (mealsToday.length === 0) {
            // No meals for today in the plan — fetch suggestions instead
            const { getMeals } = await import("@/lib/api/mealsApi");
            const mealRes = await getMeals({ limit: 2 });
            setFallbackMeals(mealRes.data || []);
          }

        } else {
          // No plan assigned — show featured meals as suggestions
          const { getMeals } = await import("@/lib/api/mealsApi");
          const mealRes = await getMeals({ limit: 2 });
          setFallbackMeals(mealRes.data || []);
        }
      } catch (err) {
        console.error("Nutrition page error:", err);
        const { getMeals } = await import("@/lib/api/mealsApi");
        const mealRes = await getMeals({ limit: 2 });
        setFallbackMeals(mealRes.data || []);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    return () => clearTimeout(t);
  }, [isAuthenticated, isAuthLoading]);

  const handleToggleEaten = async (e: React.MouseEvent, entryId: string, currentlyEaten: boolean) => {
    e.stopPropagation();
    if (!baby?._id || !entryId) {
      toast.error("Cannot mark meal without a plan");
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
      toast.error("Failed to update status");
      // Revert on error
      setTodaysMeals(prev => prev.map(item =>
        item.entryId === entryId ? { ...item, eaten: currentlyEaten } : item
      ));
    }
  };

  const displayMeals: TodayMealEntry[] = todaysMeals.length > 0
    ? todaysMeals
    : fallbackMeals.map(m => ({ entryId: "", eaten: false, meal: m }));
  const todayName = DAYS_OF_WEEK[new Date().getDay()];

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative selection:bg-[var(--color-primary)]/20">
      
      {/* --- Full Width Hero Section --- */}
      <section
        className={`relative w-full min-h-[460px] md:min-h-[540px] flex items-start transition-all duration-1000 ease-out ${mounted ? "opacity-100" : "opacity-0"}`}
      >
        {/* Background image + overlay */}
        <div className="absolute inset-0 overflow-hidden">
          <Image
            src="/images/nutrition_hero_baby.png"
            alt="Nutrition for baby"
            fill
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
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm md:text-xs font-semibold uppercase tracking-wider px-3.5 md:px-3 py-2 md:py-1.5 rounded-full shadow-sm">
                <CheckCircle2 className="w-4 h-4 md:w-3.5 md:h-3.5" /> Good Nutrition
              </span>
            </div>

            <h1 className="text-5xl md:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] tracking-tight">
              {baby ? `${baby.name}'s` : "Solid Foods"} <br />
              <span className="text-emerald-400 drop-shadow-sm">Diet Plan</span>
            </h1>

            {baby && (
              <p className="text-white/70 text-sm md:text-base font-medium max-w-sm">
                {baby.ageInMonths ? `Age: ${baby.ageInMonths} months` : ""}{baby.diet ? ` · Diet: ${baby.diet}` : ""}
              </p>
            )}
          </div>

          {/* Right: floating Daily Goals card */}
          <div
            className={`bg-white rounded-lg p-6 md:p-8 w-full max-w-md mx-auto lg:ml-auto mb-10 md:mb-0 md:mt-6 lg:mt-16 relative z-20 shadow-2xl transition-all duration-700 ease-out delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl md:text-xl font-semibold text-gray-900">Daily Goals</h3>
                {plan && todaysMeals.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">{todayName} · {todaysMeals.length} meal{todaysMeals.length > 1 ? "s" : ""} planned</p>
                )}
              </div>
              <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                <Flame className="w-4 h-4 text-gray-400" />
              </div>
            </div>

            {isLoading ? (
              <div className="space-y-5">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="flex justify-between mb-2">
                      <div className="h-4 bg-gray-100 rounded w-20"></div>
                      <div className="h-4 bg-gray-100 rounded w-16"></div>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-5">
                {nutrients.map((n, i) => {
                  const pct = n.max > 0 ? Math.min(100, Math.round((n.value / n.max) * 100)) : 0;
                  const Icon = n.icon;
                  return (
                    <div key={n.label}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 text-base md:text-sm font-semibold text-gray-800">
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
                {todaysMeals.length === 0 && !isLoading && (
                  <p className="text-xs text-gray-400 text-center pt-1">
                    {plan ? "No meals scheduled for today." : "No nutrition plan assigned yet."}
                  </p>
                )}
              </div>
            )}
          </div>

        </div>
      </section>

      {/* --- Main Page Content --- */}
      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-8 md:py-12 space-y-8 md:space-y-10 relative z-10">

        {/* --- Today's Meals & Dietary Guidelines --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">

          {/* Today's Meals */}
          <div className={`transition-all duration-700 ease-out delay-200 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Today's Meals</h2>
                {todaysMeals.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">{todayName} · From your nutrition plan</p>
                )}
                {todaysMeals.length === 0 && !isLoading && (
                  <p className="text-xs text-gray-400 mt-0.5">Suggested meals for you</p>
                )}
              </div>
              <Link href="/nutrition/meal-plans">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-full px-3.5 py-2 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer">
                  <Calendar className="w-3.5 h-3.5" /> View Schedule
                </span>
              </Link>
            </div>

            <div className="space-y-4">
              {isLoading ? (
                [1, 2].map(i => (
                  <div key={i} className="animate-pulse bg-gray-50 rounded-xl p-4 flex gap-4">
                    <div className="w-[85px] h-[105px] bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 space-y-3 py-2">
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="flex gap-2 mt-auto pt-2">
                        <div className="h-8 bg-gray-200 rounded-full flex-1"></div>
                        <div className="h-8 bg-gray-200 rounded-full flex-1"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : displayMeals.length > 0 ? displayMeals.slice(0, 2).map((item, i) => {
                const meal = item.meal;
                const isEaten = item.eaten;
                return (
                  <div
                    key={meal._id}
                    onClick={() => router.push(`/nutrition/meal-plans/${meal._id}`)}
                    className={`bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-lg p-2.5 flex gap-3 md:gap-4 cursor-pointer transition-all hover:shadow-md hover:border-[var(--color-primary)]/40 ${mounted ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`}
                    style={{ transitionDelay: mounted ? `${400 + i * 120}ms` : "0ms", transitionDuration: "500ms" }}
                  >
                    {/* Image */}
                    <div className="w-[85px] h-[105px] md:w-[95px] md:h-[115px] rounded-lg bg-gray-100 relative overflow-hidden flex-shrink-0">
                      <Image src={meal.imageUrl || meal.images?.[0] || "/images/meal_food.png"} alt={meal.name || "Meal"} fill className="object-cover hover:scale-105 transition-transform duration-500" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col py-0 justify-center">
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[10px] md:text-xs font-extrabold text-[var(--color-primary)] uppercase tracking-wider bg-[var(--color-primary)]/10 px-2 py-0.5 rounded-full">
                          {meal.category || "Meal"}
                        </span>
                        <span className="text-[10px] md:text-xs font-semibold text-gray-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Today
                        </span>
                      </div>

                      <h3 className="text-sm md:text-base font-semibold text-gray-900 leading-tight mb-1 truncate w-40">{meal.name}</h3>

                      <p className="text-[11px] md:text-xs font-semibold text-gray-500 mb-2 truncate w-40">
                        Contains: <span className="text-gray-700">{meal.ingredients?.slice(0, 3).join(', ') || "Healthy ingredients"}</span>
                      </p>

                      {meal.nutritionalInfo && (
                        <p className="text-[10px] text-gray-400 mb-2">
                          {meal.nutritionalInfo.calories} kcal · {meal.nutritionalInfo.protein}g protein
                        </p>
                      )}

                      <div className="h-[1px] w-full bg-[var(--color-primary)]/10 mb-2.5 mt-auto"></div>

                      <div className="flex gap-2">
                        {item.entryId ? (
                          <>
                            <button
                              onClick={e => handleToggleEaten(e, item.entryId, isEaten)}
                              className={`flex-1 ${isEaten ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90'} text-white text-[11px] md:text-xs font-semibold py-1.5 md:py-2 rounded-full transition-colors flex items-center justify-center gap-1.5`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> {isEaten ? 'Eaten' : 'Mark Eaten'}
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); router.push(`/nutrition/meal-plans/${meal._id}`); }}
                              className="flex-1 bg-white border border-[var(--color-primary)]/20 text-[var(--color-primary)] hover:bg-gray-50 text-[11px] md:text-xs font-semibold py-1.5 md:py-2 rounded-full transition-colors"
                            >
                              Details
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={e => { e.stopPropagation(); router.push(`/nutrition/meal-plans/${meal._id}`); }}
                            className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white text-[11px] md:text-xs font-semibold py-1.5 md:py-2 rounded-full transition-colors"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }) : (
                <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-400">No meals for today</p>
                  <p className="text-xs text-gray-400 mt-1">Browse our meal plans to get started</p>
                  <Link href="/nutrition/meal-plans">
                    <button className="mt-4 px-5 py-2 rounded-full bg-[var(--color-primary)] text-white text-xs font-semibold hover:opacity-90 transition-opacity">
                      Explore Meals
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Dietary Guidelines card */}
          <section
            className={`bg-white rounded-lg p-6 md:p-8 border border-gray-100 transition-all duration-700 ease-out delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-6 pb-4 border-b border-gray-50">Dietary Guidelines</h2>

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                <div className="h-3 bg-gray-100 rounded w-full"></div>
                <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                <div className="h-3 bg-gray-100 rounded w-full"></div>
              </div>
            ) : plan?.guidelines ? (
              <div className="space-y-4">
                <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-5">
                  <h4 className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-3 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Doctor's Guidelines
                  </h4>
                  <p className={`text-sm text-gray-700 leading-relaxed font-medium transition-all ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
                    style={{ transitionDelay: mounted ? "500ms" : "0ms", transitionDuration: "400ms" }}
                  >
                    {plan.guidelines}
                  </p>
                </div>
                {plan.assignedBy && (
                  <p className="text-xs text-gray-400 pl-1">
                    Assigned by Dr. {plan.assignedBy?.name || "your doctor"}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-5">
                {/* Default hardcoded guidelines when no plan */}
                <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-5">
                  <h4 className="flex items-center gap-2 text-xs font-semibold text-emerald-600 mb-4 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" /> Add to Diet
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                    {["Mashed Banana", "Soft Boiled Apple", "Oatmeal Cereal", "Sweet Potato"].map((food, i) => (
                      <div key={food} className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold text-gray-700 transition-all ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
                          style={{ transitionDelay: mounted ? `${500 + i * 60}ms` : "0ms", transitionDuration: "400ms" }}
                        >
                          {food}
                        </span>
                        {i !== 3 && <span className="w-1 h-1 rounded-full bg-gray-300"></span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-red-50/50 border border-red-100/50 rounded-xl p-5">
                  <h4 className="flex items-center gap-2 text-xs font-semibold text-red-500 mb-4 uppercase tracking-wider">
                    <XIcon className="w-4 h-4" /> Strictly Avoid
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                    {["Honey", "Cow's Milk", "Nuts (Whole)", "Added Salt/Sugar"].map((food, i) => (
                      <div key={food} className="flex items-center gap-2">
                        <span
                          className={`text-sm font-semibold text-gray-600 transition-all ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
                          style={{ transitionDelay: mounted ? `${650 + i * 60}ms` : "0ms", transitionDuration: "400ms" }}
                        >
                          {food}
                        </span>
                        {i !== 3 && <span className="w-1 h-1 rounded-full bg-gray-300"></span>}
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-gray-400 text-center pt-1">
                  These are general guidelines. Ask your doctor to create a personalized plan.
                </p>
              </div>
            )}
          </section>

        </div>

        {/* --- Shop CTA Banner --- */}
        <section
          className={`bg-[var(--color-primary)] rounded-lg p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-700 ease-out delay-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
        >
          {/* subtle gradient */}
          <div className="absolute top-0 right-0 w-[420px] h-[420px] bg-white rounded-full blur-[110px] opacity-20 -mr-32 -mt-32 pointer-events-none"></div>

          <div className="relative z-10 flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
            <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <ShoppingBag className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-semibold text-white mb-1.5">
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
