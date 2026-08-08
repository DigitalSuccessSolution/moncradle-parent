"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { AnimatePresence } from 'framer-motion';
import { PhoneLogin } from './PhoneLogin';
import { OTPVerification } from './OTPVerification';

export function AuthScreen() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    // Lock scroll for the auth screen on all devices
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.width = "100%";
    document.body.style.height = "100%";
    document.body.style.top = "0";
    document.body.style.left = "0";

    return () => {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
      document.body.style.height = "";
      document.body.style.top = "";
      document.body.style.left = "";
    };
  }, []);

  const handlePhoneSuccess = (phone: string) => {
    setPhoneNumber(phone);
    setStep('otp');
  };

  const handleOTPVerified = () => {
    // Login is handled inside OTPVerification via AuthContext
    // Nothing extra needed here
  };

  const handleBackToPhone = () => {
    setStep('phone');
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex flex-col md:hidden overflow-hidden h-[100dvh] w-full">

      {/* Full Screen Image Background (Matches Splash Screen) */}
      <div className="absolute inset-0 w-full h-full z-0 bg-[#FAFBFC]">
        <Image
          src="/images/image copy 3.png"
          alt="Authentication"
          fill
          priority
          className="object-cover object-center scale-110 origin-left"
        />
      </div>

      {/* Bottom Gradient Shadow for Text Readability */}
      <div
        className="absolute inset-0 w-full h-full z-10 pointer-events-none bg-gradient-to-t from-white via-white/95 to-transparent"
        style={{ backgroundSize: '100% 85%', backgroundRepeat: 'no-repeat', backgroundPosition: 'bottom' }}
      ></div>

      {/* Auth Content Wrapper */}
      <div className="relative z-20 flex flex-col justify-end items-center h-full w-full pointer-events-none pb-8">

        <div className="w-full px-6 max-w-md pointer-events-auto">
          <AnimatePresence mode="wait">
            {step === 'phone' ? (
              <PhoneLogin key="phone" onSuccess={handlePhoneSuccess} />
            ) : (
              <OTPVerification
                key="otp"
                phone={phoneNumber}
                onVerify={handleOTPVerified}
                onBack={handleBackToPhone}
              />
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
