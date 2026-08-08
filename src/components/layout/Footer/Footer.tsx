import { HeartPulse, Mail, MessageCircle, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-[var(--color-border)] pb-24 md:pb-10 pt-16 px-4 md:px-8 mt-12 hidden md:block">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-[var(--color-primary)]/10 p-2 rounded-xl text-[var(--color-primary)]">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--color-primary)] leading-tight">MONCRADEL</h2>
              <p className="text-[9px] text-[var(--color-accent)] tracking-widest uppercase font-semibold">Nurturing Little Lives</p>
            </div>
          </div>
          <p className="text-sm text-gray-500 mb-6 max-w-xs">
            A premium digital platform for modern parents to track, nurture, and celebrate their baby's milestones.
          </p>
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 cursor-pointer hover:bg-[var(--color-primary)] hover:text-white transition-colors">
              <Globe className="w-5 h-5" />
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 cursor-pointer hover:bg-[var(--color-primary)] hover:text-white transition-colors">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 cursor-pointer hover:bg-[var(--color-primary)] hover:text-white transition-colors">
              <Mail className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Links 1 */}
        <div>
          <h4 className="font-bold text-gray-900 mb-5">Features</h4>
          <ul className="space-y-3 text-sm font-medium text-gray-500">
            <li className="hover:text-[var(--color-primary)] cursor-pointer transition-colors">Growth Tracking</li>
            <li className="hover:text-[var(--color-primary)] cursor-pointer transition-colors">Nutrition Plans</li>
            <li className="hover:text-[var(--color-primary)] cursor-pointer transition-colors">Milestones</li>
            <li className="hover:text-[var(--color-primary)] cursor-pointer transition-colors">Health Records</li>
          </ul>
        </div>

        {/* Links 2 */}
        <div>
          <h4 className="font-bold text-gray-900 mb-5">Support</h4>
          <ul className="space-y-3 text-sm font-medium text-gray-500">
            <li className="hover:text-[var(--color-primary)] cursor-pointer transition-colors">Contact Us</li>
            <li className="hover:text-[var(--color-primary)] cursor-pointer transition-colors">FAQs</li>
            <li className="hover:text-[var(--color-primary)] cursor-pointer transition-colors">Doctor Consult</li>
            <li className="hover:text-[var(--color-primary)] cursor-pointer transition-colors">Shipping Policy</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="font-bold text-gray-900 mb-5">Newsletter</h4>
          <p className="text-sm text-gray-500 mb-4">Subscribe for parenting tips and exclusive offers.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl text-sm font-medium outline-none focus:border-[var(--color-primary)] transition-colors w-full"
            />
            <button className="bg-[var(--color-primary)] text-white px-5 py-3 rounded-xl font-bold shadow-lg shadow-[var(--color-primary)]/20 hover:bg-[var(--color-primary-light)] transition-colors">
              Subscribe
            </button>
          </div>
        </div>

      </div>
      
      <div className="max-w-[1400px] mx-auto border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-gray-400">
        <p>© 2026 MONCRADEL. All rights reserved.</p>
        <div className="flex gap-6">
          <span className="hover:text-gray-600 cursor-pointer transition-colors">Privacy Policy</span>
          <span className="hover:text-gray-600 cursor-pointer transition-colors">Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
