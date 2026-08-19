import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getCart, addToCart, removeFromCart, updateCartQuantity, CartItem } from '@/lib/api/cartApi';

export interface CartState {
  items: CartItem[];
  cartMap: Record<string, { cartItemId: string; qty: number }>;
  totalCount: number;
  subtotal: number;
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: CartState = {
  items: [],
  cartMap: {},
  totalCount: 0,
  subtotal: 0,
  status: 'idle',
  error: null,
};

// Async Thunks
export const fetchCartAsync = createAsyncThunk(
  'cart/fetchCart',
  async () => {
    const cart = await getCart();
    return cart.items || [];
  }
);

export const addToCartAsync = createAsyncThunk(
  'cart/addToCart',
  async ({ itemId, itemType }: { itemId: string; itemType: "product" | "meal" }) => {
    const cart = await addToCart(itemId, itemType, 1);
    return cart.items || [];
  }
);

export const updateCartQuantityAsync = createAsyncThunk(
  'cart/updateQuantity',
  async ({ cartItemId, quantity }: { cartItemId: string; quantity: number }) => {
    const cart = await updateCartQuantity(cartItemId, quantity);
    return cart.items || [];
  }
);

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCart',
  async (cartItemId: string) => {
    const cart = await removeFromCart(cartItemId);
    return cart.items || [];
  }
);

const calculateDerivedState = (state: CartState, items: CartItem[]) => {
  state.items = items;
  state.cartMap = {};
  state.totalCount = 0;
  state.subtotal = 0;

  items.forEach(item => {
    if (item.productId) {
      state.cartMap[item.productId._id] = { cartItemId: item._id, qty: item.quantity };
    }
    if (item.mealId) {
      state.cartMap[item.mealId._id] = { cartItemId: item._id, qty: item.quantity };
    }
    state.totalCount += item.quantity;
    state.subtotal += item.priceAtAddition * item.quantity;
  });
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Cart
      .addCase(fetchCartAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCartAsync.fulfilled, (state, action) => {
        state.status = 'idle';
        calculateDerivedState(state, action.payload);
      })
      .addCase(fetchCartAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load cart';
      })
      // Add to Cart
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        calculateDerivedState(state, action.payload);
      })
      // Update Quantity
      .addCase(updateCartQuantityAsync.fulfilled, (state, action) => {
        calculateDerivedState(state, action.payload);
      })
      // Remove from Cart
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        calculateDerivedState(state, action.payload);
      });
  },
});

export default cartSlice.reducer;
