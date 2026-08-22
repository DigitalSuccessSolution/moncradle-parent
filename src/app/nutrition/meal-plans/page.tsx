"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft, Calendar as CalendarIcon, Flame,
  X, ShoppingCart, LayoutGrid, Baby, Search,
  Sun, Utensils, Moon, Cookie, Apple, SlidersHorizontal, Coffee, Soup, Loader2, Filter, Check
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { getMeals, getMealFilters, Meal } from "@/lib/api/mealsApi";
import { getBabies } from "@/lib/api/babiesApi";
import { getNutritionPlan, NutritionPlan, addMealToSchedule, removeMealFromSchedule } from "@/lib/api/nutritionPlanApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAuth } from "@/context/AuthContext";
import { addToCartAsync } from "@/store/slices/cartSlice";
import toast from "react-hot-toast";
import { MealCard } from "@/components/nutrition/MealCard";
import { Plus, Trash2 } from "lucide-react";

// Full day names matching backend schema
const FULL_DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
// Today index (0=Mon…6=Sun, JS getDay returns 0=Sun so we adjust)
const getTodayDayIndex = () => {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 6 : d - 1; // convert to 0=Mon…6=Sun
};

const AGE_GROUPS = [
  { id: 'All Ages', title: 'All Ages', sub: 'Every Meal' },
  { id: '0-6 months', title: '0-6 Months', sub: 'Early Foods' },
  { id: '6-12 months', title: '6-12 Months', sub: 'Purees & Soft Bites' },
  { id: '1-3 years', title: '1-3 Years', sub: 'Toddler Meals' },
  { id: '3+ years', title: '3+ Years', sub: 'Family Meals' }
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const PAGE_LIMIT = 12;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function MealPlansHub() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartMap = useAppSelector(state => state.cart.cartMap);
  const cartTotalCount = useAppSelector(state => state.cart.totalCount);
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Data States
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // UI states
  const [activeAge, setActiveAge] = useState("All Ages");
  const [ageGroups, setAgeGroups] = useState<string[]>(["All Ages"]);
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [activeDay, setActiveDay] = useState(getTodayDayIndex()); // 0-indexed Mon-Sun
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Nutrition plan states
  const [nutritionPlan, setNutritionPlan] = useState<NutritionPlan | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(true);
  // Map: day name -> meals for that day
  const [planDayMap, setPlanDayMap] = useState<Record<string, Meal[]>>({});
  // Baby ID (for plan mutations)
  const [babyId, setBabyId] = useState<string | null>(null);
  // Meal picker modal
  const [isMealPickerOpen, setIsMealPickerOpen] = useState(false);
  const [mealPickerQuery, setMealPickerQuery] = useState("");
  const [mealPickerResults, setMealPickerResults] = useState<Meal[]>([]);
  const [isPickerLoading, setIsPickerLoading] = useState(false);
  const [isPickerLoadingMore, setIsPickerLoadingMore] = useState(false);
  const [pickerHasMore, setPickerHasMore] = useState(true);
  const [isSavingMeal, setIsSavingMeal] = useState(false);
  // Picker pagination refs
  const pickerPageRef = useRef(1);
  const pickerIsFetchingRef = useRef(false);
  const pickerHasMoreRef = useRef(true);
  const pickerSentinelRef = useRef<HTMLDivElement>(null);
  const pickerQueryRef = useRef("");

  // Filter States
  const [activeType, setActiveType] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [sortBy, setSortBy] = useState("Popularity");
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Refs for infinite scroll & search
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(1);
  const isFetchingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentFetchIdRef = useRef(0);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchQuery(val);
    }, 500);
  };

  const fetchPage = async (page: number, replace = false) => {
    if (isFetchingRef.current && !replace) return;
    const fetchId = ++currentFetchIdRef.current;
    isFetchingRef.current = true;
    if (replace) {
      setIsLoading(true);
      setIsFetchingMore(false);
    } else {
      setIsFetchingMore(true);
    }

    try {
      const queryParams: Record<string, string | number> = {
        page,
        limit: PAGE_LIMIT,
        ageGroup: activeAge,
        category: activeType,
        sortBy
      };

      if (searchQuery) queryParams.search = searchQuery;

      if (priceRange) {
        if (priceRange === "Under ₹100") queryParams.maxPrice = 99;
        if (priceRange === "₹100 - ₹300") { queryParams.minPrice = 100; queryParams.maxPrice = 300; }
        if (priceRange === "Over ₹300") queryParams.minPrice = 301;
      }

      if (preferences.length > 0) {
        queryParams.preferences = preferences.join(',');
      }

      const response = await getMeals(queryParams);
      if (fetchId !== currentFetchIdRef.current) return; // Stale fetch, ignore
      const fetchedMeals = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
      const count = response.count || 0;

      setMeals(prev => {
        if (replace) return fetchedMeals;
        const existingIds = new Set(prev.map(m => m._id));
        const newOnes = fetchedMeals.filter((m: Meal) => !existingIds.has(m._id));
        return [...prev, ...newOnes];
      });

      const loaded = replace ? fetchedMeals.length : (pageRef.current - 1) * PAGE_LIMIT + fetchedMeals.length;
      const more = fetchedMeals.length === PAGE_LIMIT && loaded < count;
      hasMoreRef.current = more;
      setHasMore(more);

    } catch (error) {
      console.error("Failed to fetch meals:", error);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  // Fetch when filters change
  useEffect(() => {
    pageRef.current = 1;
    setHasMore(true);
    hasMoreRef.current = true;
    fetchPage(1, true);
  }, [activeAge, activeType, priceRange, preferences, sortBy, searchQuery]);

  // Fetch dynamic filters once on mount
  useEffect(() => {
    getMealFilters().then(res => {
      if (res.data) {
        const capitalizedCategories = res.data.categories.map((c: string) => c.charAt(0).toUpperCase() + c.slice(1));
        setCategories(["All", ...capitalizedCategories]);
        setAgeGroups(["All Ages", ...res.data.ageGroups]);
      }
    }).catch(console.error);
  }, []);

  // Fetch baby's nutrition plan once auth is ready
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    const loadPlan = async () => {
      setIsPlanLoading(true);
      try {
        const babyRes = await getBabies();
        const babies = babyRes.data || babyRes || [];
        if (babies.length > 0) {
          setBabyId(babies[0]._id);
          const plan = await getNutritionPlan(babies[0]._id);
          setNutritionPlan(plan);
          if (plan?.weeklySchedule?.length) {
            setPlanDayMap(buildDayMap(plan.weeklySchedule));
          }
        }
      } catch (err) {
        console.error("Failed to load nutrition plan:", err);
      } finally {
        setIsPlanLoading(false);
      }
    };
    loadPlan();
  }, [isAuthLoading, isAuthenticated]);

  // Helper: build day map from weeklySchedule
  const buildDayMap = (schedule: any[]): Record<string, Meal[]> => {
    const dayMap: Record<string, Meal[]> = {};
    schedule.forEach((slot: any) => {
      if (slot.mealId && slot.day) {
        if (!dayMap[slot.day]) dayMap[slot.day] = [];
        dayMap[slot.day].push(slot.mealId as Meal);
      }
    });
    return dayMap;
  };

  // Meal picker: fetch page
  const fetchPickerPage = async (page: number, replace = false) => {
    if (pickerIsFetchingRef.current && !replace) return;
    pickerIsFetchingRef.current = true;
    if (replace) setIsPickerLoading(true);
    else setIsPickerLoadingMore(true);
    try {
      const res = await getMeals({ limit: 12, page, search: pickerQueryRef.current });
      const fetched: Meal[] = res.data || [];
      const total = res.count || 0;
      setMealPickerResults(prev => {
        if (replace) return fetched;
        const existingIds = new Set(prev.map(m => m._id));
        const newUnique = fetched.filter((m: Meal) => !existingIds.has(m._id));
        return [...prev, ...newUnique];
      });
      const loaded = replace ? fetched.length : (pickerPageRef.current - 1) * 12 + fetched.length;
      const more = fetched.length === 12 && loaded < total;
      pickerHasMoreRef.current = more;
      setPickerHasMore(more);
    } catch (e) {
      console.error('Picker fetch error:', e);
    } finally {
      pickerIsFetchingRef.current = false;
      setIsPickerLoading(false);
      setIsPickerLoadingMore(false);
    }
  };

  // Meal picker: reset + fetch on query change or open
  useEffect(() => {
    if (!isMealPickerOpen) return;
    pickerQueryRef.current = mealPickerQuery;
    pickerPageRef.current = 1;
    pickerHasMoreRef.current = true;
    setPickerHasMore(true);
    const timer = setTimeout(() => fetchPickerPage(1, true), 300);
    return () => clearTimeout(timer);
  }, [mealPickerQuery, isMealPickerOpen]);

  // Meal picker: infinite scroll observer
  useEffect(() => {
    if (!isMealPickerOpen || isPickerLoading || !pickerHasMore || !pickerSentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pickerHasMoreRef.current && !pickerIsFetchingRef.current) {
          pickerPageRef.current += 1;
          fetchPickerPage(pickerPageRef.current);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    observer.observe(pickerSentinelRef.current);
    return () => observer.disconnect();
  }, [isMealPickerOpen, isPickerLoading, pickerHasMore]);

  // Add meal to selected day
  const handleAddMealToDay = async (meal: Meal) => {
    if (!babyId) { toast.error('No baby profile found'); return; }
    setIsSavingMeal(true);
    try {
      const selectedDayName = FULL_DAY_NAMES[activeDay];
      const updatedPlan = await addMealToSchedule(babyId, selectedDayName, meal._id);
      if (updatedPlan) {
        setNutritionPlan(updatedPlan);
        setPlanDayMap(buildDayMap(updatedPlan.weeklySchedule));
        toast.success(`${meal.name} added to ${selectedDayName}!`);
      }
      setIsMealPickerOpen(false);
    } catch {
      toast.error('Failed to add meal');
    } finally {
      setIsSavingMeal(false);
    }
  };

  // Remove meal from selected day
  const handleRemoveMealFromDay = async (meal: Meal) => {
    if (!babyId) return;
    try {
      const selectedDayName = FULL_DAY_NAMES[activeDay];
      const updatedPlan = await removeMealFromSchedule(babyId, selectedDayName, meal._id);
      if (updatedPlan) {
        setNutritionPlan(updatedPlan);
        setPlanDayMap(buildDayMap(updatedPlan.weeklySchedule));
        toast.success(`${meal.name} removed from ${selectedDayName}`);
      }
    } catch {
      toast.error('Failed to remove meal');
    }
  };

  // Infinite scroll observer
  useEffect(() => {
    if (isLoading || !hasMore || !sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMoreRef.current && !isFetchingRef.current) {
          pageRef.current += 1;
          fetchPage(pageRef.current);
        }
      },
      { threshold: 0.1, rootMargin: "200px" }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [isLoading, hasMore]);

  // Disable scroll when filter modal open
  useEffect(() => {
    if (isFilterModalOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isFilterModalOpen]);

  const handleAddToCart = async (e: React.MouseEvent, meal: Meal) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast("Please login to add items to cart", { icon: "🔒" });
      router.push("/login");
      return;
    }
    try {
      await dispatch(addToCartAsync({ itemId: meal._id, itemType: "meal" })).unwrap();
      toast.success(`${meal.name} added to cart!`);
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleCardClick = (mealId: string) => {
    router.push(`/nutrition/meal-plans/${mealId}`);
  };

  const handleOpenMealPicker = () => {
    if (!isAuthenticated) {
      toast("Please login to create a meal plan", { icon: "🔒" });
      router.push("/login");
      return;
    }
    setMealPickerQuery("");
    setIsMealPickerOpen(true);
  };

  const filterContent = (
    <>
      <div className="flex items-center justify-between p-5 border-b border-gray-100">
        <h2 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
          <Filter className="w-5 h-5 text-[var(--color-primary)]" />
          Filter & Sort Meals
        </h2>
        <button
          onClick={() => setIsFilterModalOpen(false)}
          className="p-2 rounded-full bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-8 no-scrollbar">
        {/* Age Group */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Age Group</h3>
          <div className="flex flex-wrap gap-2">
            {ageGroups.map((age, i) => (
              <button
                key={i}
                onClick={() => setActiveAge(age)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${activeAge === age ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {age}
              </button>
            ))}
          </div>
        </div>

        {/* Sort By */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Sort By</h3>
          <div className="flex flex-col gap-2">
            {["Popularity", "Price: Low to High", "Price: High to Low"].map((sort, i) => (
              <label
                key={i}
                onClick={() => setSortBy(sort)}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors border border-transparent hover:border-gray-100"
              >
                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${sortBy === sort ? 'border-[var(--color-primary)] bg-[var(--color-primary)]' : 'border-gray-300'}`}>
                  {sortBy === sort && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                </div>
                <span className={`text-sm font-semibold ${sortBy === sort ? 'text-gray-900' : 'text-gray-600'}`}>{sort}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Meal Type */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Meal Type</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((type, i) => {
              const isSelected = activeType === type;
              let Icon = LayoutGrid;
              let colorClass = 'text-gray-500';
              if (type.toLowerCase() === 'breakfast') { Icon = Sun; colorClass = 'text-orange-500'; }
              else if (type.toLowerCase() === 'lunch') { Icon = Utensils; colorClass = 'text-blue-500'; }
              else if (type.toLowerCase() === 'dinner') { Icon = Moon; colorClass = 'text-amber-600'; }
              else if (type.toLowerCase() === 'snack') { Icon = Cookie; colorClass = 'text-emerald-600'; }
              else if (type !== 'All') { Icon = Utensils; colorClass = 'text-gray-500'; }

              return (
                <button
                  key={i}
                  onClick={() => setActiveType(type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 border ${isSelected
                      ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                      : 'bg-white border-gray-200 text-[#122B54] hover:bg-gray-50'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-[var(--color-primary)]' : colorClass}`} />
                  <span>{type === 'All' ? 'All Meals' : type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Price Range</h3>
          <div className="flex flex-wrap gap-2">
            {["Under ₹100", "₹100 - ₹300", "Over ₹300"].map((price, i) => (
              <button
                key={i}
                onClick={() => setPriceRange(price === priceRange ? null : price)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${priceRange === price ? 'bg-[var(--color-primary)]/10 border-[var(--color-primary)]/30 text-[var(--color-primary)]' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              >
                {price}
              </button>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Dietary & Preferences</h3>
          <div className="flex flex-col gap-2">
            {["Organic", "Puree", "Solid", "Dairy-Free", "Vegetarian"].map((pref, i) => {
              const isSelected = preferences.includes(pref);
              return (
                <label
                  key={i}
                  onClick={() => {
                    if (isSelected) setPreferences(preferences.filter(p => p !== pref));
                    else setPreferences([...preferences, pref]);
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                >
                  <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isSelected ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'bg-white border-gray-300 group-hover:border-gray-400'}`}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <span className={`text-sm font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>{pref}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-5 border-t border-gray-100 bg-white grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            setSortBy("Popularity");
            setActiveType("All");
            setPriceRange(null);
            setPreferences([]);
            setIsFilterModalOpen(false);
          }}
          className="py-3 rounded-xl font-semibold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
        >
          Clear All
        </button>
        <button
          onClick={() => setIsFilterModalOpen(false)}
          className="py-3 rounded-xl font-semibold text-sm text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] shadow-md shadow-[var(--color-primary)]/20 transition-all active:scale-95"
        >
          Apply Filters
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative selection:bg-[var(--color-primary)]/20">

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">

        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">Meal Plans</h1>
          </div>
          <button onClick={() => router.push('/shop/cart')} className="relative text-[#0F172A] active:scale-95 transition-transform mr-1">
            <ShoppingCart className="w-6 h-6" strokeWidth={2} />
            {cartTotalCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#FF3B30] text-white text-[11px] font-black min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full">
                {cartTotalCount}
              </span>
            )}
          </button>
        </div>


        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center mb-2 -ml-3 md:ml-0">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="font-semibold text-[15px]">Back</span>
          </button>
        </div>

        {/* Desktop Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 px-1"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Meal Plans</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Nutritious meals tailored for your baby's age.</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-4 mt-4"
        >
          <div className="flex items-center gap-3 w-full">
            <div className="relative flex-1 max-w-[300px]">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search meals..."
                onChange={handleSearchChange}
                className="pl-10 pr-4 h-11 bg-white border border-gray-200 rounded-full text-sm font-medium outline-none focus:border-[var(--color-primary)] transition-colors w-full"
              />
            </div>
            <button
              onClick={() => setIsFilterModalOpen(true)}
              className="bg-white border border-gray-200 w-11 h-11 rounded-full text-gray-600 hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)]/30 transition-colors flex items-center justify-center flex-shrink-0"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-3"
        >
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 border ${viewMode === "grid"
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
                : "bg-white text-gray-500 border-gray-200 hover:border-[var(--color-primary)]/50"
              }`}
          >
            <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" />
            Grid View
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition-all duration-300 border ${viewMode === "calendar"
                ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
                : "bg-white text-gray-500 border-gray-200 hover:border-[var(--color-primary)]/50"
              }`}
          >
            <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
            Weekly Calendar
          </button>
        </motion.div>

        {viewMode === "grid" ? (
          <motion.div
            key={`grid-${activeAge}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-8 md:mt-10 flex flex-col"
          >
            <h3 className="text-[18px] md:text-xl font-semibold text-black leading-tight mb-8 md:mb-10 px-1">
              Explore meals <span className="text-[var(--color-primary)]">({activeAge})</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
              {isLoading && meals.length === 0 ? (
                <div className="col-span-full py-20 flex justify-center items-center">
                  <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
                </div>
              ) : meals.length === 0 ? (
                <div className="col-span-full py-20 text-center text-gray-400 font-medium text-lg">No meals found matching your filters.</div>
              ) : (
                meals.map((meal: Meal, idx: number) => (
                  <MealCard
                    key={`${meal._id || 'grid'}-${idx}`}
                    meal={meal}
                    variants={itemVariants}
                    cartQuantity={cartMap[meal._id]?.qty || 0}
                    onAddToCart={handleAddToCart}
                    onClick={handleCardClick}
                  />
                ))
              )}
            </div>

            {/* Infinite Scroll Sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="flex justify-center items-center py-8">
                {isFetchingMore ? (
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
                ) : (
                  <div className="w-6 h-6 opacity-0" /> // invisible space to observe
                )}
              </div>
            )}

            {!hasMore && meals.length > 0 && (
              <p className="text-center text-xs text-gray-400 py-6">
                Showing all {meals.length} meals
              </p>
            )}

          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 md:mt-10 flex flex-col"
          >
            <h3 className="text-[18px] md:text-xl font-semibold text-black leading-tight mb-5 md:mb-6 px-1">
              Weekly Meal Calendar <span className="text-[var(--color-primary)]">({activeAge})</span>
            </h3>

            <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar py-2 mb-8 md:mb-10">
              {WEEK_DAYS.map((dayName, idx) => {
                const isToday = idx === getTodayDayIndex();
                const hasMeals = planDayMap[FULL_DAY_NAMES[idx]]?.length > 0;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveDay(idx)}
                    className={`relative px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${activeDay === idx
                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-primary)]/50'
                      }`}
                  >
                    {dayName}
                    {isToday && (
                      <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${activeDay === idx ? 'bg-white' : 'bg-[var(--color-primary)]'}`} />
                    )}
                    {hasMeals && activeDay !== idx && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Calendar Day View */}
            {isPlanLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-100 overflow-hidden">
                    <div className="w-full h-28 bg-gray-100"></div>
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (() => {
              const selectedDayName = FULL_DAY_NAMES[activeDay];
              const dayMeals = planDayMap[selectedDayName] || [];
              const isEmpty = dayMeals.length === 0;

              const MEAL_SLOTS = [
                { type: "Breakfast", icon: Coffee, color: "text-amber-600" },
                { type: "Snack", icon: Apple, color: "text-red-500" },
                { type: "Lunch", icon: Utensils, color: "text-blue-500" },
                { type: "Evening Snack", icon: Cookie, color: "text-purple-500" },
                { type: "Dinner", icon: Soup, color: "text-emerald-600" },
              ];

              if (isEmpty && !nutritionPlan) {
                return (
                  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-base font-semibold text-gray-500">No nutrition plan assigned yet</p>
                    <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">Click the '+' button below to start building your baby's weekly meal schedule!</p>

                    <div className="mt-6 flex justify-center">
                      <button
                        onClick={handleOpenMealPicker}
                        className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add First Meal
                      </button>
                    </div>
                  </div>
                );
              }

              if (isEmpty) {
                return (
                  <div className="text-center py-12 bg-[#F8FAFC] rounded-xl border border-gray-100">
                    <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-[15px] font-semibold text-gray-600">No meals scheduled for {selectedDayName}</p>
                    <p className="text-xs text-gray-400 mt-1 mb-5">Keep your baby's nutrition on track by adding meals.</p>
                    <button
                      onClick={handleOpenMealPicker}
                      className="inline-flex items-center gap-1.5 bg-white border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Meal for {selectedDayName}
                    </button>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 pt-2">
                  {dayMeals.map((meal, idx) => {
                    const slot = MEAL_SLOTS[idx] || { type: "Meal", icon: Utensils, color: "text-gray-500" };
                    const Icon = slot.icon;
                    return (
                      <div key={`${meal._id || 'meal'}-${idx}`} className="relative bg-white rounded-lg border border-gray-100 flex flex-col group overflow-hidden hover:border-[var(--color-primary)] transition-all duration-300">
                        {/* Remove button */}
                        <button
                          onClick={() => handleRemoveMealFromDay(meal)}
                          className="absolute top-1.5 left-1.5 z-10 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
                          title="Remove from schedule"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <div
                          className="w-full h-28 md:h-32 relative bg-[#F8FAFC] border-b border-gray-100 overflow-hidden flex-shrink-0 cursor-pointer"
                          onClick={() => handleCardClick(meal._id)}
                        >
                          {(meal?.imageUrl || (meal?.images && meal.images.length > 0)) ? (
                            <Image
                              src={(meal?.imageUrl || meal?.images?.[0]) as string}
                              alt={meal?.name || slot.type}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                              <Utensils className="w-8 h-8 mb-1 opacity-50" />
                              <span className="text-[9px] font-semibold">No Image</span>
                            </div>
                          )}
                        </div>
                        <div className="p-2.5 md:p-3.5 flex flex-col flex-1">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${slot.color}`} strokeWidth={2.5} />
                            <span className="text-[10px] md:text-[11px] font-extrabold text-black uppercase tracking-wider">{slot.type}</span>
                          </div>
                          <h4
                            className="text-xs md:text-sm font-semibold text-[#122B54] leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                            onClick={() => handleCardClick(meal._id)}
                          >
                            {meal?.name || "No meal assigned"}
                          </h4>
                          {meal.nutritionalInfo?.calories && (
                            <p className="text-[10px] text-gray-400 mt-1">{meal.nutritionalInfo.calories} kcal</p>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Add Meal Card */}
                  <button
                    onClick={() => { setMealPickerQuery(""); setIsMealPickerOpen(true); }}
                    className="flex flex-col items-center justify-center gap-2 bg-white rounded-lg border-2 border-dashed border-gray-200 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-all duration-300 min-h-[160px] group cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center group-hover:bg-[var(--color-primary)]/20 transition-colors">
                      <Plus className="w-5 h-5 text-[var(--color-primary)]" />
                    </div>
                    <span className="text-xs font-semibold text-gray-400 group-hover:text-[var(--color-primary)] transition-colors">
                      Add another meal
                    </span>
                  </button>
                </div>
              );
            })()}
          </motion.div>
        )}

      </main>


      {/* Filter Modal */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterModalOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            />

            {/* Desktop Slide-over */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="hidden md:flex fixed top-0 right-0 h-full w-full max-w-md bg-white z-[120] shadow-2xl flex-col border-l border-gray-200"
            >
              {filterContent}
            </motion.div>

            {/* Mobile Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="md:hidden fixed bottom-0 left-0 w-full h-[85vh] bg-white z-[120] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col rounded-t-3xl overflow-hidden"
            >
              <div className="w-full flex justify-center pt-3 pb-1 bg-white absolute top-0 z-10">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </div>
              <div className="mt-4 flex-1 flex flex-col overflow-hidden">
                {filterContent}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Meal Picker Modal */}
      <AnimatePresence>
        {isMealPickerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMealPickerOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[130]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 w-full max-h-[80vh] bg-white z-[140] rounded-t-3xl shadow-2xl flex flex-col overflow-hidden md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl md:bottom-8 md:rounded-2xl"
            >
              {/* Handle */}
              <div className="w-full flex justify-center pt-3 pb-1 md:hidden">
                <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Add Meal</h3>
                  <p className="text-xs text-gray-400 mt-0.5">For {FULL_DAY_NAMES[activeDay]}</p>
                </div>
                <button
                  onClick={() => setIsMealPickerOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Search */}
              <div className="px-5 pt-4 pb-3">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search meals..."
                    value={mealPickerQuery}
                    onChange={e => setMealPickerQuery(e.target.value)}
                    className="w-full pl-10 pr-4 h-11 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium outline-none focus:border-[var(--color-primary)] transition-colors"
                  />
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto px-5 pb-6">
                {isPickerLoading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="animate-pulse bg-gray-50 rounded-xl overflow-hidden">
                        <div className="h-24 bg-gray-200" />
                        <div className="p-2 space-y-1.5">
                          <div className="h-3 bg-gray-200 rounded w-3/4" />
                          <div className="h-3 bg-gray-200 rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : mealPickerResults.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Utensils className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-semibold">No meals found</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                      {mealPickerResults.map((meal: Meal, idx: number) => (
                        <button
                          key={`${meal._id || 'picker'}-${idx}`}
                          onClick={() => handleAddMealToDay(meal)}
                          disabled={isSavingMeal}
                          className="text-left bg-white border border-gray-100 rounded-lg overflow-hidden hover:border-[var(--color-primary)] hover:shadow-md transition-all duration-200 group disabled:opacity-50"
                        >
                          <div className="relative h-24 bg-gray-50">
                            <Image
                              src={meal.imageUrl || meal.images?.[0] || "/images/meal_food.png"}
                              alt={meal.name}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {isSavingMeal && (
                              <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-[var(--color-primary)] animate-spin" />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <p className="text-xs font-bold text-gray-900 line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">{meal.name}</p>
                            {meal.nutritionalInfo?.calories && (
                              <p className="text-[10px] text-gray-400 mt-0.5">{meal.nutritionalInfo.calories} kcal</p>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Infinite scroll sentinel */}
                    <div ref={pickerSentinelRef} className="flex justify-center items-center py-4">
                      {isPickerLoadingMore && (
                        <Loader2 className="w-5 h-5 text-[var(--color-primary)] animate-spin" />
                      )}
                      {!pickerHasMore && mealPickerResults.length > 0 && (
                        <p className="text-[11px] text-gray-400">All {mealPickerResults.length} meals shown</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
