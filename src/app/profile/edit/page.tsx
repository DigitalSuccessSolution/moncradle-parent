"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Camera, User, Mail, Phone, MapPin, CheckCircle2 } from "lucide-react";
import { Header } from "@/components/layout/Header/Header";
import { Footer } from "@/components/layout/Footer/Footer";
import { getUserProfile, updateUserProfile, UserProfile } from "@/lib/api/usersApi";

export default function ParentEditProfilePage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<Partial<UserProfile>>({
    name: "",
    email: "",
    phone: "",
    address: ""
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await getUserProfile();
        const user = response.data || response.user || response;
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || ""
        });
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
    setIsSaving(true);
    setError("");
    try {
      await updateUserProfile(formData);
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
    <div className="min-h-screen bg-gray-50/50 md:bg-gray-100/50 font-sans pb-24 md:pb-0">
      <Header />
      
      {/* Header */}
      <header className="md:hidden flex items-center justify-between px-4 py-4 bg-white sticky top-0 z-10 border-b border-gray-100">
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer md:bg-white md:shadow-sm md:border md:border-gray-200">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg md:text-2xl font-bold text-gray-900 md:ml-6 md:flex-1">Edit Profile</h1>
        <div className="w-10 md:hidden"></div>
      </header>

      <main className="max-w-4xl mx-auto px-0 sm:px-6 md:px-8 mt-0 md:mt-6">
        
        <div className="bg-white md:rounded-3xl md:shadow-sm md:border md:border-gray-100 p-6 md:p-12">
          {/* Profile Picture */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative">
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-indigo-50 shadow-sm bg-gray-100 flex items-center justify-center">
                 <span className="text-4xl md:text-5xl font-medium text-gray-400">R</span>
              </div>
              <button className="absolute bottom-0 right-0 md:bottom-1 md:right-1 bg-[var(--color-primary)] w-10 h-10 rounded-full flex items-center justify-center border-4 border-white text-white shadow-sm hover:scale-105 transition-transform cursor-pointer">
                <Camera className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSave} className="space-y-6 md:space-y-8 max-w-2xl mx-auto">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-11 pr-4 py-4 md:py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-4 md:py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input 
                    type="tel" 
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-11 pr-4 py-4 md:py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Alternative Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="w-5 h-5 text-gray-400" />
                  </div>
                  <input 
                    type="tel" 
                    defaultValue=""
                    className="w-full pl-11 pr-4 py-4 md:py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all shadow-sm"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Delivery Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 pt-4 pointer-events-none">
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
                <textarea 
                  rows={3}
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter your complete delivery address..."
                  className="w-full pl-11 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-[15px] font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent transition-all shadow-sm resize-none"
                ></textarea>
              </div>
            </div>

            <div className="pt-8 md:pt-6">
              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full md:w-auto md:px-12 bg-[var(--color-primary)] text-white py-4 md:py-3.5 rounded-xl font-bold text-[15px] hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center md:ml-auto gap-2 shadow-md disabled:opacity-70 cursor-pointer"
              >
                {isSaving ? "Saving..." : <><CheckCircle2 className="w-5 h-5" /> Save Changes</>}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
          </form>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
