"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service if needed
    console.error("Global error caught:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[var(--pastel-coral)]/10 p-4 rounded-full mb-6">
        <AlertCircle className="w-12 h-12 text-[var(--pastel-coral)]" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-3">
        Oops! Something went wrong
      </h2>
      <p className="text-neutral max-w-md mb-8">
        We ran into an unexpected issue while trying to load this page. Please try again.
      </p>
      
      <button
        onClick={() => reset()}
        className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-full font-medium transition-colors"
      >
        <RefreshCcw className="w-4 h-4" />
        Try Again
      </button>
    </div>
  );
}
