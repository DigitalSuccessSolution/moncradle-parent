"use client";

import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, ShoppingCart, CheckCircle2, Star, Calendar, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { getMealById, getMeals, Meal } from "@/lib/api/mealsApi";
import { getBabies } from "@/lib/api/babiesApi";
import { addMealToSchedule } from "@/lib/api/nutritionPlanApi";
import { MealCard } from "@/components/nutrition/MealCard";
import ReviewSection from "@/components/common/ReviewSection";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCartAsync } from "@/store/slices/cartSlice";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function MealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const mealId = typeof params.id === "string" ? params.id : "";
  const [meal, setMeal] = useState<Meal | null>(null);
  const [similarMeals, setSimilarMeals] = useState<Meal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New state for Add to Plan
  const [babyId, setBabyId] = useState<string | null>(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isAddingToPlan, setIsAddingToPlan] = useState(false);

  const FULL_DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    const fetchMeal = async () => {
      try {
        const data = await getMealById(mealId);
        setMeal(data);

        // Fetch similar
        const similarRes = await getMeals({ category: data.category || '', limit: 5 });
        const similarList = similarRes.meals || similarRes.data || similarRes;
        if (Array.isArray(similarList)) {
          setSimilarMeals(similarList.filter((m: any) => m._id !== mealId).slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load meal details", err);
        toast.error("Failed to load meal details.");
      } finally {
        setIsLoading(false);
      }
    };
    if (mealId) {
      fetchMeal();
    }
  }, [mealId]);

  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    const fetchBaby = async () => {
      try {
        const babyRes = await getBabies();
        const babies = babyRes.data || babyRes || [];
        if (babies.length > 0) {
          setBabyId(babies[0]._id);
        }
      } catch (err) {
        console.error("Failed to load baby profile");
      }
    };
    fetchBaby();
  }, [isAuthenticated, isAuthLoading]);

  const handleAddMealToPlan = async (day: string) => {
    if (!babyId) {
      toast.error('No baby profile found. Please add a baby first.');
      return;
    }
    setIsAddingToPlan(true);
    try {
      await addMealToSchedule(babyId, day, mealId);
      toast.success(`${meal?.name} added to ${day}'s plan!`);
      setShowPlanModal(false);
    } catch (error) {
      toast.error(`Failed to add meal to ${day}`);
    } finally {
      setIsAddingToPlan(false);
    }
  };

  const [activeImgIdx, setActiveImgIdx] = useState(0);

  const dispatch = useAppDispatch();
  const cartMap = useAppSelector((state: any) => state.cart.cartMap);
  const cartTotalCount = useAppSelector((state: any) => state.cart.totalCount);
  const cartQuantity = cartMap[mealId]?.qty || 0;

  const handleAddToCart = () => {
    if (!meal) return;
    dispatch(addToCartAsync({
      itemId: meal._id,
      itemType: "meal",
    }))
      .unwrap()
      .then(() => toast.success("Added to cart!"))
      .catch((err: any) => toast.error(err.message || "Failed to add to cart"));
  };

  const handleAddSimilarToCart = (e: any, m: Meal) => {
    if (e) e.stopPropagation();
    dispatch(addToCartAsync({
      itemId: m._id,
      itemType: "meal",
    }))
      .unwrap()
      .then(() => toast.success("Added to cart!"))
      .catch((err: any) => toast.error(err.message || "Failed to add to cart"));
  };

  const images: string[] = meal ? (meal.images && meal.images.length > 0 ? meal.images : (meal.imageUrl ? [meal.imageUrl] : [])) : [];

  const carouselRef = useRef<HTMLDivElement>(null);

  const handleThumbnailClick = (idx: number) => {
    setActiveImgIdx(idx);
    if (carouselRef.current) {
      const width = carouselRef.current.offsetWidth;
      carouselRef.current.scrollTo({ left: width * idx, behavior: 'smooth' });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollLeft = e.currentTarget.scrollLeft;
    const width = e.currentTarget.offsetWidth;
    const index = Math.round(scrollLeft / width);
    if (index !== activeImgIdx && index >= 0 && index < images.length) {
      setActiveImgIdx(index);
    }
  };

  if (isLoading || !meal) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
          <p className="text-gray-500 font-semibold animate-pulse">Loading meal details...</p>
        </div>
      </div>
    );
  }

  const isDiscounted = meal.discountedPrice && meal.discountedPrice < meal.price;
  const discountPercent = isDiscounted ? `${Math.round(((meal.price - meal.discountedPrice!) / meal.price) * 100)}% OFF` : "";

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative">

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 pt-4 pb-24 md:py-8">

        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">Back</h1>
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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center mb-2 -ml-3 md:ml-0"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="font-semibold text-[15px]">Back</span>
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 mt-0 md:mt-6">

          {/* Left Column - Product Image */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-4"
          >
            {/* Mobile Carousel (Native Smooth Scroll) */}
            <style>{`
              .hide-scroll::-webkit-scrollbar {
                display: none;
              }
              .hide-scroll {
                -ms-overflow-style: none;
                scrollbar-width: none;
              }
            `}</style>
            <div
              ref={carouselRef}
              className="md:hidden -mx-4 aspect-[4/3] flex overflow-x-auto snap-x snap-mandatory hide-scroll"
              onScroll={handleScroll}
            >
              {images.map((src: string, idx: number) => (
                <div key={idx} className="w-full h-full flex-shrink-0 snap-center relative bg-[#F8FAFC]">
                  {src ? (
                    <Image src={src} alt={meal.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <ShoppingCart className="w-10 h-10 mb-2 opacity-50" />
                      <span className="font-semibold text-xs">No Image</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Single Image View */}
            <div className="hidden md:flex h-auto aspect-[4/3] lg:aspect-square bg-[#F8FAFC] rounded-lg relative items-center justify-center overflow-hidden shadow-sm group">
              {images[activeImgIdx] ? (
                <Image src={images[activeImgIdx]} alt={meal.name} fill className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ShoppingCart className="w-12 h-12 mb-2 opacity-50" />
                  <span className="font-semibold text-sm">No Image</span>
                </div>
              )}
            </div>

            {/* Mobile Carousel Dots */}            {/* Mobile Carousel Dots */}
            {images.length > 1 && (
              <div className="md:hidden flex justify-center gap-1.5 mt-2 mb-1">
                {images.map((_, idx: number) => (
                  <div key={idx} className={`w-2 h-2 rounded-full transition-colors ${activeImgIdx === idx ? 'bg-[var(--color-primary)]' : 'bg-gray-300'}`} />
                ))}
              </div>
            )}

            {/* Thumbnail Placeholders */}
            {images.length > 1 && (
              <div className="flex gap-3 md:gap-4 overflow-x-auto hide-scroll pb-1">
                {images.map((imgSrc: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => handleThumbnailClick(idx)}
                    className={`w-16 h-16 md:w-20 md:h-20 shrink-0 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all relative overflow-hidden bg-[#F8FAFC] ${activeImgIdx === idx ? 'border-[var(--color-primary)] shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Image src={imgSrc} alt="thumbnail" fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right Column - Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col relative pb-8"
          >
            {/* Title & Reviews */}
            <div className="mb-3">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight">
                {meal.name}
              </h1>
            </div>

            {/* Ratings */}
            {meal.rating && (
              <div className="flex justify-between items-end mb-5 relative">
                <div className="flex items-center gap-1.5 bg-yellow-50 px-2.5 py-1 rounded-full border border-yellow-100">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-yellow-700">{meal.rating}</span>
                  {(meal.reviewsCount ?? 0) > 0 && (
                    <span className="text-xs font-medium text-yellow-600/70 ml-0.5">({meal.reviewsCount})</span>
                  )}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-6 flex items-end gap-2.5">
              {isDiscounted && (
                <span className="text-sm font-semibold text-gray-500 line-through mb-0.5">₹{meal.price}</span>
              )}
              <span className="text-2xl font-semibold text-gray-900">₹{meal.discountedPrice || meal.price}</span>
              {isDiscounted && (
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 mb-1">{discountPercent}</span>
              )}
            </div>

            {/* Additional Info */}
            <div className="mb-8 flex flex-wrap gap-2">
              {meal.category && (
                <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {meal.category}
                </span>
              )}
              {meal.suitableForAgeGroup && (
                <span className="bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {meal.suitableForAgeGroup}
                </span>
              )}
              {meal.tags && meal.tags.map((tag: string, i: number) => (
                <span key={i} className="bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                  {tag}
                </span>
              ))}
            </div>

            {/* Allergens Warning */}
            {meal.allergens && meal.allergens.length > 0 && (
              <div className="mb-8">
                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-start gap-3">
                  <div className="mt-0.5">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-red-800 mb-1">Contains Allergens</h4>
                    <div className="flex flex-wrap gap-2">
                      {meal.allergens.map((allergen: string, i: number) => (
                        <span key={i} className="text-[11px] font-semibold text-red-700 bg-red-100/50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          {allergen}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Nutritional Information */}
            {meal.nutritionalInfo && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Nutritional Information</h3>
                <div className="flex items-center justify-between py-4 px-2 border-y border-gray-100">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-1">Calories</span>
                    <span className="font-semibold text-gray-900 text-base leading-none">{meal.nutritionalInfo.calories} <span className="text-[10px] font-normal text-gray-500">kcal</span></span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-1">Protein</span>
                    <span className="font-semibold text-gray-900 text-base leading-none">{meal.nutritionalInfo.protein}<span className="text-[10px] font-normal text-gray-500">g</span></span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-1">Carbs</span>
                    <span className="font-semibold text-gray-900 text-base leading-none">{meal.nutritionalInfo.carbs}<span className="text-[10px] font-normal text-gray-500">g</span></span>
                  </div>
                  <div className="w-px h-8 bg-gray-200"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest mb-1">Fat</span>
                    <span className="font-semibold text-gray-900 text-base leading-none">{meal.nutritionalInfo.fat}<span className="text-[10px] font-normal text-gray-500">g</span></span>
                  </div>
                </div>
              </div>
            )}

            {/* Ingredients */}
            {meal.ingredients && meal.ingredients.length > 0 && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Ingredients</h3>
                <div className="flex flex-wrap gap-2">
                  {meal.ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                      <span className="text-sm text-gray-700 font-medium">{ing}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description (A+ Content) */}
            {meal.description && (
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Meal Description</h3>
                <div
                  className="prose prose-sm md:prose-base max-w-none text-gray-600 font-medium break-words prose-p:break-words overflow-hidden prose-img:hidden prose-headings:font-semibold prose-headings:text-gray-900 prose-a:text-[var(--color-primary)]"
                  dangerouslySetInnerHTML={{ __html: meal.description }}
                />
              </div>
            )}



            {/* Reviews */}
            {meal && <ReviewSection targetId={meal._id} targetType="meal" />}

            {/* Action Bar */}
            <div className="mt-auto bg-white p-3 lg:py-4 fixed bottom-0 left-0 w-full lg:sticky lg:bottom-0 z-40 flex gap-3 pb-safe border-t lg:border-t-0 border-gray-100">

              {/* Add to Plan Button */}
              <button
                onClick={() => setShowPlanModal(true)}
                className="flex-1 h-12 md:h-14 bg-white border border-[var(--color-primary)] text-[var(--color-primary)] font-semibold text-sm md:text-base rounded-2xl hover:bg-[var(--color-primary)]/5 transition-all duration-300 flex items-center justify-center gap-2 group/plan"
              >
                <Calendar className="w-4 h-4 md:w-5 md:h-5 group-hover/plan:scale-110 transition-transform" />
                Add to Plan
              </button>

              {/* Add to Cart Button */}
              {meal.inStock ? (
                cartQuantity > 0 ? (
                  <div
                    onClick={() => router.push('/shop/cart')}
                    className="flex-1 h-12 md:h-14 bg-[var(--color-primary)] text-white font-semibold rounded-2xl flex items-center justify-center cursor-pointer hover:bg-[#527d89] transition-colors"
                  >
                    <span className="tracking-wide font-semibold text-sm md:text-base">{cartQuantity} in cart</span>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 h-12 md:h-14 bg-[var(--color-primary)] text-white font-semibold text-sm md:text-base rounded-2xl hover:bg-[#527d89] hover:shadow-md transition-all duration-300 flex items-center justify-center gap-2 group/btn"
                  >
                    <ShoppingCart className="w-4 h-4 md:w-5 md:h-5 group-hover/btn:scale-110 transition-transform" />
                    Add to Cart
                  </button>
                )
              ) : (
                <button
                  disabled
                  className="flex-1 h-12 md:h-14 bg-gray-100 text-gray-400 font-semibold text-sm md:text-base rounded-2xl flex items-center justify-center gap-2 cursor-not-allowed border border-gray-200"
                >
                  Out of Stock
                </button>
              )}
            </div>

          </motion.div>
        </div>

      </main>

      {/* Similar Meals - Separate Section */}
      {similarMeals.length > 0 && (
        <div className="bg-white py-12 px-4 md:px-8 pb-28 lg:pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900 text-xl md:text-2xl">Similar Meals</h3>
              <button
                onClick={() => router.push('/nutrition/meal-plans')}
                className="text-[var(--color-primary)] font-semibold text-sm hover:underline"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {similarMeals.map((sm) => (
                <MealCard
                  key={sm._id}
                  meal={sm}
                  cartQuantity={cartMap[sm._id]?.qty || 0}
                  onAddToCart={(e) => handleAddSimilarToCart(e, sm)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Select Day Modal */}
      <AnimatePresence>
        {showPlanModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPlanModal(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Select Day</h3>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">Add this meal to baby's schedule</p>
                </div>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 max-h-[60vh] overflow-y-auto">
                {isAddingToPlan ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3">
                    <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
                    <p className="text-sm font-semibold text-gray-600">Updating plan...</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {FULL_DAY_NAMES.map((day) => (
                      <button
                        key={day}
                        onClick={() => handleAddMealToPlan(day)}
                        className="w-full flex items-center justify-between p-3.5 rounded-xl hover:bg-[var(--color-primary)]/5 border border-transparent hover:border-[var(--color-primary)]/20 transition-all text-left group"
                      >
                        <span className="font-semibold text-gray-700 group-hover:text-[var(--color-primary)]">{day}</span>
                        <div className="w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center group-hover:border-[var(--color-primary)] group-hover:bg-[var(--color-primary)] transition-all">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white opacity-0 group-hover:opacity-100" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
