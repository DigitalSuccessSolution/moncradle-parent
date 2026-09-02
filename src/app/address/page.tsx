"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MapPin, Plus, Edit2, Trash2, Home, Briefcase, Bell, MoreVertical, Phone } from "lucide-react";
import { getAddresses, addAddress, updateAddress, deleteAddress, Address } from "@/lib/api/addressesApi";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import { useAppSelector } from "@/store/hooks";
import { AddressModal } from "@/components/address/AddressModal";

export default function AddressPage() {
  const unreadNotificationsCount = useAppSelector(state => state.notifications.unreadCount);
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

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
      setEditingAddress(address);
    } else {
      setEditingAddress(null);
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAddress(null);
  };

  const handleSaveAddress = async (formData: Partial<Address>, isEditing: boolean, editingId: string | null) => {
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
            
      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-4 md:py-8 space-y-4 md:space-y-6">
        
        {/* Mobile Back Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 -mx-4 -mt-4 sticky top-0 z-40 bg-white mb-4">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100 active:scale-95 transition-all">
              <ChevronLeft className="w-6 h-6" strokeWidth={2} />
            </button>
            <h1 className="text-[17px] font-semibold text-[#0F172A] ml-1">Saved Addresses</h1>
          </div>
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

        {/* Mobile Add New Button (from screenshot) */}
        <div className="md:hidden">
          <button 
            onClick={() => handleOpenModal()} 
            className="w-full flex items-center justify-between p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors"
          >
            <div className="flex items-center gap-2 text-[var(--color-primary)] font-bold text-[15px]">
              <Plus className="w-5 h-5" strokeWidth={2.5} /> Add New
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--color-primary)]" />
          </button>
        </div>

        {/* Saved Addresses Title (from screenshot) */}
        <div className="md:hidden pt-2">
          <h2 className="text-[14px] font-bold text-gray-600 px-1">Saved addresses</h2>
        </div>

        {isLoading ? (
          <div className="text-center py-10 text-gray-400 font-medium">Loading addresses...</div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm mt-4">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses saved</h3>
            <p className="text-sm text-gray-500">Add an address to start receiving meal deliveries.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div key={address._id} className={`bg-white p-2.5 md:p-3.5 rounded-xl border transition-all duration-300 ${address.isDefault ? 'border-[var(--color-primary)] shadow-sm ring-1 ring-[var(--color-primary)]/10' : 'border-gray-200 shadow-sm hover:border-gray-300'}`}>
                
                <div className="flex items-center gap-2.5">
                  {/* Left Icon Box */}
                  <div className="w-[42px] h-[42px] rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {address.title === "Work" ? <Briefcase className="w-4 h-4 text-gray-800" strokeWidth={1.5} /> : address.title === "Other" ? <MapPin className="w-4 h-4 text-gray-800" strokeWidth={1.5} /> : <Home className="w-4 h-4 text-gray-800" strokeWidth={1.5} />}
                  </div>

                  {/* Right Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col py-1">
                        <div className="flex items-center gap-2">
                           <p className="text-[14px] font-bold text-gray-900 mb-0">{address.name}</p>
                           {address.isDefault && <span className="text-[9px] bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold px-1.5 py-0.5 rounded uppercase">Default</span>}
                        </div>
                        <p className="text-[12px] text-gray-500 leading-tight mb-0.5 line-clamp-2 pr-2">
                          {[address.flat, address.street, address.city, address.state, address.zipCode, address.country]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-700 mt-0.5">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span>{address.phone}</span>
                        </div>
                      </div>
                      
                      <div className="relative flex-shrink-0 -mr-2">
                        <button onClick={() => setOpenMenuId(openMenuId === address._id ? null : address._id)} className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {openMenuId === address._id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                            <div className="absolute right-0 top-10 mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden py-1">
                              <button 
                                onClick={() => { handleOpenModal(address); setOpenMenuId(null); }} 
                                className="w-full text-left px-4 py-2 text-[14px] font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Edit2 className="w-4 h-4" /> Edit
                              </button>
                              <button 
                                onClick={() => { handleDelete(address._id); setOpenMenuId(null); }} 
                                className="w-full text-left px-4 py-2 text-[14px] font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" /> Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {!address.isDefault && (
                  <div className="mt-4 pt-3 border-t border-gray-50 hidden md:block">
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

      <AddressModal 
        isOpen={showModal} 
        onClose={handleCloseModal} 
        onSave={handleSaveAddress} 
        initialData={editingAddress} 
        isFirstAddress={addresses.length === 0}
      />

    </div>
  );
}
