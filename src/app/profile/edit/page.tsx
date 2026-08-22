"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, User, Mail, Phone, CheckCircle2, UserCircle, Users, Calendar, Globe, ChevronDown, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { getUserProfile, updateUserProfile, UserProfile } from "@/lib/api/usersApi";

export default function ParentEditProfilePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    preferredLanguage: "English",
    relationToChild: ""
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [isGenderOpen, setIsGenderOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isRelationOpen, setIsRelationOpen] = useState(false);

  useEffect(() => {
    // Lock body scroll when popup is open
    if (isGenderOpen || isLangOpen || isRelationOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isGenderOpen, isLangOpen, isRelationOpen]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserProfile();
        const user = response.data || response.user || response;
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          gender: user.gender || "",
          dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : "",
          preferredLanguage: user.preferredLanguage || "English",
          relationToChild: user.relationToChild || ""
        });
        if (user.avatar) {
          setAvatarPreview(user.avatar);
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate Phone Number
    const cleanPhone = formData.phone?.replace(/\D/g, "") || "";
    if (cleanPhone.length !== 10) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    // Validate Name
    const cleanName = formData.name?.trim() || "";
    if (cleanName.length < 2) {
      setError("Please enter a valid name.");
      return;
    }

    setIsSaving(true);
    try {
      const data = new FormData();
      data.append("name", cleanName);
      if (formData.gender) data.append("gender", formData.gender);
      if (formData.dateOfBirth) data.append("dateOfBirth", formData.dateOfBirth);
      if (formData.preferredLanguage) data.append("preferredLanguage", formData.preferredLanguage);
      if (formData.relationToChild) data.append("relationToChild", formData.relationToChild);
      if (formData.email) data.append("email", formData.email);
      if (avatarFile) data.append("avatar", avatarFile);

      await updateUserProfile(data);
      router.back();
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { message?: string } } };
      setError(apiError?.response?.data?.message || "Failed to update profile");
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
        <h1 className="text-lg md:text-2xl font-semibold text-gray-900 md:ml-6 md:flex-1">Edit Profile</h1>
        <div className="w-10 md:hidden"></div>
      </header>

      <main className="max-w-4xl mx-auto px-0 sm:px-6 md:px-8 mt-0 md:mt-6">
        
        <div className="bg-white shadow-sm p-6 md:p-12">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-indigo-50 shadow-sm bg-gray-100 flex items-center justify-center">
                 {avatarPreview ? (
                   <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                   <span className="text-4xl md:text-5xl font-medium text-gray-400">
                     {formData.name ? formData.name.charAt(0).toUpperCase() : <UserCircle className="w-12 h-12" />}
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
          <form onSubmit={handleSave} className="space-y-6 md:space-y-8 max-w-2xl mx-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    maxLength={50}
                    minLength={2}
                    className="w-full pl-11 pr-4 py-4 md:py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                    required
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-4 md:py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Phone Number</label>
                <div className="relative flex items-center">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none gap-2">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-500 font-medium text-[15px] mt-0.5">+91</span>
                  </div>
                  <input 
                    type="tel" 
                    value={formData.phone || ""}
                    readOnly
                    className="w-full pl-[5.5rem] pr-4 py-4 md:py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-500 cursor-not-allowed focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Gender</label>
                <div className="relative cursor-pointer" onClick={() => setIsGenderOpen(true)}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className={`w-full pl-11 pr-10 py-4 md:py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 transition-all flex items-center justify-between`}>
                    <span className={formData.gender ? "text-gray-900" : "text-gray-400 font-normal"}>{formData.gender || "Select Gender"}</span>
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isGenderOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <input 
                    type="date" 
                    value={formData.dateOfBirth || ""}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className={`w-full pl-11 pr-4 py-4 md:py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all cursor-pointer ${formData.dateOfBirth ? 'text-gray-900' : 'text-gray-400 font-normal'}`}
                  />
                </div>
              </div>

              {/* Preferred Language */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Preferred Language</label>
                <div className="relative cursor-pointer" onClick={() => setIsLangOpen(true)}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="w-full pl-11 pr-10 py-4 md:py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 transition-all flex items-center justify-between">
                    <span className="truncate">{formData.preferredLanguage || "English"}</span>
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>

              {/* Relation to Child */}
              <div className="space-y-2 md:col-span-1 xl:col-span-2">
                <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Relation to Child</label>
                <div className="relative cursor-pointer" onClick={() => setIsRelationOpen(true)}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Heart className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="w-full pl-11 pr-10 py-4 md:py-3.5 bg-white border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 transition-all flex items-center justify-between">
                    <span className={formData.relationToChild ? "text-gray-900" : "text-gray-400 font-normal"}>{formData.relationToChild || "Select Relation"}</span>
                  </div>
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isRelationOpen ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 md:pt-6">
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full md:w-auto md:px-12 bg-[var(--color-primary)] text-white py-4 md:py-3.5 rounded-xl font-semibold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center md:ml-auto gap-2 shadow-md disabled:opacity-70 cursor-pointer"
              >
                {isSaving ? "Saving..." : <><CheckCircle2 className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
          </form>
        </div>
      </main>
      
      {/* Gender Modal */}
      <AnimatePresence>
        {isGenderOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setIsGenderOpen(false)}>
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full md:w-96 md:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl" 
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-lg font-bold text-gray-900">Select Gender</h3>
                <button onClick={() => setIsGenderOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-3 max-h-[60vh] overflow-y-auto">
                {["Male", "Female", "Other", "Prefer not to say"].map(opt => (
                  <button 
                    key={opt} 
                    type="button"
                    onClick={() => { setFormData({...formData, gender: opt}); setIsGenderOpen(false); }} 
                    className={`w-full text-left px-5 py-4 my-1 rounded-xl font-semibold transition-colors flex items-center justify-between ${formData.gender === opt ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    {opt}
                    {formData.gender === opt && <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Language Modal */}
      <AnimatePresence>
        {isLangOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setIsLangOpen(false)}>
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full md:w-96 md:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl" 
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-lg font-bold text-gray-900">Preferred Language</h3>
                <button onClick={() => setIsLangOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-3 max-h-[60vh] overflow-y-auto">
                {["English", "Hindi", "Gujarati", "Marathi", "Tamil"].map(opt => (
                  <button 
                    key={opt} 
                    type="button"
                    onClick={() => { setFormData({...formData, preferredLanguage: opt}); setIsLangOpen(false); }} 
                    className={`w-full text-left px-5 py-4 my-1 rounded-xl font-semibold transition-colors flex items-center justify-between ${formData.preferredLanguage === opt ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    {opt}
                    {formData.preferredLanguage === opt && <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Relation Modal */}
      <AnimatePresence>
        {isRelationOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setIsRelationOpen(false)}>
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white w-full md:w-96 md:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl" 
              onClick={e => e.stopPropagation()}
            >
              <div className="p-5 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-lg font-bold text-gray-900">Relation to Child</h3>
                <button onClick={() => setIsRelationOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="p-3 max-h-[60vh] overflow-y-auto">
                {["Father", "Mother", "Guardian", "Grandparent", "Other"].map(opt => (
                  <button 
                    key={opt} 
                    type="button"
                    onClick={() => { setFormData({...formData, relationToChild: opt}); setIsRelationOpen(false); }} 
                    className={`w-full text-left px-5 py-4 my-1 rounded-xl font-semibold transition-colors flex items-center justify-between ${formData.relationToChild === opt ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    {opt}
                    {formData.relationToChild === opt && <CheckCircle2 className="w-5 h-5 text-[var(--color-primary)]" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
    </div>
  );
}
