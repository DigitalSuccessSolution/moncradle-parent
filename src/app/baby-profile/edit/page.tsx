"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/layout/Footer/Footer";
import { Header } from "@/components/layout/Header/Header";
import { getBabies, updateBaby, BabyProfile } from "@/lib/api/babiesApi";

export default function BabyEditProfilePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [formData, setFormData] = useState<Partial<BabyProfile>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBaby = async () => {
      try {
        const response = await getBabies();
        const babies = response.data || response;
        if (babies && babies.length > 0) {
          const fetchedBaby = babies[0];
          setBaby(fetchedBaby);
          setFormData({
            name: fetchedBaby.name || "",
            gender: fetchedBaby.gender || "Boy",
            dateOfBirth: fetchedBaby.dateOfBirth ? new Date(fetchedBaby.dateOfBirth).toISOString().split('T')[0] : "",
            weight: fetchedBaby.weight || "",
            height: fetchedBaby.height || "",
            medicalCondition: fetchedBaby.medicalCondition || ""
          });
        }
      } catch (error) {
        console.error("Failed to load baby profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBaby();
  }, []);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baby?._id) return;

    setIsSaving(true);
    setError("");
    try {
      await updateBaby(baby._id, formData);
      router.back();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError?.response?.data?.message || "Failed to update baby profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50/50 md:bg-gray-100/50 font-sans pb-24 md:pb-0">
      <Header />
      
      {/* Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer md:bg-white md:shadow-sm md:border md:border-gray-200">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 md:ml-6 md:flex-1">Edit Baby Profile</h1>
        <div className="w-10 md:hidden"></div>
      </header>

      <main className="max-w-4xl mx-auto px-0 sm:px-6 md:px-8 mt-0 md:mt-6">
        
        <div className="bg-white md:rounded-3xl md:shadow-sm md:border md:border-gray-100 p-6 md:p-12 pb-32 md:pb-12">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-indigo-50 shadow-sm bg-gray-100 flex items-center justify-center">
                 <span className="text-4xl md:text-5xl font-medium text-gray-400">J</span>
              </div>
              <button className="absolute bottom-0 right-0 md:bottom-1 md:right-1 bg-[var(--color-primary)] w-10 h-10 rounded-full flex items-center justify-center border-4 border-white text-white shadow-sm hover:scale-105 transition-transform cursor-pointer">
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6 md:space-y-8 max-w-2xl mx-auto relative">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Baby's Name */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[15px] font-medium text-gray-800">Your baby's name</label>
                </div>
                <input 
                  type="text" 
                  value={formData.name || ""}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-4 md:py-3.5 bg-white border border-gray-300 rounded-2xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all shadow-sm"
                  placeholder="Enter name"
                  required
                />
              </div>

              {/* Gender */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[15px] font-medium text-gray-800">Your baby is a</label>
                </div>
                <div className="flex gap-3 max-w-md">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, gender: "boy"})}
                    className={`flex-1 py-3.5 md:py-3 rounded-full text-sm font-semibold transition-all border shadow-sm cursor-pointer ${formData.gender === 'boy' || formData.gender === 'Boy' ? 'bg-[#0f2862] text-white border-[#0f2862]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                  >
                    Boy
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, gender: "girl"})}
                    className={`flex-1 py-3.5 md:py-3 rounded-full text-sm font-semibold transition-all border shadow-sm cursor-pointer ${formData.gender === 'girl' || formData.gender === 'Girl' ? 'bg-[#0f2862] text-white border-[#0f2862]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                  >
                    Girl
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, gender: "private"})}
                    className={`flex-1 py-3.5 md:py-3 rounded-full text-sm font-semibold transition-all border shadow-sm cursor-pointer ${formData.gender === 'private' || formData.gender === 'Private' || formData.gender === 'Other' ? 'bg-[#0f2862] text-white border-[#0f2862]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                  >
                    Private
                  </button>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[15px] font-medium text-gray-800">Select Date of Birth</label>
                </div>
                <input 
                  type="date" 
                  value={formData.dateOfBirth || ""}
                  onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                  className="w-full px-4 py-4 md:py-3.5 bg-white border border-gray-300 rounded-2xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all shadow-sm"
                  required
                />
              </div>

              {/* Premature Days */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[15px] font-medium text-gray-800">Premature Days</label>
                </div>
                <input 
                  type="number" 
                  defaultValue="0"
                  className="w-full px-4 py-4 md:py-3.5 bg-white border border-gray-300 rounded-2xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all shadow-sm"
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[15px] font-medium text-gray-800">Your Baby's Weight (kg)</label>
                </div>
                <input 
                  type="number"
                  step="0.1" 
                  value={formData.weight || ""}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  placeholder="---"
                  className="w-full px-4 py-4 md:py-3.5 bg-indigo-50/30 border border-indigo-200 rounded-2xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent focus:bg-indigo-50/50 transition-all shadow-sm"
                />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[15px] font-medium text-gray-800">Your Baby's Height (cm)</label>
                </div>
                <input 
                  type="number"
                  step="0.1" 
                  value={formData.height || ""}
                  onChange={(e) => setFormData({...formData, height: e.target.value})}
                  placeholder="---"
                  className="w-full px-4 py-4 md:py-3.5 bg-white border border-gray-300 rounded-2xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all shadow-sm"
                />
              </div>

              {/* Medical Condition */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[15px] font-medium text-gray-800">Medical Condition</label>
                </div>
                <textarea 
                  rows={3}
                  value={formData.medicalCondition || ""}
                  onChange={(e) => setFormData({...formData, medicalCondition: e.target.value})}
                  placeholder="---"
                  className="w-full px-4 py-4 md:py-3.5 bg-white border border-gray-300 rounded-2xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all shadow-sm resize-none"
                ></textarea>
              </div>

            </div>

            {/* Save Button */}
            <div className="pt-8 md:pt-6">
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full md:w-auto md:px-12 bg-[var(--color-primary)] text-white py-4 md:py-3.5 rounded-xl font-bold text-[15px] hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70 cursor-pointer md:ml-auto"
              >
                {isSaving ? "Saving..." : <><CheckCircle2 className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm font-medium text-center absolute -bottom-6 w-full">{error}</p>}
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
