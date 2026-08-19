"use client";

import { useState, useEffect } from "react";


import { ChevronLeft, Bell, ShoppingBag, Calendar, CheckCircle2, X, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { getNotifications, markAsRead, Notification } from "@/lib/api/notificationsApi";
import { useAppDispatch } from "@/store/hooks";
import { decrementUnreadCount, markAllAsReadLocally as markAllAsReadRedux } from "@/store/slices/notificationsSlice";
export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        setIsLoading(true);
        const response = await getNotifications();
        if (response.success) {
          setNotifications(response.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  useEffect(() => {
    if (selectedNotif) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedNotif]);

  const handleNotifClick = async (notif: Notification) => {
    setSelectedNotif(notif);
    if (!notif.isRead) {
      // Optimistic update
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      dispatch(decrementUnreadCount());
      try {
        await markAsRead(notif._id);
      } catch (error) {
        console.error('Failed to mark notification as read', error);
      }
    }
  };

  const markAllAsReadLocally = async () => {
    const unreadIds = notifications.filter(n => !n.isRead).map(n => n._id);
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    dispatch(markAllAsReadRedux());
    for (const id of unreadIds) {
      try {
        await markAsRead(id);
      } catch (e) {
        // ignore errors for batch
      }
    }
  };

  const getIcon = (type: string) => {
    const baseClass = "w-6 h-6"; // Adjusted to match smaller container
    switch (type) {
      case 'order': return <ShoppingBag className={baseClass} />;
      case 'appointment': return <Calendar className={baseClass} />;
      case 'health': return <Bell className={baseClass} />; // The image used a bell for 'Important Announcement'
      default: return <Bell className={baseClass} />;
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'order': return 'bg-purple-100 text-purple-500';
      case 'appointment': return 'bg-blue-100 text-blue-500';
      case 'health': return 'bg-yellow-100 text-yellow-600';
      default: return 'bg-[#cbf1f9] text-[#1bbce6]'; // Matching the light cyan in the image
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 1) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const allCount = notifications.length;

  const filteredNotifications = notifications.filter(notif =>
    (activeTab === "all" ? true : !notif.isRead)
  );

  // Group by date
  const groupedNotifications = filteredNotifications.reduce((acc, notif) => {
    const date = new Date(notif.createdAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    let group = "Older";
    if (date.toDateString() === today.toDateString()) group = "Today";
    else if (date.toDateString() === yesterday.toDateString()) group = "Yesterday";

    if (!acc[group]) acc[group] = [];
    acc[group].push(notif);
    return acc;
  }, {} as Record<string, Notification[]>);

  const groupOrder = ["Today", "Yesterday", "Older"];

  return (
    <div className="min-h-screen bg-white font-sans pb-24 md:pb-0">
      

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">

        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 -mx-4 sm:-mx-6 -mt-4 sticky top-0 z-40 bg-white shadow-sm">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-base sm:text-lg font-semibold text-[#0F172A] ml-1">Notifications</h1>
          </div>

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
        <div className="hidden md:flex flex-col mb-4 px-1 lg:mb-6">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-sm md:text-base lg:text-lg text-gray-500 font-medium mt-1 lg:mt-2">Stay updated with your baby's appointments and orders.</p>
        </div>

        {/* Filters and Mark Read */}
        <div className="flex flex-row items-center justify-between px-3 sm:px-5 md:px-4 py-3 md:mb-6">
          <div className="flex gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center gap-2 sm:gap-3 pl-4 sm:pl-5 pr-1 sm:pr-1.5 py-1.5 rounded-full text-sm sm:text-[15px] font-medium transition-all ${activeTab === "all" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "bg-[#f3f4f8] text-gray-600"
                }`}
            >
              All
              <span className={`flex items-center justify-center min-w-[24px] sm:min-w-[28px] h-6 sm:h-7 rounded-full text-[11px] sm:text-xs font-semibold px-2 ${activeTab === "all" ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-primary)]/80 text-white"
                }`}>
                {allCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("unread")}
              className={`flex items-center gap-2 sm:gap-3 pl-4 sm:pl-5 pr-1 sm:pr-1.5 py-1.5 rounded-full text-sm sm:text-[15px] font-medium transition-all ${activeTab === "unread" ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)]" : "bg-[#f3f4f8] text-gray-600"
                }`}
            >
              Unread
              <span className={`flex items-center justify-center min-w-[24px] sm:min-w-[28px] h-6 sm:h-7 rounded-full text-[11px] sm:text-xs font-semibold px-2 ${activeTab === "unread" ? "bg-[var(--color-primary)] text-white" : "bg-[var(--color-primary)]/80 text-white"
                }`}>
                {unreadCount}
              </span>
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsReadLocally}
              className="text-sm sm:text-[15px] font-medium text-[var(--color-primary)] hover:opacity-80 transition-opacity whitespace-nowrap"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="md:bg-white md:rounded-lg md:border md:border-gray-100 md:overflow-hidden">
          {isLoading ? (
            <div className="px-5 md:px-6 pt-4 animate-pulse">
              <div className="w-20 h-5 bg-gray-200 rounded mb-4 mt-2"></div>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-0">
                  <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gray-100"></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <div className="w-1/2 h-4 bg-gray-200 rounded"></div>
                      <div className="w-10 h-3 bg-gray-100 rounded"></div>
                    </div>
                    <div className="w-3/4 h-3 bg-gray-100 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 sm:py-16 md:py-20 px-6 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-100/60 rounded-full flex items-center justify-center mb-4 sm:mb-5 md:mb-6">
                <Bell className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-[17px] md:text-xl font-semibold text-[#2a2d3a] mb-1.5 md:mb-2">No notifications yet</h3>
              <p className="text-xs sm:text-[14px] md:text-base text-gray-500 max-w-[200px] sm:max-w-[250px] md:max-w-[300px] mx-auto">When you get updates about orders or appointments, they'll show up here.</p>
            </div>
          ) : (
            <div className="px-3 sm:px-5 md:px-6 pt-2 sm:pt-4">
              {groupOrder.map(group => {
                if (!groupedNotifications[group] || groupedNotifications[group].length === 0) return null;
                return (
                  <div key={group} className="mb-6 sm:mb-8 last:mb-2">
                    <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-[#444a56] mb-3 sm:mb-4 px-1">{group}</h2>
                    <div className="flex flex-col">
                      {groupedNotifications[group].map((notif, idx) => (
                        <div
                          key={notif._id}
                          onClick={() => handleNotifClick(notif)}
                          className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4 px-1 sm:px-2 rounded-xl cursor-pointer transition-all hover:bg-gray-50 active:scale-[0.98]"
                        >
                          {/* Circular Icon */}
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex-shrink-0 rounded-full flex items-center justify-center ${getIconBgColor(notif.type)}`}>
                            {getIcon(notif.type)}
                          </div>

                          {/* Text Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start">
                              <h3 className="text-sm sm:text-[15px] md:text-[16px] lg:text-lg font-semibold text-[#2a2d3a] truncate pr-2">
                                {notif.title}
                              </h3>
                              {!notif.isRead && (
                                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[var(--color-primary)] rounded-full flex-shrink-0 mt-1 sm:mt-1.5 md:mt-2"></div>
                              )}
                            </div>
                            <div className="flex justify-between items-center mt-0.5 sm:mt-1 md:mt-1.5">
                              <p className="text-xs sm:text-[13px] md:text-[14px] lg:text-base text-gray-500 truncate pr-2 sm:pr-3">
                                {notif.message}
                              </p>
                              <span className="text-[10px] sm:text-[11px] md:text-[12px] lg:text-sm text-gray-400 whitespace-nowrap flex-shrink-0 font-medium">
                                {formatTimeAgo(notif.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* Notification Modal / Bottom Sheet */}
      <AnimatePresence>
        {selectedNotif && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNotif(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 md:inset-0 md:m-auto w-full md:w-[500px] lg:w-[600px] h-fit max-h-[90vh] bg-white rounded-t-3xl md:rounded-3xl p-5 sm:p-6 md:p-8 z-[101] flex flex-col gap-3 md:gap-4 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center ${getIconBgColor(selectedNotif.type)}`}>
                  {getIcon(selectedNotif.type)}
                </div>
                <button
                  onClick={() => setSelectedNotif(null)}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <div className="mt-2 sm:mt-3">
                <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-black mb-1 sm:mb-2 leading-tight">{selectedNotif.title}</h2>
                <span className="text-xs sm:text-sm md:text-[15px] font-semibold text-gray-500">
                  {new Date(selectedNotif.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <p className="mt-3 sm:mt-4 md:mt-5 text-sm sm:text-base md:text-lg leading-relaxed text-gray-700">
                  {selectedNotif.message}
                </p>
              </div>

              {selectedNotif.orderId && (
                <button
                  onClick={() => {
                    setSelectedNotif(null);
                    router.push('/orders');
                  }}
                  className="mt-3 sm:mt-4 md:mt-5 w-full py-2.5 sm:py-3 md:py-3.5 bg-[var(--color-primary)] text-white font-semibold text-sm sm:text-base md:text-lg rounded-xl hover:opacity-90 transition-opacity shadow-md active:scale-[0.98]"
                >
                  Track Order
                </button>
              )}
              {selectedNotif.type === 'appointment' && (
                <button
                  onClick={() => {
                    setSelectedNotif(null);
                    router.push('/appointments');
                  }}
                  className="mt-3 sm:mt-4 md:mt-5 w-full py-2.5 sm:py-3 md:py-3.5 bg-[var(--color-primary)] text-white font-semibold text-sm sm:text-base md:text-lg rounded-xl hover:opacity-90 transition-opacity shadow-md active:scale-[0.98]"
                >
                  View Appointment
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      
    </div>
  );
}
