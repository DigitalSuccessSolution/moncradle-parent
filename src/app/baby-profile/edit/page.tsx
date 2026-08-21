"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, CheckCircle2, Baby, ChevronDown } from "lucide-react";


import { getBabies, updateBaby, BabyProfile } from "@/lib/api/babiesApi";

const COMMON_ALLERGIES = ["Milk", "Eggs", "Peanuts", "Tree Nuts", "Soy", "Wheat", "Fish", "Shellfish"];
const COMMON_SYMPTOMS = ["Cold", "Cough", "Fever", "Teething", "Constipation", "Diarrhea", "Colic"];
export default function BabyEditProfilePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [baby, setBaby] = useState<BabyProfile | null>(null);
  const [formData, setFormData] = useState<Omit<Partial<BabyProfile>, 'allergies' | 'currentSymptoms'> & { allergies?: string | string[], currentSymptoms?: string | string[] }>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBaby = async () => {
      try {
        const response = await getBabies();
        const babies = response.data || response;
        console.log("FETCHED BABY DATA:", babies && babies.length > 0 ? babies[0] : null);
        if (babies && babies.length > 0) {
          const fetchedBaby = babies[0];
          setBaby(fetchedBaby);
          setFormData({
            name: fetchedBaby.name || "",
            gender: fetchedBaby.gender || "Boy",
            dateOfBirth: fetchedBaby.dateOfBirth ? new Date(fetchedBaby.dateOfBirth).toISOString().split('T')[0] : "",
            weight: fetchedBaby.weight || "",
            height: fetchedBaby.height || "",
            prematureDays: fetchedBaby.prematureDays || 0,
            diet: fetchedBaby.diet || "",
            medicalCondition: fetchedBaby.medicalCondition || "",
            bloodType: fetchedBaby.bloodType || "",
            allergies: fetchedBaby.allergies || [],
            currentSymptoms: fetchedBaby.currentSymptoms || []
          });
          if (fetchedBaby.avatar) {
            setAvatarPreview(fetchedBaby.avatar);
          }
        }
      } catch (error) {
        console.error("Failed to load baby profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBaby();
  }, []);
  
  const toggleAllergy = (allergy: string) => {
    const currentStr = Array.isArray(formData.allergies) ? formData.allergies.join(", ") : (formData.allergies || "");
    const list = currentStr.split(',').map(a => a.trim()).filter(a => a);
    
    if (list.includes(allergy)) {
      setFormData({...formData, allergies: list.filter(a => a !== allergy).join(', ')});
    } else {
      setFormData({...formData, allergies: [...list, allergy].join(', ')});
    }
  };

  const toggleSymptom = (symptom: string) => {
    const currentStr = Array.isArray(formData.currentSymptoms) ? formData.currentSymptoms.join(", ") : (formData.currentSymptoms || "");
    const list = currentStr.split(',').map(s => s.trim()).filter(s => s);
    
    if (list.includes(symptom)) {
      setFormData({...formData, currentSymptoms: list.filter(s => s !== symptom).join(', ')});
    } else {
      setFormData({...formData, currentSymptoms: [...list, symptom].join(', ')});
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baby?._id) return;

    setIsSaving(true);
    setError("");
    try {
      const data = new FormData();
      if (formData.name) data.append("name", formData.name);
      if (formData.gender) data.append("gender", formData.gender);
      if (formData.dateOfBirth) data.append("dateOfBirth", formData.dateOfBirth);
      if (formData.weight) data.append("weight", formData.weight.toString());
      if (formData.height) data.append("height", formData.height.toString());
      if (formData.prematureDays !== undefined) data.append("prematureDays", formData.prematureDays.toString());
      if (formData.diet) data.append("diet", formData.diet);
      if (formData.medicalCondition) data.append("medicalCondition", formData.medicalCondition);
      if (formData.bloodType) data.append("bloodType", formData.bloodType);
      if (formData.allergies !== undefined) {
        const allergyList = Array.isArray(formData.allergies) 
          ? formData.allergies 
          : typeof formData.allergies === 'string' 
            ? formData.allergies.split(',').map((a: string) => a.trim()).filter((a: string) => a)
            : [];
        data.append("allergies", JSON.stringify(allergyList));
      }
      if (formData.currentSymptoms !== undefined) {
        const symptomList = Array.isArray(formData.currentSymptoms) 
          ? formData.currentSymptoms 
          : typeof formData.currentSymptoms === 'string' 
            ? formData.currentSymptoms.split(',').map((s: string) => s.trim()).filter((s: string) => s)
            : [];
        data.append("currentSymptoms", JSON.stringify(symptomList));
      }
      if (avatarFile) data.append("avatar", avatarFile);

      await updateBaby(baby._id, data);
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
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0">
      
      
      {/* Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white sticky top-0 z-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer md:bg-white md:shadow-sm md:border md:border-gray-200">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg md:text-2xl font-semibold text-gray-900 md:ml-6 md:flex-1">Edit Baby Profile</h1>
        <div className="w-10 md:hidden"></div>
      </header>

      <main className="max-w-4xl mx-auto px-0 sm:px-6 md:px-8 mt-0 md:mt-6">
        
        <div className="bg-white shadow-sm p-6 md:p-12 pb-32 md:pb-12">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-indigo-50 shadow-sm bg-gray-100 flex items-center justify-center">
                 {avatarPreview ? (
                   <img src={avatarPreview} alt="Baby Profile" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-4xl md:text-5xl font-medium text-gray-400">
                     {formData.name ? formData.name.charAt(0).toUpperCase() : <Baby className="w-12 h-12" />}
                   </span>
                 )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 md:bottom-1 md:right-1 bg-[var(--color-primary)] w-10 h-10 rounded-full flex items-center justify-center border-4 border-white text-white shadow-sm hover:scale-105 transition-transform cursor-pointer"
              >
                <Camera className="w-5 h-5" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setAvatarFile(file);
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setAvatarPreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
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
                  className="w-full px-4 py-4 md:py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
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
                    className={`flex-1 py-3.5 md:py-3 rounded-full text-sm font-semibold transition-all border shadow-sm cursor-pointer ${formData.gender === 'boy' || formData.gender === 'Boy' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                  >
                    Boy
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, gender: "girl"})}
                    className={`flex-1 py-3.5 md:py-3 rounded-full text-sm font-semibold transition-all border shadow-sm cursor-pointer ${formData.gender === 'girl' || formData.gender === 'Girl' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                  >
                    Girl
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, gender: "private"})}
                    className={`flex-1 py-3.5 md:py-3 rounded-full text-sm font-semibold transition-all border shadow-sm cursor-pointer ${formData.gender === 'private' || formData.gender === 'Private' || formData.gender === 'Other' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
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
                <div className="relative">
                  <input 
                    type="date" 
                    value={formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : ""}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="w-full appearance-none px-4 py-4 md:py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    required
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* Premature Days */}
              <div className="space-y-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[15px] font-medium text-gray-800">Premature Days</label>
                </div>
                <input 
                  type="number" 
                  value={formData.prematureDays !== undefined ? formData.prematureDays : ""}
                  onChange={(e) => setFormData({...formData, prematureDays: e.target.value === "" ? undefined : parseInt(e.target.value)})}
                  placeholder="e.g. 14"
                  className="w-full px-4 py-4 md:py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
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
                  onChange={(e) => setFormData({...formData, weight: parseFloat(e.target.value) || undefined})}
                  placeholder="e.g. 5.5"
                  className="w-full px-4 py-4 md:py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
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
                  onChange={(e) => setFormData({...formData, height: parseFloat(e.target.value) || undefined})}
                  placeholder="e.g. 55.0"
                  className="w-full px-4 py-4 md:py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
              </div>

              {/* Diet */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[15px] font-medium text-gray-800">What diet do you follow?</label>
                </div>
                <div className="flex gap-3 max-w-md">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, diet: "Veg"})}
                    className={`flex-1 py-3.5 md:py-3 rounded-full text-sm font-semibold transition-all border shadow-sm cursor-pointer ${formData.diet === 'Veg' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                  >
                    🥕 Veg
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, diet: "Veg + Egg"})}
                    className={`flex-1 py-3.5 md:py-3 rounded-full text-sm font-semibold transition-all border shadow-sm cursor-pointer ${formData.diet === 'Veg + Egg' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                  >
                    🥚 Veg + Egg
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, diet: "Non-Veg"})}
                    className={`flex-1 py-3.5 md:py-3 rounded-full text-sm font-semibold transition-all border shadow-sm cursor-pointer ${formData.diet === 'Non-Veg' ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'}`}
                  >
                    🍗 Non-Veg
                  </button>
                </div>
              </div>

              {/* Blood Type */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[15px] font-medium text-gray-800">Blood Type</label>
                </div>
                <div className="relative">
                  <select 
                    value={formData.bloodType || ""}
                    onChange={(e) => setFormData({...formData, bloodType: e.target.value})}
                    className="w-full appearance-none px-4 py-4 md:py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select Blood Type</option>
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
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
                  placeholder="e.g. Asthma, Eczema"
                  className="w-full px-4 py-4 md:py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all resize-none"
                ></textarea>
              </div>

              {/* Allergies */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[15px] font-medium text-gray-800">Allergies (Optional)</label>
                </div>
                <input 
                  type="text"
                  value={Array.isArray(formData.allergies) ? formData.allergies.join(", ") : formData.allergies || ""}
                  onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                  placeholder="e.g. Peanuts, Dairy"
                  className="w-full px-4 py-4 md:py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {COMMON_ALLERGIES.map(allergy => {
                    const currentStr = Array.isArray(formData.allergies) ? formData.allergies.join(", ") : (formData.allergies || "");
                    const isSelected = currentStr.split(',').map(a => a.trim()).includes(allergy);
                    return (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${isSelected ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        {isSelected ? '✓ ' : '+ '}{allergy}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Current Symptoms */}
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[15px] font-medium text-gray-800">Current Health Symptoms (Optional)</label>
                </div>
                <p className="text-xs text-gray-500 mb-2">This helps us recommend better meals for your baby's current needs.</p>
                <input 
                  type="text"
                  value={Array.isArray(formData.currentSymptoms) ? formData.currentSymptoms.join(", ") : formData.currentSymptoms || ""}
                  onChange={(e) => setFormData({...formData, currentSymptoms: e.target.value})}
                  placeholder="e.g. Cold, Teething"
                  className="w-full px-4 py-4 md:py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  {COMMON_SYMPTOMS.map(symptom => {
                    const currentStr = Array.isArray(formData.currentSymptoms) ? formData.currentSymptoms.join(", ") : (formData.currentSymptoms || "");
                    const isSelected = currentStr.split(',').map(s => s.trim()).includes(symptom);
                    return (
                      <button
                        key={symptom}
                        type="button"
                        onClick={() => toggleSymptom(symptom)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors cursor-pointer ${isSelected ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                      >
                        {isSelected ? '✓ ' : '+ '}{symptom}
                      </button>
                    )
                  })}
                </div>
              </div>

            </div>

            {/* Save Button */}
            <div className="pt-8 md:pt-6">
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full md:w-auto md:px-12 bg-[var(--color-primary)] text-white py-4 md:py-3.5 rounded-xl font-semibold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-70 cursor-pointer md:ml-auto"
              >
                {isSaving ? "Saving..." : <><CheckCircle2 className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm font-medium text-center absolute -bottom-6 w-full">{error}</p>}
          </form>
        </div>
      </main>
      
      
    </div>
  );
}
