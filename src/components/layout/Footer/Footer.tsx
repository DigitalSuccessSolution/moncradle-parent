"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { subscribeToNewsletter } from "@/lib/api/newsletterApi";
import { Mail, MessageCircle, Globe } from "lucide-react";
import { FaFacebook, FaInstagram } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      await subscribeToNewsletter(email);
      toast.success("Subscribed successfully!");
      setEmail("");
    } catch (error: any) {
      toast.error(error?.message || "Failed to subscribe");
    } finally {
      setLoading(false);
    }
  };
  const authRoutes = ["/login", "/signup", "/forgot-password"];
  if (authRoutes.some(route => pathname?.startsWith(route))) {
    return null;
  }

  return (
    <footer className="bg-white pb-24 md:pb-10 pt-16 px-4 md:px-8 mt-12 hidden md:block">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">

        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <Link href="/" className="inline-block mb-4">
            <Image src="/logo.png" alt="moncradle Logo" width={180} height={50} className="w-auto h-10 object-contain" />
          </Link>
          <p className="text-sm text-gray-500 mb-6 max-w-xs leading-relaxed">
            A premium digital platform for modern parents to track, nurture, and celebrate their baby's milestones.
          </p>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#1877F2] hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
              <FaFacebook className="w-4 h-4" />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-[#E4405F] hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
              <FaInstagram className="w-4 h-4" />
            </a>

            <a href="mailto:support@moncradle.com" className="w-10 h-10 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-sm hover:shadow-md hover:-translate-y-1">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Links 1 */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-5">Features</h4>
          <ul className="space-y-3 text-sm font-medium text-gray-500">
            <li><Link href="/growth" className="hover:text-[var(--color-primary)] transition-colors">Growth Tracking</Link></li>
            <li><Link href="/nutrition" className="hover:text-[var(--color-primary)] transition-colors">Nutrition Plans</Link></li>
            <li><Link href="/growth/milestones" className="hover:text-[var(--color-primary)] transition-colors">Milestones</Link></li>
            <li><Link href="/health-records" className="hover:text-[var(--color-primary)] transition-colors">Health Records</Link></li>
            <li><Link href="/articles" className="hover:text-[var(--color-primary)] transition-colors">Blog & Articles</Link></li>
          </ul>
        </div>

        {/* Links 2 */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-5">Support</h4>
          <ul className="space-y-3 text-sm font-medium text-gray-500">
            <li><Link href="/help-support" className="hover:text-[var(--color-primary)] transition-colors">Contact Us</Link></li>
            <li><Link href="/help-support" className="hover:text-[var(--color-primary)] transition-colors">FAQs</Link></li>
            <li><Link href="/doctor" className="hover:text-[var(--color-primary)] transition-colors">Doctor Consult</Link></li>
            <li><Link href="/help-support" className="hover:text-[var(--color-primary)] transition-colors">Shipping Policy</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-5">Newsletter</h4>
          <p className="text-sm text-gray-500 mb-4 leading-relaxed">Subscribe for parenting tips and exclusive offers.</p>
          <form className="flex flex-col gap-3" onSubmit={handleSubscribe}>
            <input
              type="email"
              placeholder="Your email address"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white border border-gray-200 px-4 py-3 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all w-full"
            />
            <button type="submit" disabled={loading} className="bg-[var(--color-primary)] text-white px-5 py-3 rounded-xl font-semibold shadow-lg shadow-[var(--color-primary)]/20 hover:bg-[var(--color-primary)]/90 active:scale-95 transition-all w-full cursor-pointer disabled:opacity-50">
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        </div>

      </div>

      <div className="max-w-[1400px] mx-auto border-t border-gray-100 mt-16 pt-8 pb-4 flex flex-col lg:flex-row items-center justify-between gap-6 text-[13px] font-semibold text-gray-400">
        <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-center md:text-left">
          <p>© {new Date().getFullYear()} moncradle. All rights reserved.</p>
          <span className="hidden md:block w-1 h-1 rounded-full bg-gray-300"></span>
          <p className="flex items-center gap-1.5">
            Designed & Developed by
            <a 
              href="https://digitalsuccesssolutions.in/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-[var(--color-primary)] font-bold transition-colors relative group"
            >
              Digital Success Solutions
              <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-gray-300 group-hover:bg-[var(--color-primary)] transition-colors"></span>
            </a>
          </p>
        </div>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
