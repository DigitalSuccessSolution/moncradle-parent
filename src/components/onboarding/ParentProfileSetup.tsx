"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/lib/api/usersApi";

interface ParentProfileSetupProps {
  onComplete: () => void;
}

export function ParentProfileSetup({ onComplete }: ParentProfileSetupProps) {
  const { logout, user, login, token } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const handleContinue = async () => {
    if (!name) return;

    setIsLoading(true);
    setError("");

    try {
      const currentToken = token || localStorage.getItem("token") || "";
      
      if (!currentToken.startsWith("mock_")) {
        const data = new FormData();
        data.append("name", name.trim());
        if (email.trim()) data.append("email", email.trim());

        await updateUserProfile(data);
      }

      // Update auth context
      const updatedUser = { ...user, name: name.trim(), email: email.trim() };
      login(currentToken, updatedUser);

      localStorage.setItem("hasSetParentProfile", "true");
      onComplete();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      const message = apiError?.response?.data?.message || "Failed to save details. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white md:bg-black/50 md:backdrop-blur-sm flex flex-col font-sans overflow-y-auto overscroll-none md:p-12">
      <div className="md:m-auto w-full max-w-xl flex flex-col">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-1 md:flex-none flex flex-col p-6 pt-12 md:p-12 w-full relative bg-white md:rounded-[2rem] md:shadow-[0_8px_30px_rgb(0,0,0,0.12)] min-h-[100dvh] md:min-h-0"
        >
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8 relative">
          <h1 className="text-[22px] font-semibold text-gray-800">
            Welcome! What's your name?
          </h1>
        </div>

        <p className="text-sm text-gray-500 mb-8 font-medium">
          Let's get to know you before we setup your baby's profile.
        </p>

        {/* Form Fields */}
        <div className="flex-1 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Full Name <span className="text-red-500">*</span></label>
            <input 
              type="text"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[var(--color-primary)] transition-colors"
            />
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 ml-1">Email Address <span className="text-gray-400 font-normal">(Optional)</span></label>
            <input 
              type="email"
              placeholder="e.g. priya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border border-gray-300 rounded-xl px-4 py-3.5 text-gray-900 placeholder:text-gray-400 outline-none focus:border-[var(--color-primary)] transition-colors"
            />
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
            disabled={!name || isLoading}
            className="w-full text-white py-4 rounded-full font-semibold text-base transition-all disabled:bg-gray-300 disabled:opacity-100 bg-gray-900 active:scale-95 disabled:active:scale-100 shadow-md flex justify-center items-center"
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              "Continue to Baby Profile"
            )}
          </button>
        </div>

        </motion.div>

      </div>
    </div>
  );
}
