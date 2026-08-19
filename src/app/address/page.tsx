"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {  ChevronLeft, MapPin, Plus, Edit2, Trash2, Home, Briefcase, Star, CheckCircle2, X , Bell } from "lucide-react";
import { getAddresses, addAddress, updateAddress, deleteAddress, Address } from "@/lib/api/addressesApi";
import { Button } from "@/components/ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import { useAppSelector } from "@/store/hooks";

export default function AddressPage() {
  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);
  const router = useRouter();
  const cartTotalCount = useAppSelector((state: any) => state.cart.totalCount);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Address>>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    isDefault: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const data = await getAddresses();
      setAddresses(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setIsEditing(true);
      setEditingId(address._id);
      setFormData({
        street: address.street,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        isDefault: address.isDefault
      });
    } else {
      setIsEditing(false);
      setEditingId(null);
      setFormData({ street: "", city: "", state: "", zipCode: "", country: "India", isDefault: addresses.length === 0 });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ street: "", city: "", state: "", zipCode: "", country: "India", isDefault: false });
  };

  const handleSubmit = async () => {
    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      Swal.fire("Error", "Please fill in all required fields.", "error");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (isEditing && editingId) {
        await updateAddress(editingId, formData);
        Swal.fire("Success", "Address updated successfully", "success");
      } else {
        await addAddress(formData);
        Swal.fire("Success", "Address added successfully", "success");
      }
      handleCloseModal();
      fetchAddresses();
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save address", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await deleteAddress(id);
        Swal.fire('Deleted!', 'Your address has been deleted.', 'success');
        fetchAddresses();
      } catch (err) {
        Swal.fire('Error!', 'Failed to delete address.', 'error');
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await updateAddress(id, { isDefault: true });
      fetchAddresses();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] font-sans pb-24 md:pb-0">
            
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-6">
        
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white">
          <div className="flex items-center gap-2">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-medium text-[#0F172A] ml-1">Addresses</h1>
          </div>
          
          <button onClick={() => handleOpenModal()} className="p-2 text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 rounded-full transition-all">
            <Plus className="w-5 h-5" />
          </button>
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
        <div className="hidden md:flex flex-row items-center justify-between mb-4 gap-4 px-1">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">Address Book</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage your delivery addresses for meal plans.</p>
          </div>
          <Button variant="primary" onClick={() => handleOpenModal()} leftIcon={<Plus className="w-4 h-4"/>} className="hidden md:flex">
            Add New Address
          </Button>
        </div>

        {/* Mobile Add Button */}
        <div className="md:hidden">
           <Button variant="primary" fullWidth onClick={() => handleOpenModal()} leftIcon={<Plus className="w-4 h-4"/>}>
            Add New Address
          </Button>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-gray-400 font-medium">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-sm text-gray-500">Add an address to start receiving meal deliveries.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address._id} className={`bg-white p-5 md:p-6 rounded-2xl border transition-all duration-300 ${address.isDefault ? 'border-[var(--color-primary)] shadow-md ring-2 ring-[var(--color-primary)]/10' : 'border-gray-200 shadow-sm hover:border-gray-300'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${address.isDefault ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]' : 'bg-gray-100 text-gray-500'}`}>
                      <Home className="w-4 h-4" />
                    </div>
                    {address.isDefault && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenModal(address)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(address._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
          <div className="flex items-center gap-1">
            <button onClick={() => router.push('/notifications')} className="relative p-2 -mr-2 rounded-full hover:bg-gray-100 transition-colors cursor-pointer group">
              <Bell className="w-6 h-6 text-gray-800 group-hover:text-black transition-colors" />
              {unreadNotificationsCount > 0 && <span className="absolute top-1.5 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm"></span>}
            </button>
          </div>
        </div>
                
                <div className="mt-4">
                  <p className="text-[15px] font-semibold text-gray-800 leading-relaxed">
                    {address.street}
                  </p>
                  <p className="text-[15px] text-gray-600">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-[14px] text-gray-500 mt-1">
                    {address.country}
                  </p>
                </div>

                {!address.isDefault && (
                  <div className="mt-5 pt-4 border-t border-gray-50">
                    <button onClick={() => handleSetDefault(address._id)} className="text-sm font-semibold text-[var(--color-primary)] hover:opacity-80 transition-opacity">
                      Set as default
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </main>

      
      {/* Address Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleCloseModal} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {isEditing ? "Edit Address" : "Add New Address"}
                </h3>
                <button onClick={handleCloseModal} className="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-200 rounded-full transition-colors">
                  <X className="w-5 h-5"/>
                </button>
              </div>
              
              <div className="p-5 md:p-6 space-y-5 overflow-y-auto">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address *</label>
                  <textarea 
                    value={formData.street} 
                    onChange={e => setFormData({...formData, street: e.target.value})} 
                    className="w-full border border-gray-200 rounded-xl p-3 text-[15px] font-medium focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none resize-none min-h-[80px]"
                    placeholder="House/Flat No, Building Name, Area"
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">City *</label>
                    <input 
                      type="text" 
                      value={formData.city} 
                      onChange={e => setFormData({...formData, city: e.target.value})} 
                      className="w-full border border-gray-200 rounded-xl p-3 text-[15px] font-medium focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">State *</label>
                    <input 
                      type="text" 
                      value={formData.state} 
                      onChange={e => setFormData({...formData, state: e.target.value})} 
                      className="w-full border border-gray-200 rounded-xl p-3 text-[15px] font-medium focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode *</label>
                    <input 
                      type="text" 
                      value={formData.zipCode} 
                      onChange={e => setFormData({...formData, zipCode: e.target.value})} 
                      className="w-full border border-gray-200 rounded-xl p-3 text-[15px] font-medium focus:ring-2 focus:ring-[var(--color-primary)]/20 focus:border-[var(--color-primary)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                    <input 
                      type="text" 
                      value={formData.country} 
                      readOnly
                      className="w-full border border-gray-200 rounded-xl p-3 text-[15px] font-medium bg-gray-50 text-gray-500 outline-none"
                    />
                  </div>
                </div>

                {!isEditing && (
                  <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors mt-2">
                    <input 
                      type="checkbox" 
                      checked={formData.isDefault}
                      onChange={e => setFormData({...formData, isDefault: e.target.checked})}
                      className="w-5 h-5 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-gray-700">Set as default address</span>
                  </label>
                )}
              </div>

              <div className="p-5 border-t border-gray-100 bg-gray-50">
                <Button variant="primary" fullWidth onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : (isEditing ? "Update Address" : "Save Address")}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
