import { apiClient } from "@/lib/apiClient";

export interface Address {
  _id: string;
  userId: string;
  title: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
  phone?: string;
}

/** GET /api/addresses — fetch current user's addresses */
export async function getAddresses(): Promise<Address[]> {
  const response = await apiClient.get("/addresses");
  return response.data.data;
}

/** POST /api/addresses — add a new address */
export async function addAddress(addressData: Partial<Address>): Promise<Address> {
  const response = await apiClient.post("/addresses", addressData);
  return response.data.data;
}

/** PUT /api/addresses/:id — update an address */
export async function updateAddress(id: string, addressData: Partial<Address>): Promise<Address> {
  const response = await apiClient.put(`/addresses/${id}`, addressData);
  return response.data.data;
}

/** DELETE /api/addresses/:id — delete an address */
export async function deleteAddress(id: string): Promise<any> {
  const response = await apiClient.delete(`/addresses/${id}`);
  return response.data;
}
