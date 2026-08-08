"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, Search, MessageSquareText, Mail, Phone, 
  ChevronDown, ChevronUp, LifeBuoy, FileText
} from "lucide-react";
import { Header } from "@/components/layout/Header/Header";
import { Footer } from "@/components/layout/Footer/Footer";

const faqs = [
  {
    question: "How do I track my baby's growth?",
    answer: "You can track your baby's growth by navigating to the Growth Tracker section from the Account menu or Bottom Navigation. There you can log weight, height, and head circumference."
  },
  {
    question: "Where can I find my order history?",
    answer: "Your past and current orders are available in the 'Orders' section under your Account menu. You can track delivery status and view invoices there."
  },
  {
    question: "How do I book a consultation with a doctor?",
    answer: "Go to the 'Doctor' section from your Account or Home page, select a specialist, pick an available time slot, and confirm your booking. You will receive a notification with the meeting link."
  },
  {
    question: "Can I manage multiple baby profiles?",
    answer: "Currently, our platform supports one primary baby profile per account. We are working on adding multi-profile support in the upcoming updates."
  },
  {
    question: "How secure are my health records?",
    answer: "All your health records and medical data are encrypted with 256-bit SSL and securely stored. We comply with strict data privacy policies to ensure your information is safe."
  }
];

export default function HelpSupportPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-white font-sans pb-24 md:pb-0">
      <Header />
      
      {/* Mobile Header */}
      <header className="md:hidden flex items-center px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-all cursor-pointer">
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-900 ml-2">Help & Support</h1>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-10">
        
        {/* Desktop Title */}
        <div className="hidden md:flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2.5 rounded-full hover:bg-gray-200 transition-colors cursor-pointer bg-white shadow-sm border border-gray-200">
            <ArrowLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Help & Support</h1>
        </div>

        {/* 2-Column Grid for Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Contact & Search */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Search Bar */}
            <section className="bg-[var(--color-primary)] rounded-[32px] p-8 text-white shadow-lg shadow-blue-900/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <LifeBuoy className="w-32 h-32" />
              </div>
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-2">How can we help?</h2>
                <p className="text-indigo-100 text-sm mb-6">Search our knowledge base or reach out to our team.</p>
                <div className="relative">
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for answers..."
                    className="w-full px-5 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-[15px] font-semibold text-white placeholder:text-indigo-100 focus:outline-none focus:bg-white focus:text-gray-900 focus:placeholder:text-gray-400 transition-all pl-12"
                  />
                  <Search className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${searchQuery ? 'text-gray-400' : 'text-indigo-100'}`} />
                </div>
              </div>
            </section>

            {/* Contact Options */}
            <section className="px-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Us</h3>
              <div className="divide-y divide-gray-100">
                
                {/* Chat */}
                <div className="flex items-center gap-5 py-5 hover:bg-gray-50 transition-all cursor-pointer group">
                  <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <MessageSquareText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-[15px]">Live Chat Support</h4>
                    <p className="text-sm text-gray-500 mt-0.5">Usually replies in 2-3 minutes</p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-center gap-5 py-5 hover:bg-gray-50 transition-all cursor-pointer group">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-[15px]">Email Us</h4>
                    <p className="text-sm text-gray-500 mt-0.5">support@moncradel.com</p>
                  </div>
                </div>

                {/* Call */}
                <div className="flex items-center gap-5 py-5 hover:bg-gray-50 transition-all cursor-pointer group">
                  <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-[15px]">Call Us</h4>
                    <p className="text-sm text-gray-500 mt-0.5">1800-123-4567 (Mon-Fri, 9AM-6PM)</p>
                  </div>
                </div>

              </div>
            </section>
            
          </div>

          {/* Right Column: FAQs */}
          <div className="lg:col-span-7 pt-4 md:pt-0">
            <div className="sticky top-24 min-h-[500px]">
              
              <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center text-[var(--color-primary)]">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
              </div>

              {filteredFaqs.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 font-medium">No answers found for "{searchQuery}".<br/>Please try a different keyword or contact support.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredFaqs.map((faq, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                      <div 
                        key={index}
                        className={`transition-all duration-300 ${isOpen ? 'bg-[var(--color-primary)]/5 rounded-2xl' : 'hover:bg-gray-50 rounded-2xl'}`}
                      >
                        <button 
                          onClick={() => toggleFaq(index)}
                          className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
                        >
                          <span className={`font-bold text-[15px] ${isOpen ? 'text-[var(--color-primary)]' : 'text-gray-800'}`}>
                            {faq.question}
                          </span>
                          <div className={`shrink-0 ml-4 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-500'}`}>
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>
                        
                        <div 
                          className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                        >
                          <div className="p-5 pt-0 text-sm text-gray-600 leading-relaxed font-medium">
                            {faq.answer}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
