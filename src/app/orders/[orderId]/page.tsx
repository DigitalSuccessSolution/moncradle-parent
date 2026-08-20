"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Package, Truck, CheckCircle2, MapPin, Loader2, IndianRupee, Star } from "lucide-react";
import Image from "next/image";
import ReviewModal from "@/components/ui/ReviewModal";
import { getOrderById } from "@/lib/api/ordersApi";
import { checkHasReviewed, ReviewTargetType } from "@/lib/api/reviewsApi";

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewOrder, setReviewOrder] = useState<{ mode: "item" | "deliveryPartner" } | null>(null);
  const [reviewedOrders, setReviewedOrders] = useState<{ item?: any; deliveryPartner?: any }>({});
  const [viewingReview, setViewingReview] = useState<{ title: string; review: any } | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(orderId as string);
        setOrder(data);
      } catch (err: any) {
        setError(err.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  useEffect(() => {
    const fetchReviewsStatus = async () => {
      if (!order || order.status !== 'delivered') return;

      const firstItemType = order.items?.[0]?.itemType || "meal";
      
      try {
        const [hasReviewedItem, hasReviewedDelivery] = await Promise.all([
          checkHasReviewed({ orderId: order._id, targetType: firstItemType as ReviewTargetType }),
          checkHasReviewed({ orderId: order._id, targetType: 'deliveryPartner' })
        ]);

        setReviewedOrders({
          item: hasReviewedItem || undefined,
          deliveryPartner: hasReviewedDelivery || undefined
        });
      } catch (err) {
        console.error("Failed to fetch review status", err);
      }
    };

    fetchReviewsStatus();
  }, [order]);

  const getProgress = (status: string) => {
    if (!status) return 0;
    switch (status.toLowerCase()) {
      case 'pending': return 0;
      case 'preparing':
      case 'ready': return 33;
      case 'out_for_delivery': return 66;
      case 'delivered': return 100;
      case 'cancelled': return 100;
      default: return 0;
    }
  };

  const getStepStatus = (status: string, step: number) => {
    if (status?.toLowerCase() === 'cancelled') return step === 1 ? 'completed' : 'upcoming';
    const progress = getProgress(status);
    const stepThreshold = (step - 1) * 33;
    if (progress > stepThreshold) return 'completed';
    if (progress === stepThreshold) return 'active';
    return 'upcoming';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-[var(--color-background)] p-4 flex flex-col items-center justify-center text-center">
        <Package className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-800">Order Not Found</h2>
        <p className="text-gray-500 mt-2">The order you're looking for doesn't exist or you don't have access to it.</p>
        <button
          onClick={() => router.push('/orders')}
          className="mt-6 bg-[var(--color-primary)] text-white px-6 py-2.5 rounded-full font-semibold shadow-sm"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const shortId = order._id.slice(-6).toUpperCase();
  const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const displayStatus = order.status.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
  
  const firstItem = order.items?.[0];
  const firstItemType = firstItem?.itemType || "meal";
  const firstItemDetail = firstItemType === 'product' ? firstItem?.productId : firstItem?.mealId;
  const itemName = firstItemDetail?.name || "Order Item";
  const itemReviewLabel = firstItemType === 'product' ? "Product" : "Meal";

  return (
    <div className="min-h-screen bg-[var(--color-background)] pb-24 font-sans relative">
      <main className="max-w-[800px] mx-auto px-4 md:px-8 py-4 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 sticky top-0 z-40 bg-[var(--color-background)] py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <button 
            onClick={() => router.push('/orders')} 
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Order #{shortId}</h1>
            <p className="text-xs text-gray-500">{dateFormatted}</p>
          </div>
        </div>



        {/* Status Tracker */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
            <h2 className="text-lg font-bold text-gray-900">Tracking Status</h2>
            <div className="flex items-center gap-3 flex-wrap">
              {order.isOtpRequired && !['delivered', 'cancelled'].includes(order.status) && (
                 <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase">OTP:</span>
                    <span className="text-sm font-black text-[var(--color-primary)] tracking-[0.2em]">{order.deliveryOtp || '----'}</span>
                 </div>
              )}
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                order.status === 'delivered' ? 'bg-green-50 text-green-600 border-green-200' :
                order.status === 'cancelled' ? 'bg-red-50 text-red-600 border-red-200' :
                'bg-orange-50 text-orange-600 border-orange-200'
              }`}>
                {displayStatus}
              </span>
            </div>
          </div>

          {order.status !== 'cancelled' ? (
            <div className="relative mt-8 px-2 sm:px-6 pb-4">
              {/* Background Line */}
              <div className="absolute top-5 left-0 w-full h-[2px] bg-gray-100 -translate-y-1/2 rounded-full z-0"></div>
              {/* Active Line */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${getProgress(order.status)}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="absolute top-5 left-0 h-[2px] bg-[var(--color-primary)] -translate-y-1/2 rounded-full z-0"
              ></motion.div>

              <div className="relative flex justify-between z-10">
                {[
                  { label: "Placed", icon: CheckCircle2 },
                  { label: "Packed", icon: Package },
                  { label: "In Transit", icon: Truck },
                  { label: "Delivered", icon: MapPin }
                ].map((step, index) => {
                  const stepStatus = getStepStatus(order.status, index + 1);
                  const Icon = step.icon;

                  return (
                    <div key={index} className="flex flex-col items-center gap-3">
                      {stepStatus === 'completed' && (
                        <div className="w-10 h-10 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center relative z-10 shadow-sm border-2 border-white">
                          <Icon className="w-4 h-4" />
                        </div>
                      )}
                      {stepStatus === 'active' && (
                        <div className="relative z-10">
                          <div className="absolute inset-0 bg-[var(--color-primary)] rounded-full animate-ping opacity-20"></div>
                          <div className="w-10 h-10 rounded-full bg-white border-2 border-[var(--color-primary)] text-[var(--color-primary)] flex items-center justify-center shadow-sm">
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                      {stepStatus === 'upcoming' && (
                        <div className="w-10 h-10 rounded-full bg-white border-2 border-gray-200 text-gray-300 flex items-center justify-center relative z-10">
                          <Icon className="w-4 h-4" />
                        </div>
                      )}
                      <span className={`text-[10px] md:text-xs font-semibold text-center ${stepStatus === 'upcoming' ? 'text-gray-400' : 'text-gray-900'}`}>
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-center">
              <p className="text-sm font-semibold text-red-600">This order has been cancelled.</p>
              {order.cancellationReason && (
                <p className="text-xs text-red-500 mt-1">Reason: {order.cancellationReason}</p>
              )}
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Items in this Order</h2>
          <div className="space-y-4">
            {order.items?.map((item: any, idx: number) => {
              const detail = item.itemType === 'product' ? item.productId : item.mealId;
              const imgUrl = detail?.imageUrl || "/images/product_bottle.png";
              return (
                <div key={idx} className="flex gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100 items-center">
                  <div className="w-16 h-16 rounded-lg bg-white p-1 shadow-sm flex-shrink-0">
                    <Image src={imgUrl} alt={detail?.name || "Item"} width={64} height={64} className="w-full h-full object-contain rounded-md" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{detail?.name || "Unknown Item"}</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[var(--color-primary)] text-sm flex items-center justify-end">
                      <IndianRupee className="w-3.5 h-3.5" />{item.priceAtAddition}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Delivery Information</h2>
          {order.deliveryAddress ? (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 leading-relaxed">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">{order.deliveryAddress.street}</p>
                  <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} - {order.deliveryAddress.zipCode}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic">No delivery address provided.</p>
          )}

          {order.specialInstructions && (
            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-xl border border-blue-100 text-sm">
              <span className="font-bold block mb-1">Special Instructions:</span>
              {order.specialInstructions}
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Item Total</span>
              <span className="font-medium flex items-center"><IndianRupee className="w-3 h-3"/>{order.totalAmount}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className="font-medium text-green-600">FREE</span>
            </div>
            <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-lg text-gray-900">
              <span>Grand Total</span>
              <span className="flex items-center text-[var(--color-primary)]"><IndianRupee className="w-4 h-4"/>{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Review Section if Delivered */}
        {order.status === 'delivered' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Rate Your Experience</h2>
            <div className="flex flex-wrap items-center gap-3">
              {/* Rate Item */}
              {reviewedOrders.item ? (
                <button 
                  onClick={() => setViewingReview({ title: `${itemReviewLabel} Review`, review: reviewedOrders.item })}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer active:scale-95"
                >
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= (reviewedOrders.item.rating ?? reviewedOrders.item) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-100'}`} />
                  ))}
                  <span className="text-xs font-bold text-amber-600 ml-1">View {itemReviewLabel} Review</span>
                </button>
              ) : (
                <button
                  onClick={() => setReviewOrder({ mode: "item" })}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-600 text-sm font-bold hover:bg-amber-100 transition-colors active:scale-95"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> Rate {itemReviewLabel}
                </button>
              )}

              {/* Rate Delivery */}
              {reviewedOrders.deliveryPartner ? (
                <button 
                  onClick={() => setViewingReview({ title: `Delivery Review`, review: reviewedOrders.deliveryPartner })}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer active:scale-95"
                >
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} className={`w-4 h-4 ${s <= (reviewedOrders.deliveryPartner.rating ?? reviewedOrders.deliveryPartner) ? 'fill-blue-400 text-blue-400' : 'text-gray-200 fill-gray-100'}`} />
                  ))}
                  <span className="text-xs font-bold text-blue-600 ml-1">View Delivery Review</span>
                </button>
              ) : (
                <button
                  onClick={() => setReviewOrder({ mode: "deliveryPartner" })}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-200 bg-blue-50 text-blue-600 text-sm font-bold hover:bg-blue-100 transition-colors active:scale-95"
                >
                  <Star className="w-4 h-4 fill-blue-400 text-blue-400" /> Rate Delivery
                </button>
              )}
            </div>
          </div>
        )}

      </main>

      {/* Review Modal */}
      {reviewOrder && (
        <ReviewModal
          isOpen={!!reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSuccess={(rating) => {
            setReviewedOrders(prev => ({ ...prev, [reviewOrder.mode]: rating }));
            setReviewOrder(null);
          }}
          targetType={reviewOrder.mode === "item" ? firstItemType : "deliveryPartner"}
          targetName={reviewOrder.mode === "item" ? itemName : "Delivery Partner"}
          targetSubtitle={`Order #${shortId} · ${dateFormatted}`}
          mealId={reviewOrder.mode === "item" && firstItemType === "meal" ? (firstItemDetail?._id || firstItemDetail) : undefined}
          productId={reviewOrder.mode === "item" && firstItemType === "product" ? (firstItemDetail?._id || firstItemDetail) : undefined}
          deliveryPartnerId={reviewOrder.mode === "deliveryPartner" ? (order.deliveryId?._id || order.deliveryId) : undefined}
          orderId={order._id}
        />
      )}
      {/* View Review Modal */}
      <AnimatePresence>
        {viewingReview && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setViewingReview(null)} className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">{viewingReview.title}</h3>
              <div className="flex gap-1 mb-4">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-7 h-7 ${s <= (viewingReview.review.rating ?? viewingReview.review) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-100'}`} />
                ))}
              </div>
              {viewingReview.review.comment ? (
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">{viewingReview.review.comment}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No comment provided.</p>
              )}
              <button onClick={() => setViewingReview(null)} className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors">Close</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
