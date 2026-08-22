"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Loader2 } from "lucide-react";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  orderId: string;
}

export default function CancelOrderModal({ isOpen, onClose, onConfirm, orderId }: CancelOrderModalProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    if (loading) return;
    setReason("");
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setError("Please provide a reason for cancellation.");
      return;
    }
    
    setLoading(true);
    setError("");
    try {
      await onConfirm(reason);
      handleClose();
    } catch (err: any) {
      setError(err.message || "Failed to cancel order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <h2 className="text-[16px] font-semibold leading-tight">Cancel Order #{orderId.slice(-6).toUpperCase()}</h2>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="px-5 py-5">
              <p className="text-[13px] text-gray-600 mb-4">
                Are you sure you want to cancel this order? Please tell us why you are cancelling so we can improve our service.
              </p>

              {/* Comment */}
              <div className="mb-4">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1.5">
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  placeholder="E.g., I ordered by mistake..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-[14px] text-gray-800 font-medium resize-none min-h-[100px] focus:outline-none focus:ring-1 focus:ring-red-500/40 focus:border-red-500/40 transition-all"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-[12px] text-red-500 font-medium mb-3">{error}</p>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
                >
                  Keep Order
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !reason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling...</>
                  ) : (
                    "Cancel Order"
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
