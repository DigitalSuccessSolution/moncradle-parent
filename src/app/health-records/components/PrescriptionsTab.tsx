import { FileText, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface PrescriptionsTabProps {
  records: any[];
  setSelectedRecord: (record: any) => void;
  formatDate: (dateStr: string) => string;
}

export function PrescriptionsTab({ records, setSelectedRecord, formatDate }: PrescriptionsTabProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-lg border border-gray-100">
         <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
           <FileText className="w-8 h-8 text-gray-300" />
         </div>
         <p className="text-gray-500 font-medium">No prescriptions found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
      {records.map((record, i) => (
        <div key={record._id || i} className="bg-white rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex flex-col h-full cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0 flex items-center justify-center">
                <img src={record.doctorId?.avatar || "/images/doctor_profile.png"} alt={record.doctorId?.name || "Doctor"} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{record.doctorId?.name ? `Dr. ${record.doctorId.name}` : "Doctor"}</h3>
                <p className="text-[11px] font-medium text-gray-500">{record.doctorId?.specialization || "Specialist"}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-gray-500">
               <Calendar className="w-3.5 h-3.5" />
               <span>{formatDate(record.createdAt || new Date().toISOString())}</span>
            </div>
          </div>

          <div className="mb-5 flex-1">
            <span className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded uppercase tracking-wider mb-2 border bg-blue-50 text-blue-600 border-blue-100">
              Prescription
            </span>
            <p className="text-[13px] text-gray-600 font-medium line-clamp-2 mt-1">
              <span className="font-semibold text-gray-800 mr-1">Notes:</span> 
              {record.medicalNotes || "No medical notes."}
            </p>
          </div>

          <div className="flex gap-3 mt-auto">
            <Button variant="outline" size="sm" fullWidth onClick={() => setSelectedRecord(record)}>
              View Details
            </Button>
            {record.fileUrl && (
              <Button variant="primary" size="sm" fullWidth leftIcon={<Download className="w-4 h-4" />} onClick={(e) => { e.stopPropagation(); window.open(record.fileUrl, '_blank'); }}>
                Document
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
