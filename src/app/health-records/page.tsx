"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header/Header";

import { Footer } from "@/components/layout/Footer/Footer";
import { Button } from "@/components/ui/Button";
import Image from "next/image";
import { 
  ArrowLeft, FileText, Download, X, Calendar, 
  Stethoscope, Activity, Utensils
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

// Dummy data matching backend: prescription.model.js
const MOCK_RECORDS = [
  {
    _id: "rec_1",
    createdAt: "2026-07-28T09:30:00.000Z",
    doctorId: {
      _id: "doc1",
      name: "Dr. Ananya Sharma",
      specialization: "Pediatrician",
      image: "/images/doctor_profile.png"
    },
    fileUrl: "https://example.com/prescription1.pdf",
    medicalNotes: "Baby is recovering well from the mild viral infection. Ensure adequate hydration. Administer prescribed drops twice a day for 3 days.",
    nutritionRecommendations: "Continue breastfeeding. Introduce soft mashed fruits (like banana or apple puree) once a day."
  },
  {
    _id: "rec_2",
    createdAt: "2026-06-15T14:00:00.000Z",
    doctorId: {
      _id: "doc2",
      name: "Dr. Rahul Verma",
      specialization: "Child Nutritionist",
      image: "/images/doctor_profile.png"
    },
    fileUrl: "https://example.com/prescription2.pdf",
    medicalNotes: "General 6-month checkup. Weight and height are progressing along the 75th percentile. No medical concerns.",
    nutritionRecommendations: "Start weaning. Begin with iron-fortified baby cereal mixed with breastmilk. Avoid salt and sugar entirely for the first year."
  },
  {
    _id: "rec_3",
    createdAt: "2026-05-10T11:15:00.000Z",
    doctorId: {
      _id: "doc1",
      name: "Dr. Ananya Sharma",
      specialization: "Pediatrician",
      image: "/images/doctor_profile.png"
    },
    fileUrl: "",
    medicalNotes: "Routine vaccination completed (DTaP, IPV, Hep B). Mild fever expected for 24-48 hours.",
    nutritionRecommendations: "Feed more frequently to soothe the baby. Keep the child hydrated."
  }
];

export default function HealthRecordsPage() {
  const router = useRouter();
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedRecord) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedRecord]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
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
          <h1 className="text-lg font-bold text-gray-900 ml-2">Health Records</h1>
        </div>
      </div>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6">
        
        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Health Records</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage prescriptions, doctor notes, and dietary recommendations.</p>
          </div>
          <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
            <FileText className="w-4 h-4" /> {MOCK_RECORDS.length} Records Total
          </div>
        </div>

        {/* Records List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {MOCK_RECORDS.map((record) => (
            <div key={record._id} className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex flex-col h-full cursor-pointer">
              
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                    <Image src={record.doctorId.image} alt={record.doctorId.name} width={48} height={48} className="object-cover" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{record.doctorId.name}</h3>
                    <p className="text-[11px] font-medium text-gray-500">{record.doctorId.specialization}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
                   <Calendar className="w-3.5 h-3.5" />
                   <span>{formatDate(record.createdAt)}</span>
                </div>
              </div>

              <div className="mb-5 flex-1">
                <p className="text-[13px] text-gray-600 font-medium line-clamp-2">
                  <span className="font-semibold text-gray-800 mr-1">Notes:</span> 
                  {record.medicalNotes}
                </p>
              </div>

              <div className="flex gap-3 mt-auto">
                <Button 
                  variant="outline" 
                  size="sm" 
                  fullWidth 
                  onClick={() => setSelectedRecord(record)}
                >
                  View Details
                </Button>
                {record.fileUrl && (
                  <Button 
                    variant="primary" 
                    size="sm" 
                    fullWidth 
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={() => alert("Downloading prescription PDF...")}
                  >
                    Document
                  </Button>
                )}
              </div>

            </div>
          ))}
        </div>

      </main>

      <Footer />
      

      {/* Record Details Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setSelectedRecord(null)}
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.4 }}
              className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 bg-white sticky top-0 z-10">
                <div className="flex items-center gap-2">
                   <h2 className="text-lg font-semibold text-gray-900">Record Details</h2>
                </div>
                <button 
                  onClick={() => setSelectedRecord(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6 overflow-y-auto no-scrollbar space-y-6 bg-white">
                
                {/* Doctor & Date */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50">
                      <Image src={selectedRecord.doctorId.image} alt={selectedRecord.doctorId.name} width={40} height={40} className="object-cover" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-gray-500 mb-0.5">Consulted By</p>
                      <h3 className="text-sm font-semibold text-gray-900">{selectedRecord.doctorId.name}</h3>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-[11px] font-medium text-gray-500 mb-0.5">Date</p>
                     <p className="text-sm font-semibold text-gray-900">{formatDate(selectedRecord.createdAt)}</p>
                  </div>
                </div>

                {/* Medical Notes */}
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-4 h-4 text-[var(--color-primary)]" />
                      <h4 className="text-[13px] font-semibold text-gray-900">Medical Notes</h4>
                   </div>
                   <p className="text-sm text-gray-600 leading-relaxed">
                     {selectedRecord.medicalNotes || "No medical notes provided."}
                   </p>
                </div>

                {/* Nutrition Recommendations */}
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <Utensils className="w-4 h-4 text-orange-500" />
                      <h4 className="text-[13px] font-semibold text-gray-900">Diet & Nutrition</h4>
                   </div>
                   <p className="text-sm text-gray-600 leading-relaxed">
                     {selectedRecord.nutritionRecommendations || "No dietary recommendations provided."}
                   </p>
                </div>

              </div>

              {/* Actions */}
              {selectedRecord.fileUrl && (
                <div className="p-4 bg-white sticky bottom-0 flex justify-end">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="px-6 py-2 rounded-lg cursor-pointer"
                    leftIcon={<Download className="w-4 h-4" />} 
                    onClick={() => alert("Downloading document...")}
                  >
                    Download
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
