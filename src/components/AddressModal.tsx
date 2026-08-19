import React, { useState, useEffect } from 'react';
import { addAddress, updateAddress, Address } from '@/lib/api/addressesApi';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (address: Address, isEdit: boolean) => void;
  editingAddress: Address | null;
}

export const AddressModal: React.FC<AddressModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingAddress
}) => {
  const [addressData, setAddressData] = useState({
    title: "", street: "", city: "", state: "", zipCode: "", phone: "", isDefault: false, country: "India"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingAddress) {
      setAddressData({
        title: editingAddress.title || "",
        street: editingAddress.street,
        city: editingAddress.city,
        state: editingAddress.state,
        zipCode: editingAddress.zipCode,
        phone: editingAddress.phone || "",
        isDefault: !!editingAddress.isDefault,
        country: editingAddress.country || "India"
      });
    } else {
      setAddressData({
        title: "", street: "", city: "", state: "", zipCode: "", phone: "", isDefault: false, country: "India"
      });
    }
  }, [editingAddress, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingAddress) {
        const updated = await updateAddress(editingAddress._id, addressData);
        onSuccess(updated, true);
      } else {
        const added = await addAddress(addressData);
        onSuccess(added, false);
      }
      onClose();
    } catch (error: any) {
      console.error("Failed to save address:", error);
      alert(error.response?.data?.message || "Failed to save address. Ensure zip code is 6 digits and phone is 10 digits.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">{editingAddress ? 'Edit Address' : 'Add New Address'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Title (e.g. Home, Office)</label>
              <input required type="text" value={addressData.title} onChange={e => setAddressData({...addressData, title: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" placeholder="e.g. Home" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input required type="text" value={addressData.street} onChange={e => setAddressData({...addressData, street: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" placeholder="House No, Building, Street" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input required type="text" value={addressData.city} onChange={e => setAddressData({...addressData, city: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" placeholder="City" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input required type="text" value={addressData.state} onChange={e => setAddressData({...addressData, state: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" placeholder="State" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code (6 digits)</label>
              <input required type="text" pattern="\d{6}" title="Must be exactly 6 digits" value={addressData.zipCode} onChange={e => setAddressData({...addressData, zipCode: e.target.value.replace(/\D/g, '')})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" placeholder="ZIP Code" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number (10 digits)</label>
              <input required type="text" pattern="\d{10}" title="Must be exactly 10 digits" value={addressData.phone} onChange={e => setAddressData({...addressData, phone: e.target.value.replace(/\D/g, '')})} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]" placeholder="Phone Number" />
            </div>
            <div className="col-span-2 flex items-center mt-2">
              <input type="checkbox" id="isDefault" checked={addressData.isDefault} onChange={e => setAddressData({...addressData, isDefault: e.target.checked})} className="w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)]" />
              <label htmlFor="isDefault" className="ml-2 text-sm font-medium text-gray-700">Set as default address</label>
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 bg-[var(--color-primary)] text-white font-semibold rounded-xl hover:bg-[#527d89] transition-colors disabled:opacity-50">
              {isSubmitting ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
