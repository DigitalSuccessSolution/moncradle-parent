"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, Home, Package } from "lucide-react";
import Link from "next/link";

export default function OrderSuccessPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(timer); router.replace("/orders"); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", duration: 0.6 }} className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2, stiffness: 200 }} className="w-24 h-24 rounded-full bg-green-50 border-4 border-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" strokeWidth={1.5} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">Your order has been placed. We will notify you when it is out for delivery.</p>
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
          <div className="flex gap-3">
            <Link href="/" className="flex-1"><button className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-semibold text-sm px-4 py-3 rounded-xl hover:bg-gray-50 transition-all"><Home className="w-4 h-4" />Home</button></Link>
            <Link href="/orders" className="flex-1"><button className="w-full flex items-center justify-center gap-2 bg-[var(--color-primary)] text-white font-semibold text-sm px-4 py-3 rounded-xl hover:opacity-90 transition-all"><ShoppingBag className="w-4 h-4" />My Orders</button></Link>
          </div>
          <p className="text-xs text-gray-400 mt-5">Redirecting to orders in {countdown}s...</p>
        </motion.div>
      </motion.div>
    </div>
  );
}
