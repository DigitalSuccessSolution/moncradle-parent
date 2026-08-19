"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneLogin } from '@/components/auth/PhoneLogin';
import { OTPVerification } from '@/components/auth/OTPVerification';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handlePhoneSuccess = (phone: string) => {
    setPhoneNumber(phone);
    setStep('otp');
  };

  const handleOTPVerified = () => {
    // Login is handled inside OTPVerification via AuthContext
    // isAuthenticated update will trigger the useEffect redirect
  };

  const handleBackToPhone = () => {
    setStep('phone');
  };

  if (isAuthenticated) return null; // Avoid flashing login content

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-indigo-50 flex items-center justify-center p-4 sm:p-6 md:p-8">

      {/* Popup Style Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-[900px] min-h-[500px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col md:flex-row relative border border-white/50"
      >

        {/* LEFT SIDE (Desktop Image & Branding) */}
        <div className="relative hidden md:block w-full md:w-1/2 overflow-hidden bg-[#FAFBFC]">

          <Image
            src="/images/login_abstract_bg.png"
            alt="Authentication"
            fill
            priority
            className="object-cover object-center"
          />

          {/* Dark Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2C2652]/90 via-[#2C2652]/30 to-transparent z-10"></div>

          {/* Branding at the bottom */}
          <div className="absolute inset-0 flex flex-col justify-end p-10 lg:p-12 text-white z-20 pointer-events-none">
            <h1 className="text-3xl lg:text-4xl font-black mb-3 tracking-tight drop-shadow-md">moncradle</h1>
            <p className="text-sm lg:text-base text-white/90 font-medium max-w-[280px] leading-relaxed drop-shadow-sm">
              Your beautiful journey into parenthood starts here. Join our community for expert guidance.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE FORM CONTENT */}
        <div className="relative z-20 flex flex-col justify-center items-center w-full md:w-1/2 bg-white p-6 md:p-10 lg:p-12">

          <div className="w-full max-w-sm pointer-events-auto">
            {/* Mobile-only logo */}
            <div className="md:hidden text-center mb-8">
              <h1 className="text-3xl font-black text-[#3A3368] tracking-tight">moncradle</h1>
            </div>

            <AnimatePresence mode="wait">
              {step === 'phone' ? (
                <motion.div
                  key="phone"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PhoneLogin onSuccess={handlePhoneSuccess} />
                </motion.div>
              ) : (
                <motion.div
                  key="otp"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <OTPVerification
                    phone={phoneNumber}
                    onVerify={handleOTPVerified}
                    onBack={handleBackToPhone}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
