"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";



import { Package, Truck, CheckCircle2, ChevronRight, X, MapPin, ChevronLeft, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import ReviewModal from "@/components/ui/ReviewModal";

import { getOrders } from "@/lib/api/ordersApi";
import { checkHasReviewed, ReviewTargetType } from "@/lib/api/reviewsApi";
import { useAppSelector } from "@/store/hooks";

const mapOrderForUI = (order: any) => {
  const firstItem = order.items?.[0];
  const firstItemType = firstItem?.itemType;
  const firstMealId = firstItemType === 'meal' ? (firstItem?.mealId?._id || firstItem?.mealId) : null;
  const firstProductId = firstItemType === 'product' ? (firstItem?.productId?._id || firstItem?.productId) : null;

  return {
    id: order._id.slice(-6).toUpperCase(),
    fullId: order._id,
    date: new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    status: order.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
    items: (order.items || []).map((item: any) => {
      const details = item.itemType === 'product' ? item.productId : item.mealId;
      return {
        name: details?.name || 'Unknown Item',
        qty: item.quantity,
        price: `₹${item.priceAtAddition || 0}`,
        img: details?.imageUrl || "/images/product_bottle.png"
      };
    }),
    total: `₹${order.totalAmount}`,
    img: firstItem ? (firstItemType === 'product' ? firstItem.productId?.imageUrl : firstItem.mealId?.imageUrl) : "/images/product_bottle.png",
    name: firstItem ? (firstItemType === 'product' ? firstItem.productId?.name : firstItem.mealId?.name) : "Order Item",
    qty: order.items ? order.items.reduce((acc: number, curr: any) => acc + curr.quantity, 0) : 0,
    // IDs needed for reviews
    rawMealId: firstMealId,
    rawProductId: firstProductId,
    deliveryPartnerId: order.deliveryPartnerId?._id || order.deliveryPartnerId || null,
    itemType: firstItemType || 'meal',
  };
};

export default function OrdersPage() {
  const router = useRouter();
  const cartTotalCount = useAppSelector((state: any) => state.cart?.totalCount || 0);
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [pastOrders, setPastOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewOrder, setReviewOrder] = useState<{ order: any; mode: "item" | "deliveryPartner" } | null>(null);
  // Track submitted ratings: { [orderId]: { item?: any, deliveryPartner?: any } }
  const [reviewedOrders, setReviewedOrders] = useState<Record<string, { item?: any; deliveryPartner?: any }>>({});

  const getProgress = (status: string) => {
    if (!status) return 0;
    switch (status.toLowerCase()) {
      case 'pending': return 0;
      case 'preparing':
      case 'ready': return 33;
      case 'out for delivery': return 66;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  const getStepStatus = (status: string, step: number) => {
    const progress = getProgress(status);
    const stepThreshold = (step - 1) * 33;
    if (progress > stepThreshold) return 'completed';
    if (progress === stepThreshold) return 'active';
    return 'upcoming';
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders();
        const allOrders = response.data || [];

        const active = allOrders
          .filter((o: any) => ['pending', 'preparing', 'ready', 'out_for_delivery'].includes(o.status))
          .map(mapOrderForUI);

        const past = allOrders
          .filter((o: any) => ['delivered', 'cancelled'].includes(o.status))
          .map(mapOrderForUI);

        setActiveOrders(active);
        setPastOrders(past);

        // Fetch review status for delivered orders
        const deliveredOrders = past.filter((o: any) => o.status === 'Delivered');
        if (deliveredOrders.length > 0) {
          const reviewStatusObj: Record<string, any> = {};
          
          await Promise.all(deliveredOrders.map(async (o: any) => {
            try {
              const [hasReviewedItem, hasReviewedDelivery] = await Promise.all([
                checkHasReviewed({ orderId: o.fullId, targetType: o.itemType as ReviewTargetType }),
                checkHasReviewed({ orderId: o.fullId, targetType: 'deliveryPartner' })
              ]);
              
              if (hasReviewedItem || hasReviewedDelivery) {
                reviewStatusObj[o.fullId] = {
                  item: hasReviewedItem || undefined,
                  deliveryPartner: hasReviewedDelivery || undefined
                };
              }
            } catch (err) {
              // Ignore individual failures
            }
          }));
          
          if (Object.keys(reviewStatusObj).length > 0) {
            setReviewedOrders(prev => ({ ...prev, ...reviewStatusObj }));
          }
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // No tracking order modal needed anymore

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative">
      

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">

        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">My Orders</h1>
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
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center mb-2 -ml-3 md:ml-0"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="font-semibold text-[15px]">Back</span>
          </button>
        </motion.div>

        {/* Desktop Page Header */}
        <div className="hidden md:flex flex-col mb-4 px-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Track your active deliveries and view past orders.</p>
        </div>

        <div className="space-y-10">

          {/* Active Orders List */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Orders</h2>
            <div className="space-y-4">
              {activeOrders.length === 0 && !isLoading && (
                <p className="text-gray-500 text-sm">No active orders.</p>
              )}
              {activeOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  onClick={() => router.push(`/orders/${order.fullId}`)}
                  className="bg-white rounded-lg p-5 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-5 cursor-pointer hover:border-[var(--color-primary)] transition-colors group"
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
                      {order.items.map((item: any, j: number) => (
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
                      <p className="text-sm md:text-lg font-semibold text-[var(--color-primary)]">{order.total}</p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      className="rounded-lg shadow-sm cursor-pointer px-4"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/orders/${order.fullId}`);
                      }}
                    >
                      View Details
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
              {pastOrders.length === 0 && !isLoading && (
                <p className="text-gray-500 text-sm">No past orders.</p>
              )}
              {pastOrders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + (i * 0.1) }}
                  onClick={() => router.push(`/orders/${order.fullId}`)}
                  className="bg-white rounded-lg p-4 border border-gray-100 transition-all group cursor-pointer flex flex-col gap-3 hover:border-[var(--color-primary)]"
                >
                  {/* Top row — image + order info */}
                  <div className="flex items-center gap-3">
                    <Image src={order.img} alt="Order" width={52} height={52} className="object-contain rounded-lg flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-gray-900 text-sm truncate">Order #{order.id}</h5>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 flex-shrink-0">
                          {order.status}
                        </span>
                        <span className="text-[11px] font-medium text-gray-500">{order.date}</span>
                      </div>
                    </div>
                    <span className="font-semibold text-gray-900 text-sm flex-shrink-0">{order.total}</span>
                  </div>

                  {/* Bottom row — rate buttons + arrow */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                    {order.status === "Delivered" ? (
                      <div className="flex gap-2">
                        {/* Item Rate button or Rated stars */}
                        {reviewedOrders[order.fullId]?.item ? (
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${s <= (reviewedOrders[order.fullId].item.rating ?? reviewedOrders[order.fullId].item) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-100'}`} />
                            ))}
                            <span className="text-[11px] font-semibold text-amber-600 ml-0.5">{order.itemType === 'product' ? 'Product' : 'Meal'}</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setReviewOrder({ order, mode: "item" }); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-600 text-[12px] font-semibold hover:bg-amber-100 transition-colors active:scale-95"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Rate {order.itemType === 'product' ? 'Product' : 'Meal'}
                          </button>
                        )}

                        {/* Delivery Rate button or Rated stars */}
                        {reviewedOrders[order.fullId]?.deliveryPartner ? (
                          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                            {[1,2,3,4,5].map(s => (
                              <Star key={s} className={`w-3 h-3 ${s <= (reviewedOrders[order.fullId].deliveryPartner.rating ?? reviewedOrders[order.fullId].deliveryPartner) ? 'fill-blue-400 text-blue-400' : 'text-gray-200 fill-gray-100'}`} />
                            ))}
                            <span className="text-[11px] font-semibold text-blue-600 ml-0.5">Delivery</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); setReviewOrder({ order, mode: "deliveryPartner" }); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-600 text-[12px] font-semibold hover:bg-blue-100 transition-colors active:scale-95"
                          >
                            <Star className="w-3.5 h-3.5 fill-blue-400 text-blue-400" /> Rate Delivery
                          </button>
                        )}
                      </div>
                    ) : (
                      <div />
                    )}
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors flex-shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

        </div>

      </main>

      {/* Review Modal for Orders */}
      {reviewOrder && (
        <ReviewModal
          isOpen={!!reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSuccess={(rating) => {
            const orderId = reviewOrder.order.fullId;
            setReviewedOrders(prev => ({
              ...prev,
              [orderId]: { ...prev[orderId], [reviewOrder.mode]: rating }
            }));
            setReviewOrder(null);
          }}
          targetType={reviewOrder.mode === "item" ? reviewOrder.order.itemType : "deliveryPartner"}
          targetName={
            reviewOrder.mode === "item"
              ? reviewOrder.order.name || "Order Item"
              : "Delivery Partner"
          }
          targetSubtitle={`Order #${reviewOrder.order.id} · ${reviewOrder.order.date}`}
          mealId={reviewOrder.mode === "item" && reviewOrder.order.itemType === 'meal' ? reviewOrder.order.rawMealId ?? undefined : undefined}
          productId={reviewOrder.mode === "item" && reviewOrder.order.itemType === 'product' ? reviewOrder.order.rawProductId ?? undefined : undefined}
          deliveryPartnerId={reviewOrder.mode === "deliveryPartner" ? reviewOrder.order.deliveryPartnerId ?? undefined : undefined}
          orderId={reviewOrder.order.fullId}
        />
      )}
    </div>
  );
}
