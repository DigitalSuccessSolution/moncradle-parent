"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { ProductCard } from "@/components/shop/ProductCard";
import { MealCard } from "@/components/nutrition/MealCard";
import { getProductById, Product } from "@/lib/api/productsApi";
import { getMealById, Meal } from "@/lib/api/mealsApi";
import { HeartCrack, Loader2, ChevronLeft, Heart, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { addToCartAsync, removeFromCartAsync, updateCartQuantityAsync } from "@/store/slices/cartSlice";
import { removeFromWishlistAsync } from "@/store/slices/wishlistSlice";

export default function WishlistPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector(state => state.wishlist.items);
  const cartMap = useAppSelector(state => state.cart.cartMap);
  const cartTotalCount = useAppSelector(state => state.cart.totalCount);
  const [products, setProducts] = useState<any[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!initialLoadDone) setLoading(true);
      try {
        const productPromises = wishlistItems
          .filter(item => item.itemType === 'product')
          .map(item => getProductById(item.itemId).then((res: any) => res?.data || res).catch(() => null));
          
        const mealPromises = wishlistItems
          .filter(item => item.itemType === 'meal')
          .map(item => getMealById(item.itemId).then((res: any) => res?.data || res).catch(() => null));

        const fetchedProducts = await Promise.all(productPromises);
        const fetchedMeals = await Promise.all(mealPromises);

        setProducts(fetchedProducts.filter(Boolean).map((p: any) => ({
          id: p._id,
          name: p.name,
          oldPrice: p.discountedPrice && p.discountedPrice < p.price ? `₹${p.price}` : "",
          price: `₹${p.discountedPrice || p.price}`,
          discount: p.discountedPrice && p.discountedPrice < p.price ? `${Math.round(((p.price - p.discountedPrice) / p.price) * 100)}% OFF` : "",
          tag: p.isFeatured ? "Featured" : "",
          img: p.images && p.images.length > 0 ? p.images[0] : (p.imageUrl || ""),
          rating: p.rating || 4.5,
          reviews: p.numReviews || 0
        })));
        
        setMeals(fetchedMeals.filter(Boolean));
      } catch (err) {
        console.error("Failed to load wishlist details", err);
      } finally {
        setLoading(false);
        setInitialLoadDone(true);
      }
    };

    fetchDetails();
  }, [wishlistItems]);

  const handleAddToCart = async (productId: string) => {
    try {
      await dispatch(addToCartAsync({ itemId: productId, itemType: "product" })).unwrap();
    } catch { /* ignore */ }
  };

  const handleAddToCartMeal = async (e: React.MouseEvent, meal: Meal) => {
    e.stopPropagation();
    try {
      await dispatch(addToCartAsync({ itemId: meal._id, itemType: "meal" })).unwrap();
    } catch { /* ignore */ }
  };
  
  const handleIncrement = async (productId: string) => {
    const entry = cartMap[productId];
    if (!entry) { handleAddToCart(productId); return; }
    try {
      await dispatch(updateCartQuantityAsync({ cartItemId: entry.cartItemId, quantity: entry.qty + 1 })).unwrap();
    } catch {}
  };

  const handleDecrement = async (productId: string) => {
    const entry = cartMap[productId];
    if (!entry) return;
    try {
      if (entry.qty <= 1) {
        await dispatch(removeFromCartAsync(entry.cartItemId)).unwrap();
      } else {
        await dispatch(updateCartQuantityAsync({ cartItemId: entry.cartItemId, quantity: entry.qty - 1 })).unwrap();
      }
    } catch {}
  };

  const handleRemoveMeal = async (e: React.MouseEvent, mealId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await dispatch(removeFromWishlistAsync(mealId)).unwrap();
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative">
            
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">
        
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">My Wishlist</h1>
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
        <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 px-1">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">My Wishlist</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Your curated collection of favorite products and meals.</p>
          </div>
          <div className="bg-[var(--pastel-purple)]/10 text-[var(--pastel-purple)] px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 border shadow-sm" style={{ borderColor: 'var(--pastel-purple)' }}>
            <Heart className="w-4 h-4 fill-current" /> {wishlistItems.length} {wishlistItems.length === 1 ? 'Item' : 'Items'}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
             <div className="w-8 h-8 border-4 border-gray-100 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
          </div>
        ) : wishlistItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-100">
             <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <HeartCrack className="w-8 h-8 text-rose-300" />
             </div>
             <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
             <p className="text-gray-500 font-medium max-w-md mx-auto mb-6">Explore our collections and find something you love.</p>
             <div className="flex justify-center gap-3">
               <Link href="/shop" className="bg-[var(--color-primary)] hover:opacity-90 text-white font-semibold py-2.5 px-6 rounded-md text-sm transition-opacity">
                 Explore Shop
               </Link>
             </div>
          </div>
        ) : (
          <div className="space-y-10">
            {products.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 px-1">Saved Products</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {products.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      cartQuantity={cartMap[product.id]?.qty || 0}
                      onAddToCart={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
                      onIncrement={(e) => { e.stopPropagation(); handleIncrement(product.id); }}
                      onDecrement={(e) => { e.stopPropagation(); handleDecrement(product.id); }}
                    />
                  ))}
                </div>
              </section>
            )}

            {meals.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 px-1">Saved Meals</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                  {meals.map((meal) => (
                    <MealCard 
                      key={meal._id}
                      meal={meal}
                      cartQuantity={cartMap[meal._id]?.qty || 0}
                      onAddToCart={handleAddToCartMeal}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      
          </div>
  );
}
