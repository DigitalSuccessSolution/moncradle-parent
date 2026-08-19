"use client";

import { useAppSelector } from "@/store/hooks";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, FileText, Bell, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getBabies } from "@/lib/api/babiesApi";
import { getPrescriptions, Prescription } from "@/lib/api/healthRecordsApi";
import { apiClient } from "@/lib/apiClient";

import { RecordDetailsModal } from "./components/RecordDetailsModal";
import { UploadModal } from "./components/UploadModal";
import { VaccinationsTab } from "./components/VaccinationsTab";
import { PrescriptionsTab } from "./components/PrescriptionsTab";
import { ReportsTab } from "./components/ReportsTab";

export default function HealthRecordsPage() {
  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);
  const router = useRouter();
  const [selectedRecord, setSelectedRecord] = useState<Prescription | null>(null);
  const [records, setRecords] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Reports");
  
  // Upload State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadNotes, setUploadNotes] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [babyId, setBabyId] = useState<string | null>(null);
  const [babyAgeMonths, setBabyAgeMonths] = useState<number>(0);

  const tabs = ["Reports", "Prescriptions", "Vaccinations"];

  const filteredRecords = records.filter(record => {
    if (activeTab === "Prescriptions") return !record.uploadedByParent;
    if (activeTab === "Reports") return !!record.uploadedByParent;
    return true;
  });

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const babyRes = await getBabies();
        const babies = babyRes.data || babyRes;
        if (babies && babies.length > 0) {
          const bId = babies[0]._id;
          setBabyId(bId);
          if (babies[0].dateOfBirth) {
            const dob = new Date(babies[0].dateOfBirth);
            const now = new Date();
            const months = (now.getFullYear() - dob.getFullYear()) * 12 + now.getMonth() - dob.getMonth();
            setBabyAgeMonths(Math.max(0, months));
          }
          const presRes = await getPrescriptions(bId);
          setRecords(presRes || []);
        }
      } catch (err) {
        console.error("Failed to fetch health records:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, []);

  const handleUpload = async () => {
    if (!file || !babyId) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("babyId", babyId);
    formData.append("file", file);
    formData.append("medicalNotes", uploadNotes);

    try {
      const res = await apiClient.post("/prescriptions", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        setRecords([res.data.data, ...records]);
        setIsUploadModalOpen(false);
        setFile(null);
        setUploadNotes("");
        setActiveTab("Reports"); // Switch to reports tab to see the uploaded file
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (selectedRecord) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [selectedRecord]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0 relative">
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">
        
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white mb-4">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">Health Records</h1>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => router.push('/notifications')} className="relative p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer group">
              <Bell className="w-6 h-6 text-gray-800 group-hover:text-black transition-colors" />
              {unreadNotificationsCount > 0 && <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>}
            </button>
          </div>
        </div>

        {/* Desktop Navigation */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center mb-2 -ml-3 md:ml-0"
        >
          <button 
            onClick={() => router.back()} 
            className="flex items-center gap-1 px-3 py-2 rounded-full text-gray-700 hover:bg-gray-100 hover:text-[var(--color-primary)] transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
            <span className="font-semibold text-[15px]">Back</span>
          </button>
        </motion.div>

        {/* Desktop Page Header */}
        <div className="hidden md:flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 px-1">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Health Records</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage prescriptions, doctor notes, and dietary recommendations.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 text-blue-600 px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 border border-blue-100 shadow-sm">
              <FileText className="w-4 h-4" /> {records.length} Records
            </div>
            {activeTab === "Reports" && (
              <Button variant="primary" onClick={() => setIsUploadModalOpen(true)} leftIcon={<UploadCloud className="w-4 h-4" />}>
                Upload Document
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Upload FAB */}
        <AnimatePresence>
          {activeTab === "Reports" && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="md:hidden fixed bottom-24 right-6 z-50"
            >
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="w-14 h-14 bg-[var(--color-primary)] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#8A84C8]/40 hover:scale-105 active:scale-95 transition-all"
              >
                <UploadCloud className="w-6 h-6" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs Navigation */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                activeTab === tab
                  ? "bg-[var(--color-primary)] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
             <div className="w-8 h-8 border-4 border-gray-100 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
          </div>
        ) : activeTab === "Vaccinations" ? (
          <VaccinationsTab babyAgeMonths={babyAgeMonths} babyId={babyId as string} />
        ) : activeTab === "Prescriptions" ? (
          <PrescriptionsTab records={filteredRecords} setSelectedRecord={setSelectedRecord} formatDate={formatDate} />
        ) : activeTab === "Reports" ? (
          <ReportsTab records={filteredRecords} setSelectedRecord={setSelectedRecord} formatDate={formatDate} />
        ) : null}
      </main>
      
      <AnimatePresence>
        {selectedRecord && (
          <RecordDetailsModal
            selectedRecord={selectedRecord}
            setSelectedRecord={setSelectedRecord}
            formatDate={formatDate}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isUploadModalOpen && (
          <UploadModal
            setIsUploadModalOpen={setIsUploadModalOpen}
            setFile={setFile}
            file={file}
            uploadNotes={uploadNotes}
            setUploadNotes={setUploadNotes}
            handleUpload={handleUpload}
            isUploading={isUploading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
