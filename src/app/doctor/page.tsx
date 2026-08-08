"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header/Header";

import { Footer } from "@/components/layout/Footer/Footer";
import { Button } from "@/components/ui/Button";
import { Calendar as CalendarIcon, Video, Star, Clock, ArrowLeft, X, Shield, Award, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";

const MOCK_DOCTORS = [
  { 
    id: "doc1", 
    name: "Dr. Ananya Sharma", 
    spec: "Pediatrician", 
    exp: "12 yrs exp", 
    rating: "4.9", 
    reviews: 124,
    slots: "3 available today", 
    img: "/images/doctor_profile.png",
    languages: "English, Hindi",
    education: "MBBS, MD - Pediatrics",
    about: "Dr. Ananya Sharma is a highly experienced pediatrician specializing in infant care and early childhood development."
  },
  { 
    id: "doc2", 
    name: "Dr. Rahul Verma", 
    spec: "Child Nutritionist", 
    exp: "8 yrs exp", 
    rating: "4.8", 
    reviews: 89,
    slots: "1 available today", 
    img: "/images/doctor_profile.png",
    languages: "English",
    education: "BSc Nutrition, MSc Clinical Nutrition",
    about: "Dr. Rahul Verma focuses on customized dietary plans for growing babies to ensure optimal physical and mental growth."
  },
  { 
    id: "doc3", 
    name: "Dr. Smriti Gupta", 
    spec: "Dermatologist", 
    exp: "15 yrs exp", 
    rating: "5.0", 
    reviews: 210,
    slots: "Next available tomorrow", 
    img: "/images/doctor_profile.png",
    languages: "English, Hindi, Marathi",
    education: "MBBS, MD - Dermatology",
    about: "Dr. Smriti Gupta is an expert in pediatric dermatology, treating all kinds of infant skin conditions and allergies."
  },
];

export default function DoctorPage() {
  const router = useRouter();
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);

  useEffect(() => {
    if (selectedDoctor) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedDoctor]);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative">
      <Header />

      {/* Mobile Back Header */}
      <div className="md:hidden flex items-center justify-between px-6 py-4 sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="flex items-center">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900 ml-2">Find a Doctor</h1>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
        
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="hidden md:flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Consult a Doctor</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Book a clinic consultation with top pediatric specialists.</p>
          </div>
        </motion.div>

        {/* Categories */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          transition={{ delay: 0.1 }}
          className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0"
        >
           {["All Specialists", "Nutritionist", "Pediatrician", "Psychologist", "Lactation"].map((cat, i) => (
             <button key={i} className={`whitespace-nowrap px-6 py-2.5 rounded-full text-sm font-bold transition-colors ${i === 0 ? 'bg-[var(--color-primary)] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)]'}`}>
               {cat}
             </button>
           ))}
        </motion.div>

        {/* Doctor List */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 pt-2"
        >
          {MOCK_DOCTORS.map((doc, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group flex flex-col h-full cursor-pointer">
               <div className="flex flex-col gap-3 h-full">
                 
                 <div className="flex items-start gap-4">
                   <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 bg-blue-50/50">
                     <Image src={doc.img} alt={doc.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                   </div>
                   <div className="flex-1 min-w-0 pt-0.5">
                     <h3 className="font-semibold text-base text-gray-900 leading-tight truncate group-hover:text-[var(--color-primary)] transition-colors">{doc.name}</h3>
                     <p className="text-[11px] font-medium text-gray-500 mb-1.5 truncate">{doc.spec}</p>
                     
                     <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <div className="flex items-center gap-1 bg-amber-50/50 border border-amber-100 px-1.5 py-0.5 rounded text-[10px] font-semibold text-amber-600">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> {doc.rating}
                        </div>
                        <span className="text-[10px] font-semibold text-gray-500 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">{doc.exp}</span>
                     </div>
                     <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-1.5">
                       <Clock className="w-3 h-3" /> {doc.slots}
                     </div>
                   </div>
                 </div>
               
                 <div className="flex gap-2 mt-auto pt-3">
                   <Button variant="outline" size="sm" className="flex-1" onClick={() => setSelectedDoctor(doc)}>
                     Profile
                   </Button>
                   <Link href="/doctor/book" className="flex-1 block">
                     <Button variant="primary" size="sm" fullWidth leftIcon={<CalendarIcon className="w-3.5 h-3.5" />}>
                       Book
                     </Button>
                   </Link>
                 </div>

               </div>
            </motion.div>
          ))}
        </motion.div>

      </main>

      <Footer />
      

      {/* Doctor Profile Modal */}
      <AnimatePresence>
        {selectedDoctor && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedDoctor(null)}
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.4 }}
              className="relative w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white sticky top-0 z-10">
                <h2 className="text-lg font-bold text-gray-900">Doctor Profile</h2>
                <button 
                  onClick={() => setSelectedDoctor(null)}
                  className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors active:scale-95"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-white shadow-md bg-gray-50 mb-4">
                    <Image src={selectedDoctor.img} alt={selectedDoctor.name} width={96} height={96} className="object-cover" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{selectedDoctor.name}</h3>
                  <p className="text-sm font-bold text-[var(--color-primary)] mb-3">{selectedDoctor.spec}</p>
                  
                  <div className="flex items-center justify-center gap-4 w-full border-t border-gray-50 pt-4 mt-2">
                     <div className="flex-1 border-r border-gray-50">
                        <div className="flex items-center justify-center gap-1 text-amber-500 mb-0.5">
                          <Star className="w-4 h-4 fill-amber-500" />
                          <span className="font-bold text-base text-gray-900">{selectedDoctor.rating}</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{selectedDoctor.reviews} Reviews</p>
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center justify-center gap-1 text-[var(--color-primary)] mb-0.5">
                          <Award className="w-4 h-4" />
                          <span className="font-bold text-base text-gray-900">{selectedDoctor.exp.split(' ')[0]}</span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Experience</p>
                     </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-t border-gray-50 pt-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                       <Shield className="w-4 h-4 text-[var(--color-primary)]" /> About Doctor
                    </h4>
                    <p className="text-sm text-gray-600 font-medium leading-relaxed">
                      {selectedDoctor.about}
                    </p>
                  </div>
                  
                  <div className="border-t border-gray-50 pt-4 space-y-3">
                    <div>
                       <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Education</p>
                       <p className="text-sm font-bold text-gray-900">{selectedDoctor.education}</p>
                    </div>
                    <div>
                       <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Languages Spoken</p>
                       <p className="text-sm font-bold text-gray-900">{selectedDoctor.languages}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Actions */}
              <div className="p-4 bg-white sticky bottom-0 flex justify-center">
                <Link href="/doctor/book">
                  <Button variant="primary" size="sm" className="rounded-full" leftIcon={<CalendarIcon className="w-4 h-4" />} onClick={() => setSelectedDoctor(null)}>
                    Book Appointment
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
