"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MoreVertical, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createBaby } from "@/lib/api/babiesApi";

interface BabyProfileSetupProps {
  onComplete: () => void;
}

export function BabyProfileSetup({ onComplete }: BabyProfileSetupProps) {
  const { logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [name, setName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"Boy" | "Girl" | "Private" | "">("");
  const [diet, setDiet] = useState<"Veg" | "Veg + Egg" | "Non-Veg" | "">("");

  const handleContinue = async () => {
    if (!name || !dob || !gender || !diet) return;

    setIsLoading(true);
    setError("");

    try {
      // Calculate age in months
      const birthDate = new Date(dob);
      const today = new Date();
      let months = (today.getFullYear() - birthDate.getFullYear()) * 12;
      months -= birthDate.getMonth();
      months += today.getMonth();
      const ageInMonths = months <= 0 ? 0 : months;

      await createBaby({
        name,
        dateOfBirth: dob,
        gender: gender.toLowerCase() as "boy" | "girl" | "private",
        diet: diet.toLowerCase() as "veg" | "veg + egg" | "non-veg",
        ageInMonths,
      });

      localStorage.setItem("hasSetBabyProfile", "true");
      onComplete();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      const message = apiError?.response?.data?.message || "Failed to save baby details. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col font-sans overflow-y-auto overscroll-none md:hidden">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col p-6 pt-12 md:p-12 max-w-md mx-auto w-full relative"
      >
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 relative">
          <h1 className="text-[22px] font-bold text-gray-800">
            Please fill your Baby's Details
          </h1>
          <button onClick={() => setShowMenu(!showMenu)} className="text-gray-400 p-1 relative z-10">
            <MoreVertical className="w-5 h-5" />
          </button>

          <AnimatePresence>
            {showMenu && (
              <>
                {/* Backdrop to close menu */}
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                
                {/* Dropdown Menu */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-10 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[140px] z-20 origin-top-right overflow-hidden"
                >
                  <button 
                    onClick={() => {
                      logout();
                      setShowMenu(false);
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 font-bold flex items-center gap-2 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6 flex-1">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Your baby's name</label>
            <input 
              type="text"
              placeholder="Enter the baby's name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          {/* DOB Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Select Date of Birth</label>
            <div className="relative">
              <input 
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-transparent border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[var(--color-primary)] transition-colors appearance-none"
              />
              {!dob && (
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none bg-white pr-4">
                  Add Date of Birth
                </div>
              )}
              <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Gender Field */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 ml-1">Your baby is a</label>
            <div className="flex gap-3">
              {(["Boy", "Girl", "Private"] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(g)}
                  className={`flex-1 py-2.5 rounded-full border transition-all text-sm font-medium ${gender === g ? 'border-gray-900 bg-gray-900 text-white shadow-md' : 'border-gray-300 text-gray-600 bg-transparent'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Diet Field */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700 ml-1">What diet do you follow?</label>
            <div className="flex gap-3">
              <button
                onClick={() => setDiet("Veg")}
                className={`flex-1 py-2.5 rounded-full border transition-all text-sm font-medium flex items-center justify-center gap-1.5 ${diet === "Veg" ? 'border-gray-900 bg-gray-900 text-white shadow-md' : 'border-gray-300 text-gray-600 bg-transparent'}`}
              >
                <span>🥕</span> Veg
              </button>
              <button
                onClick={() => setDiet("Veg + Egg")}
                className={`flex-1 py-2.5 rounded-full border transition-all text-sm font-medium flex items-center justify-center gap-1.5 ${diet === "Veg + Egg" ? 'border-gray-900 bg-gray-900 text-white shadow-md' : 'border-gray-300 text-gray-600 bg-transparent'}`}
              >
                <span>🥚</span> Veg + Egg
              </button>
              <button
                onClick={() => setDiet("Non-Veg")}
                className={`flex-1 py-2.5 rounded-full border transition-all text-sm font-medium flex items-center justify-center gap-1.5 ${diet === "Non-Veg" ? 'border-gray-900 bg-gray-900 text-white shadow-md' : 'border-gray-300 text-gray-600 bg-transparent'}`}
              >
                <span>🍗</span> Non-Veg
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-500 text-xs font-medium text-center mt-2 px-2">{error}</p>
        )}

        {/* Action Button */}
        <div className="mt-12 mb-4">
          <button
            onClick={handleContinue}
            disabled={!name || !dob || !gender || !diet || isLoading}
            className="w-full text-white py-4 rounded-full font-bold text-base transition-all disabled:bg-gray-300 disabled:opacity-100 bg-gray-900 active:scale-95 disabled:active:scale-100 shadow-md flex justify-center items-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Continue"
            )}
          </button>
        </div>

      </motion.div>
    </div>
  );
}
