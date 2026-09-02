"use client";

import { motion } from "framer-motion";
import { CalendarDays, Clock, CreditCard } from "lucide-react";
import { Subscription } from "@/lib/api/subscriptionsApi";
import { useRouter } from "next/navigation";
interface SubscriptionCardProps {
  sub: Subscription;
  index: number;
  onUpdate?: () => void;
}

const statusStyles: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100",
  expired: "bg-gray-100 text-gray-500 border-gray-200",
  cancelled: "bg-red-50 text-red-600 border-red-100",
};

function calculateDeliveriesRemaining(schedule: any[]): number {
  if (!schedule) return 0;
  return schedule.filter((s) => s.status === 'pending' || s.status === 'ordered').length;
}

function calculateTotalDeliveries(schedule: any[]): number {
  if (!schedule) return 1; // avoid division by zero
  return schedule.filter((s) => s.status !== 'skipped').length;
}

export default function SubscriptionCard({ sub, index, onUpdate }: SubscriptionCardProps) {
  const router = useRouter();
  const deliveriesRemaining = calculateDeliveriesRemaining(sub.deliverySchedule || []);
  const totalDeliveries = calculateTotalDeliveries(sub.deliverySchedule || []);
  const progressPercent = Math.max(
    0,
    Math.min(100, (deliveriesRemaining / totalDeliveries) * 100)
  );

  const computedStartDate = sub.deliverySchedule && sub.deliverySchedule.length > 0
    ? new Date(Math.min(...sub.deliverySchedule.map(s => new Date(s.date).getTime())))
    : new Date(sub.startDate);

  const computedEndDate = sub.deliverySchedule && sub.deliverySchedule.length > 0
    ? new Date(Math.max(...sub.deliverySchedule.map(s => new Date(s.date).getTime())))
    : new Date(sub.endDate);

  // @ts-ignore
  const planName =
    typeof sub.planId === "object" && (sub.planId as any).title
      ? (sub.planId as any).title
      : "Custom Meal Plan";

  const isActive = sub.status === "active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="group bg-white rounded-2xl border border-gray-100 hover:border-[var(--color-primary)]/30 flex flex-col transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
    >
      {/* Card top accent */}
      <div
        className={`h-1.5 w-full ${isActive
          ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)]"
          : "bg-gray-200"
          }`}
      />

      <div className="p-6 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isActive ? "bg-[var(--color-primary)]/10" : "bg-gray-100"
                }`}
            >
              <CalendarDays
                className={`w-5 h-5 ${isActive ? "text-[var(--color-primary)]" : "text-gray-400"
                  }`}
                strokeWidth={1.5}
              />
            </div>
            <div>
              <h2 className="text-[15px] md:text-[17px] font-semibold text-gray-900 leading-tight">
                {planName}
              </h2>
              <p className="text-[11px] md:text-[13px] text-gray-400 font-medium mt-0.5">
                Starts{" "}
                {computedStartDate.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          <span
            className={`px-2.5 py-1 text-[10px] md:text-[11px] font-bold uppercase tracking-wider rounded-lg border flex-shrink-0 ${statusStyles[sub.status] || statusStyles.expired
              }`}
          >
            {sub.status}
          </span>
        </div>

        {/* Progress section */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2.5">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-400" />
              <span className="text-xs md:text-sm font-medium text-gray-500">Deliveries Remaining</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              <span className="text-[var(--color-primary)] text-base md:text-lg">{deliveriesRemaining}</span>
              <span className="text-gray-400 font-medium md:text-sm"> / {totalDeliveries}</span>
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
              className={`h-2 rounded-full ${isActive
                ? "bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-light)]"
                : "bg-gray-300"
                }`}
            />
          </div>
          <p className="text-[11px] md:text-[13px] text-gray-400 font-medium mt-2">
            Ends on{" "}
            {computedEndDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>



        {/* Actions */}
        <div className="mt-4 flex gap-2.5 pt-4 border-t border-gray-50">
          <button
            onClick={() => {
              const planId = typeof sub.planId === 'object' ? (sub.planId as any)._id : sub.planId;
              router.push(`/subscriptions/new?planId=${planId}`);
            }}
            className="w-full bg-[var(--color-primary)] hover:opacity-90 active:scale-95 text-white font-semibold text-[13px] md:text-[15px] py-2.5 md:py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-[var(--color-primary)]/20"
          >
            <CreditCard className="w-3.5 h-3.5 md:w-4 md:h-4" />
            Renew Plan
          </button>
        </div>
      </div>
    </motion.div>
  );
}
