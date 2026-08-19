"use client";

import { motion } from "framer-motion";
import { CalendarDays, Check, ChevronRight, Star } from "lucide-react";
import { SubscriptionPlan } from "@/lib/api/subscriptionsApi";

interface PlanCardProps {
  plan: SubscriptionPlan;
  index: number;
}

export default function PlanCard({ plan, index }: PlanCardProps) {
  const isPopular = index === 1 || plan.title?.toLowerCase().includes("month");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`relative flex flex-col rounded-2xl transition-all duration-300 hover:-translate-y-0.5 overflow-hidden ${
        isPopular
          ? "bg-[var(--color-primary)] text-white"
          : "bg-white border border-gray-100 hover:border-[var(--color-primary)]/20"
      }`}
    >
      {/* Popular badge */}
      {isPopular && (
        <div className="absolute top-4 right-4">
          <span className="flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest py-1 px-3 rounded-full border border-white/30">
            <Star className="w-2.5 h-2.5 fill-white" />
            Most Popular
          </span>
        </div>
      )}

      {/* Decorative circles on popular card */}
      {isPopular && (
        <>
          <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
          <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />
        </>
      )}

      <div className="p-6 flex flex-col flex-1">
        {/* Icon */}
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
            isPopular ? "bg-white/20" : "bg-[var(--color-primary)]/10"
          }`}
        >
          <CalendarDays
            className={`w-5 h-5 ${
              isPopular ? "text-white" : "text-[var(--color-primary)]"
            }`}
            strokeWidth={1.5}
          />
        </div>

        {/* Title & description */}
        <h3
          className={`text-lg md:text-xl font-semibold mb-1.5 ${
            isPopular ? "text-white" : "text-gray-900"
          }`}
        >
          {plan.title}
        </h3>
        <p
          className={`text-[13px] md:text-[15px] leading-relaxed mb-5 min-h-[36px] ${
            isPopular ? "text-white/70" : "text-gray-500"
          }`}
        >
          {plan.description}
        </p>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-6">
          <span
            className={`text-3xl md:text-4xl font-bold ${
              isPopular ? "text-white" : "text-gray-900"
            }`}
          >
            ₹{plan.price}
          </span>
          <span
            className={`text-sm md:text-base font-medium ${
              isPopular ? "text-white/60" : "text-gray-400"
            }`}
          >
            / {plan.durationInDays} days
          </span>
        </div>

        {/* Features */}
        <div className="flex-1">
          <ul className="space-y-3 mb-6">
            {(plan.features || []).map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isPopular
                      ? "bg-white/20 text-white"
                      : "bg-[var(--color-primary)]/10 text-[var(--color-primary)]"
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span
                  className={`text-[13px] md:text-[15px] font-medium leading-relaxed ${
                    isPopular ? "text-white/90" : "text-gray-700"
                  }`}
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        <button
          className={`w-full font-semibold text-[14px] md:text-[16px] py-3 md:py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer ${
            isPopular
              ? "bg-white text-[var(--color-primary)] hover:bg-white/90"
              : "bg-[var(--color-primary)] text-white hover:opacity-90"
          }`}
        >
          Subscribe Now
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
