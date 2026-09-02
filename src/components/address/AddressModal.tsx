"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, CheckCircle2, Info } from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/ui/Button";
import { Address } from "@/lib/api/addressesApi";

const FloatingInput = ({ label, id, ...props }: any) => (
  <div className="relative w-full">
    <input
      id={id}
      className="block w-full px-3 py-2.5 text-[15px] font-medium text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] peer"
      placeholder=" "
      {...props}
    />
    <label
      htmlFor={id}
      className="absolute text-[14px] font-medium text-gray-500 duration-200 transform -translate-y-1/2 top-0 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-[var(--color-primary)] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-0 peer-focus:scale-[0.85] peer-focus:-translate-y-1/2 left-2 cursor-text"
    >
      {label}
    </label>
  </div>
);

const FloatingTextarea = ({ label, id, ...props }: any) => (
  <div className="relative w-full">
    <textarea
      id={id}
      className="block w-full px-3 py-2.5 text-[15px] font-medium text-gray-900 bg-transparent rounded-lg border border-gray-300 appearance-none focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] peer resize-none min-h-[64px]"
      placeholder=" "
      {...props}
    />
    <label
      htmlFor={id}
      className="absolute text-[14px] font-medium text-gray-500 duration-200 transform -translate-y-1/2 top-0 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-[var(--color-primary)] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-[15px] peer-placeholder-shown:top-0 peer-focus:top-0 peer-focus:scale-[0.85] peer-focus:-translate-y-1/2 left-2 cursor-text"
    >
      {label}
    </label>
  </div>
);

export interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Partial<Address>, isEditing: boolean, editingId: string | null) => Promise<void>;
  initialData?: Address | null;
  isFirstAddress?: boolean;
}

export function AddressModal({ isOpen, onClose, onSave, initialData, isFirstAddress = false }: AddressModalProps) {
  const [formData, setFormData] = useState<Partial<Address>>({
    title: "Home",
    name: "",
    phone: "",
    flat: "",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
    isDefault: false,
    location: undefined
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || "Home",
          name: initialData.name || "",
          phone: initialData.phone || "",
          flat: initialData.flat || "",
          street: initialData.street || "",
          city: initialData.city || "",
          state: initialData.state || "",
          zipCode: initialData.zipCode || "",
          country: initialData.country || "India",
          isDefault: initialData.isDefault || false,
          location: initialData.location
        });
      } else {
        setFormData({ 
          title: "Home", 
          name: "", 
          phone: "", 
          flat: "", 
          street: "", 
          city: "", 
          state: "", 
          zipCode: "", 
          country: "India", 
          isDefault: isFirstAddress, 
          location: undefined 
        });
      }
    }
  }, [isOpen, initialData, isFirstAddress]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      Swal.fire("Error", "Geolocation is not supported by your browser.", "error");
      return;
    }

    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();

          if (data && data.address) {
            setFormData({
              ...formData,
              street: data.address.road || data.address.suburb || data.address.neighbourhood || formData.street,
              city: data.address.city || data.address.town || data.address.village || data.address.county || formData.city,
              state: data.address.state || formData.state,
              zipCode: data.address.postcode || formData.zipCode,
              country: data.address.country || "India",
              location: {
                type: 'Point',
                coordinates: [lng, lat]
              }
            });
          } else {
             setFormData({
                ...formData,
                location: { type: 'Point', coordinates: [lng, lat] }
             });
          }
        } catch (error) {
          console.error("Reverse geocoding error:", error);
          setFormData({
            ...formData,
            location: { type: 'Point', coordinates: [lng, lat] }
          });
        }

        setIsFetchingLocation(false);
      },
      (error) => {
        setIsFetchingLocation(false);
        Swal.fire("Error", "Could not fetch location. Please allow location permissions.", "error");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.flat || !formData.street || !formData.city || !formData.state || !formData.zipCode) {
      Swal.fire("Error", "Please fill in all required fields.", "error");
      return;
    }

    if (formData.phone.length !== 10) {
      Swal.fire("Error", "Phone number must be exactly 10 digits.", "error");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave(formData, !!initialData, initialData ? initialData._id : null);
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Failed to save address", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div 
            initial={{ opacity: 0, y: "100%" }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: "100%" }} 
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mt-2 mb-0 md:hidden flex-shrink-0" />
            <div className="px-4 py-3 md:p-4 border-b border-gray-100 bg-gray-50 md:bg-white">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {initialData ? "Edit Address" : "Add New Address"}
                </h3>
                <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0">
                  <X className="w-5 h-5"/>
                </button>
              </div>
              <div className="flex items-start gap-2 px-2 py-1.5 rounded-lg bg-blue-50 border border-blue-100">
                <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
                  Ensure your address details are accurate for a smooth delivery experience.
                </p>
              </div>
            </div>
            
            <div className="p-5 md:p-6 space-y-4 overflow-y-auto">
              <div className="flex flex-col gap-5">
                <FloatingInput
                  id="flat"
                  label="House / Flat No. *"
                  type="text" 
                  value={formData.flat} 
                  onChange={(e: any) => setFormData({...formData, flat: e.target.value})} 
                />
                
                <FloatingTextarea
                  id="street"
                  label="Area / Street *"
                  value={formData.street} 
                  onChange={(e: any) => setFormData({...formData, street: e.target.value})} 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-5">
                <FloatingInput
                  id="city"
                  label="City *"
                  type="text" 
                  value={formData.city} 
                  onChange={(e: any) => setFormData({...formData, city: e.target.value})} 
                />
                <FloatingInput
                  id="state"
                  label="State *"
                  type="text" 
                  value={formData.state} 
                  onChange={(e: any) => setFormData({...formData, state: e.target.value})} 
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-5">
                <FloatingInput
                  id="zipCode"
                  label="Pincode *"
                  type="text" 
                  value={formData.zipCode} 
                  onChange={(e: any) => setFormData({...formData, zipCode: e.target.value})} 
                />
                <FloatingInput
                  id="country"
                  label="Country *"
                  type="text" 
                  value={formData.country} 
                  onChange={(e: any) => setFormData({...formData, country: e.target.value})}
                />
              </div>

              <div className="mt-5">
                <Button 
                  type="button" 
                  variant="outline" 
                  fullWidth 
                  onClick={handleGetLocation} 
                  disabled={isFetchingLocation}
                  leftIcon={formData.location ? <CheckCircle2 className="w-4.5 h-4.5" /> : <MapPin className="w-4.5 h-4.5" />}
                  className={`rounded-full transition-all duration-300 ${
                    formData.location 
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" 
                      : "border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {isFetchingLocation ? "Fetching location..." : formData.location ? "Location Captured" : "Use Current Location"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                <FloatingInput
                  id="name"
                  label="Full Name *"
                  type="text" 
                  value={formData.name} 
                  onChange={(e: any) => setFormData({...formData, name: e.target.value})} 
                />
                <FloatingInput
                  id="phone"
                  label="Phone Number *"
                  type="tel" 
                  maxLength={10}
                  value={formData.phone} 
                  onChange={(e: any) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setFormData({...formData, phone: val});
                  }} 
                />
              </div>


              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Save address as *</label>
                <div className="flex items-center gap-3">
                  {["Home", "Work", "Other"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, title: type })}
                      className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors border ${
                        formData.title === type
                          ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                          : "bg-white text-gray-600 border-gray-200 hover:border-[var(--color-primary)]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {!initialData && (
                <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors mt-2">
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
                {isSubmitting ? "Saving..." : (initialData ? "Update Address" : "Save Address")}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
