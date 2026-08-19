import { motion } from "framer-motion";
import { X, UploadCloud, File, FileText } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface UploadModalProps {
  setIsUploadModalOpen: (isOpen: boolean) => void;
  setFile: (file: File | null) => void;
  file: File | null;
  uploadNotes: string;
  setUploadNotes: (notes: string) => void;
  handleUpload: () => void;
  isUploading: boolean;
}

export function UploadModal({
  setIsUploadModalOpen,
  setFile,
  file,
  uploadNotes,
  setUploadNotes,
  handleUpload,
  isUploading
}: UploadModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsUploadModalOpen(false)} />
      <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} className="relative w-full md:max-w-md bg-white rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
          <button onClick={() => setIsUploadModalOpen(false)} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* File Upload Zone */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Select File</label>
            <div className="relative group">
              <input 
                type="file" 
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                accept="image/*,application/pdf"
              />
              <div className={`w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-200 bg-gray-50 group-hover:bg-blue-50/50 group-hover:border-[var(--color-primary)] ${file ? 'border-[var(--color-primary)] bg-blue-50/30' : 'border-gray-200'}`}>
                {file ? (
                  <div className="flex flex-col items-center">
                     <div className="w-14 h-14 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center mb-3">
                       {file.type.includes('image') ? <File className="w-6 h-6 text-[var(--color-primary)]" /> : <FileText className="w-6 h-6 text-[var(--color-primary)]" />}
                     </div>
                     <p className="text-sm font-semibold text-gray-900 text-center max-w-[200px] truncate">{file.name}</p>
                     <p className="text-xs text-gray-500 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <>
                    <div className="w-14 h-14 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6 text-[var(--color-primary)]" />
                    </div>
                    <p className="text-sm font-semibold text-gray-900">Click or drag file to upload</p>
                    <p className="text-xs text-gray-500 mt-1">Image or PDF (max. 10MB)</p>
                  </>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Document Title / Notes</label>
            <textarea 
              value={uploadNotes} 
              onChange={(e) => setUploadNotes(e.target.value)} 
              placeholder="E.g. Monthly Checkup Blood Report..." 
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-4 focus:ring-[var(--color-primary)]/10 focus:border-[var(--color-primary)] outline-none resize-none h-28 transition-all shadow-sm" 
            />
          </div>

          <div className="pt-2">
            <Button variant="primary" fullWidth size="lg" onClick={handleUpload} disabled={!file || isUploading}>
              {isUploading ? "Uploading..." : "Save Document"}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
