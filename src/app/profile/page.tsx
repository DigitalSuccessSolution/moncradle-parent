"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";


import { Settings, LogOut, FileText, Activity, ShieldCheck, ChevronRight, Download, UploadCloud, MapPin, Stethoscope, Edit2, Edit3, Phone, ChevronLeft, Bell, ShoppingCart } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { getUserProfile, UserProfile } from "@/lib/api/usersApi";
import { getAddresses, addAddress, updateAddress, Address } from "@/lib/api/addressesApi";
import { getBabies, BabyProfile } from "@/lib/api/babiesApi";
import { AddressModal } from "@/components/address/AddressModal";

export default function ProfilePage() {
  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);
  const cartItemCount = useAppSelector(state => state.cart?.totalCount || 0);
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [babies, setBabies] = useState<BabyProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Address Modal States
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, addressRes, babiesRes] = await Promise.all([
          getUserProfile(),
          getAddresses().catch(() => []), // gracefully handle if addresses fail
          getBabies().catch(() => []) // gracefully handle if babies fail
        ]);

        const userData = profileRes.data || profileRes.user || profileRes;
        setUser(userData);
        setAddresses(addressRes || []);
        setBabies(babiesRes?.data || babiesRes || []);
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveAddress = async (formData: Partial<Address>, isEditing: boolean, editingId: string | null) => {
    let savedAddress: Address;
    if (isEditing && editingId) {
      savedAddress = await updateAddress(editingId, formData);
      setAddresses(addresses.map(a => a._id === savedAddress._id ? savedAddress : a));
    } else {
      savedAddress = await addAddress(formData);
      setAddresses([...addresses, savedAddress]);
    }
    setIsAddressModalOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent, addr: Address) => {
    e.stopPropagation();
    setEditingAddress(addr);
    setIsAddressModalOpen(true);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }
  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0">


      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-8">
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-6 sticky top-0 z-40 bg-white mb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-semibold text-[#0F172A]">My Profile</h1>
          </div>
          <div className="flex items-center gap-3 pr-1">
            <Link href="/shop/cart" className="relative text-[#0F172A] active:scale-95 transition-transform">
              <ShoppingCart className="w-6 h-6" strokeWidth={2} />
              {cartItemCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-[#FF3B30] text-white text-[11px] font-black min-w-[20px] h-[20px] px-1 flex items-center justify-center rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <Link href="/notifications" className="relative text-[#0F172A] active:scale-95 transition-transform">
              <Bell className="w-6 h-6" strokeWidth={2} />
              {unreadNotificationsCount > 0 && <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
            </Link>
          </div>
        </div>

        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-semibold text-gray-900 mb-8 tracking-tight max-w-2xl mx-auto">
          Profile & Records
        </motion.h1>

        <div className="max-w-2xl mx-auto">

          {/* Left Column - Profile Card & Menus */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Parent Profile Card */}
            <div className="bg-white p-6 shadow-sm relative">
              <Link href="/profile/edit" className="absolute top-4 right-4 p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-500 z-50">
                <Edit3 className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm bg-gray-50 flex-shrink-0">
                  <Image src={user?.avatar || "/images/splashscreen2.png"} alt="Profile" width={64} height={64} className="object-cover w-full h-full" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 pr-8">{user?.name || "Parent Name"}</h2>
                  <p className="text-xs text-gray-500 font-medium">{user?.email || "No email provided"}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-purple-50 text-purple-600 text-[10px] font-semibold rounded border border-purple-100">Parent Account</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-0.5">Phone Number</p>
                  <p className="text-sm font-semibold text-gray-800">{user?.phone ? `+91 ${user.phone}` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold tracking-wider mb-0.5">Member Since</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.createdAt ? new Date(user.createdAt as string).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : "2024"}
                  </p>
                </div>
              </div>
            </div>

            {/* Saved Delivery Addresses */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                  <h3 className="text-sm font-semibold text-gray-900">Delivery Addresses</h3>
                </div>
                <button onClick={() => {
                  setEditingAddress(null);
                  setIsAddressModalOpen(true);
                }} className="text-[10px] font-semibold text-[var(--color-primary)] hover:underline uppercase tracking-wider">
                  Add New
                </button>
              </div>

              <div className="space-y-3">
                {addresses.length === 0 ? (
                  <p className="text-xs text-gray-600 leading-relaxed font-medium">
                    No delivery addresses saved yet.
                  </p>
                ) : (
                  addresses.map(addr => (
                    <div key={addr._id} className="relative p-2 md:p-3 transition-all flex gap-3">
                      <div className="flex-1">
                        <div className="flex justify-between items-start w-full">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900 text-sm">{user?.name || "Customer"}</span>
                            {addr.isDefault && <span className="bg-white px-2 py-0.5 rounded-full text-[9px] font-semibold text-[var(--color-primary)] border border-[var(--color-primary)] uppercase tracking-wider">Default</span>}
                          </div>
                          <button onClick={(e) => handleEditClick(e, addr)} className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-[var(--color-primary)] hover:text-white transition-colors cursor-pointer flex-shrink-0">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-xs text-gray-600 leading-relaxed mb-1.5">
                          {addr.street}, {addr.city}, {addr.state} - {addr.zipCode}
                        </p>
                        <p className="text-xs font-semibold text-gray-800">{addr.phone || user?.phone}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Primary Pediatrician */}
            <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-semibold text-gray-900">Primary Doctor</h3>
                </div>
              </div>
              <div className="text-center py-4">
                {babies.length > 0 && babies[0].assignedDoctorId ? (
                  <>
                    <p className="text-sm text-gray-800 font-semibold mb-1">
                      {babies[0].assignedDoctorId.name.startsWith('Dr') ? babies[0].assignedDoctorId.name : `Dr. ${babies[0].assignedDoctorId.name}`}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mb-3">{babies[0].assignedDoctorId.email || 'Pediatrician'}</p>
                    <button className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors uppercase tracking-wider">
                      Message Doctor
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 font-medium mb-3">No primary doctor assigned yet.</p>
                    <button className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg hover:bg-emerald-100 transition-colors uppercase tracking-wider">
                      Find a Doctor
                    </button>
                  </>
                )}
              </div>
            </div>
          </motion.div>


        </div>

      </main>



      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        initialData={editingAddress}
        isFirstAddress={addresses.length === 0}
      />
    </div>
  );
}
