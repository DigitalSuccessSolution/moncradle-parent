"use client";

import { Header } from "@/components/layout/Header/Header";
import { Footer } from "@/components/layout/Footer/Footer";
import { ArrowLeft, Trash2, ShieldCheck, ShoppingCart, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([
    {
      id: "prod-1",
      name: "Organic Baby Cerelac",
      size: "500g",
      price: 280,
      quantity: 1,
      img: "/images/meal_food.png",
    },
    {
      id: "prod-2",
      name: "Vitamin D3 Drops",
      size: "15ml",
      price: 290,
      quantity: 2,
      img: "/images/product_bottle.png",
    }
  ]);

  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    setItemToDelete(id);
  };

  const confirmRemoveItem = () => {
    if (itemToDelete) {
      setCartItems(prev => prev.filter(item => item.id !== itemToDelete));
      setItemToDelete(null);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 500 ? 0 : 50;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans flex flex-col">
      <Header />

      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/shop" className="md:hidden text-gray-700 hover:text-[var(--color-primary)] transition-colors p-1 -ml-1">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">Cart</h1>
          <span className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] px-3 py-1 rounded-lg text-sm font-bold ml-2">
            {cartItems.length} Items
          </span>
        </div>

        {cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-12 md:p-20 flex flex-col items-center justify-center border border-gray-100 shadow-sm text-center relative overflow-hidden"
          >
            {/* Decorative background blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[var(--color-primary)]/5 rounded-full blur-3xl" />
              <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <motion.div
              initial={{ y: 0 }}
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-40 h-40 bg-gradient-to-tr from-[var(--color-primary)]/20 to-blue-500/10 rounded-full flex items-center justify-center mb-8 relative"
            >
              <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                <ShoppingCart className="w-10 h-10 text-[var(--color-primary)]" />
              </div>
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 tracking-tight">Your Cart is Empty</h2>
            <p className="text-gray-500 mb-10 max-w-md text-lg leading-relaxed">
              Looks like you haven't added anything to your cart yet. Discover our premium collection of essentials for your baby!
            </p>

            <Link href="/shop" className="bg-[var(--color-primary)] text-white px-10 py-4 rounded-lg font-extrabold text-lg hover:bg-[var(--color-primary-light)] transition-all shadow-xl shadow-[var(--color-primary)]/25 active:scale-95 group flex items-center gap-3">
              Explore the Shop
              <ArrowLeft className="w-5 h-5 rotate-180 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">

            {/* Left Column: Cart Items & Free Shipping Banner */}
            <div className="lg:col-span-2 space-y-6">

              {/* Items List */}
              <div className="space-y-4">
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-2.5 md:p-3 pr-4 md:pr-5 rounded-lg border border-gray-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.1)] transition-all duration-300 flex gap-4 md:gap-5 items-stretch relative group"
                    >
                      {/* Item Image */}
                      <Link href={`/shop/${item.id}`} className="w-24 md:w-32 relative flex-shrink-0 cursor-pointer block group-hover:scale-105 transition-transform duration-300 bg-gray-50/50 rounded-lg overflow-hidden">
                        <Image src={item.img} alt={item.name} fill className="object-cover" />
                      </Link>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col min-w-0 h-full py-3 md:py-4">
                        <div className="flex justify-between items-start gap-2 md:gap-4 pr-8 md:pr-0">
                          <Link href={`/shop/${item.id}`} className="text-base md:text-xl font-bold text-gray-900 hover:text-[var(--color-primary)] transition-colors leading-tight truncate md:whitespace-normal">
                            {item.name}
                          </Link>
                          {/* Desktop Remove Button */}
                          <button
                            onClick={() => removeItem(item.id)}
                            className="hidden md:flex text-gray-500 hover:text-red-500 hover:bg-red-50 w-9 h-9 rounded-full items-center justify-center transition-colors flex-shrink-0 border border-transparent hover:border-red-100"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] md:text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">{item.size}</p>

                        <div className="flex items-center justify-between mt-auto">
                          <span className="text-base md:text-xl font-extrabold text-[#122B54]">₹{item.price}</span>

                          {/* Quantity Pill */}
                          <div className="flex items-center bg-gray-50/80 backdrop-blur-md rounded-full p-0.5 border border-gray-200/80">
                            <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-gray-600 font-bold hover:bg-white hover:text-[var(--color-primary)] hover:shadow-sm rounded-full transition-all">-</button>
                            <span className="w-6 md:w-8 text-center font-bold text-gray-900 text-xs md:text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-gray-600 font-bold hover:bg-white hover:text-[var(--color-primary)] hover:shadow-sm rounded-full transition-all">+</button>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Remove Button (Absolute) */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="md:hidden absolute top-3 right-3 text-gray-500 hover:text-red-500 hover:bg-red-50 w-7 h-7 rounded-full flex items-center justify-center transition-colors z-10"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/30 p-6 lg:p-8 lg:sticky lg:top-24 overflow-hidden relative">
              <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight">Order Summary</h3>

              <div className="space-y-4 text-sm font-semibold text-gray-500 mb-6">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-bold text-gray-900 text-base">₹{subtotal}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Shipping Estimate</span>
                  <span className="font-bold text-gray-900 text-base">{shipping === 0 ? <span className="text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 text-xs uppercase tracking-wider">Free</span> : `₹${shipping}`}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tax</span>
                  <span className="font-bold text-gray-900 text-base">₹0</span>
                </div>
              </div>

              {/* Promo Code Input */}
              <div className="mb-6 flex gap-2">
                <input
                  type="text"
                  placeholder="Promo code"
                  className="flex-1 min-w-0 w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 text-sm font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium outline-none focus:border-[var(--color-primary)] focus:bg-white transition-colors shadow-inner"
                />
                <button className="bg-gray-900 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-gray-800 transition-colors shadow-md flex-shrink-0">
                  Apply
                </button>
              </div>

              <div className="w-full border-t-2 border-dashed border-gray-100 mb-6" />

              <div className="flex justify-between items-end mb-8">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-500">Total</span>
                  <span className="text-[10px] text-gray-400 font-medium">Incl. of all taxes</span>
                </div>
                <span className="text-3xl lg:text-4xl font-black text-[#122B54] tracking-tight">₹{total}</span>
              </div>

              <Link href="/shop/checkout" className="group w-full bg-[var(--color-primary)] text-white py-3 rounded-lg font-bold text-base flex items-center justify-center gap-2 hover:bg-[var(--color-primary-light)] transition-all shadow-lg shadow-[var(--color-primary)]/20 active:scale-[0.98] duration-200">
                Checkout Securely
                <ArrowLeft className="w-4 h-4 rotate-180 group-hover:translate-x-1.5 transition-transform duration-300" />
              </Link>
            </div>

          </div>
        )}
      </main>

      <Footer />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {itemToDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setItemToDelete(null)}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-lg w-full max-w-sm p-6 shadow-2xl overflow-hidden"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Remove Item?</h3>
              <p className="text-center text-sm text-gray-500 mb-8 px-2">
                Are you sure you want to remove this item from your cart?
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setItemToDelete(null)}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveItem}
                  className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold shadow-lg shadow-red-500/30 transition-colors"
                >
                  Yes, Remove
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
