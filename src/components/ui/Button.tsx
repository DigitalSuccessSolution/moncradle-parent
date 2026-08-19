import React, { ButtonHTMLAttributes, forwardRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility to merge tailwind classes safely
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "white";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 group cursor-pointer";
    
    const variants = {
      primary: "bg-[var(--color-primary)] text-white hover:opacity-90",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200/80",
      outline: "border border-gray-200 bg-transparent text-gray-700 hover:bg-gray-50 hover:text-gray-900",
      ghost: "bg-transparent text-gray-600 hover:bg-gray-100/50 hover:text-gray-900",
      danger: "bg-red-500 text-white hover:bg-red-600",
      white: "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50",
    };
    
    const sizes = {
      sm: "h-9 px-4 text-sm rounded-lg gap-1.5",
      md: "h-12 px-6 text-base rounded-xl gap-2",
      lg: "h-14 px-8 text-lg rounded-2xl gap-3",
      icon: "h-12 w-12 rounded-full p-0 flex items-center justify-center",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 h-5 w-5 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
