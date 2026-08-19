import { useState, useEffect } from "react";
import { Activity, CheckCircle2, Syringe, Loader2, Calendar, UserCircle, FileText, X } from "lucide-react";
import { getVaccinationSchedule, upsertVaccination } from "@/lib/api/healthRecordsApi";
import { motion, AnimatePresence } from "framer-motion";

interface VaccinationsTabProps {
  babyAgeMonths: number;
  babyId: string;
}

export function VaccinationsTab({ babyAgeMonths, babyId }: VaccinationsTabProps) {
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [selectedVaccine, setSelectedVaccine] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    givenDate: new Date().toISOString().split('T')[0],
    administeredBy: "",
    notes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchRecords = async () => {
    try {
      const data = await getVaccinationSchedule(babyId);
      setSchedule(data);
    } catch (error) {
      console.error("Failed to fetch vaccinations", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (babyId) {
      fetchRecords();
    }
  }, [babyId]);

  const openVaccineModal = (vaccineName: string) => {
    setSelectedVaccine(vaccineName);
    setFormData({
      givenDate: new Date().toISOString().split('T')[0],
      administeredBy: "",
      notes: ""
    });
  };

  const closeVaccineModal = () => {
    setSelectedVaccine(null);
  };

  const handleMarkGiven = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVaccine) return;
    setIsSubmitting(true);
    try {
      await upsertVaccination(babyId, {
        vaccineName: selectedVaccine,
        status: "given",
        givenDate: formData.givenDate ? new Date(formData.givenDate).toISOString() : undefined,
        administeredBy: formData.administeredBy,
        notes: formData.notes
      });
      await fetchRecords();
      closeVaccineModal();
    } catch (error) {
      console.error("Failed to update vaccination status", error);
    } finally {
      setIsSubmitting(false);
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--color-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-24 relative">
      <div className="flex items-center gap-3 mb-6 p-4 bg-blue-50/80 rounded-2xl border border-blue-100 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 shadow-inner">
          <Activity className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-[15px] font-bold text-blue-900">WHO / IAP Schedule</h3>
          <p className="text-xs text-blue-600/80 font-medium mt-0.5">Track your child's immunization journey</p>
        </div>
      </div>
      
      <div className="space-y-8">
        {Array.from(new Set(schedule.map(v => v.dueMonths))).sort((a, b) => a - b).map(dueMonths => {
          const vaccinesInGroup = schedule.filter(v => v.dueMonths === dueMonths);
          
          // Map dueMonths to human readable title
          let groupTitle = vaccinesInGroup[0]?.dueAgeLabel || `${dueMonths} Months`;

          // Determine overall status for this group's header
          const allGiven = vaccinesInGroup.every(v => v.computedStatus === "given" || v.computedStatus === "missed" || v.computedStatus === "skipped");

          return (
            <div key={dueMonths} className="relative">
              {/* Timeline Connector Line */}
              <div className="absolute left-[15px] top-[32px] bottom-[-40px] w-0.5 bg-gray-200/70 z-0"></div>

              <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] shrink-0 border-2 bg-white ${
                  allGiven ? "bg-green-100 text-green-700 border-green-200" : "text-gray-600 border-gray-300"
                }`}>
                  {allGiven ? <CheckCircle2 className="w-4 h-4" /> : groupTitle.split(' ')[0]}
                </div>
                <h3 className="font-bold text-gray-900 text-lg">{groupTitle}</h3>
              </div>

              <div className="flex flex-col gap-4 ml-12">
                {vaccinesInGroup.map((vaccine, i) => {
                  const status = vaccine.computedStatus;
                  const record = vaccine.record;

                  return (
                    <div key={i} className={`flex flex-col sm:flex-row sm:items-start gap-4 p-5 rounded-2xl border transition-all ${
                      status === "given" ? "bg-green-50/40 border-green-200" :
                      status === "overdue" ? "bg-red-50/50 border-red-200" :
                      status === "due" ? "bg-amber-50/50 border-amber-200" :
                      status === "upcoming" ? "bg-orange-50/30 border-orange-100" :
                      "bg-white border-gray-100 shadow-sm hover:shadow-md"
                    }`}>
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm ${
                          status === "given" ? "bg-green-100 text-green-600" :
                          status === "overdue" ? "bg-red-100 text-red-500" :
                          status === "due" ? "bg-amber-100 text-amber-500" :
                          status === "upcoming" ? "bg-orange-100 text-orange-500" :
                          "bg-gray-100 text-gray-400"
                        }`}>
                          {status === "given" ? <CheckCircle2 className="w-6 h-6" /> : <Syringe className="w-6 h-6" />}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-[16px] font-bold text-gray-900">{vaccine.name}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                              status === "given" ? "bg-green-100 text-green-700" :
                              status === "missed" ? "bg-red-800 text-white" :
                              status.includes("overdue") ? "bg-red-100 text-red-700" :
                              status.includes("due") ? "bg-amber-100 text-amber-700" :
                              status.includes("upcoming") ? "bg-orange-100 text-orange-700" :
                              status === "skipped" ? "bg-gray-200 text-gray-600" :
                              "bg-gray-100 text-gray-500"
                            }`}>
                              {status === "given" ? "Given" : 
                               status === "missed" ? "Missed" :
                               status === "skipped" ? "Skipped" :
                               status === "rescheduled_overdue" ? "Overdue (Rescheduled)" :
                               status === "rescheduled_due" ? "Due Now (Rescheduled)" :
                               status === "rescheduled_upcoming" ? "Soon (Rescheduled)" :
                               status === "rescheduled_future" ? "Rescheduled" :
                               status === "overdue" ? "Overdue" : 
                               status === "due" ? "Due Now" : 
                               status === "upcoming" ? "Soon" : "Upcoming"}
                            </span>
                          </div>
                          <p className="text-[13px] text-gray-500 font-medium mt-1 mb-2 leading-snug">{vaccine.description}</p>
                          
                          {/* Detailed Given Info */}
                          {status === "given" && record && (
                            <div className="mt-3 bg-white/60 p-3 rounded-xl border border-green-100/50 space-y-2">
                              {record.givenDate && (
                                <div className="flex items-center gap-2 text-[12px] text-gray-700">
                                  <Calendar className="w-3.5 h-3.5 text-green-600" />
                                  <span className="font-semibold text-green-800">Date:</span> 
                                  {new Date(record.givenDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </div>
                              )}
                              {record.administeredBy && (
                                <div className="flex items-center gap-2 text-[12px] text-gray-700">
                                  <UserCircle className="w-3.5 h-3.5 text-blue-500" />
                                  <span className="font-medium">Administered by: {record.administeredBy}</span>
                                </div>
                              )}
                              {record.notes && (
                                <div className="flex items-start gap-2 text-[12px] text-gray-700 mt-1">
                                  <FileText className="w-3.5 h-3.5 text-orange-400 mt-0.5 shrink-0" />
                                  <span className="italic">"{record.notes}"</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {status !== "given" && status !== "missed" && status !== "skipped" && (
                        <div className="shrink-0 mt-3 sm:mt-0 flex flex-col justify-center">
                          <button
                            onClick={() => openVaccineModal(vaccine.name)}
                            className="w-full sm:w-auto px-4 py-2 text-[13px] font-semibold bg-white border border-gray-200 shadow-sm text-gray-700 hover:text-[var(--color-primary)] hover:border-[var(--color-primary)] rounded-xl transition-colors flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark as Given
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Vaccine Details Modal */}
      <AnimatePresence>
        {selectedVaccine && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={closeVaccineModal}
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[400px] bg-white rounded-2xl shadow-xl z-50 overflow-hidden border border-gray-100"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Syringe className="w-5 h-5 text-[var(--color-primary)]" />
                  <h3 className="font-bold text-gray-900">Vaccination Details</h3>
                </div>
                <button onClick={closeVaccineModal} className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleMarkGiven} className="p-5 space-y-4">
                <div className="mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Vaccine Name</span>
                  <p className="text-lg font-bold text-gray-900">{selectedVaccine}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date Given *</label>
                  <input 
                    type="date" 
                    required
                    value={formData.givenDate}
                    onChange={(e) => setFormData({...formData, givenDate: e.target.value})}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Administered By (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Apollo Hospital / Dr. Smith"
                    value={formData.administeredBy}
                    onChange={(e) => setFormData({...formData, administeredBy: e.target.value})}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Notes / Batch No (Optional)</label>
                  <textarea 
                    placeholder="Any side effects observed or batch number"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-sm resize-none"
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-3 bg-[var(--color-primary)] text-white font-bold rounded-xl shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Confirm Vaccination
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
