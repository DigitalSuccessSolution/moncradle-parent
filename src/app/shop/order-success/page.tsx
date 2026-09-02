"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, Home, Package, XCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { checkPaymentStatus } from "@/lib/api/paymentsApi";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);
  const [statusChecked, setStatusChecked] = useState(false);
  
  const paymentCode = searchParams.get('code');
  const paymentId = searchParams.get('paymentId');
  const type = searchParams.get('type');
  const isSubscription = type === 'subscription';
  const [isFailed, setIsFailed] = useState(paymentCode && paymentCode !== 'PAYMENT_SUCCESS');

  useEffect(() => {
    if (paymentId && !statusChecked) {
      checkPaymentStatus(paymentId).then(res => {
        if (res.success && res.status === 'success') {
          setIsFailed(false);
        } else {
          setIsFailed(true);
        }
        setStatusChecked(true);
      }).catch(() => {
        setStatusChecked(true);
      });
    } else if (!paymentId) {
      setStatusChecked(true);
    }
  }, [paymentId, statusChecked]);

  useEffect(() => {
    if (!statusChecked) return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { 
          clearInterval(timer); 
          router.replace(isSubscription ? "/nutrition/meal-plans?tab=calendar" : "/orders"); 
          return 0; 
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router, statusChecked]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", duration: 0.6 }} className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2, stiffness: 200 }} className={`w-24 h-24 rounded-full border-4 flex items-center justify-center mx-auto mb-6 ${isFailed ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'}`}>
          {isFailed ? (
            <XCircle className="w-12 h-12 text-red-500" strokeWidth={1.5} />
          ) : (
            <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={1.5} />
          )}
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{isFailed ? 'Payment Failed!' : isSubscription ? 'Subscription Active!' : 'Order Placed!'}</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            {isFailed 
              ? "Your payment could not be processed. Please try again or choose another payment method." 
              : isSubscription
                ? "Your subscription is active. Your meals will be delivered as scheduled."
                : "Your order has been placed. We will notify you when it is out for delivery."}
          </p>
          
          {!isFailed && !isSubscription && (
            <div className="bg-[var(--color-background)] rounded-2xl p-4 mb-6 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estimated Delivery</p>
                  <p className="text-sm font-bold text-gray-900">3-5 Business Days</p>
                </div>
              </div>
            </div>
          )}
          {!isFailed && isSubscription && (
            <div className="bg-[var(--color-background)] rounded-2xl p-4 mb-6 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Meal Schedule</p>
                  <p className="text-sm font-bold text-gray-900">Added to your calendar</p>
                </div>
              </div>
            </div>
          )}
          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <button className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold text-sm px-4 py-3 rounded-xl hover:bg-gray-50 transition-all">
                <Home className="w-4 h-4" />Home
              </button>
            </Link>
            <Link href={isSubscription ? "/nutrition/meal-plans?tab=calendar" : "/orders"} className="flex-1">
              <button className={`w-full flex items-center justify-center gap-2 text-white font-semibold text-sm px-4 py-3 rounded-xl hover:opacity-90 transition-all ${isFailed ? 'bg-gray-900' : 'bg-[var(--color-primary)]'}`}>
                {isSubscription ? <Calendar className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                {isFailed ? (isSubscription ? 'View Schedule' : 'View Orders') : (isSubscription ? 'My Schedule' : 'My Orders')}
              </button>
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-5">Redirecting in {countdown}s...</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
