import React from 'react';
import {
  Calendar as CalendarIcon,
  Flame,
  X,
  Utensils,
  Apple,
  Coffee,
  Cookie,
  Soup,
  Plus
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// Helper to format Date object as YYYY-MM-DD
const formatDateStr = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

interface MyMealScheduleProps {
  planDayMap: Record<string, any[]>;
  activeDay: string;
  setActiveDay: (dateStr: string) => void;
  isPlanLoading: boolean;
  activeSubscription: any | null;
  handleOpenMealPicker: () => void;
  handleRemoveMealFromDay: (entry: any) => void;
  setSelectedEntryDetail: (entry: any) => void;
}

const MEAL_SLOTS = [
  { type: "Breakfast", icon: Coffee, color: "text-amber-600" },
  { type: "Snack", icon: Apple, color: "text-red-500" },
  { type: "Lunch", icon: Utensils, color: "text-blue-500" },
  { type: "Evening Snack", icon: Cookie, color: "text-purple-500" },
  { type: "Dinner", icon: Soup, color: "text-emerald-600" },
];

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'delivered') return <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">✓ Delivered</span>;
  if (status === 'skipped') return <span className="text-[9px] font-bold bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full uppercase tracking-wide">⏭ Skipped</span>;
  if (status === 'ordered') return <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">📦 Ordered</span>;
  return <span className="text-[9px] font-bold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full uppercase tracking-wide">⏳ Pending</span>;
};

export const MyMealSchedule: React.FC<MyMealScheduleProps> = ({
  planDayMap,
  activeDay,
  setActiveDay,
  isPlanLoading,
  activeSubscription,
  handleOpenMealPicker,
  handleRemoveMealFromDay,
  setSelectedEntryDetail,
}) => {
  const router = useRouter();

  const dayEntries = activeDay ? (planDayMap[activeDay] || []) : [];
  const isEmpty = dayEntries.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-8 md:mt-10 flex flex-col"
    >
      <h3 className="text-[18px] md:text-xl font-semibold text-black leading-tight mb-5 md:mb-6 px-1">
        My Meal Schedule
      </h3>

      <div className="flex gap-2 md:gap-3 overflow-x-auto no-scrollbar py-2 mb-8 md:mb-10">
        {Object.keys(planDayMap).sort().map((dateStr) => {
          const dateObj = new Date(dateStr);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
          const dayNum = dateObj.getDate();
          const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' });

          const isToday = dateStr === formatDateStr(new Date());
          const isActive = activeDay === dateStr;
          const hasActiveMeals = planDayMap[dateStr]?.some(entry => entry.status !== 'skipped' && entry.status !== 'delivered');

          return (
            <button
              key={dateStr}
              onClick={() => setActiveDay(dateStr)}
              className={`relative px-4 md:px-5 py-2 md:py-2.5 rounded-xl text-center min-w-[70px] transition-all border ${isActive
                ? 'bg-[var(--color-primary)] text-white shadow-md border-[var(--color-primary)]'
                : 'bg-white border-gray-200 text-gray-600 hover:border-[var(--color-primary)]/50'
                }`}
            >
              <div className="text-[10px] uppercase font-extrabold opacity-80 mb-0.5">{dayName}</div>
              <div className="text-base font-black">{dayNum}</div>
              <div className="text-[9px] font-bold opacity-80">{monthName}</div>

              {isToday && (
                <span className={`absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border-2 border-white ${isActive ? 'bg-amber-400' : 'bg-[var(--color-primary)]'}`} title="Today" />
              )}
              {hasActiveMeals && !isActive && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar Day View */}
      {isPlanLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="animate-pulse bg-white rounded-lg border border-gray-100 overflow-hidden">
              <div className="w-full h-28 bg-gray-100"></div>
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (() => {
        // No subscription at all
        if (!activeSubscription && isEmpty) {
          return (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-base font-semibold text-gray-500">No active subscription found</p>
              <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">Subscribe to a meal plan to see your schedule here!</p>
              <div className="mt-6 flex justify-center">
                <button
                  onClick={() => router.push('/subscriptions')}
                  className="flex items-center gap-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary)]/90 text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Browse Plans
                </button>
              </div>
            </div>
          );
        }

        if (isEmpty) {
          const displayDate = activeDay ? new Date(activeDay).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';
          return (
            <div className="text-center py-12 bg-[#F8FAFC] rounded-xl border border-gray-100">
              <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-[15px] font-semibold text-gray-600">No delivery scheduled {activeDay ? `for ${displayDate}` : 'yet'}</p>
              <p className="text-xs text-gray-400 mt-1 mb-5">Add a meal to your cart to schedule a delivery for this day.</p>
              <button
                onClick={handleOpenMealPicker}
                disabled={!activeDay}
                className="inline-flex items-center gap-1.5 bg-white border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" /> Add Meal
              </button>
            </div>
          );
        }

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pt-2">
            {dayEntries.map((entry, idx) => {
              const { meal, scheduleId, timeSlot, status } = entry;
              const slot = MEAL_SLOTS[idx] || { type: "Meal", icon: Utensils, color: "text-gray-500" };
              const Icon = slot.icon;
              const isSkipped = status === 'skipped';
              const isDelivered = status === 'delivered';
              return (
                <div
                  key={`${scheduleId}-${idx}`}
                  className={`bg-white p-2.5 md:p-3.5 rounded-xl border transition-all duration-300 flex items-stretch gap-3.5 cursor-pointer ${isSkipped ? 'border-gray-200 opacity-60' : 'border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md'}`}
                  onClick={() => setSelectedEntryDetail(entry)}
                >
                  {/* Left: Image */}
                  <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 relative rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                    {(meal?.imageUrl || (meal?.images && meal.images.length > 0)) ? (
                      <Image
                        src={(meal?.imageUrl || meal?.images?.[0]) as string}
                        alt={meal?.name || slot.type}
                        fill
                        className={`object-cover transition-transform duration-500 ${!isSkipped ? 'group-hover:scale-110' : 'grayscale'}`}
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Utensils className="w-6 h-6 mb-1 opacity-30" />
                      </div>
                    )}
                  </div>

                  {/* Middle: Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className={`w-4 h-4 ${slot.color}`} strokeWidth={2.5} />
                        <span className="text-[11px] font-extrabold text-gray-700 uppercase tracking-wider">
                          {timeSlot ? timeSlot.split(' (')[0] : slot.type}
                        </span>
                      </div>
                      <h4 className={`text-[14px] font-bold leading-tight line-clamp-2 pr-2 ${isSkipped ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                        {meal?.name || "No meal assigned"}
                      </h4>
                      {meal?.nutritionalInfo?.calories && (
                        <p className="text-[12px] text-gray-500 mt-1 flex items-center gap-1">
                          <Flame className="w-3 h-3 text-orange-400" />
                          {meal.nutritionalInfo.calories} kcal
                        </p>
                      )}
                    </div>

                    <div className="mt-2">
                      <StatusBadge status={status} />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        );
      })()}
    </motion.div>
  );
};
