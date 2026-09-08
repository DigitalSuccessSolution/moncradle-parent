import Image from "next/image";
import { ShoppingCart, Flame, Utensils, Heart, Star } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { Meal } from "@/lib/api/mealsApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToWishlistAsync, removeFromWishlistAsync } from "@/store/slices/wishlistSlice";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export interface MealCardProps {
  meal: Meal;
  variants?: Variants;
  cartQuantity?: number;
  onAddToCart?: (e: React.MouseEvent, meal: Meal) => void;
  onClick?: (mealId: string) => void;
}

export function MealCard({
  meal,
  variants,
  cartQuantity = 0,
  onAddToCart,
  onClick
}: MealCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const isWished = wishlistItems.some(item => item.itemId === meal._id && item.itemType === 'meal');

  const { isAuthenticated } = useAuth();

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast("Please login to add to wishlist", { icon: "🔒" });
      router.push("/login");
      return;
    }
    try {
      if (isWished) {
        await dispatch(removeFromWishlistAsync(meal._id)).unwrap();
        toast.success(`${meal.name} removed from wishlist`);
      } else {
        await dispatch(addToWishlistAsync({ itemId: meal._id, itemType: 'meal' })).unwrap();
        toast.success(`${meal.name} added to wishlist`);
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(meal._id);
    } else {
      router.push(`/nutrition/meal-plans/${meal._id}`);
    }
  };

  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md overflow-hidden flex flex-col group cursor-pointer transition-all duration-300 relative h-full"
      onClick={handleCardClick}
    >
      {/* ── Image Container ── */}
      <div className="relative w-full h-36 sm:h-44 md:h-48 bg-slate-50 overflow-hidden flex-shrink-0">
        {meal.imageUrl || (meal.images && meal.images.length > 0) ? (
          <Image
            src={(meal.imageUrl || meal.images?.[0]) as string}
            alt={meal.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-orange-50/40 to-slate-50 text-slate-300 group-hover:scale-105 transition-transform duration-500 ease-out">
            <Utensils className="w-7 h-7 sm:w-8 sm:h-8 mb-1 text-orange-400/60" />
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-400">Fresh Puree</span>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          aria-label="Wishlist"
          className={`absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xs backdrop-blur-md transition-all duration-200 active:scale-90 ${isWished ? "bg-rose-500 text-white" : "bg-white/90 text-gray-600 hover:bg-white"}`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWished ? "fill-white" : ""}`} />
        </button>

        {/* Out of Stock or Discount Badge */}
        {!meal.inStock ? (
          <span className="absolute top-2.5 left-2.5 bg-slate-800/90 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs z-10">
            Out of Stock
          </span>
        ) : (meal.discountedPrice && meal.discountedPrice < meal.price) ? (
          <span className="absolute top-2.5 left-2.5 bg-orange-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs z-10">
            {Math.round(((meal.price - meal.discountedPrice) / meal.price) * 100)}% OFF
          </span>
        ) : null}
      </div>

      {/* ── Card Content ── */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 gap-1.5">
        <div>
          <div className="flex items-start justify-between gap-1 mb-0.5">
            <h4
              className="text-xs sm:text-[13px] font-normal text-black line-clamp-2 min-h-[2.4em] group-hover:text-[var(--color-primary)] transition-colors leading-tight sm:leading-snug"
              title={meal.name}
            >
              {meal.name}
            </h4>
            {((meal as any).rating > 0) && (
              <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-100/60 shrink-0">
                <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                <span className="text-[9px] font-medium text-amber-700">{(meal as any).rating}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-light text-gray-500 mb-1">
            <div className="flex items-center gap-1 truncate">
              <Flame className="w-3 h-3 text-orange-500 shrink-0" />
              <span>{meal.nutritionalInfo?.calories || 0} kcal</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{meal.nutritionalInfo?.protein || 0}g protein</span>
            </div>
          </div>

          {/* Price row */}
          <div className="flex items-baseline gap-1 pt-1 border-t border-gray-100/60">
            <span className="text-xs sm:text-sm font-semibold text-black">₹{meal.discountedPrice || meal.price}</span>
            {(meal.discountedPrice && meal.discountedPrice < meal.price) ? (
              <span className="text-[10px] sm:text-[11px] text-gray-400 line-through font-light">₹{meal.price}</span>
            ) : null}
          </div>
        </div>

        {/* Action Button */}
        <div onClick={(e) => e.stopPropagation()} className="pt-0.5 z-10 relative">
          {!meal.inStock ? (
            <div className="w-full py-1.5 flex items-center justify-center bg-gray-100 text-gray-400 text-xs font-normal rounded-xl">
              Out of Stock
            </div>
          ) : cartQuantity > 0 ? (
            <div
              onClick={() => router.push(`/shop/cart`)}
              className="w-full py-1.5 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl cursor-pointer transition-colors shadow-2xs"
            >
              <span className="text-xs font-semibold">{cartQuantity} in cart ✓</span>
            </div>
          ) : (
            <button
              onClick={(e) => onAddToCart?.(e, meal)}
              className="w-full py-1.5 sm:py-2 flex items-center justify-center gap-1.5 bg-[var(--color-primary)] hover:brightness-95 text-white text-xs sm:text-sm font-medium rounded-xl active:scale-95 transition-all shadow-2xs cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Add to Cart</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
