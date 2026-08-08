"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header/Header";

import { Footer } from "@/components/layout/Footer/Footer";
import { ArrowLeft, Bell, ShoppingBag, Calendar, CheckCircle2, X, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Dummy data matching backend: notification.model.js
const MOCK_NOTIFICATIONS = [
  {
    _id: "notif_1",
    title: "Appointment Reminder",
    message: "You have a scheduled video consultation with Dr. Ananya Sharma tomorrow at 10:30 AM.",
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    type: "appointment" // UI helper based on context
  },
  {
    _id: "notif_2",
    title: "Order Shipped!",
    message: "Your Monthly Meals subscription pack has been shipped and will arrive today.",
    isRead: false,
    orderId: "ord_123",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    type: "order"
  },
  {
    _id: "notif_3",
    title: "New Prescription Added",
    message: "Dr. Rahul Verma has uploaded a new prescription and diet chart for Aarav.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    type: "health"
  },
  {
    _id: "notif_4",
    title: "System Update",
    message: "Welcome to Moncradel! Explore our new premium features for your baby's growth.",
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    type: "system"
  }
];

export default function NotificationsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  
  // In a real app, this would call an API. Here we just mock the local state if needed.
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [selectedNotif, setSelectedNotif] = useState<typeof MOCK_NOTIFICATIONS[0] | null>(null);

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

  const handleNotifClick = (notif: typeof MOCK_NOTIFICATIONS[0]) => {
    setSelectedNotif(notif);
    if (!notif.isRead) {
      setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
    }
  };

  const filteredNotifications = notifications.filter(notif => 
    activeTab === "all" ? true : !notif.isRead
  );

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string, isRead: boolean) => {
    const baseClass = `w-5 h-5 ${isRead ? 'text-gray-400' : 'text-[var(--color-primary)]'}`;
    switch (type) {
      case 'order': return <ShoppingBag className={baseClass} />;
      case 'appointment': return <Calendar className={baseClass} />;
      case 'health': return <CheckCircle2 className={baseClass} />;
      default: return <Bell className={baseClass} />;
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 1) {
      return date.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).toUpperCase();
    }
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0">
      <Header />

      {/* Mobile Back Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Notifications</h1>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
        
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Stay updated with your baby's appointments and orders.</p>
          </div>
        </div>

        <div className="flex flex-row items-center justify-between gap-4 mb-6">
          {/* Tabs */}
          <div className="flex gap-8 px-2">
            <button 
              onClick={() => setActiveTab("all")}
              className={`text-sm md:text-base font-semibold transition-all ${activeTab === "all" ? "text-black" : "text-gray-500 hover:text-black"}`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab("unread")}
              className={`text-sm md:text-base font-semibold transition-all ${activeTab === "unread" ? "text-black" : "text-gray-500 hover:text-black"}`}
            >
              Unread
            </button>
          </div>

          {/* Mark all as read */}
          {notifications.some(n => !n.isRead) && (
            <button 
              onClick={markAllAsRead}
              className="text-xs sm:text-sm font-semibold text-black hover:text-gray-700 transition-colors px-2"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="md:bg-white md:rounded-lg md:border md:border-gray-100 md:shadow-[var(--shadow-soft)] overflow-hidden">
          {filteredNotifications.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No notifications</h3>
              <p className="text-sm text-gray-500 font-medium">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredNotifications.map((notif) => (
                <div 
                  key={notif._id} 
                  onClick={() => handleNotifClick(notif)}
                  className={`p-4 md:p-5 flex gap-4 transition-colors hover:bg-gray-50 cursor-pointer ${!notif.isRead ? 'bg-primary/[0.03]' : 'bg-white'}`}
                >
                  <div className="flex-shrink-0 relative mt-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${!notif.isRead ? 'bg-[var(--color-primary)]/10' : 'bg-gray-100'}`}>
                      {getIcon(notif.type, notif.isRead)}
                    </div>
                    {!notif.isRead && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-sm md:text-base font-bold truncate pr-4 text-black">
                        {notif.title}
                      </h3>
                      <span className="text-xs font-semibold text-gray-500 whitespace-nowrap flex-shrink-0">
                        {formatTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm leading-relaxed text-black font-medium">
                      {notif.message}
                    </p>
                    {notif.orderId && (
                      <div className="mt-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
                          Tap to View Details
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
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
              className="fixed bottom-0 left-0 right-0 md:inset-0 md:m-auto w-full md:w-[500px] h-fit max-h-[90vh] bg-white rounded-t-3xl md:rounded-2xl p-6 md:p-8 z-[101] flex flex-col gap-3 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                {getIcon(selectedNotif.type, false)}
                <button 
                  onClick={() => setSelectedNotif(null)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h2 className="text-xl md:text-2xl font-semibold text-black mb-1">{selectedNotif.title}</h2>
                <span className="text-sm font-semibold text-gray-500">
                  {new Date(selectedNotif.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <p className="mt-4 text-sm md:text-base leading-relaxed text-black font-medium bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-100">
                  {selectedNotif.message}
                </p>
              </div>

              {selectedNotif.orderId && (
                <button 
                  onClick={() => {
                    setSelectedNotif(null);
                    router.push('/orders');
                  }}
                  className="mt-2 w-full py-2.5 bg-[var(--color-primary)] text-white font-semibold text-base rounded-lg hover:bg-[var(--color-primary-light)] transition-colors shadow-md shadow-[var(--color-primary)]/20 active:scale-95"
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
                  className="mt-2 w-full py-2.5 bg-[var(--color-primary)] text-white font-semibold text-base rounded-lg hover:bg-[var(--color-primary-light)] transition-colors shadow-md shadow-[var(--color-primary)]/20 active:scale-95"
                >
                  View Appointment
                </button>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Footer />
      
    </div>
  );
}
