"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, Sparkles, Layers, ShieldCheck, RefreshCw, Zap, HeartPulse, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getSubscriptions, getSubscriptionPlans, Subscription, SubscriptionPlan } from "@/lib/api/subscriptionsApi";
import SubscriptionCard from "@/components/subscriptions/SubscriptionCard";
import PlanCard from "@/components/subscriptions/PlanCard";
import { CardSkeleton, PlanSkeleton } from "@/components/subscriptions/SubscriptionSkeletons";

// ── Empty state (page-specific) ───────────────────────────────────────────────

function EmptyState({ onExplore }: { onExplore: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto">
          <Layers className="w-10 h-10 text-[var(--color-primary)]" strokeWidth={1.5} />
        </div>
        <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[var(--color-secondary)]/20 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-[var(--color-secondary)]" />
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No active subscriptions</h3>
      <p className="text-sm text-gray-500 max-w-xs leading-relaxed mb-6">
        You don't have any active plans yet. Explore our curated plans to get started with your baby's journey.
      </p>
      <button
        onClick={onExplore}
        className="flex items-center gap-2 bg-[var(--color-primary)] text-white font-semibold text-sm px-6 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all"
      >
        <Sparkles className="w-4 h-4" />
        Explore Plans
      </button>
    </motion.div>
  );
}

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left outline-none focus:outline-none"
      >
        <span className="text-[14px] md:text-[16px] font-semibold text-gray-900 pr-4">{question}</span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-4 text-[13px] md:text-[15px] text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"my_plans" | "explore">("my_plans");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [explorePlans, setExplorePlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchSubs = async () => {
      try {
        const [resSubs, resPlans] = await Promise.all([
          getSubscriptions(),
          getSubscriptionPlans(),
        ]);
        setSubscriptions(resSubs || []);
        setExplorePlans(resPlans || []);
        if (resSubs.length === 0) {
          setActiveTab("explore");
        }
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSubs();
  }, []);



  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans pb-24 md:pb-0">
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">

        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">Subscriptions</h1>
          </div>
        </div>

        {/* Desktop Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center -ml-3"
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
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="hidden md:flex flex-col md:flex-row md:items-start justify-between gap-4 px-1"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
              Manage Subscriptions
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              View and manage your active plans, or discover new ones tailored for your baby.
            </p>
          </div>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-2xl w-fit">
          {(["my_plans", "explore"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative px-5 py-2 rounded-xl text-[14px] font-semibold transition-all duration-200 outline-none focus:outline-none ${
                activeTab === tab
                  ? "bg-white text-gray-900 border border-gray-200"
                  : "text-gray-500 hover:text-gray-700 border border-transparent"
              }`}
            >
              {tab === "my_plans" ? "My Plans" : "Explore Plans"}
              {tab === "my_plans" && subscriptions.length > 0 && !isLoading && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold bg-[var(--color-primary)] text-white rounded-full">
                  {subscriptions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {activeTab === "my_plans" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {isLoading ? (
                  <>
                    <CardSkeleton />
                    <CardSkeleton />
                    <CardSkeleton />
                  </>
                ) : subscriptions.length === 0 ? (
                  <EmptyState onExplore={() => setActiveTab("explore")} />
                ) : (
                  subscriptions.map((sub, i) => (
                    <SubscriptionCard
                      key={sub._id || i}
                      sub={sub}
                      index={i}
                    />
                  ))
                )}
              </div>
            )}

            {activeTab === "explore" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
                {isLoading ? (
                  <>
                    <PlanSkeleton />
                    <PlanSkeleton />
                    <PlanSkeleton />
                  </>
                ) : explorePlans.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="col-span-full flex flex-col items-center justify-center py-16 px-4 text-center"
                  >
                    <div className="w-20 h-20 rounded-3xl bg-[var(--color-primary)]/10 flex items-center justify-center mx-auto mb-4">
                      <Sparkles
                        className="w-9 h-9 text-[var(--color-primary)]"
                        strokeWidth={1.5}
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No plans available
                    </h3>
                    <p className="text-sm text-gray-500 max-w-xs">
                      No subscription plans are available at the moment. Please check back soon.
                    </p>
                  </motion.div>
                ) : (
                  explorePlans.map((plan, index) => (
                    <PlanCard key={plan._id || index} plan={plan} index={index} />
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Why Subscribe section ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 px-1">Why Subscribe?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: ShieldCheck, label: "Expert-Approved",  desc: "Every plan is reviewed by certified child nutritionists", color: "bg-emerald-50 text-emerald-600" },
              { icon: RefreshCw,   label: "Flexible Plans",   desc: "Renew, pause, or cancel anytime — no hidden fees",       color: "bg-blue-50 text-blue-600" },
              { icon: Zap,         label: "Daily Fresh Meals", desc: "Age-appropriate meals prepared fresh every morning",     color: "bg-amber-50 text-amber-600" },
              { icon: HeartPulse,  label: "Growth Tracking",  desc: "Nutrition insights linked to your baby's health profile", color: "bg-rose-50 text-rose-600" },
            ].map(({ icon: Icon, label, desc, color }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                className="bg-white rounded-2xl p-4 border border-gray-100 flex flex-col gap-3"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <div>
                  <p className="text-[13px] md:text-[15px] font-semibold text-gray-900 leading-tight">{label}</p>
                  <p className="text-[11px] md:text-[13px] text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── FAQ section ── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-2 pb-4"
        >
          <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 px-1">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {[
              { q: "Can I pause my subscription?",        a: "Yes. Open your active plan, select Manage, and choose Pause. Your remaining days are preserved and resume when you unpause." },
              { q: "What happens after my plan expires?",  a: "Your plan moves to 'Expired' status and deliveries stop. You can renew at any time to start a fresh cycle." },
              { q: "Are meals customised for my baby?",    a: "Yes. Every meal plan is built around your baby's age, weight, allergies, and nutritional needs set in their profile." },
              { q: "How do I cancel a subscription?",      a: "Go to My Plans, open the plan, and select Manage → Cancel. The plan remains active until the end of the current cycle." },
              { q: "Will I be charged automatically?",     a: "No. Plans do not auto-renew. You will receive a reminder before expiry and can choose to renew manually." },
            ].map((item, i) => (
              <FaqItem
                key={i}
                question={item.q}
                answer={item.a}
                isOpen={openFaqIndex === i}
                onToggle={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
              />
            ))}
          </div>
        </motion.section>

      </main>
    </div>
  );
}
