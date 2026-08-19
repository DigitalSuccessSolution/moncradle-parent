import { motion } from "framer-motion";
import { X, Activity, Utensils, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface RecordDetailsModalProps {
  selectedRecord: any;
  setSelectedRecord: (record: any | null) => void;
  formatDate: (dateStr: string) => string;
}

export function RecordDetailsModal({ selectedRecord, setSelectedRecord, formatDate }: RecordDetailsModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedRecord(null)} />
      <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "tween", ease: [0.25, 1, 0.5, 1], duration: 0.4 }} className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">Record Details</h2>
          </div>
          <button onClick={() => setSelectedRecord(null)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <div className="px-6 pb-6 overflow-y-auto no-scrollbar space-y-5 bg-white">
          
          {/* Header: Uploaded by / Consulted by */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                {selectedRecord.uploadedByParent ? (
                  selectedRecord.babyId?.parentId?.avatar ? (
                    <img src={selectedRecord.babyId.parentId.avatar} alt="Parent" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-50 text-purple-500 font-bold">
                      P
                    </div>
                  )
                ) : (
                  <img src={selectedRecord.doctorId?.avatar || "/images/doctor_profile.png"} alt="Doctor" className="w-full h-full object-cover" />
                )}
              </div>
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  {selectedRecord.uploadedByParent ? "Uploaded By" : "Consulted By"}
                </p>
                <h3 className="text-sm font-bold text-gray-900">
                  {selectedRecord.uploadedByParent ? (selectedRecord.babyId?.parentId?.name ? `${selectedRecord.babyId.parentId.name} (Parent)` : "You (Self Upload)") : (selectedRecord.doctorId?.name ? `Dr. ${selectedRecord.doctorId.name}` : "Doctor")}
                </h3>
                {!selectedRecord.uploadedByParent && selectedRecord.doctorId?.specialization && (
                  <p className="text-[11px] text-[var(--color-primary)] font-medium">{selectedRecord.doctorId.specialization}</p>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Date</p>
              <p className="text-sm font-bold text-gray-900">{formatDate(selectedRecord.createdAt || new Date().toISOString())}</p>
            </div>
          </div>

          {/* Type Badge */}
          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
              selectedRecord.uploadedByParent
                ? "bg-purple-50 text-purple-600 border-purple-100"
                : "bg-blue-50 text-blue-600 border-blue-100"
            }`}>
              {selectedRecord.uploadedByParent ? "📄 My Health Report" : "💊 Doctor Prescription"}
            </span>
          </div>

          {/* Medical Notes */}
          <div className="p-4 bg-white border border-gray-100 rounded-2xl">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-[var(--color-primary)]" />
              <h4 className="text-[13px] font-bold text-gray-900">Medical Notes</h4>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {selectedRecord.medicalNotes || <span className="text-gray-400 italic">No medical notes provided.</span>}
            </p>
          </div>

          {/* Diet & Nutrition (only if exists) */}
          {selectedRecord.nutritionRecommendations && (
            <div className="p-4 bg-white border border-gray-100 rounded-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Utensils className="w-4 h-4 text-orange-500" />
                <h4 className="text-[13px] font-bold text-gray-900">Diet & Nutrition</h4>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{selectedRecord.nutritionRecommendations}</p>
            </div>
          )}

          {/* Vitals (if exists) */}
          {selectedRecord.vitals && (selectedRecord.vitals.weight || selectedRecord.vitals.temperature || selectedRecord.vitals.bp) && (
            <div className="p-4 bg-white border border-gray-100 rounded-2xl">
              <h4 className="text-[13px] font-bold text-gray-900 mb-3">Vitals</h4>
              <div className="grid grid-cols-3 gap-3">
                {selectedRecord.vitals.weight && (
                  <div className="text-center p-2 bg-blue-50 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">Weight</p>
                    <p className="text-sm font-bold text-gray-900">{selectedRecord.vitals.weight}</p>
                  </div>
                )}
                {selectedRecord.vitals.temperature && (
                  <div className="text-center p-2 bg-orange-50 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">Temp</p>
                    <p className="text-sm font-bold text-gray-900">{selectedRecord.vitals.temperature}</p>
                  </div>
                )}
                {selectedRecord.vitals.bp && (
                  <div className="text-center p-2 bg-red-50 rounded-xl">
                    <p className="text-[10px] text-gray-500 font-semibold mb-1">BP</p>
                    <p className="text-sm font-bold text-gray-900">{selectedRecord.vitals.bp}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Medicines (if exists) */}
          {selectedRecord.medicines && selectedRecord.medicines.length > 0 && (
            <div className="p-4 bg-white border border-gray-100 rounded-2xl">
              <h4 className="text-[13px] font-bold text-gray-900 mb-3">💊 Prescribed Medicines</h4>
              <div className="space-y-2">
                {selectedRecord.medicines.map((med: any, i: number) => (
                  <div key={i} className="flex items-start justify-between gap-2 p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{med.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{med.dosage} · {med.frequency} · {med.duration}</p>
                      {med.instructions && <p className="text-xs text-[var(--color-primary)] mt-0.5">{med.instructions}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Visit */}
          {selectedRecord.nextVisitDate && (
            <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-100 rounded-2xl">
              <Calendar className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Next Visit</p>
                <p className="text-sm font-bold text-gray-900">{formatDate(selectedRecord.nextVisitDate)}</p>
              </div>
            </div>
          )}

        </div>

        {selectedRecord.fileUrl && (
          <div className="p-4 bg-white sticky bottom-0 flex justify-end">
            <Button variant="primary" size="sm" className="px-6 py-2 rounded-lg cursor-pointer" leftIcon={<Download className="w-4 h-4" />} onClick={() => window.open(selectedRecord.fileUrl!, '_blank')}>
              Download
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
