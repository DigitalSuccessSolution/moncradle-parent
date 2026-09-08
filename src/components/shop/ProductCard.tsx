import Image from "next/image";
import { Star, ShoppingCart, Plus, Minus, Heart } from "lucide-react";
import { motion, Variants } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addToWishlistAsync, removeFromWishlistAsync } from "@/store/slices/wishlistSlice";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: string;
    oldPrice?: string;
    discount?: string;
    tag?: string;
    img: string;
    rating: number;
    reviews: number;
    stockQuantity?: number;
  };
  variants?: Variants;
  cartQuantity?: number;
  onAddToCart?: (e: React.MouseEvent) => void;
  onIncrement?: (e: React.MouseEvent) => void;
  onDecrement?: (e: React.MouseEvent) => void;
}

export function ProductCard({
  product,
  variants,
  cartQuantity = 0,
  onAddToCart,
  onIncrement,
  onDecrement
}: ProductCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const isWished = wishlistItems.some(item => item.itemId === product.id && item.itemType === 'product');

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
        await dispatch(removeFromWishlistAsync(product.id)).unwrap();
        toast.success(`${product.name} removed from wishlist`);
      } else {
        await dispatch(addToWishlistAsync({ itemId: product.id, itemType: 'product' })).unwrap();
        toast.success(`${product.name} added to wishlist`);
      }
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <motion.div
      variants={variants}
      className="bg-white rounded-2xl border border-gray-100 shadow-xs hover:shadow-md overflow-hidden flex flex-col group cursor-pointer transition-all duration-300 relative h-full"
    >
      {/* ── Image — click here navigates to product ── */}
      <div
        onClick={() => router.push(`/shop/${product.id}`)}
        className="relative w-full h-36 sm:h-44 md:h-48 bg-slate-50 overflow-hidden flex-shrink-0 cursor-pointer"
      >
        {product.img ? (
          <Image
            src={product.img}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-purple-50/40 to-slate-50 text-slate-300 group-hover:scale-105 transition-transform duration-500 ease-out">
            <ShoppingCart className="w-7 h-7 sm:w-8 sm:h-8 mb-1 text-[var(--color-primary)]/40" />
            <span className="text-[10px] sm:text-[11px] font-medium text-gray-400">Baby Essential</span>
          </div>
        )}

        {/* Wishlist button — top right */}
        <button
          onClick={handleWishlistToggle}
          aria-label="Wishlist"
          className={`absolute top-2.5 right-2.5 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-xs backdrop-blur-md transition-all duration-200 active:scale-90 ${isWished ? "bg-rose-500 text-white" : "bg-white/90 text-gray-600 hover:bg-white"}`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWished ? "fill-white" : ""}`} />
        </button>

        {/* Discount badge — top left */}
        {product.discount && (
          <span className="absolute top-2.5 left-2.5 bg-orange-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full shadow-xs">
            {product.discount}
          </span>
        )}

        {/* Featured tag */}
        {product.tag && !product.discount && (
          <span className="absolute top-2.5 left-2.5 bg-[var(--color-primary)] text-white text-[9px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
            {product.tag}
          </span>
        )}
      </div>

      {/* ── Card Content ── */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 gap-1.5">
        <div>
          {/* Rating (if available) */}
          {product.rating ? (
            <div className="flex items-center gap-1 mb-0.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span className="text-[11px] font-medium text-gray-700">{product.rating}</span>
              {product.reviews > 0 && (
                <span className="text-[10px] text-gray-400 font-light">({product.reviews})</span>
              )}
            </div>
          ) : null}

          <h4
            onClick={() => router.push(`/shop/${product.id}`)}
            className="text-xs sm:text-[13px] font-normal text-black line-clamp-2 group-hover:text-[var(--color-primary)] transition-colors leading-tight sm:leading-snug cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h4>

          {/* Price row */}
          <div className="flex items-baseline gap-1 mt-1 pt-1 border-t border-gray-100/60">
            <span className="text-xs sm:text-sm font-semibold text-black">{product.price}</span>
            {product.oldPrice && (
              <span className="text-[10px] sm:text-[11px] text-gray-400 font-light line-through">{product.oldPrice}</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div onClick={(e) => e.stopPropagation()} className="pt-0.5 z-10 relative">
          {product.stockQuantity === 0 ? (
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
              onClick={(e) => { e.stopPropagation(); onAddToCart?.(e); }}
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

