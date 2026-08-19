"use client";

import { WifiOff, RefreshCcw } from "lucide-react";

export default function OfflineFallback() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-[var(--pastel-orange)]/10 p-6 rounded-full mb-6">
        <WifiOff className="w-16 h-16 text-[var(--pastel-orange)]" />
      </div>
      
      <h2 className="text-2xl font-bold text-foreground mb-3">
        You're Offline
      </h2>
      <p className="text-neutral max-w-md mb-8">
        It looks like you've lost your internet connection. Some features might be unavailable until you reconnect.
      </p>
      
      <button 
        onClick={() => window.location.reload()}
        className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-full font-medium transition-colors"
      >
        <RefreshCcw className="w-4 h-4" />
        Retry Connection
      </button>
    </div>
  );
}
