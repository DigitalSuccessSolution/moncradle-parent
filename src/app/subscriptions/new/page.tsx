"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  ChevronLeft, ChevronRight, Check, Utensils, MapPin,
  CreditCard, Calendar, Loader2, Plus, X, Baby, Pencil, Edit2, Trash2, Home, Briefcase, Phone, MoreVertical
} from "lucide-react";
import { getMeals, Meal } from "@/lib/api/mealsApi";
import { getBabies, BabyProfile } from "@/lib/api/babiesApi";
import { getAddresses, Address, addAddress, updateAddress } from "@/lib/api/addressesApi";
import { AddressModal } from "@/components/address/AddressModal";
import { getSubscriptionPlans, createSubscription, SubscriptionPlan } from "@/lib/api/subscriptionsApi";
import { initiatePayment } from "@/lib/api/paymentsApi";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

// ── Helpers ─────────────────────────────────────────────────────────────────

// Get the next N weekday dates starting from tomorrow
function getDeliveryDates(startDate: Date, totalDays: number): Date[] {
  const dates: Date[] = [];
  let d = new Date(startDate);
  d.setDate(d.getDate() + 1); // start from tomorrow
  while (dates.length < totalDays) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
}

const STEP_LABELS = ["Choose Plan", "Start Date", "Build Menu", "Address", "Review & Pay"];

// ── Component ────────────────────────────────────────────────────────────────

export default function NewSubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Data
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Selections
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [activePayment, setActivePayment] = useState("upi");
  
  type CustomScheduleItem = { id: string; date: Date; meal: Meal; timeSlot: string };
  const [customSchedule, setCustomSchedule] = useState<CustomScheduleItem[]>([]);
  
  const [addingMealForDate, setAddingMealForDate] = useState<Date | null>(null);
  const [mealDetail, setMealDetail] = useState<Meal | null>(null); // meal detail sheet

  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<Address | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const TIME_SLOTS = [
    { label: "Breakfast", time: "8 AM - 9 AM", value: "Breakfast (8 AM - 9 AM)" },
    { label: "Lunch", time: "12 PM - 1 PM", value: "Lunch (12 PM - 1 PM)" },
    { label: "Dinner", time: "7 PM - 8 PM", value: "Dinner (7 PM - 8 PM)" },
  ];

  // Next 14 days for start date picker
  const next14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i + 1);
    return d;
  });

  // Load all data on mount
  useEffect(() => {
    if (isAuthLoading) return;
    if (!isAuthenticated) { router.push("/login"); return; }
    const load = async () => {
      setIsLoadingData(true);
      try {
        const [plansRes, babiesRes, addressesRes] = await Promise.all([
          getSubscriptionPlans(),
          getBabies(),
          getAddresses(),
        ]);
        setPlans(plansRes || []);
        const babies = babiesRes.data || babiesRes || [];
        if (babies.length > 0) setBaby(babies[0]);
        const addrs = addressesRes || [];
        setAddresses(addrs);
        const def = addrs.find((a: Address) => a.isDefault) || addrs[0];
        if (def) setSelectedAddressId(def._id);

        // If planId in query, pre-select it
        const planId = searchParams.get("planId");
        if (planId && plansRes.length > 0) {
          const found = plansRes.find((p: SubscriptionPlan) => p._id === planId);
          if (found) { setSelectedPlan(found); setStep(1); }
        }
      } catch (e) {
        console.error(e);
        toast.error("Failed to load data");
      } finally {
        setIsLoadingData(false);
      }
    };
    load();
  }, [isAuthenticated, isAuthLoading]);

  // Load meals whenever plan changes
  useEffect(() => {
    if (!selectedPlan) return;
    const fetchMeals = async () => {
      try {
        const res = await getMeals({ limit: 30, page: 1 });
        // API returns { data: [...] } or { meals: [...] } or direct array
        const list = res.data || res.meals || res || [];
        setMeals(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("Failed to load meals:", e);
        toast.error("Failed to load meals");
      }
    };
    fetchMeals();
  }, [selectedPlan]);

  // ── Derived ──────────────────────────────────────────────────────────────
  const mealsRequired = selectedPlan?.durationInDays || 7;
  const deliveryDates = getDeliveryDates(startDate, mealsRequired);

  const handleAddMeal = (meal: Meal, timeSlot: string) => {
    if (!addingMealForDate) return;
    setCustomSchedule(prev => [
      ...prev,
      {
        id: Math.random().toString(36).substring(7),
        date: addingMealForDate,
        meal,
        timeSlot
      }
    ]);
    setAddingMealForDate(null);
    setMealDetail(null);
  };

  const removeScheduledMeal = (id: string) => {
    setCustomSchedule(prev => prev.filter(item => item.id !== id));
  };

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSaveAddress = async (formData: Partial<Address>, isEditing: boolean, editingId: string | null) => {
    try {
      let savedAddr: Address;
      if (isEditing && editingId) {
        savedAddr = await updateAddress(editingId, formData);
        setAddresses(prev => prev.map(a => a._id === editingId ? savedAddr : a));
      } else {
        savedAddr = await addAddress(formData);
        setAddresses(prev => [...prev, savedAddr]);
        setSelectedAddressId(savedAddr._id);
      }
      setIsAddressModalOpen(false);
      setAddressToEdit(null);
      toast.success(isEditing ? "Address updated successfully" : "Address added successfully");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save address");
      throw err;
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubscribe = async () => {
    if (!selectedPlan || !baby?._id || !selectedAddressId) return;
    setIsSubmitting(true);
    try {
      const deliverySchedule = customSchedule.map(item => ({
        date: item.date.toISOString(),
        mealId: item.meal._id,
        timeSlot: item.timeSlot,
        status: "pending",
      }));
      
      const mealsTotal = customSchedule.reduce((sum, item) => sum + (item.meal.price || 0), 0);
      const finalAmount = (selectedPlan.price || 0) + mealsTotal;

      const res = await createSubscription({
        babyId: baby._id as string,
        planId: selectedPlan._id as string,
        deliveryAddressId: selectedAddressId,
        totalAmount: finalAmount,
        deliverySchedule: deliverySchedule as any,
      });

      // Handle Online Payment
      if (activePayment === 'upi' || activePayment === 'card') {
        const paymentRes = await initiatePayment({ subscriptionId: res._id as string });
        if (paymentRes.success && paymentRes.redirectUrl) {
          window.location.href = paymentRes.redirectUrl;
          return;
        }
        toast.error("Failed to initiate online payment, subscription created as COD.");
      }

      toast.success("🎉 Subscription created! Your meal calendar is ready.", { duration: 4000 });
      router.push("/shop/order-success?type=subscription");
    } catch (e: any) {
      toast.error(e?.message || "Failed to create subscription");
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return !!selectedPlan;
    if (step === 1) return !!startDate;
    if (step === 2) return customSchedule.length > 0;
    if (step === 3) return !!selectedAddressId;
    return true;
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (isAuthLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin" />
          <p className="text-gray-500 font-semibold animate-pulse">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans">

      {/* ── Header ── */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 flex items-center gap-3">
          <button
            onClick={() => step === 0 ? router.back() : setStep(s => s - 1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="text-[11px] font-semibold text-[var(--color-primary)] uppercase tracking-wider">
              Step {step + 1} of {STEP_LABELS.length}
            </p>
            <h1 className="text-[16px] md:text-[18px] font-bold text-gray-900">{STEP_LABELS[step]}</h1>
          </div>
          {/* Desktop step dots */}
          <div className="hidden md:flex items-center gap-2">
            {STEP_LABELS.map((label, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                  i < step ? 'bg-[var(--color-primary)] text-white'
                  : i === step ? 'bg-[var(--color-primary)]/20 text-[var(--color-primary)] ring-2 ring-[var(--color-primary)]'
                  : 'bg-gray-100 text-gray-400'
                }`}>
                  {i < step ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : i + 1}
                </div>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-6 h-0.5 ${i < step ? 'bg-[var(--color-primary)]' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Mobile progress bar */}
        <div className="md:hidden h-1 bg-gray-100">
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-500"
            style={{ width: `${((step + 1) / STEP_LABELS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Main Content: 2-column on desktop ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-6 pb-28 md:pb-10">
        <div className="md:grid md:grid-cols-[1fr_360px] md:gap-8 lg:gap-12">

          {/* ── LEFT: Steps content ── */}
          <div className="min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >

            {/* ─────────────────── STEP 0: Choose Plan ─────────────────── */}
            {step === 0 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Choose a Meal Plan</h2>
                  <p className="text-sm text-gray-500 mt-1">Select the plan that fits your baby's needs best.</p>
                </div>
                {plans.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Utensils className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    <p>No subscription plans available right now.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {plans.map((plan) => {
                      const isSelected = selectedPlan?._id === plan._id;
                      return (
                        <button
                          key={plan._id}
                          onClick={() => setSelectedPlan(plan)}
                          className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                            isSelected
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className={`font-bold text-base ${isSelected ? "text-[var(--color-primary)]" : "text-gray-900"}`}>
                                {plan.title || plan.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-0.5">{plan.description}</p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                                  📅 {plan.durationInDays} days
                                </span>
                                {(plan.features || []).slice(0, 2).map((f, i) => (
                                  <span key={i} className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                                    ✓ {f}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right ml-4 shrink-0">
                              <p className={`text-2xl font-bold ${isSelected ? "text-[var(--color-primary)]" : "text-gray-900"}`}>
                                ₹{plan.price}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">for {plan.durationInDays} days</p>
                            </div>
                          </div>
                          {isSelected && (
                            <div className="mt-3 flex items-center gap-1.5 text-[var(--color-primary)]">
                              <Check className="w-4 h-4" strokeWidth={3} />
                              <span className="text-xs font-bold">Selected</span>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ─────────────────── STEP 1: Start Date ─────────────────── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Choose Start Date</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Select when you want the meal deliveries to begin.
                  </p>
                </div>

                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {next14Days.map((d, i) => {
                    const isSelected = startDate.toDateString() === d.toDateString();
                    return (
                      <button
                        key={i}
                        onClick={() => setStartDate(d)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-16 py-3 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                            : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        <span className="text-[10px] font-bold uppercase">
                          {d.toLocaleDateString("en", { weekday: "short" })}
                        </span>
                        <span className="text-xl font-bold mt-0.5">{d.getDate()}</span>
                        <span className="text-[10px]">{d.toLocaleDateString("en", { month: "short" })}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─────────────────── Meal Detail Bottom Sheet ─────────────────── */}
            <AnimatePresence>
              {mealDetail && (
                <>
                  {/* Backdrop */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMealDetail(null)}
                    className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
                  />
                  {/* Container for alignment */}
                  <div className="fixed inset-0 z-[100] flex flex-col justify-end md:justify-center md:items-center pointer-events-none">
                    {/* Modal Content */}
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
                      <div className="overflow-y-auto hide-scroll flex-1 pb-6">
                        {/* Image */}
                        <div className="relative h-56 md:h-[340px] mx-4 md:mx-6 md:mt-6 rounded-2xl overflow-hidden bg-gray-100 mb-6 shadow-sm border border-gray-100/50">
                          <Image
                            src={mealDetail.imageUrl || mealDetail.images?.[0] || "/images/meal_food.png"}
                            alt={mealDetail.name}
                            fill
                            className="object-cover"
                          />
                          <button
                            onClick={() => setMealDetail(null)}
                            className="absolute top-3 right-3 w-8 h-8 bg-black/40 hover:bg-black/60 transition-colors rounded-full flex items-center justify-center backdrop-blur-md"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                        </div>

                        <div className="px-5 md:px-6 space-y-5">
                          {/* Name & Price */}
                          <div className="flex items-start justify-between gap-4">
                            <h2 className="text-xl font-bold text-gray-900 flex-1 leading-tight">{mealDetail.name}</h2>
                            <div className="text-right shrink-0">
                              {mealDetail.discountedPrice && mealDetail.discountedPrice < mealDetail.price ? (
                                <>
                                  <p className="text-2xl font-black text-gray-900">₹{mealDetail.discountedPrice}</p>
                                  <p className="text-xs text-gray-400 line-through font-medium">₹{mealDetail.price}</p>
                                </>
                              ) : (
                                <p className="text-2xl font-black text-gray-900">₹{mealDetail.price}</p>
                              )}
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {mealDetail.category && (
                              <span className="text-[10px] font-bold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {mealDetail.category}
                              </span>
                            )}
                            {mealDetail.suitableForAgeGroup && (
                              <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                👶 {mealDetail.suitableForAgeGroup}
                              </span>
                            )}
                            {(mealDetail.tags || []).map((tag, i) => (
                              <span key={i} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {tag}
                              </span>
                            ))}
                          </div>

                          {/* Nutrition */}
                          {mealDetail.nutritionalInfo && (
                            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 md:p-5">
                              <h3 className="text-sm font-bold text-gray-900 mb-3">Nutritional Info</h3>
                              <div className="grid grid-cols-4 gap-2 text-center">
                                {[
                                  { label: "Calories", value: `${mealDetail.nutritionalInfo.calories}`, unit: "kcal" },
                                  { label: "Protein", value: `${mealDetail.nutritionalInfo.protein}`, unit: "g" },
                                  { label: "Carbs", value: `${mealDetail.nutritionalInfo.carbs}`, unit: "g" },
                                  { label: "Fat", value: `${mealDetail.nutritionalInfo.fat}`, unit: "g" },
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
                          {mealDetail.ingredients && mealDetail.ingredients.length > 0 && (
                            <div>
                              <h3 className="text-sm font-bold text-gray-900 mb-2.5">Ingredients</h3>
                              <div className="flex flex-wrap gap-2">
                                {mealDetail.ingredients.map((ing, i) => (
                                  <span key={i} className="text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                    {ing}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Allergens */}
                          {mealDetail.allergens && mealDetail.allergens.length > 0 && (
                            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 shadow-sm">
                              <h3 className="text-sm font-bold text-red-800 mb-2">⚠️ Contains Allergens</h3>
                              <div className="flex flex-wrap gap-2">
                                {mealDetail.allergens.map((a, i) => (
                                  <span key={i} className="text-[10px] font-black text-red-700 bg-red-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                    {a}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons - Sticky Bottom */}
                      <div className="bg-white border-t border-gray-100 px-5 py-4 flex flex-col gap-3 shrink-0 rounded-b-3xl">
                        {addingMealForDate && (
                          <div className="flex gap-2 mb-2">
                            {TIME_SLOTS.map(ts => (
                              <button 
                                key={ts.value}
                                onClick={() => handleAddMeal(mealDetail, ts.value)}
                                className="flex-1 py-2 px-1 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary)]/90 flex flex-col items-center justify-center gap-0.5"
                              >
                                <span className="text-[11px] font-bold">Add for {ts.label}</span>
                                <span className="text-[9px] text-white/80">{ts.time}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        <button
                          onClick={() => setMealDetail(null)}
                          className="w-full h-12 rounded-xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
</motion.div>
                  </div>
                </>
              )}
            </AnimatePresence>


            {/* ─────────────────── STEP 2: Build Menu ─────────────────── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Build Your Schedule</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Add meals for each day of your plan.
                  </p>
                </div>

                <div className="space-y-4">
                  {deliveryDates.map((d, i) => {
                    const dayMeals = customSchedule.filter(s => s.date.toDateString() === d.toDateString());
                    return (
                      <div key={i} className="bg-white rounded-2xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="px-2.5 py-1 rounded-md bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                              <span className="text-[11px] font-bold text-[var(--color-primary)] uppercase tracking-wider whitespace-nowrap">Day {i + 1}</span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">{formatDate(d)}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => setAddingMealForDate(d)}
                            className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1.5 rounded-full hover:bg-[var(--color-primary)]/20 transition-colors"
                          >
                            + Add Meal
                          </button>
                        </div>
                        
                        {dayMeals.length > 0 ? (
                          <div className="space-y-2">
                            {dayMeals.map(item => (
                              <div key={item.id} className="flex items-center justify-between bg-gray-50 p-2 rounded-xl border border-gray-100">
                                <div className="flex items-center gap-2">
                                  <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-gray-200 shrink-0">
                                    <Image src={item.meal.imageUrl || item.meal.images?.[0] || '/images/meal_food.png'} alt={item.meal.name} fill className="object-cover" />
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs font-bold text-gray-900 truncate pr-2">{item.meal.name}</p>
                                    <p className="text-[10px] font-bold text-gray-500">{item.timeSlot} • ₹{item.meal.price}</p>
                                  </div>
                                </div>
                                <button onClick={() => removeScheduledMeal(item.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors shrink-0">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-4 text-center border-2 border-dashed border-gray-100 rounded-xl">
                            <p className="text-xs text-gray-400 font-medium">No meals added for this day</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─────────────────── Add Meal Modal ─────────────────── */}
            <AnimatePresence>
              {addingMealForDate && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    onClick={() => setAddingMealForDate(null)}
                    className="fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
                  />
                  <div className="fixed inset-0 z-[90] flex flex-col justify-end md:justify-center md:items-center pointer-events-none">
                    <motion.div
                      initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
                      className="w-full md:max-w-3xl bg-white rounded-t-3xl md:rounded-3xl h-[85vh] md:h-[80vh] flex flex-col pointer-events-auto shadow-2xl overflow-hidden"
                    >
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">Add Meal to {formatDate(addingMealForDate)}</h3>
                          <p className="text-xs text-gray-500">Select a meal below.</p>
                        </div>
                        <button onClick={() => setAddingMealForDate(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="overflow-y-auto flex-1 p-4 bg-gray-50/50">
                        {/* Meal Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {meals.map(meal => (
                            <button
                              key={meal._id}
                              onClick={() => setMealDetail(meal)}
                              className="text-left rounded-2xl border-2 border-gray-100 bg-white hover:border-gray-300 overflow-hidden transition-all duration-200"
                            >
                              <div className="relative h-28 bg-gray-50">
                                <Image src={meal.imageUrl || meal.images?.[0] || "/images/meal_food.png"} alt={meal.name} fill className="object-cover" />
                                <div className="absolute bottom-1.5 left-1.5">
                                  <span className="text-[10px] font-bold bg-black/60 text-white px-1.5 py-0.5 rounded-full">₹{meal.price}</span>
                                </div>
                              </div>
                              <div className="p-2.5">
                                <p className="text-xs font-bold text-gray-900 line-clamp-2">{meal.name}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </>
              )}
            </AnimatePresence>

            {/* ─────────────────── STEP 3: Address ─────────────────── */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                  <p className="text-sm text-gray-500 mt-1">Where should we deliver your baby's meals?</p>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                    <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-semibold">No saved addresses found</p>
                    <button
                      onClick={() => { setAddressToEdit(null); setIsAddressModalOpen(true); }}
                      className="mt-4 flex items-center gap-2 mx-auto bg-[var(--color-primary)] text-white text-sm font-semibold px-5 py-2.5 rounded-full"
                    >
                      <Plus className="w-4 h-4" /> Add Address
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    {addresses.map((address) => {
                      const isSelected = selectedAddressId === address._id;
                      return (
                        <div 
                          key={address._id} 
                          onClick={() => setSelectedAddressId(address._id)}
                          className={`cursor-pointer bg-white p-2.5 md:p-3.5 rounded-xl border transition-all duration-300 ${isSelected ? 'border-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-primary)]/10 bg-[var(--color-primary)]/5' : 'border-gray-200 shadow-sm hover:border-gray-300'}`}
                        >
                          <div className="flex items-center gap-2.5">
                            {/* Left Icon Box */}
                            <div className={`w-[42px] h-[42px] rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? "bg-[var(--color-primary)] text-white" : "bg-gray-100 text-gray-800"}`}>
                              {address.title === "Work" ? <Briefcase className="w-5 h-5" strokeWidth={1.5} /> : address.title === "Other" ? <MapPin className="w-5 h-5" strokeWidth={1.5} /> : <Home className="w-5 h-5" strokeWidth={1.5} />}
                            </div>

                            {/* Right Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col py-1">
                                  <div className="flex items-center gap-2">
                                     <p className="text-[14px] font-bold text-gray-900 mb-0">{address.name}</p>
                                     {address.isDefault && <span className="text-[9px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold px-1.5 py-0.5 rounded uppercase">Default</span>}
                                  </div>
                                  <p className="text-[12px] text-gray-500 leading-tight mb-0.5 line-clamp-2 pr-2">
                                    {[address.flat, address.street, address.city, address.state, address.zipCode, address.country]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </p>
                                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-700 mt-0.5">
                                    <Phone className="w-3 h-3 text-gray-500" />
                                    <span>{address.phone}</span>
                                  </div>
                                </div>
                                
                                <div className="relative flex-shrink-0 -mr-2">
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); setAddressToEdit(address); setIsAddressModalOpen(true); }} 
                                    className="p-1.5 text-gray-400 hover:text-[var(--color-primary)] hover:bg-gray-100 rounded-full transition-colors z-10"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={() => { setAddressToEdit(null); setIsAddressModalOpen(true); }}
                      className="w-full p-4 rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center gap-2 text-sm font-semibold text-gray-500 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Add New Address
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ─────────────────── STEP 4: Review & Pay ─────────────────── */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Review & Confirm</h2>
                  <p className="text-sm text-gray-500 mt-1">Check your order details before subscribing.</p>
                </div>

                {/* Plan summary */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3">
                  <h3 className="text-sm font-bold text-gray-700">📋 Plan Details</h3>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{selectedPlan?.title || selectedPlan?.name}</span>
                    <span className="font-bold text-gray-900">₹{(selectedPlan?.price || 0) + customSchedule.reduce((s,i) => s + (i.meal.price||0), 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Duration</span>
                    <span>{selectedPlan?.durationInDays} days</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Total Meals Scheduled</span>
                    <span className="font-bold text-gray-900">{customSchedule.length} meals</span>
                  </div>
                </div>

                {/* Baby */}
                {baby && (
                  <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <h3 className="text-sm font-bold text-gray-700 mb-2">👶 Baby</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                        <Baby className="w-4 h-4 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{baby.name}</p>
                        {baby.ageInMonths && (
                          <p className="text-xs text-gray-500">{baby.ageInMonths} months old</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Address */}
                {addresses.find(a => a._id === selectedAddressId) && (() => {
                  const addr = addresses.find(a => a._id === selectedAddressId)!;
                  return (
                    <div className="bg-white rounded-2xl border border-gray-100 p-4">
                      <h3 className="text-sm font-bold text-gray-700 mb-2">📍 Delivery Address</h3>
                      <p className="text-sm font-semibold text-gray-800">{addr.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {addr.flat && `${addr.flat}, `}{addr.street}, {addr.city} {addr.zipCode}
                      </p>
                    </div>
                  );
                })()}

                {/* Total */}
                <div className="bg-[var(--color-primary)]/5 border border-[var(--color-primary)]/20 rounded-2xl p-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-[var(--color-primary)]">₹{(selectedPlan?.price || 0) + customSchedule.reduce((s,i) => s + (i.meal.price||0), 0)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">One-time payment for {selectedPlan?.durationInDays} days of fresh meals</p>
                </div>

                {/* Payment Method Selection */}
                <div>
                  <h3 className="text-sm font-bold text-gray-700 mb-3 mt-4">💳 Select Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'upi', label: 'UPI / PhonePe', icon: CreditCard },
                      { id: 'card', label: 'Card / Netbanking', icon: CreditCard }
                    ].map((method) => {
                      const isActive = activePayment === method.id;
                      const Icon = method.icon;
                      return (
                        <button
                          key={method.id}
                          onClick={() => setActivePayment(method.id)}
                          className={`relative p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${
                            isActive 
                              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5 ring-1 ring-[var(--color-primary)]/20" 
                              : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <Icon className={`w-5 h-5 ${isActive ? "text-[var(--color-primary)]" : "text-gray-400"}`} />
                          <span className={`text-xs font-semibold text-center ${isActive ? "text-gray-900" : "text-gray-600"}`}>
                            {method.label}
                          </span>
                          {isActive && (
                            <div className="absolute top-2 right-2 w-3 h-3 bg-[var(--color-primary)] rounded-full flex items-center justify-center">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            </motion.div>
          </AnimatePresence>
          </div>

          {/* ── RIGHT: Sticky summary (desktop only) ── */}
          <div className="hidden md:block">
            <div className="sticky top-24 space-y-4">
              {/* Plan summary card */}
              {selectedPlan && (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <h3 className="text-sm font-bold text-gray-700 mb-3">📋 Your Selection</h3>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 text-sm">{selectedPlan.title || selectedPlan.name}</span>
                    <span className="text-lg font-bold text-[var(--color-primary)]">₹{selectedPlan.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedPlan.durationInDays} days plan</p>
                  <div className="mt-3 h-px bg-gray-100" />
                  {/* Custom Schedule Summary */}
                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Meals Added ({customSchedule.length})</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {customSchedule.length > 0 ? customSchedule.map(item => (
                        <div key={item.id} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg overflow-hidden relative bg-gray-100 shrink-0">
                            <Image src={item.meal.imageUrl || item.meal.images?.[0] || '/images/meal_food.png'} alt={item.meal.name} fill className="object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-800 truncate">{item.meal.name}</p>
                            <p className="text-[10px] text-gray-500">{formatDate(item.date)} • {item.timeSlot}</p>
                          </div>
                          <p className="text-xs font-bold text-[var(--color-primary)] shrink-0">₹{item.meal.price}</p>
                        </div>
                      )) : (
                        <p className="text-xs text-gray-400">No meals added yet.</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center text-sm mb-1">
                      <span className="text-gray-500">Meals Total</span>
                      <span className="font-bold text-gray-900">₹{customSchedule.reduce((s,i) => s + (i.meal.price||0), 0)}</span>
                    </div>
                    <div className="flex justify-between items-center text-base mt-2">
                      <span className="font-bold text-gray-900">Total Amount</span>
                      <span className="font-black text-[var(--color-primary)] text-lg">₹{(selectedPlan.price || 0) + customSchedule.reduce((s,i) => s + (i.meal.price||0), 0)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Baby info */}
              {baby && (
                <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center">
                    <Baby className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{baby.name}</p>
                    {baby.ageInMonths && <p className="text-xs text-gray-500">{baby.ageInMonths} months old</p>}
                  </div>
                </div>
              )}

              {/* Desktop Continue button */}
              <button
                onClick={() => step < 4 ? setStep(s => s + 1) : handleSubscribe()}
                disabled={!canProceed() || isSubmitting}
                className="w-full h-12 bg-[var(--color-primary)] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-primary)]/90 transition-all"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</>
                ) : step < 4 ? (
                  <>Continue <ChevronRight className="w-4 h-4" /></>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Confirm & Subscribe</>
                )}
              </button>
            </div>
          </div>

        </div>
      </div>
      {/* ── Mobile Bottom Action Bar (hidden on desktop) ── */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 shadow-lg px-4 py-4 z-40">
        {step < 4 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canProceed()}
            className="w-full h-14 bg-[var(--color-primary)] text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
          >
            Continue <ChevronRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubscribe}
            disabled={isSubmitting}
            className="w-full h-14 bg-[var(--color-primary)] text-white font-bold text-base rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Creating Subscription...</>
            ) : (
              <><CreditCard className="w-5 h-5" /> Confirm & Subscribe</>
            )}
          </button>
        )}
      </div>

      {/* Address Modal */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => { setIsAddressModalOpen(false); setAddressToEdit(null); }}
        onSave={handleSaveAddress}
        initialData={addressToEdit}
        isFirstAddress={addresses.length === 0}
      />
    </div>
  );
}
