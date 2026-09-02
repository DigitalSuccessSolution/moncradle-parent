"use client";

import { ChevronLeft, Trash2, ShieldCheck, ShoppingCart, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateCartQuantityAsync, removeFromCartAsync } from "@/store/slices/cartSlice";
import { CartItem } from "@/lib/api/cartApi";

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items: cartItems, status: cartStatus, error, totalCount: cartTotalCount } = useAppSelector(state => state.cart);

  const isLoading = cartStatus === 'loading';
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const updateQuantity = async (cartItemId: string, newQty: number) => {
    if (newQty < 1) { setItemToDelete(cartItemId); return; }
    setUpdatingId(cartItemId);
    try {
      await dispatch(updateCartQuantityAsync({ cartItemId, quantity: newQty })).unwrap();
    } catch { }
    finally { setUpdatingId(null); }
  };

  const confirmRemoveItem = async () => {
    if (!itemToDelete) return;
    setUpdatingId(itemToDelete);
    try {
      await dispatch(removeFromCartAsync(itemToDelete)).unwrap();
    } catch { }
    finally { setUpdatingId(null); setItemToDelete(null); }
  };

  const getItemName = (item: CartItem) =>
    item.productId?.name || item.mealId?.name || "Product";

  const getItemImg = (item: CartItem) =>
    item.productId?.imageUrl || item.mealId?.imageUrl || "";

  const getItemPrice = (item: CartItem) => item.priceAtAddition;

  const subtotal = cartItems.reduce((acc, item) => acc + getItemPrice(item) * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
          <p className="text-gray-500 text-sm font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans flex flex-col">

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">My Cart</h1>
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
            <h1 className="text-2xl md:text-3xl font-medium text-gray-900">My Cart</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Review your items and proceed to checkout.</p>
          </div>
          <div className="bg-[var(--pastel-orange)]/10 text-[var(--pastel-orange)] px-4 py-2 rounded-xl font-medium text-sm flex items-center gap-2 border shadow-sm" style={{ borderColor: 'var(--pastel-orange)' }}>
            <ShoppingCart className="w-4 h-4 fill-current" /> {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 font-medium max-w-md mx-auto mb-6">Discover our premium collection of essentials for your baby!</p>
            <div className="flex justify-center gap-3">
              <Link href="/shop" className="bg-[var(--color-primary)] hover:opacity-90 text-white font-medium py-2.5 px-6 rounded-md text-sm transition-opacity">
                Explore Shop
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">

            {/* Left: Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {cartItems.map((item) => (
                  <motion.div
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`bg-white p-3 pr-4 rounded-xl border border-gray-100 shadow-sm flex gap-4 items-stretch relative group transition-opacity ${updatingId === item._id ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {/* Image */}
                    <Link href={item.productId?._id ? `/shop/${item.productId._id}` : (item.mealId?._id ? `/nutrition/meal-plans/${item.mealId._id}` : "#")} className="flex-shrink-0">
                      <div className="w-24 md:w-28 relative h-full min-h-[96px] bg-gray-50 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center">
                        {getItemImg(item) ? (
                          <Image src={getItemImg(item)} alt={getItemName(item)} fill className="object-cover" />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400">
                            <ShoppingCart className="w-6 h-6 mb-1 opacity-50" />
                            <span className="text-[9px] font-semibold">No Image</span>
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex-1 flex flex-col min-w-0 py-1 md:py-2">
                      <div className="flex justify-between items-start gap-2">
                        <Link href={item.productId?._id ? `/shop/${item.productId._id}` : (item.mealId?._id ? `/nutrition/meal-plans/${item.mealId._id}` : "#")}>
                          <h3 className="text-[15px] md:text-base font-medium text-gray-900 leading-snug line-clamp-2 hover:text-[var(--color-primary)] transition-colors cursor-pointer pr-1">
                            {getItemName(item)}
                          </h3>
                        </Link>
                        <button
                          onClick={() => setItemToDelete(item._id)}
                          className="flex text-gray-400 hover:text-red-500 hover:bg-red-50 w-8 h-8 rounded-full items-center justify-center transition-colors flex-shrink-0 -mr-2 md:mr-0"
                        >
                          <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                        </button>
                      </div>

                      <p className="text-xs text-gray-400 mt-1 font-medium">
                        ₹{getItemPrice(item)} each
                      </p>

                      {/* Subscription Badges */}
                      {item.isSubscription && (
                        <div className="mt-2 space-y-1">
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[10px] font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-2 py-0.5 rounded uppercase tracking-wider">
                              Subscription
                            </span>
                            {item.timeSlot && (
                              <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                                {item.timeSlot}
                              </span>
                            )}
                          </div>
                          {item.deliveryDates && item.deliveryDates.length > 0 && (
                            <p className="text-[11px] text-gray-500 font-medium line-clamp-1">
                              Dates: {item.deliveryDates.length} days selected
                            </p>
                          )}
                          {item.customizations && item.customizations.length > 0 && (
                            <p className="text-[11px] text-gray-500 font-medium line-clamp-1">
                              Custom: {item.customizations.join(', ')}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-auto pt-2">
                        <span className="text-base md:text-lg font-black text-[#122B54]">
                          ₹{getItemPrice(item) * item.quantity}
                        </span>

                        {/* Quantity control */}
                        <div className="flex items-center bg-gray-50 rounded-full border border-gray-100 p-0.5">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 font-medium hover:bg-white hover:text-[var(--color-primary)] rounded-full transition-all"
                          >-</button>
                          <span className="w-6 text-center font-medium text-gray-900 text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-gray-600 font-medium hover:bg-white hover:text-[var(--color-primary)] rounded-full transition-all"
                          >+</button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Free shipping banner */}
              {shipping === 0 ? (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                  <p className="text-sm font-semibold text-emerald-700">You get free shipping on this order! 🎉</p>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <p className="text-sm font-medium text-blue-700">Add ₹{500 - subtotal} more for free shipping</p>
                </div>
              )}
            </div>

            {/* Right: Order Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 lg:sticky lg:top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-5">Order Summary</h3>

              <div className="space-y-3 text-sm font-semibold text-gray-500 mb-5">
                <div className="flex justify-between"><span>Subtotal</span><span className="text-gray-900 font-medium">₹{subtotal}</span></div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="font-medium text-gray-900">{shipping === 0 ? <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded text-xs">Free</span> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between"><span>Tax</span><span className="text-gray-900 font-medium">₹0</span></div>
              </div>


              <div className="border-t border-dashed border-gray-200 mb-5" />

              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total</p>
                  <p className="text-[10px] text-gray-400">Incl. of all taxes</p>
                </div>
                <span className="text-3xl font-bold text-[#122B54]">₹{total}</span>
              </div>

              <Link href="/shop/checkout" className="group w-full bg-[var(--color-primary)] text-white py-3 rounded-xl font-medium text-sm flex items-center justify-center gap-2 hover:bg-[var(--color-primary-light)] transition-all shadow-md">
                Checkout Securely
                <ChevronLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

          </div>
        )}
      </main>


      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setItemToDelete(null)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Remove Item?</h3>
              <p className="text-center text-sm text-gray-500 mb-6">Are you sure you want to remove this item?</p>
              <div className="flex gap-3">
                <button onClick={() => setItemToDelete(null)} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium text-sm transition-colors">Cancel</button>
                <button onClick={confirmRemoveItem} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium text-sm shadow-md transition-colors">Yes, Remove</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
