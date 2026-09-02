"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft, Calendar as CalendarIcon, Flame,
  X, ShoppingCart, LayoutGrid, Baby, Search,
  Sun, Utensils, Moon, Cookie, Apple, SlidersHorizontal, Coffee, Soup, Loader2, Filter, Check, Leaf, AlertTriangle
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { getMeals, getMealFilters, Meal } from "@/lib/api/mealsApi";
import { getBabies } from "@/lib/api/babiesApi";
import { getSubscriptions, skipMeal, updateSubscription, updateMealInstructions, Subscription } from "@/lib/api/subscriptionsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAuth } from "@/context/AuthContext";
import { addToCartAsync } from "@/store/slices/cartSlice";
import toast from "react-hot-toast";
import { MealCard } from "@/components/nutrition/MealCard";
import { MyMealSchedule } from "@/components/nutrition/MyMealSchedule";
import { Plus } from "lucide-react";

// Helper to format Date object as YYYY-MM-DD
const formatDateStr = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
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
  const [activeDay, setActiveDay] = useState<string>(""); // format: YYYY-MM-DD
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedEntryDetail, setSelectedEntryDetail] = useState<any | null>(null);
  const [mealToSkip, setMealToSkip] = useState<any | null>(null);
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);
  const [instructionsText, setInstructionsText] = useState("");
  const [isSavingInstructions, setIsSavingInstructions] = useState(false);

  // Subscription states
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(true);
  // Map: day name -> delivery schedule items for that day
  const [planDayMap, setPlanDayMap] = useState<Record<string, { meal: Meal; scheduleId: string; timeSlot?: string; status: string; specialInstructions?: string; subscriptionId: string }[]>>({});
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

  // Fetch user's active subscription once auth is ready and user views schedule
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated || viewMode !== 'calendar') return;
    const loadSubscription = async () => {
      setIsPlanLoading(true);
      try {
        const subscriptions = await getSubscriptions();
        // Find the first active subscription
        const active = subscriptions.find(s => s.status === 'active') || null;
        setActiveSubscription(active);
        if (active?.deliverySchedule?.length) {
          const map = buildDeliveryDayMap(active.deliverySchedule, active._id as string);
          setPlanDayMap(map);
          const sorted = Object.keys(map).sort();
          if (sorted.length > 0 && !activeDay) {
            setActiveDay(sorted[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load subscription:", err);
      } finally {
        setIsPlanLoading(false);
      }
    };
    loadSubscription();
  }, [isAuthLoading, isAuthenticated, viewMode]);

  // Helper: build day map from subscription deliverySchedule
  // Groups deliveries by exact date string YYYY-MM-DD
  const buildDeliveryDayMap = (schedule: NonNullable<Subscription['deliverySchedule']>, subId: string) => {
    const dayMap: Record<string, { meal: Meal; scheduleId: string; timeSlot?: string; status: string; specialInstructions?: string; subscriptionId: string }[]> = {};
    schedule.forEach((item) => {
      if (!item.mealId) return;
      const dateStr = formatDateStr(new Date(item.date));
      if (!dayMap[dateStr]) dayMap[dateStr] = [];
      dayMap[dateStr].push({
        meal: item.mealId as Meal,
        scheduleId: item._id,
        timeSlot: item.timeSlot,
        status: item.status,
        specialInstructions: item.specialInstructions,
        subscriptionId: subId
      });
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

  // Add meal to selected day → adds to Cart as a subscription order
  const handleAddMealToDay = async (meal: Meal) => {
    if (!isAuthenticated) {
      toast("Please login to add meals", { icon: "🔒" });
      router.push("/login");
      return;
    }
    if (!activeDay) {
      toast.error("Please select a valid date first.");
      return;
    }
    setIsSavingMeal(true);
    try {
      const selectedDateObj = new Date(activeDay);
      const displayDate = selectedDateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

      await dispatch(addToCartAsync({
        itemId: meal._id,
        itemType: "meal",
        subscriptionData: {
          isSubscription: true,
          deliveryDates: [activeDay], // send YYYY-MM-DD directly
          timeSlot: "Lunch (12 PM - 1 PM)",
          customizations: [],
          specialInstructions: "",
        }
      })).unwrap();
      toast.success(`${meal.name} added to cart for ${displayDate}! Complete checkout to confirm delivery.`, { duration: 4000 });
      setIsMealPickerOpen(false);
    } catch {
      toast.error('Failed to add meal to cart');
    } finally {
      setIsSavingMeal(false);
    }
  };

  // Skip a delivery from an active subscription
  const handleRemoveMealFromDay = async (entry: { meal: Meal; scheduleId: string; status: string }) => {
    if (!activeSubscription?._id) return;
    if (entry.status === 'delivered') {
      toast("This meal has already been delivered and cannot be skipped.", { icon: "❌" });
      return;
    }

    try {
      const updatedSub = await skipMeal(activeSubscription._id as string, entry.scheduleId);
      // Update local state completely using the returned subscription to reflect carry-forward date changes
      setActiveSubscription(updatedSub);
      setPlanDayMap(buildDeliveryDayMap(updatedSub.deliverySchedule, updatedSub._id as string));
      toast.success(`Delivery for ${entry.meal.name} skipped.`);
    } catch {
      toast.error('Failed to skip delivery');
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
            My Schedule
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
          <MyMealSchedule
            planDayMap={planDayMap}
            activeDay={activeDay}
            setActiveDay={setActiveDay}
            isPlanLoading={isPlanLoading}
            activeSubscription={activeSubscription}
            handleOpenMealPicker={handleOpenMealPicker}
            handleRemoveMealFromDay={handleRemoveMealFromDay}
            setSelectedEntryDetail={setSelectedEntryDetail}
          />
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
                  <p className="text-xs text-gray-400 mt-0.5">For {activeDay ? new Date(activeDay).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : ''}</p>
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

      {/* Meal Details Bottom Drawer */}
      <AnimatePresence>
        {selectedEntryDetail && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setSelectedEntryDetail(null); setIsEditingInstructions(false); }}
              className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-sm z-[110]"
            />

            {/* Container for alignment */}
            <div className="fixed inset-0 z-[120] flex flex-col justify-end md:justify-center md:items-center pointer-events-none">
              <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl max-h-[85vh] md:max-h-[90vh] flex flex-col pointer-events-auto shadow-2xl overflow-hidden relative"
              >
                {/* Drag Handle (Mobile only) */}
                <div className="flex justify-center pt-3 pb-2 md:hidden bg-white shrink-0">
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto no-scrollbar flex-1 pb-10">
                  {/* Image */}
                  <div className="relative h-56 md:h-[340px] mx-4 md:mx-6 md:mt-6 rounded-2xl overflow-hidden bg-gray-100 mb-6 shadow-sm border border-gray-100/50">
                    <Image
                      src={selectedEntryDetail.meal?.imageUrl || selectedEntryDetail.meal?.images?.[0] || "/images/meal_food.png"}
                      alt={selectedEntryDetail.meal?.name || "Meal"}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => { setSelectedEntryDetail(null); setIsEditingInstructions(false); }}
                      className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 transition-colors rounded-full flex items-center justify-center backdrop-blur-md"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>

                  <div className="px-5 md:px-6 space-y-5">
                    {/* Header: Time Slot & Status */}
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <Utensils className="w-4 h-4 text-gray-400" strokeWidth={2.5} />
                        <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wider">
                          {selectedEntryDetail.timeSlot ? selectedEntryDetail.timeSlot.split(' (')[0] : 'MEAL'}
                        </span>
                      </div>
                      {(() => {
                        const status = selectedEntryDetail.status;
                        if (status === 'delivered') return <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">✓ Delivered</span>;
                        if (status === 'skipped') return <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full uppercase tracking-wide">⏭ Skipped</span>;
                        if (status === 'ordered') return <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">📦 Ordered</span>;
                        return <span className="text-[9px] font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">⏳ Pending</span>;
                      })()}
                    </div>

                    {/* Name */}
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-xl font-bold text-gray-900 flex-1 leading-tight">{selectedEntryDetail.meal?.name}</h2>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {selectedEntryDetail.meal?.category && (
                        <span className="text-[10px] font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {selectedEntryDetail.meal.category}
                        </span>
                      )}
                      {selectedEntryDetail.meal?.suitableForAgeGroup && (
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          👶 {selectedEntryDetail.meal.suitableForAgeGroup}
                        </span>
                      )}
                      {(selectedEntryDetail.meal?.tags || []).map((tag: string, i: number) => (
                        <span key={i} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* Description */}
                    {selectedEntryDetail.meal?.description && (
                      <p className="text-gray-500 text-sm leading-relaxed font-medium">{selectedEntryDetail.meal.description}</p>
                    )}

                    {/* Special Instructions Section */}
                    <div className="bg-white border-t border-gray-100 pt-5 mt-2">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <span className="text-lg">📝</span> Special Instructions
                        </h3>
                        {!isEditingInstructions && (
                          <button
                            onClick={() => {
                              setInstructionsText(selectedEntryDetail.specialInstructions || "");
                              setIsEditingInstructions(true);
                            }}
                            className="text-[11px] font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 hover:bg-[var(--color-primary)]/20 px-3 py-1.5 rounded-full transition-colors"
                          >
                            {selectedEntryDetail.specialInstructions ? "Edit Note" : "+ Add Note"}
                          </button>
                        )}
                      </div>

                      {isEditingInstructions ? (
                        <div className="flex flex-col gap-3">
                          <textarea
                            value={instructionsText}
                            onChange={(e) => setInstructionsText(e.target.value)}
                            placeholder="E.g. Less spicy, make it extra soft..."
                            className="w-full text-sm p-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 focus:border-[var(--color-primary)] resize-none"
                            rows={2}
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setIsEditingInstructions(false)}
                              className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 transition-colors"
                              disabled={isSavingInstructions}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={async () => {
                                setIsSavingInstructions(true);
                                try {
                                  const sub = activeSubscription;
                                  if (sub && sub.deliverySchedule) {
                                    // Send to backend using the optimized instructions API
                                    await updateMealInstructions(sub._id as string, selectedEntryDetail.scheduleId, instructionsText);

                                    // Manually update local state to preserve populated meal objects
                                    const localUpdatedSchedule = (sub.deliverySchedule || []).map(sch => {
                                      if (sch._id === selectedEntryDetail.scheduleId) {
                                        return { ...sch, specialInstructions: instructionsText };
                                      }
                                      return sch;
                                    });
                                    const localUpdatedSub = { ...sub, deliverySchedule: localUpdatedSchedule };

                                    setActiveSubscription(localUpdatedSub);
                                    setPlanDayMap(buildDeliveryDayMap(localUpdatedSchedule, sub._id as string));
                                    setSelectedEntryDetail({ ...selectedEntryDetail, specialInstructions: instructionsText });
                                    setIsEditingInstructions(false);
                                    toast.success("Instructions saved successfully!");
                                  }
                                } catch (err: any) {
                                  console.error("Failed to save instructions", err?.response?.data || err);
                                  toast.error(`Failed to save instructions: ${err?.response?.data?.message || err.message}`);
                                } finally {
                                  setIsSavingInstructions(false);
                                }
                              }}
                              className="px-4 py-2 text-xs font-bold bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 rounded-full flex items-center gap-2 shadow-sm transition-colors"
                              disabled={isSavingInstructions}
                            >
                              {isSavingInstructions ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              Save Note
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100">
                          <p className="text-xs text-gray-600 font-medium whitespace-pre-wrap leading-relaxed">
                            {selectedEntryDetail.specialInstructions || <span className="text-gray-400 italic">No special instructions added for this meal.</span>}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Nutrition */}
                    {selectedEntryDetail.meal?.nutritionalInfo && (
                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 md:p-5">
                        <h3 className="text-sm font-bold text-gray-900 mb-3">Nutritional Info</h3>
                        <div className="grid grid-cols-4 gap-2 text-center">
                          {[
                            { label: "Calories", value: `${selectedEntryDetail.meal.nutritionalInfo.calories || 0}`, unit: "kcal" },
                            { label: "Protein", value: `${selectedEntryDetail.meal.nutritionalInfo.protein || 0}`, unit: "g" },
                            { label: "Carbs", value: `${selectedEntryDetail.meal.nutritionalInfo.carbs || 0}`, unit: "g" },
                            { label: "Fat", value: `${selectedEntryDetail.meal.nutritionalInfo.fat || 0}`, unit: "g" },
                          ].map(({ label, value, unit }) => (
                            <div key={label} className="bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm">
                              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{label}</p>
                              <p className="text-base font-black text-gray-900 mt-1">{value}</p>
                              <p className="text-[9px] text-gray-400 font-semibold">{unit}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ingredients */}
                    {selectedEntryDetail.meal?.ingredients && selectedEntryDetail.meal.ingredients.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-gray-900 mb-2.5">Ingredients</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedEntryDetail.meal.ingredients.map((ing: string, i: number) => (
                            <span key={i} className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                              <Check className="w-3.5 h-3.5" strokeWidth={3} />
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Allergens */}
                    {selectedEntryDetail.meal?.allergens && selectedEntryDetail.meal.allergens.length > 0 && (
                      <div className="bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm mt-4">
                        <h3 className="text-sm font-bold text-red-800 mb-2">⚠️ Contains Allergens</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedEntryDetail.meal.allergens.map((a: string, i: number) => (
                            <span key={i} className="text-[10px] font-black text-red-700 bg-red-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons - Sticky Bottom */}
                <div className="bg-white border-t border-gray-100 px-5 py-4 flex gap-3 shrink-0 rounded-b-3xl">
                  {selectedEntryDetail.status !== 'skipped' && selectedEntryDetail.status !== 'delivered' && (
                    <button
                      onClick={() => setMealToSkip(selectedEntryDetail)}
                      className="flex-1 h-12 rounded-xl bg-orange-50 text-orange-600 font-bold text-[14px] border-2 border-orange-100 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <X className="w-4 h-4" strokeWidth={2.5} />
                      Skip Delivery
                    </button>
                  )}
                  <button
                    onClick={() => { setSelectedEntryDetail(null); setIsEditingInstructions(false); }}
                    className="flex-1 h-12 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-[14px] hover:bg-gray-50 transition-colors flex items-center justify-center"
                  >
                    Close
                  </button>
                </div>

              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Skip Confirmation Modal */}
      <AnimatePresence>
        {mealToSkip && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMealToSkip(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[130]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[140] flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="bg-white rounded-3xl p-6 w-full max-w-sm pointer-events-auto shadow-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mb-4 mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Skip this delivery?</h3>
                <p className="text-center text-gray-500 text-sm mb-6 leading-relaxed">
                  Are you sure you want to skip <span className="font-bold text-gray-700">{mealToSkip.meal?.name || "this meal"}</span>? 
                  This delivery will be carried forward to the end of your subscription.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setMealToSkip(null)}
                    className="flex-1 py-3.5 rounded-xl font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const m = mealToSkip;
                      setMealToSkip(null);
                      await handleRemoveMealFromDay(m);
                      setSelectedEntryDetail(null);
                      setIsEditingInstructions(false);
                    }}
                    className="flex-1 py-3.5 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-sm shadow-orange-500/20"
                  >
                    Yes, Skip
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
