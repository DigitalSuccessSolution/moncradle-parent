"use client";

import { Header } from "@/components/layout/Header/Header";
import { Footer } from "@/components/layout/Footer/Footer";
import { ArrowLeft, MapPin, Truck, CreditCard, Banknote, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

// Dummy data matching cart state conceptually
const cartItems = [
  { id: "prod-1", name: "Organic Baby Cerelac Trial Pack For New Born Baby (6-12 months)", size: "500g", price: 280, quantity: 1, img: "/images/meal_food.png" },
  { id: "prod-2", name: "Vitamin D3 Drops for new born baby 15ml D drop", size: "15ml", price: 290, quantity: 2, img: "/images/product_bottle.png" },
];

const addresses = [
  { id: "addr-1", type: "Home", name: "John Doe", phone: "+91 98765 43210", address: "A-123, Sunshine Apartments, Sector 45", city: "Gurugram", state: "Haryana", zip: "122003", isDefault: true }
];

const deliveryOptions = [
  { id: "standard", name: "Standard Delivery", time: "3-5 Business Days", price: 0 },
  { id: "express", name: "Express Delivery", time: "1-2 Business Days", price: 50 }
];

const paymentMethods = [
  { id: "upi", name: "UPI", desc: "Google Pay, PhonePe, Paytm", icon: Banknote },
  { id: "card", name: "Credit/Debit Card", desc: "Visa, Mastercard, RuPay", icon: CreditCard },
  { id: "cod", name: "Cash on Delivery", desc: "Pay when you receive", icon: Banknote }
];

export default function CheckoutPage() {
  const [activeDelivery, setActiveDelivery] = useState("standard");
  const [activePayment, setActivePayment] = useState("upi");

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = deliveryOptions.find(d => d.id === activeDelivery)?.price || 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/shop/cart" className="md:hidden text-gray-700 hover:text-[var(--color-primary)] transition-colors p-1 -ml-1">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">Checkout</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* 1. Delivery Address */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="bg-gray-100 text-gray-600 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm">1</span>
                  Delivery Address
                </h2>
                <button className="text-sm font-bold text-[var(--color-primary)] hover:text-[#527d89] transition-colors">
                  Add New
                </button>
              </div>

              <div className="space-y-4">
                {addresses.map((addr) => (
                  <div key={addr.id} className="relative p-4 md:p-5 rounded-xl border border-[var(--color-primary)] bg-gray-50/50 cursor-pointer flex gap-3 md:gap-4 transition-all">
                    <div className="pt-1 flex-shrink-0">
                      <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-primary)]" fill="currentColor" stroke="white" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900">{addr.name}</span>
                        <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-500 border border-gray-200 uppercase tracking-wider">{addr.type}</span>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed mb-2">
                        {addr.address}, {addr.city}, {addr.state} - {addr.zip}
                      </p>
                      <p className="text-sm font-semibold text-gray-800">{addr.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>

            {/* 2. Delivery Options */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100"
            >
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <span className="bg-gray-100 text-gray-600 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm">2</span>
                Delivery Method
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deliveryOptions.map((opt) => {
                  const isActive = activeDelivery === opt.id;
                  return (
                    <div 
                      key={opt.id}
                      onClick={() => setActiveDelivery(opt.id)}
                      className={`relative p-4 md:p-5 rounded-xl border cursor-pointer flex items-start gap-3 md:gap-4 transition-all duration-300 ${isActive ? 'border-[var(--color-primary)] bg-gray-50/50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
                    >
                      <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 mt-0.5 md:mt-1 flex-shrink-0 flex items-center justify-center transition-colors ${isActive ? 'border-[var(--color-primary)]' : 'border-gray-300'}`}>
                        {isActive && <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[var(--color-primary)]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="font-bold text-gray-900 truncate">{opt.name}</span>
                          <span className="font-extrabold text-[var(--color-primary)] flex-shrink-0">{opt.price === 0 ? 'FREE' : `₹${opt.price}`}</span>
                        </div>
                        <span className="text-sm text-gray-500 font-medium">{opt.time}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>

            {/* 3. Payment Method */}
            <motion.section 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100"
            >
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                <span className="bg-gray-100 text-gray-600 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm">3</span>
                Payment Method
              </h2>

              <div className="space-y-3">
                {paymentMethods.map((method) => {
                  const isActive = activePayment === method.id;
                  const Icon = method.icon;
                  return (
                    <div 
                      key={method.id}
                      onClick={() => setActivePayment(method.id)}
                      className={`relative p-4 md:p-5 rounded-xl border cursor-pointer flex items-center gap-3 md:gap-4 transition-all duration-300 ${isActive ? 'border-[var(--color-primary)] bg-gray-50/50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
                    >
                      <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isActive ? 'border-[var(--color-primary)]' : 'border-gray-300'}`}>
                        {isActive && <div className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-[var(--color-primary)]" />}
                      </div>
                      <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${isActive ? 'bg-white text-[var(--color-primary)] shadow-sm' : 'bg-gray-50 text-gray-400'}`}>
                        <Icon className="w-4 h-4 md:w-5 md:h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-gray-900 truncate">{method.name}</p>
                        <p className="text-xs text-gray-500 font-medium truncate">{method.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.section>

          </div>

          {/* Right Column: Order Summary */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 lg:sticky lg:top-24 overflow-hidden relative"
          >
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

            {/* Mini Cart Items */}
            <div className="space-y-4 mb-6 pb-6 border-b border-gray-100 border-dashed">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4 items-center">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-50 rounded-lg relative overflow-hidden flex-shrink-0 border border-gray-100">
                    <Image src={item.img} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-gray-900 text-sm">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm md:text-base">
                <span className="text-gray-500 font-medium">Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm md:text-base">
                <span className="text-gray-500 font-medium">Shipping</span>
                {shipping === 0 ? (
                  <span className="font-bold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded text-xs uppercase tracking-wider">FREE</span>
                ) : (
                  <span className="font-bold text-gray-900">₹{shipping}</span>
                )}
              </div>
              
              <div className="flex justify-between items-center text-sm md:text-base">
                <span className="text-gray-500 font-medium">Tax</span>
                <span className="font-bold text-gray-900">₹0</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 border-dashed border-2 mb-8">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-bold text-gray-500">Total</span>
                <span className="text-3xl font-black text-[#122B54] tracking-tight">₹{total}</span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium text-right">Incl. of all taxes</p>
            </div>

            <button className="group w-full bg-[#122B54] text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:bg-[#1e3c72] transition-all shadow-lg shadow-[#122B54]/20 active:scale-[0.98] duration-200">
              <Lock className="w-4 h-4 text-white/70" />
              Place Order
            </button>
            
            <p className="text-center text-[11px] text-gray-400 font-medium mt-4 flex items-center justify-center gap-1">
              By placing this order, you agree to our Terms.
            </p>

          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
