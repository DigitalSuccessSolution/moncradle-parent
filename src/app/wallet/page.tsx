"use client";

import { useAppSelector } from "@/store/hooks";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {  ChevronLeft, Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, Clock , Bell } from "lucide-react";
import { getWallet, Wallet, WalletTransaction } from "@/lib/api/walletApi";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function WalletPage() {
  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);
  const router = useRouter();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const data = await getWallet();
      setWallet(data);
    } catch (err) {
      console.error("Failed to fetch wallet", err);
    } finally {
      setIsLoading(false);
    }
  };

  const transactions = wallet?.transactions || [];

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0">
            
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">
        
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white mb-4">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">My Wallet</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => router.push('/notifications')} className="relative p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer group">
              <Bell className="w-6 h-6 text-gray-800 group-hover:text-black transition-colors" />
              {unreadNotificationsCount > 0 && <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>}
            </button>
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
        <div className="hidden md:flex flex-col mb-4 px-1">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">My Wallet</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">Manage your funds and view transaction history.</p>
        </div>

        {/* Balance Card */}
        <div className="bg-[var(--color-primary)] rounded-3xl p-8 relative overflow-hidden text-white shadow-xl shadow-[var(--color-primary)]/30">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <WalletIcon className="w-40 h-40 transform translate-x-1/4 -translate-y-1/4" />
          </div>
          
          <div className="relative z-10">
            <p className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-2">Available Balance</p>
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-black">
                {isLoading ? "..." : `₹${wallet?.balance?.toFixed(2) || "0.00"}`}
              </span>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-white text-[var(--color-primary)] font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-sm">
                <Plus className="w-5 h-5" />
                Add Funds
              </button>
              <button className="flex-1 bg-black/20 hover:bg-black/30 backdrop-blur-sm text-white font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-400" />
            Recent Transactions
          </h2>

          {isLoading ? (
            <div className="text-center py-8 text-gray-400 font-medium text-sm">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-10">
               <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <WalletIcon className="w-8 h-8 text-gray-300" />
               </div>
               <h3 className="text-gray-900 font-semibold mb-1">No transactions yet</h3>
               <p className="text-sm text-gray-500">Your wallet activity will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx._id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl transition-colors border border-transparent hover:border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {tx.type === 'credit' ? <ArrowDownLeft className="w-6 h-6" /> : <ArrowUpRight className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-[15px]">{tx.description}</h4>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className={`font-black text-lg ${tx.type === 'credit' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
      
          </div>
  );
}
