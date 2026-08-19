import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-border p-6 rounded-full mb-6">
        <FileQuestion className="w-16 h-16 text-neutral" />
      </div>
      
      <h2 className="text-3xl font-bold text-foreground mb-3">
        Page Not Found
      </h2>
      <p className="text-neutral max-w-md mb-8">
        We couldn't find the page you're looking for. It might have been removed, renamed, or didn't exist in the first place.
      </p>
      
      <Link 
        href="/"
        className="flex items-center gap-2 bg-primary hover:bg-primary-light text-white px-6 py-3 rounded-full font-medium transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>
    </div>
  );
}
