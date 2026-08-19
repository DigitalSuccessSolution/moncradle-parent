"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, X, CheckCircle2, Loader2 } from "lucide-react";
import { submitReview, ReviewTargetType, SubmitReviewPayload } from "@/lib/api/reviewsApi";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (rating: number) => void;

  targetType: ReviewTargetType;
  targetName: string;           // display name e.g. "Dr. Ayesha Khan"
  targetSubtitle?: string;      // e.g. "Paediatrician" or "Meal from Order #ABC123"

  // IDs depending on targetType
  mealId?: string;
  productId?: string;
  orderId?: string;
  doctorId?: string;
  appointmentId?: string;
  deliveryPartnerId?: string;
}

const TARGET_LABELS: Record<ReviewTargetType, string> = {
  meal: "meal",
  product: "product",
  doctor: "doctor",
  deliveryPartner: "delivery",
};

export default function ReviewModal({
  isOpen,
  onClose,
  onSuccess,
  targetType,
  targetName,
  targetSubtitle,
  mealId,
  productId,
  orderId,
  doctorId,
  appointmentId,
  deliveryPartnerId,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (loading) return;
    setRating(0);
    setHovered(0);
    setComment("");
    setError("");
    setSuccess(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (rating === 0) { setError("Please select a rating."); return; }
    setLoading(true);
    setError("");

    const payload: SubmitReviewPayload = {
      targetType,
      rating,
      comment: comment.trim() || undefined,
      mealId,
      productId,
      orderId,
      doctorId,
      appointmentId,
      deliveryPartnerId,
    };

    try {
      await submitReview(payload);
      setSuccess(true);
      onSuccess?.(rating);
      setTimeout(handleClose, 1800);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to submit review. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const starLabels = ["Terrible", "Poor", "Okay", "Good", "Excellent"];
  const displayRating = hovered || rating;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full sm:max-w-md bg-white sm:rounded-2xl rounded-t-2xl shadow-xl overflow-hidden"
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-gray-200" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-50">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  Rate this {TARGET_LABELS[targetType]}
                </p>
                <h2 className="text-[16px] font-semibold text-gray-900 leading-tight">{targetName}</h2>
                {targetSubtitle && (
                  <p className="text-[12px] text-gray-400 font-medium mt-0.5">{targetSubtitle}</p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="px-5 py-5">
              {success ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center py-6 gap-3"
                >
                  <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle2 className="w-7 h-7 text-green-600" />
                  </div>
                  <p className="text-[15px] font-semibold text-gray-900">Thank you for your review!</p>
                  <p className="text-[13px] text-gray-500 text-center">Your feedback helps us improve.</p>
                </motion.div>
              ) : (
                <>
                  {/* Stars */}
                  <div className="flex flex-col items-center mb-5">
                    <div className="flex gap-2 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onMouseEnter={() => setHovered(star)}
                          onMouseLeave={() => setHovered(0)}
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`w-9 h-9 transition-colors ${
                              star <= displayRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-200 fill-gray-100"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <p className={`text-[13px] font-semibold transition-colors ${displayRating ? "text-amber-500" : "text-gray-400"}`}>
                      {displayRating ? starLabels[displayRating - 1] : "Tap a star to rate"}
                    </p>
                  </div>

                  {/* Comment */}
                  <div className="mb-4">
                    <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                      Add a comment (optional)
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      maxLength={500}
                      placeholder="Share your experience..."
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-[14px] text-gray-800 font-medium resize-none min-h-[88px] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]/40 transition-all"
                    />
                    <p className="text-[11px] text-gray-400 text-right mt-0.5">{comment.length}/500</p>
                  </div>

                  {/* Error */}
                  {error && (
                    <p className="text-[12px] text-red-500 font-medium mb-3">{error}</p>
                  )}

                  {/* Submit */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading || rating === 0}
                    className="w-full bg-[var(--color-primary)] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[14px] py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</>
                    ) : (
                      "Submit Review"
                    )}
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
