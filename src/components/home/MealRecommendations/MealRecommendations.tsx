"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { ChevronRight, Flame, ShoppingCart, Utensils, Heart } from "lucide-react";
import { getMeals, getRecommendedMeals, Meal } from "@/lib/api/mealsApi";
import { getBabies } from "@/lib/api/babiesApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToCartAsync } from "@/store/slices/cartSlice";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { MealCard } from "@/components/nutrition/MealCard";
import { useAuth } from "@/context/AuthContext";

export function MealRecommendations() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const cartMap = useAppSelector(state => state.cart.cartMap);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        if (isAuthenticated) {
          try {
            const babies = await getBabies();
            if (babies && babies.length > 0) {
              const recommended = await getRecommendedMeals(babies[0]._id);
              if (recommended && recommended.length > 0) {
                setMeals(recommended);
                return;
              }
            }
          } catch (e: any) {
            // Ignore 401s silently if token is invalid or just cleared
            if (e?.response?.status !== 401) {
              console.error("Failed to fetch babies/recommended:", e);
            }
          }
        }
        
        // Fallback to popular meals if not authenticated or no babies
        const res = await getMeals({ limit: 5 });
        setMeals(Array.isArray(res.data) ? res.data : res);
      } catch (error) {
        console.error("Failed to fetch meals:", error);
      }
    };
    fetchMeals();
  }, [isAuthenticated]);

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
    } catch { 
      toast.error('Failed to add to cart');
    }
  };

  const handleCardClick = (mealId: string) => {
    router.push(`/nutrition/meal-plans/${mealId}`);
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] } }
  };

  return (
    <section>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8 gap-2">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-black leading-tight">Nutritious Meals</h2>
          <p className="text-sm text-gray-500 mt-2 hidden md:block font-light">Healthy and tasty food options for your baby.</p>
        </div>
        <Link href="/nutrition/meal-plans" className="text-[11px] md:text-sm font-semibold md:font-medium text-[var(--color-primary)] flex items-center gap-1 group shrink-0 whitespace-nowrap">
          <span className="relative pb-0.5">
            View All
            <span className="absolute bottom-0 left-0 w-full h-[1.5px] bg-[var(--color-primary)] origin-left scale-x-0 group-hover:scale-x-100 group-active:scale-x-0 transition-transform duration-300 ease-out rounded-full"></span>
          </span>
          <ChevronRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Meal Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="flex overflow-x-auto items-stretch snap-x snap-mandatory gap-2 md:gap-3 pb-4 px-4 -mx-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {meals.length === 0 ? (
          <div className="w-full text-center text-gray-400 font-medium py-10 col-span-full">No meals available at the moment.</div>
        ) : (
          meals.map((meal) => (
            <motion.div
              key={meal._id}
              variants={itemVariants}
              className="w-[45vw] min-w-[45vw] snap-center sm:w-full sm:min-w-full md:w-auto md:min-w-0 shrink-0"
            >
              <MealCard 
                meal={meal} 
                cartQuantity={cartMap[meal._id]?.qty || 0}
                onAddToCart={handleAddToCart}
                onClick={handleCardClick}
              />
            </motion.div>
          ))
        )}
      </motion.div>
    </section>
  );
}
