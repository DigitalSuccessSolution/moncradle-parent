"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header/Header";

import { Footer } from "@/components/layout/Footer/Footer";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft, Calendar as CalendarIcon, Clock, Flame,
  Leaf, X, ShoppingCart, LayoutGrid, CheckCircle2, Heart, AlertTriangle, Baby,
  Sun, Utensils, Moon, Cookie, Apple, SlidersHorizontal, Coffee, Soup
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";

const MEAL_PLANS = [
  {
    id: 1,
    ageGroup: "6-8 Months",
    name: "Apple & Oat Puree",
    type: "Breakfast",
    cals: "120",
    protein: "3g",
    prepTime: "10m",
    price: 149,
    img: "/images/food/apple_oat_puree.png",
    isRecommended: true,
    allergyWarning: "",
    ingredients: ["1/2 Apple, peeled & cored", "2 tbsp Rolled Oats", "1/4 cup Water or Breastmilk"],
    steps: [
      "Steam the apple chunks until very soft (about 8 mins).",
      "Blend the steamed apple with rolled oats.",
      "Add water or breastmilk until you reach the desired puree consistency."
    ],
    nutrition: { carbs: "22g", fat: "1g", fiber: "3g" }
  },
  {
    id: 2,
    ageGroup: "6-8 Months",
    name: "Mashed Sweet Potato",
    type: "Lunch",
    cals: "95",
    protein: "2g",
    prepTime: "15m",
    price: 129,
    img: "/images/food/sweet_potato_mash.png",
    isRecommended: false,
    allergyWarning: "",
    ingredients: ["1 small Sweet Potato", "Pinch of Cinnamon (optional)", "Water"],
    steps: [
      "Peel and chop the sweet potato into small cubes.",
      "Steam or boil until completely tender.",
      "Mash with a fork or blend until smooth, adding water as needed."
    ],
    nutrition: { carbs: "21g", fat: "0g", fiber: "4g" }
  },
  {
    id: 3,
    ageGroup: "1-2 Years",
    name: "Dal Khichdi with Vegetables",
    type: "Dinner",
    cals: "150",
    protein: "6g",
    prepTime: "20m",
    price: 199,
    img: "/images/food/dal_khichdi.png",
    isRecommended: true,
    allergyWarning: "",
    ingredients: ["2 tbsp Yellow Moong Dal", "2 tbsp Rice", "1/4 cup Mixed Veggies (Carrot, Peas)", "Pinch of Turmeric", "1 tsp Ghee"],
    steps: [
      "Wash dal and rice thoroughly.",
      "Pressure cook dal, rice, and veggies with turmeric and water for 3-4 whistles.",
      "Mash lightly, stir in ghee, and serve lukewarm."
    ],
    nutrition: { carbs: "25g", fat: "4g", fiber: "5g" }
  },
  {
    id: 4,
    ageGroup: "1-2 Years",
    name: "Mini Paneer Paratha",
    type: "Snack",
    cals: "180",
    protein: "8g",
    prepTime: "25m",
    price: 249,
    img: "/images/food/mini_paratha.png",
    isRecommended: false,
    allergyWarning: "Contains Dairy (Paneer/Ghee). Avoid if lactose intolerant.",
    ingredients: ["1/2 cup Whole Wheat Flour", "1/4 cup Grated Paneer", "Pinch of Cumin powder", "Ghee for roasting"],
    steps: [
      "Knead a soft dough using wheat flour and water.",
      "Mix grated paneer with cumin powder.",
      "Stuff a small dough ball with the paneer mix, roll gently, and roast on a tawa with ghee."
    ],
    nutrition: { carbs: "20g", fat: "8g", fiber: "3g" }
  }
];

const AGE_GROUPS = [
  { id: '4-6 Months', title: '4-6 Months', sub: 'Purees & Early Foods' },
  { id: '6-8 Months', title: '6-8 Months', sub: 'Soft & Mashed Foods' },
  { id: '9-12 Months', title: '9-12 Months', sub: 'Minced & Soft Bites' },
  { id: '1-2 Years', title: '1-2 Years', sub: 'Toddler Meals' },
  { id: '2+ Years', title: '2+ Years', sub: 'Family Meals' }
];

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

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
  const [activeAge, setActiveAge] = useState("6-8 Months");
  const [activeType, setActiveType] = useState("All");
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [activeDay, setActiveDay] = useState(1);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<typeof MEAL_PLANS[0] | null>(null);

  useEffect(() => {
    if (selectedMeal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedMeal]);

  const filteredMeals = MEAL_PLANS.filter(meal => 
    meal.ageGroup === activeAge && 
    (activeType === "All" || meal.type === activeType)
  );

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative selection:bg-[var(--color-primary)]/20">
      <Header />

      {/* Mobile Back Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 sticky top-0 z-40 bg-[var(--color-background)]/90 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-90 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Meal Plans</h1>
        </div>

        {/* Mobile Cart Button */}
        <button className="w-10 h-10 flex items-center justify-center bg-white rounded-lg border border-gray-200 text-[#122B54] active:scale-95 transition-all">
          <ShoppingCart className="w-5 h-5" />
        </button>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 py-6 pb-24 md:py-10 space-y-8 md:space-y-10 relative z-10">

        {/* Desktop Header & View Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hidden md:flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-3 bg-white rounded-full shadow-sm hover:shadow hover:-translate-y-0.5 transition-all">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-black">Meal Plans</h1>
              <p className="text-sm font-medium text-gray-500 mt-1">Meals for {activeAge}</p>
            </div>
          </div>
        </motion.div>

        {/* View Mode Toggles & Filter Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between mb-2"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 border ${
                viewMode === "grid"
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[var(--color-primary)]/50"
              }`}
            >
              <LayoutGrid className="w-4 h-4 md:w-5 md:h-5" />
              Grid View
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all duration-300 border ${
                viewMode === "calendar"
                  ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-md"
                  : "bg-white text-gray-500 border-gray-200 hover:border-[var(--color-primary)]/50"
              }`}
            >
              <CalendarIcon className="w-4 h-4 md:w-5 md:h-5" />
              Weekly Calendar
            </button>
          </div>

          <button
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center justify-center w-[42px] h-[42px] rounded-xl bg-white border border-gray-200 text-[#122B54] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Content Area */}
        {viewMode === "grid" ? (
          <motion.div
            key={`grid-${activeAge}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="mt-8 md:mt-10 flex flex-col"
          >
            <h3 className="text-[18px] md:text-xl font-bold text-black leading-tight mb-8 md:mb-10 px-1">
              Explore meals <span className="text-[var(--color-primary)]">({activeAge})</span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {filteredMeals.length === 0 ? (
              <div className="col-span-full py-20 text-center text-gray-400 font-medium text-lg">No meals found for this age group.</div>
            ) : (
              filteredMeals.map(meal => (
                <motion.div
                  variants={itemVariants}
                  key={meal.id}
                  className="bg-white rounded-lg border border-gray-200 flex flex-col group overflow-hidden hover:border-[var(--color-primary)] transition-colors duration-300 relative cursor-pointer"
                  onClick={() => setSelectedMeal(meal)}
                >
                  {/* Tag */}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-md text-[9px] font-bold text-[var(--color-primary)] shadow-sm z-10 uppercase tracking-wide">
                    {meal.type}
                  </span>


                  <div className="block flex-1 flex flex-col pointer-events-none">
                    {/* Image Container */}
                    <div className="w-full h-36 md:h-44 relative bg-[#F8FAFC] border-b border-gray-100 overflow-hidden flex-shrink-0">
                      <Image src={meal.img} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col p-3 md:p-4">
                      <div className="min-h-[2.5rem] mb-0.5">
                        <h4 className="text-sm font-semibold text-[#122B54] leading-tight line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">{meal.name}</h4>
                      </div>
                      <p className="text-[10px] md:text-xs font-medium text-gray-500 mb-2">{meal.cals} kcal • {meal.protein} protein</p>

                      {/* Price & Action */}
                      <div className="mt-auto flex flex-col gap-2.5 pt-2">
                        <div className="flex items-center flex-wrap gap-1.5 md:gap-2 mb-1">
                          <p className="text-sm md:text-base font-bold text-[#122B54] tracking-tight">₹{meal.price}</p>
                          <p className="text-sm md:text-base font-medium text-gray-400 line-through">₹{meal.price + 100}</p>
                          <div className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-md text-xs md:text-sm font-bold tracking-wide">
                            ₹100 OFF
                          </div>
                        </div>

                        <button
                          className="w-full bg-[var(--color-primary)] text-white text-[11px] md:text-xs font-bold py-2 rounded-lg hover:bg-[#527d89] hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 group/btn shadow-sm pointer-events-auto"
                          onClick={(e) => {
                            e.stopPropagation();
                            alert(`Added ${meal.name} to cart!`);
                          }}
                        >
                          <ShoppingCart className="w-3.5 h-3.5 group-hover/btn:scale-110 transition-transform" />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 md:mt-10 flex flex-col"
          >
            <h3 className="text-[18px] md:text-xl font-bold text-black leading-tight mb-5 md:mb-6 px-1">
              Weekly Meal Calendar <span className="text-[var(--color-primary)]">({activeAge})</span>
            </h3>

            {/* Day Tabs */}
            <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar py-2 mb-8 md:mb-10">
              {WEEK_DAYS.map((dayName, idx) => {
                const day = idx + 1;
                return (
                  <button
                    key={day}
                    onClick={() => setActiveDay(day)}
                    className={`px-4 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                      activeDay === day 
                        ? 'bg-[var(--color-primary)] text-white shadow-md' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    {dayName}
                  </button>
                );
              })}
            </div>

            {/* Meals for the Day */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6 pt-2">
              {[
                { type: "Breakfast", icon: Coffee, color: "text-amber-600", meal: filteredMeals[0] },
                { type: "Snack", icon: Apple, color: "text-red-500", meal: filteredMeals[1] },
                { type: "Lunch", icon: Utensils, color: "text-blue-500", meal: filteredMeals[2] },
                { type: "Evening Snack", icon: Cookie, color: "text-purple-500", meal: filteredMeals[3] },
                { type: "Dinner", icon: Soup, color: "text-emerald-600", meal: filteredMeals[0] },
              ].map((item, idx) => {
                const Icon = item.icon;
                const meal = item.meal || MEAL_PLANS[0]; // fallback if not enough mock data
                return (
                  <div key={idx} className="bg-white rounded-lg border border-gray-100 flex flex-col group overflow-hidden hover:border-[var(--color-primary)] transition-all duration-300">
                    <div className="w-full h-28 md:h-32 relative bg-[#F8FAFC] border-b border-gray-100 overflow-hidden flex-shrink-0">
                      <Image src={meal.img} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-2.5 md:p-3.5 flex flex-col flex-1">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <Icon className={`w-3.5 h-3.5 md:w-4 md:h-4 ${item.color}`} strokeWidth={2.5} />
                        <span className="text-[10px] md:text-[11px] font-extrabold text-black uppercase tracking-wider">{item.type}</span>
                      </div>
                      <h4 className="text-xs md:text-sm font-semibold text-[#122B54] leading-snug line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors">
                        {meal.name}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>


          </motion.div>
        )}

      </main>

      <Footer />
      

      {/* --- Premium Meal Detail Modal --- */}
      <AnimatePresence>
        {selectedMeal && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-[#122B54]/40 backdrop-blur-sm"
              onClick={() => setSelectedMeal(null)}
            />

            {/* Modal Container */}
            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.4 }}
              className="relative w-full md:max-w-4xl bg-white md:rounded-[2rem] rounded-t-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-[650px] md:max-h-[85vh]"
            >
              <button
                onClick={() => setSelectedMeal(null)}
                className="absolute top-4 right-4 p-2 bg-black/30 md:bg-gray-100 md:text-gray-500 hover:bg-black/50 md:hover:bg-gray-200 backdrop-blur-md text-white md:backdrop-blur-none rounded-full transition-colors z-50"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image Header */}
              <div className="h-56 md:h-full md:w-[45%] relative overflow-hidden bg-[#F8FAFC] flex-shrink-0">
                <Image src={selectedMeal.img} alt={selectedMeal.name} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#122B54]/90 via-[#122B54]/30 to-transparent pointer-events-none" />

                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between md:flex-col md:items-start md:gap-3">
                  <div>
                    <span className="inline-block text-white/90 text-[9px] font-bold uppercase tracking-widest mb-2 px-2.5 py-1 bg-white/20 backdrop-blur-md rounded-md">
                      {selectedMeal.type}
                    </span>
                    <h2 className="text-xl md:text-3xl font-semibold text-white leading-tight">{selectedMeal.name}</h2>
                  </div>
                  <div className="text-right md:text-left">
                    <span className="text-white/80 text-[10px] font-medium block">Price</span>
                    <span className="text-2xl md:text-3xl font-bold text-white">₹{selectedMeal.price}</span>
                  </div>
                </div>
              </div>

              {/* Right Side Content Container */}
              <div className="flex-1 flex flex-col min-h-0 md:w-[55%] relative">
                {/* Scrollable Content */}
                <div className="p-6 md:p-8 overflow-y-auto space-y-8 bg-white flex-1 md:pt-12">
                  {/* Stats Row */}
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[90px] flex flex-col items-center justify-center p-3 rounded-[1rem] bg-[#F8FAFC] border border-gray-100">
                      <Flame className="w-4 h-4 text-orange-500 mb-2" />
                      <p className="text-sm font-semibold text-[#122B54]">{selectedMeal.cals}</p>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Kcal</p>
                    </div>

                    <div className="flex-1 min-w-[90px] flex flex-col items-center justify-center p-3 rounded-[1rem] bg-[#F8FAFC] border border-gray-100">
                      <Leaf className="w-4 h-4 text-emerald-500 mb-2" />
                      <p className="text-sm font-semibold text-[#122B54]">{selectedMeal.protein}</p>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Protein</p>
                    </div>

                    <div className="flex-1 min-w-[90px] flex flex-col items-center justify-center p-3 rounded-[1rem] bg-[#F8FAFC] border border-gray-100">
                      <Clock className="w-4 h-4 text-blue-500 mb-2" />
                      <p className="text-sm font-semibold text-[#122B54]">{selectedMeal.prepTime}</p>
                      <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">Prep</p>
                    </div>
                  </div>

                  {/* Allergy Warning */}
                  {selectedMeal.allergyWarning && (
                    <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex gap-3 items-start">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-red-700">Allergy Warning</h4>
                        <p className="text-xs text-red-600 mt-1 font-medium leading-relaxed">{selectedMeal.allergyWarning}</p>
                      </div>
                    </div>
                  )}

                  {/* Ingredients & Steps */}
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-base font-semibold text-[#122B54] mb-4 flex items-center gap-2">
                        Ingredients
                      </h3>
                      <ul className="space-y-3">
                        {selectedMeal.ingredients.map((ing: string, i: number) => (
                          <li key={i} className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            </div>
                            <span className="text-xs md:text-sm text-gray-600 font-medium">{ing}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-base font-semibold text-[#122B54] mb-4">
                        Preparation
                      </h3>
                      <div className="space-y-5">
                        {selectedMeal.steps.map((step: string, i: number) => (
                          <div key={i} className="flex gap-4 group/step">
                            <div className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0 text-[11px] font-bold group-hover/step:bg-[var(--color-primary)] group-hover/step:text-white transition-colors">
                              {i + 1}
                            </div>
                            <p className="text-xs md:text-sm text-gray-600 font-medium leading-relaxed pt-1">{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 md:p-6 border-t border-gray-100 bg-white sticky bottom-0 mt-auto shadow-[0_-10px_30px_rgba(0,0,0,0.02)] flex gap-3">
                  <button 
                    className="flex-1 bg-white border-2 border-gray-200 text-gray-600 text-sm font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm" 
                    onClick={() => alert("Saved to Favorites!")}
                  >
                    <Heart className="w-4 h-4 md:w-5 md:h-5" />
                    <span className="hidden sm:inline">Save</span>
                  </button>
                  <button
                    className="flex-[2] md:flex-[3] bg-[var(--color-primary)] text-white text-sm font-semibold py-3.5 rounded-xl hover:bg-[#527d89] hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 active:scale-95"
                    onClick={() => {
                      alert(`Added ${selectedMeal.name} to cart!`);
                      setSelectedMeal(null);
                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart - ₹{selectedMeal.price}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- Filter Modal --- */}
      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterModalOpen(false)}
              className="absolute inset-0 bg-[#122B54]/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full sm:w-[400px] bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
               <div className="p-4 md:p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                 <h2 className="text-lg font-bold text-[#122B54]">Filters</h2>
                 <button onClick={() => setIsFilterModalOpen(false)} className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                   <X className="w-5 h-5" />
                 </button>
               </div>
               
               <div className="p-5 overflow-y-auto space-y-8">
                 {/* Age Group Filters */}
                 <div>
                   <h3 className="text-sm font-bold text-gray-900 mb-3">Choose Age Group</h3>
                   <div className="grid grid-cols-2 gap-3">
                     {AGE_GROUPS.map((age) => {
                       const isSelected = activeAge === age.id;
                       return (
                         <button
                           key={age.id}
                           onClick={() => { setActiveAge(age.id); setIsFilterModalOpen(false); }}
                           className={`flex flex-col p-3 rounded-2xl border transition-all duration-300 text-left ${
                             isSelected
                               ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/5'
                               : 'border-gray-100 bg-white hover:border-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/5'
                           }`}
                         >
                           <h4 className={`text-sm font-bold ${isSelected ? 'text-[var(--color-primary)]' : 'text-[#122B54]'}`}>{age.title}</h4>
                           <p className={`text-[10px] font-semibold ${isSelected ? 'text-[var(--color-primary)]/70' : 'text-gray-400'}`}>{age.sub}</p>
                         </button>
                       );
                     })}
                   </div>
                 </div>

                 {/* Meal Type Filters */}
                 <div>
                   <h3 className="text-sm font-bold text-gray-900 mb-3">Filter by Meal Type</h3>
                   <div className="flex flex-wrap gap-2">
                     {[
                       { id: 'All', label: 'All Meals', icon: LayoutGrid, colorClass: 'text-red-500' },
                       { id: 'Breakfast', label: 'Breakfast', icon: Sun, colorClass: 'text-orange-500' },
                       { id: 'Lunch', label: 'Lunch', icon: Utensils, colorClass: 'text-blue-500' },
                       { id: 'Dinner', label: 'Dinner', icon: Moon, colorClass: 'text-amber-600' },
                       { id: 'Snack', label: 'Snacks', icon: Cookie, colorClass: 'text-emerald-600' },
                     ].map((type) => {
                       const isSelected = activeType === type.id;
                       const Icon = type.icon;
                       return (
                         <button
                           key={type.id}
                           onClick={() => { setActiveType(type.id); setIsFilterModalOpen(false); }}
                           className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 border ${
                             isSelected
                               ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                               : 'bg-white border-gray-200 text-[#122B54] hover:bg-gray-50'
                           }`}
                         >
                           <Icon className={`w-4 h-4 ${isSelected ? 'text-[var(--color-primary)]' : type.colorClass}`} />
                           <span>{type.label}</span>
                         </button>
                       );
                     })}
                   </div>
                 </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
