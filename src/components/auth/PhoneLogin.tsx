import React, { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { sendOTP } from '@/lib/api/authApi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const phoneSchema = z.object({
  phone: z.string().regex(/^\d{10}$/, "Please enter a valid 10-digit mobile number")
});

type PhoneFormValues = z.infer<typeof phoneSchema>;

interface PhoneLoginProps {
  onSuccess: (phone: string) => void;
}

export function PhoneLogin({ onSuccess }: PhoneLoginProps) {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors, isValid } } = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    mode: "onChange",
    defaultValues: { phone: '' }
  });

  const onSubmit = async (data: PhoneFormValues) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await sendOTP(data.phone);
      toast.success(`OTP sent: ${response.otp}`);
      onSuccess(data.phone);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to send OTP. Please try again.');
      toast.error('Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
      className="w-full max-w-sm mx-auto flex flex-col items-center pointer-events-auto"
    >
      <div className="text-center mb-6 w-full">
        <h2 className="text-2xl sm:text-[28px] leading-tight font-medium text-[#3A3368] mb-1">
          Welcome to
        </h2>
        <h2 className="text-3xl sm:text-[32px] leading-tight font-medium text-[#ED7A9C]">
          moncradle
        </h2>
        <p className="text-xs sm:text-sm text-gray-500 mt-2 font-medium">
          Enter your mobile number to get started
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
        <div>
          <div className={`flex items-center bg-white rounded-full border ${errors.phone || error ? 'border-red-400' : 'border-[#7E57C2]'} shadow-sm px-5 py-3.5 focus-within:ring-2 focus-within:ring-[#7E57C2]/20 transition-all`}>
            {/* Country Code */}
            <div className="flex items-center gap-2 pr-3 border-r border-gray-300">
              <span className="text-xl">🇮🇳</span>
              <span className="text-gray-800 font-semibold text-sm sm:text-base">+91</span>
            </div>
            {/* Input Field */}
            <input
              type="tel"
              {...register('phone', {
                onChange: (e) => {
                  e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
                }
              })}
              placeholder="Mobile Number"
              className="flex-1 min-w-0 w-full bg-transparent border-none outline-none pl-4 text-[#3A3368] font-semibold text-base sm:text-lg placeholder:text-gray-400 placeholder:font-medium"
            />
          </div>
          {(errors.phone || error) && (
            <p className="text-red-500 text-[11px] sm:text-xs font-medium mt-1.5 ml-4">
              {errors.phone?.message || error}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full bg-[#ED7A9C] text-white text-base sm:text-lg font-semibold py-3.5 mt-2 rounded-2xl shadow-lg shadow-pink-500/30 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:active:scale-100 flex justify-center items-center h-[54px]"
        >
          {isLoading ? (
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            "Send OTP"
          )}
        </button>
      </form>
    </motion.div>
  );
}
