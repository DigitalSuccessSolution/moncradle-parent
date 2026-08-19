import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
      <p className="text-neutral font-medium">Loading...</p>
    </div>
  );
}
