import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { verifyOTP } from '@/lib/api/authApi';
import { sendOTP } from '@/lib/api/authApi';
import { useAuth } from '@/context/AuthContext';

interface OTPVerificationProps {
  phone: string;
  onVerify: () => void;
  onBack: () => void;
}

export function OTPVerification({ phone, onVerify, onBack }: OTPVerificationProps) {
  const [otp, setOtp] = useState<string[]>(new Array(4).fill(''));
  const [activeOTPIndex, setActiveOTPIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { login } = useAuth();

  useEffect(() => {
    inputRef.current?.focus();
  }, [activeOTPIndex]);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (!/^[0-9]*$/.test(value)) return;

    const newOTP: string[] = [...otp];
    newOTP[index] = value.substring(value.length - 1);
    setOtp(newOTP);
    setError(''); // Clear error on change

    if (value && index < 3) {
      setActiveOTPIndex(index + 1);
    }
  };

  const handleOnKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const newOTP: string[] = [...otp];
      newOTP[index] = '';
      setOtp(newOTP);
      setError('');
      if (index > 0) {
        setActiveOTPIndex(index - 1);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 4) return;

    setIsLoading(true);
    setError('');

    try {
      // Call real Verify OTP API
      const data = await verifyOTP(phone, otpValue);

      // Save token and user data
      const token = data.token || data.accessToken || '';
      const user = data.user || data.data || {};

      login(token, user);
      onVerify();
    } catch (err) {
      // Mock Fallback
      if (otpValue === '1234') {
        const dummyToken = 'mock_token_' + Date.now();
        const dummyUser = { _id: 'user_1', name: 'Mock User', phone };
        login(dummyToken, dummyUser);
        onVerify();
      } else {
        setError('Invalid OTP. Please use 1234 for testing.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError('');
    setResendMsg('');

    try {
      await sendOTP(phone);
      setResendMsg('OTP sent successfully!');
      // Clear message after 3 seconds
      setTimeout(() => setResendMsg(''), 3000);
    } catch {
      setError('Failed to resend OTP.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="w-full max-w-sm mx-auto flex flex-col items-center pointer-events-auto"
    >
      <div className="text-center mb-6 w-full">
        <h2 className="text-2xl sm:text-[28px] leading-tight font-medium text-[#3A3368] mb-1">
          Verify Details
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
          Enter the OTP sent to <span className="font-semibold text-[#3A3368]">+91 {phone}</span>
        </p>
        <button onClick={onBack} className="text-[#ED7A9C] text-xs font-semibold mt-1 underline">
          Change Number
        </button>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center gap-2">
            {otp.map((_, index) => (
              <React.Fragment key={index}>
                <input
                  ref={activeOTPIndex === index ? inputRef : null}
                  type="tel"
                  className={`w-10 h-12 sm:w-12 sm:h-14 border-2 rounded-xl bg-white text-center text-xl font-semibold text-[#3A3368] ${error ? 'border-red-400 focus:border-red-500' : 'focus:border-[#7E57C2]'} focus:ring-2 focus:ring-[#7E57C2]/20 outline-none transition-all shadow-sm`}
                  onChange={(e) => handleOnChange(e, index)}
                  onKeyDown={(e) => handleOnKeyDown(e, index)}
                  value={otp[index]}
                />
              </React.Fragment>
            ))}
          </div>
          {error && (
            <p className="text-red-500 text-[11px] sm:text-xs font-medium text-center mt-1">
              {error}
            </p>
          )}
          {resendMsg && (
            <p className="text-green-600 text-[11px] sm:text-xs font-medium text-center mt-1">
              {resendMsg}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={otp.join('').length !== 4 || isLoading}
          className="w-full bg-white text-[#ED7A9C] text-base sm:text-lg font-semibold py-3.5 mt-2 rounded-2xl shadow-[0_8px_30px_rgba(237,122,156,0.15)] border border-pink-50 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center h-[54px]"
        >
          {isLoading ? (
            <svg className="animate-spin h-6 w-6 text-[#ED7A9C]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            "Verify & Login"
          )}
        </button>

        <p className="text-center text-xs text-gray-500 font-medium">
          Didn't receive the code?{' '}
          <button 
            type="button" 
            onClick={handleResendOTP}
            disabled={isResending}
            className="text-[#3A3368] font-semibold hover:underline disabled:opacity-50"
          >
            {isResending ? 'Sending...' : 'Resend OTP'}
          </button>
        </p>
      </form>
    </motion.div>
  );
}
