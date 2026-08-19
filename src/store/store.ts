import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './slices/cartSlice';
import wishlistReducer from './slices/wishlistSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    wishlist: wishlistReducer,
    notifications: notificationsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
