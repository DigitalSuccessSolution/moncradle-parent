"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header/Header";

import { Footer } from "@/components/layout/Footer/Footer";
import { Package, Truck, CheckCircle2, ChevronRight, X, MapPin } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";

// Dummy data
const activeOrders = [
  {
    id: "MC12344",
    date: "27 May 2026",
    status: "In Transit",
    items: [
      { name: "Organic Baby Cerelac", qty: 2, price: "₹560", img: "/images/meal_food.png" },
      { name: "Vitamin D3 Drops", qty: 1, price: "₹290", img: "/images/product_bottle.png" }
    ],
    total: "₹850"
  }
];

const pastOrders = [
  { id: "MC12340", date: "15 May 2026", status: "Delivered", total: "₹420", img: "/images/product_bottle.png", name: "Vitamin D3 Drops", qty: 1 },
  { id: "MC12335", date: "02 May 2026", status: "Delivered", total: "₹1200", img: "/images/meal_food.png", name: "Organic Baby Cerelac", qty: 4 },
];

export default function OrdersPage() {
  const [trackingOrder, setTrackingOrder] = useState<any>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (trackingOrder) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [trackingOrder]);

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative">
      <Header />
      
      <main className="max-w-[1000px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-10">
        
        {/* Page Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight">My Orders</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Track your active deliveries and view past orders.</p>
        </motion.div>

        <div className="space-y-10">
           
           {/* Active Orders List */}
           <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Orders</h2>
              <div className="space-y-4">
                 {activeOrders.map((order, i) => (
                    <motion.div 
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
                    >
                       <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-semibold text-lg text-gray-900">Order #{order.id}</h3>
                            <span className="text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-100 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                              {order.status}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4">
                             {order.items.map((item, j) => (
                               <div key={j} className="flex items-center gap-3">
                                  <Image src={item.img} alt={item.name} width={48} height={48} className="object-contain rounded-lg flex-shrink-0" />
                                  <div>
                                    <p className="text-xs font-semibold text-gray-900">{item.name}</p>
                                    <p className="text-[10px] font-medium text-gray-500">Qty: {item.qty}</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>

                       <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-4 border-t border-gray-100 md:pt-0 md:border-t-0 md:pl-5 md:border-l">
                          <div className="flex items-center gap-1.5 md:flex-col md:items-end md:gap-0.5">
                             <p className="text-xs md:text-[10px] font-medium text-gray-500">Total Amount:</p>
                             <p className="text-sm md:text-lg font-bold text-[var(--color-primary)]">{order.total}</p>
                          </div>
                          <Button 
                            variant="primary" 
                            size="sm" 
                            className="rounded-lg shadow-sm cursor-pointer px-4"
                            onClick={() => setTrackingOrder(order)}
                          >
                            Track Order
                          </Button>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </section>

           {/* Past Orders List */}
           <section>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Past Orders</h2>
              <div className="space-y-4">
                 {pastOrders.map((order, i) => (
                    <motion.div 
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + (i * 0.1) }}
                      className="bg-white rounded-lg p-4 border border-gray-100 hover:shadow-sm transition-all flex items-center justify-between group cursor-pointer"
                    >
                       <div className="flex items-center gap-4">
                         <Image src={order.img} alt="Order" width={56} height={56} className="object-contain rounded-lg flex-shrink-0" />
                         <div>
                           <h5 className="font-semibold text-gray-900 text-sm">Order #{order.id}</h5>
                           <div className="flex items-center gap-2 mt-1">
                             <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                               {order.status}
                             </span>
                             <span className="text-[11px] font-medium text-gray-500">{order.date}</span>
                           </div>
                         </div>
                       </div>
                       <div className="flex items-center gap-4">
                         <span className="font-semibold text-gray-900 text-sm hidden sm:block">{order.total}</span>
                         <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                           <ChevronRight className="w-4 h-4" />
                         </div>
                       </div>
                    </motion.div>
                 ))}
              </div>
           </section>

        </div>

      </main>

      <Footer />
      

      {/* Tracking Modal */}
      <AnimatePresence>
        {trackingOrder && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setTrackingOrder(null)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 bg-white border-b border-gray-100 z-10">
                <div className="flex items-center gap-3">
                   <h2 className="text-lg font-semibold text-gray-900">Track Order</h2>
                   <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">#{trackingOrder.id}</span>
                </div>
                <button 
                  onClick={() => setTrackingOrder(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto no-scrollbar space-y-8 bg-white relative">
                
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--color-primary)] opacity-[0.03] rounded-full blur-3xl pointer-events-none"></div>

                {/* Progress Bar UI */}
                <div className="relative mt-2 px-2 sm:px-6">
                   {/* Background Line */}
                   <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 -translate-y-1/2 rounded-full z-0"></div>
                   {/* Active Line (50% for In Transit) */}
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: "50%" }}
                     transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                     className="absolute top-5 left-0 h-[2px] bg-[var(--color-primary)] -translate-y-1/2 rounded-full z-0"
                   ></motion.div>
                   
                   <div className="relative flex justify-between z-10">
                      {/* Step 1 */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center relative z-10">
                          <CheckCircle2 className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-800 text-center leading-tight">Placed</span>
                      </div>
                      {/* Step 2 */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center relative z-10">
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-800 text-center leading-tight">Packed</span>
                      </div>
                      {/* Step 3 (Active) */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="relative z-10">
                          <div className="absolute -inset-2 bg-[var(--color-primary)]/20 rounded-full animate-ping opacity-75"></div>
                          <div className="relative w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center">
                            <Truck className="w-4 h-4" />
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[var(--color-primary)] text-center leading-tight">In Transit</span>
                      </div>
                      {/* Step 4 */}
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center relative z-10">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-semibold text-gray-400 text-center leading-tight">Delivered</span>
                      </div>
                   </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-orange-50/50 border border-orange-100 rounded-lg p-4 flex items-start gap-3 relative z-10">
                  <div className="p-2 bg-white text-orange-500 rounded-lg border border-orange-100 shadow-sm shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Arriving Today by 9:00 PM</h4>
                    <p className="text-xs font-medium text-gray-600 mt-0.5 leading-relaxed">Your package is currently out for delivery in your area. Our delivery partner will contact you soon.</p>
                  </div>
                </div>

              </div>
              
              {/* Actions */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-lg">
                <Button variant="outline" size="sm" className="rounded-lg cursor-pointer" onClick={() => setTrackingOrder(null)}>
                  Close
                </Button>
                <Button variant="primary" size="sm" className="rounded-lg cursor-pointer">
                  Contact Support
                </Button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
