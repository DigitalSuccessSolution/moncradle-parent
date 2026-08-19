import { apiClient as api } from "@/lib/apiClient";

export interface WishlistItem {
  itemType: 'product' | 'meal';
  itemId: string;
}

export const getWishlist = async () => {
  const response = await api.get('/users/wishlist');
  return response.data;
};

export const addToWishlist = async (itemId: string, itemType: 'product' | 'meal') => {
  const response = await api.post('/users/wishlist', { itemId, itemType });
  return response.data;
};

export const removeFromWishlist = async (itemId: string) => {
  const response = await api.delete(`/users/wishlist/${itemId}`);
  return response.data;
};
