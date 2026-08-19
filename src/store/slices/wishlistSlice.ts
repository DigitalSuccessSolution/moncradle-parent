import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as wishlistApi from '@/lib/api/wishlistApi';
import { WishlistItem } from '@/lib/api/wishlistApi';
import toast from 'react-hot-toast';

interface WishlistState {
  items: WishlistItem[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchWishlistAsync = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await wishlistApi.getWishlist();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist');
    }
  }
);

export const addToWishlistAsync = createAsyncThunk(
  'wishlist/addToWishlist',
  async ({ itemId, itemType }: { itemId: string; itemType: 'product' | 'meal' }, { rejectWithValue }) => {
    try {
      const response = await wishlistApi.addToWishlist(itemId, itemType);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist');
    }
  }
);

export const removeFromWishlistAsync = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (itemId: string, { rejectWithValue }) => {
    try {
      const response = await wishlistApi.removeFromWishlist(itemId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlistAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchWishlistAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload || [];
      })
      .addCase(fetchWishlistAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      })
      .addCase(addToWishlistAsync.fulfilled, (state, action) => {
        state.items = action.payload || [];
      })
      .addCase(removeFromWishlistAsync.fulfilled, (state, action) => {
        state.items = action.payload || [];
      });
  },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
