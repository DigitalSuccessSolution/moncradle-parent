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
      className="bg-[#EEF2F7] rounded-md overflow-hidden flex flex-col group cursor-pointer transition-all duration-200 relative"
      onClick={handleCardClick}
    >
      {/* ── Image ── */}
      <div className="relative w-full h-44 md:h-52 bg-[#EEF2F7] overflow-hidden flex-shrink-0">
        {meal.imageUrl || (meal.images && meal.images.length > 0) ? (
          <Image 
            src={(meal.imageUrl || meal.images?.[0]) as string} 
            alt={meal.name} 
            fill 
            className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 group-hover:scale-[1.04] transition-transform duration-500 ease-out">
            <Utensils className="w-10 h-10 mb-2 opacity-50" />
            <span className="text-[10px] font-semibold">No Image</span>
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Wishlist button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow backdrop-blur-sm transition-all duration-200 ${isWished ? "bg-rose-500" : "bg-white/80"}`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWished ? "fill-white text-white" : "text-gray-500"}`} />
        </button>


        {/* Out of Stock or Discount Badge */}
        {!meal.inStock ? (
          <span className="absolute top-2.5 left-2.5 bg-gray-600 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow z-10">
            Out of Stock
          </span>
        ) : (meal.discountedPrice && meal.discountedPrice < meal.price) ? (
          <span className="absolute top-2.5 left-2.5 bg-[#F4A261] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow z-10">
            {Math.round(((meal.price - meal.discountedPrice) / meal.price) * 100)}% OFF
          </span>
        ) : null}

        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 z-10">
          <span className="text-white text-[13px] font-black leading-none">₹{meal.discountedPrice || meal.price}</span>
          {(meal.discountedPrice && meal.discountedPrice < meal.price) ? (
            <span className="text-white/60 text-[10px] line-through leading-none">₹{meal.price}</span>
          ) : null}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="px-3 py-2.5 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-[13px] font-semibold text-gray-900 line-clamp-1 group-hover:text-[#8A84C8] transition-colors leading-snug">
            {meal.name}
          </h4>
          {((meal as any).rating > 0) && (
            <div className="flex items-center gap-0.5 bg-yellow-50 px-1.5 py-0.5 rounded-full border border-yellow-100 flex-shrink-0">
              <Star className="w-2.5 h-2.5 text-yellow-500 fill-yellow-500" />
              <span className="text-[9px] font-bold text-yellow-700">{(meal as any).rating}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mt-auto mb-1">
          <div className="flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" />
            <span className="text-[11px] font-semibold text-gray-700">{meal.nutritionalInfo?.calories || 0} kcal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] font-semibold text-gray-700">{meal.nutritionalInfo?.protein || 0}g protein</span>
          </div>
        </div>

        <div onClick={(e) => e.stopPropagation()} className="mt-1 flex justify-center z-20 relative">
          {!meal.inStock ? (
            <div className="w-[85%] h-[36px] flex items-center justify-center bg-gray-100 text-gray-500 text-[11px] font-semibold rounded-2xl border border-gray-200">
              Out of Stock
            </div>
          ) : cartQuantity > 0 ? (
            <div
              onClick={() => router.push(`/shop/cart`)}
              className="w-[85%] h-[36px] flex items-center justify-center bg-[#8A84C8] text-white rounded-2xl cursor-pointer hover:bg-[#7a74b8] transition-colors"
            >
              <span className="text-[11px] font-semibold">{cartQuantity} in cart</span>
            </div>
          ) : (
            <button
              onClick={(e) => onAddToCart?.(e, meal)}
              className="w-[85%] h-[36px] flex items-center justify-center gap-1.5 bg-[#8A84C8] hover:bg-[#7a74b8] text-white text-[11px] font-semibold rounded-2xl active:scale-95 transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
