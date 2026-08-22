"use client";



import { MapPin, Plus, CheckCircle2, ChevronLeft, Wallet, CreditCard, Banknote, Edit2, ShieldCheck, Tag, ShoppingCart, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCartAsync } from "@/store/slices/cartSlice";
import { useEffect } from "react";
import { createOrder, OrderItem } from "@/lib/api/ordersApi";
import { applyCoupon } from "@/lib/api/couponApi";
import { clearCart } from "@/lib/api/cartApi";
import { useRouter } from "next/navigation";
import { getAddresses, Address } from "@/lib/api/addressesApi";
import { useAuth } from "@/context/AuthContext";
import { AddressModal } from "@/components/AddressModal";

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
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items: cartItems, subtotal } = useAppSelector(state => state.cart);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  useEffect(() => {
    dispatch(fetchCartAsync());
    fetchUserAddresses();
  }, [dispatch]);

  const fetchUserAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data);
      if (data.length > 0) {
        const defaultAddr = data.find((a: Address) => a.isDefault);
        setSelectedAddressId(defaultAddr ? defaultAddr._id : data[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
    }
  };

  const handleAddressSuccess = (savedAddress: Address, isEdit: boolean) => {
    if (isEdit) {
      setAddresses(addresses.map(a => a._id === savedAddress._id ? savedAddress : a));
    } else {
      setAddresses([...addresses, savedAddress]);
    }
    setSelectedAddressId(savedAddress._id);
  };

  const handleEditClick = (e: React.MouseEvent, addr: Address) => {
    e.stopPropagation(); // prevent selecting the address just by clicking edit
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  };

  const [activeDelivery, setActiveDelivery] = useState("standard");
  const [activePayment, setActivePayment] = useState("upi");

  const shipping = deliveryOptions.find(d => d.id === activeDelivery)?.price || 0;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = subtotal + shipping - discount;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const data = await applyCoupon(couponInput.trim(), subtotal);
      setAppliedCoupon({ code: couponInput.trim(), discount: data.discountAmount });
      setCouponInput("");
    } catch (err: any) {
      setCouponError(err.message || "Failed to apply coupon");
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;
    setIsSubmitting(true);
    try {
      const orderItems: OrderItem[] = cartItems.map(item => ({
        itemType: item.itemType,
        productId: item.itemType === 'product' && item.productId ? item.productId._id : undefined,
        mealId: item.itemType === 'meal' && item.mealId ? item.mealId._id : undefined,
        quantity: item.quantity,
        priceAtAddition: item.priceAtAddition,
      }));

      const selectedAddr = addresses.find(a => a._id === selectedAddressId);
      if (!selectedAddr) {
        alert("Please select or add a delivery address.");
        setIsSubmitting(false);
        return;
      }

      await createOrder({
        items: orderItems,
        deliveryAddress: {
          street: selectedAddr.street,
          city: selectedAddr.city,
          state: selectedAddr.state,
          zipCode: selectedAddr.zipCode
        },
        couponCode: appliedCoupon ? appliedCoupon.code : undefined
      });

      await clearCart();
      await dispatch(fetchCartAsync());
      router.replace('/shop/order-success');
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans flex flex-col">


      <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">Checkout</h1>
          </div>
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
            <h1 className="text-2xl md:text-3xl font-medium text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Complete your order securely.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-4">

            {/* 1. Delivery Address */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
                  Delivery Address
                </h2>
                <button onClick={() => {
                  setEditingAddress(null);
                  setIsAddressModalOpen(true);
                }} className="text-sm font-bold text-[var(--color-primary)] hover:text-[#527d89] transition-colors">
                  Add New
                </button>
              </div>

              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <div className="text-center p-6 bg-gray-50 border border-gray-100 rounded-xl text-gray-500 text-sm">
                    No addresses found. Please add a new address to continue.
                  </div>
                ) : (
                  addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr._id;
                    return (
                      <div
                        key={addr._id}
                        onClick={() => setSelectedAddressId(addr._id)}
                        className={`relative p-3 md:p-4 rounded-lg md:rounded-xl border cursor-pointer flex gap-3 transition-all ${isSelected ? 'border-[var(--color-primary)] bg-gray-50/50' : 'border-gray-100 hover:border-gray-300'}`}
                      >
                        <div className="pt-1 flex-shrink-0">
                          {isSelected ? (
                            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-[var(--color-primary)]" fill="currentColor" stroke="white" />
                          ) : (
                            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full border-2 border-gray-300" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start w-full">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="font-bold text-gray-900">{user?.name || "Customer"}</span>
                              {addr.isDefault && <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-[var(--color-primary)] border border-[var(--color-primary)] uppercase tracking-wider">Default</span>}
                            </div>
                            <button onClick={(e) => handleEditClick(e, addr)} className="text-gray-400 hover:text-[var(--color-primary)] transition-colors p-1">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed mb-2">
                            {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                          </p>
                          <p className="text-sm font-semibold text-gray-800">{addr.phone || user?.phone}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </motion.section>

            {/* 2. Delivery Options */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm"
            >
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 mb-4 md:mb-6">
                Delivery Method
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deliveryOptions.map((opt) => {
                  const isActive = activeDelivery === opt.id;
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setActiveDelivery(opt.id)}
                      className={`relative p-3 md:p-4 rounded-lg md:rounded-xl border cursor-pointer flex items-start gap-3 transition-all duration-300 ${isActive ? 'border-[var(--color-primary)] bg-gray-50/50' : 'border-gray-100 hover:border-gray-300 bg-white'}`}
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
              className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 border border-gray-100 shadow-sm"
            >
              <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2 mb-4 md:mb-6">
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
                      className={`relative p-3 md:p-4 rounded-lg md:rounded-xl border cursor-pointer flex items-center gap-3 transition-all duration-300 ${isActive ? 'border-[var(--color-primary)] bg-gray-50/50' : 'border-gray-100 hover:border-gray-300'}`}
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
              {cartItems.map(item => {
                const itemDetails = item.itemType === 'product' ? item.productId : item.mealId;
                if (!itemDetails) return null;
                return (
                  <div key={item._id} className="flex gap-4 items-center">
                    <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-50 rounded-lg relative overflow-hidden flex-shrink-0 border border-gray-100 flex items-center justify-center">
                      {itemDetails.imageUrl ? (
                        <Image src={itemDetails.imageUrl} alt={itemDetails.name} fill className="object-cover" />
                      ) : (
                        <ShoppingCart className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{itemDetails.name}</p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-gray-900 text-sm">₹{item.priceAtAddition * item.quantity}</span>
                  </div>
                );
              })}
            </div>

            {/* Coupon Section */}
            <div className="mb-6">
              {!appliedCoupon ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Tag className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Enter coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        className="w-full pl-9 pr-3 py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm focus:outline-none focus:border-[var(--color-primary)] uppercase font-bold text-gray-800 placeholder:font-medium placeholder:text-gray-400 bg-gray-50/50 transition-colors"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors"
                    >
                      {couponLoading ? "..." : "Apply"}
                    </button>
                  </div>
                  {couponError && <p className="text-xs text-red-500 font-medium ml-1">{couponError}</p>}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                      <CheckCircle2 className="w-3 h-3" />
                    </span>
                    <div>
                      <p className="text-sm font-bold text-emerald-800">{appliedCoupon.code}</p>
                      <p className="text-xs text-emerald-600 font-medium">Coupon applied successfully</p>
                    </div>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-sm font-bold text-red-500 hover:text-red-600">
                    Remove
                  </button>
                </div>
              )}
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

              {discount > 0 && (
                <div className="flex justify-between items-center text-sm md:text-base">
                  <span className="text-emerald-600 font-bold">Discount ({appliedCoupon?.code})</span>
                  <span className="font-bold text-emerald-600">-₹{discount}</span>
                </div>
              )}
            </div>

            <div className="pt-5 border-t-2 border-gray-100 border-dashed mb-8">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-base font-bold text-gray-900">Total Amount</p>
                  <p className="text-xs font-medium text-gray-500">Includes all taxes & fees</p>
                </div>
                <span className="text-2xl md:text-3xl font-black text-[#122B54]">₹{total}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting || cartItems.length === 0}
              className={`group w-full bg-[#122B54] text-white py-3.5 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all shadow-lg shadow-[#122B54]/20 duration-200 ${isSubmitting || cartItems.length === 0 ? 'opacity-70 cursor-not-allowed' : 'hover:bg-[#1e3c72] active:scale-[0.98]'}`}>
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4 text-white/70" />
                  Place Order
                </>
              )}
            </button>

            <p className="text-center text-[11px] text-gray-400 font-medium mt-4 flex items-center justify-center gap-1">
              By placing this order, you agree to our Terms.
            </p>

          </motion.div>
        </div>
      </main>



      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSuccess={handleAddressSuccess}
        editingAddress={editingAddress}
      />
    </div>
  );
}
