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
    <div
      className="bg-[#EEF2F7] rounded-md overflow-hidden flex flex-col group cursor-pointer transition-all duration-200 relative"
    >
      {/* ── Image — click here navigates to product ── */}
      <div
        onClick={() => router.push(`/shop/${product.id}`)}
        className="relative w-full h-44 md:h-52 bg-[#EEF2F7] overflow-hidden flex-shrink-0 cursor-pointer"
      >
        <Image
          src={product.img}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-[1.04] transition-transform duration-500 ease-out"
        />

        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Wishlist button — top right */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow backdrop-blur-sm transition-all duration-200 ${isWished ? "bg-rose-500" : "bg-white/80"}`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWished ? "fill-white text-white" : "text-gray-500"}`} />
        </button>

        {/* Discount badge — top left */}
        {product.discount && (
          <span className="absolute top-2.5 left-2.5 bg-[#F4A261] text-white text-[10px] font-semibold px-2 py-0.5 rounded-md shadow">
            {product.discount}
          </span>
        )}

        {/* Featured tag */}
        {product.tag && !product.discount && (
          <span className="absolute top-2.5 left-2.5 bg-[#8A84C8] text-white text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide shadow">
            {product.tag}
          </span>
        )}

        {/* Price pill — bottom left */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1">
          <span className="text-white text-[13px] font-black leading-none">{product.price}</span>
          {product.oldPrice && (
            <span className="text-white/60 text-[10px] line-through leading-none">{product.oldPrice}</span>
          )}
        </div>


      </div>

      {/* ── Content ── */}
      <div className="px-3 py-2.5 flex flex-col gap-2">
        <h4
          onClick={() => router.push(`/shop/${product.id}`)}
          className="text-[13px] font-semibold text-gray-900 line-clamp-1 group-hover:text-[#8A84C8] transition-colors leading-snug cursor-pointer"
        >
          {product.name}
        </h4>

        {/* Rating + Price row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-semibold text-gray-700">{product.rating}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-[#0F172A]">{product.price}</span>
            {product.oldPrice && (
              <span className="text-[10px] text-gray-400 line-through">{product.oldPrice}</span>
            )}
          </div>
        </div>

        {/* Add to Cart — stopPropagation here prevents card navigation */}
        <div onClick={(e) => e.stopPropagation()}>
          {cartQuantity > 0 ? (
            <div
              onClick={() => router.push(`/shop/cart`)}
              className="flex items-center justify-center bg-[#8A84C8] text-white rounded-lg px-2 py-1.5 cursor-pointer hover:bg-[#7a74b8] transition-colors"
            >
              <span className="text-xs font-semibold">{cartQuantity} in cart</span>
            </div>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onAddToCart?.(e); }}
              className="w-full flex items-center justify-center gap-1.5 bg-[#8A84C8] hover:bg-[#7a74b8] text-white text-[11px] font-semibold py-2 rounded-lg active:scale-95 transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

