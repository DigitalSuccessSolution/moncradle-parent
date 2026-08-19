import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getNotifications } from '@/lib/api/notificationsApi';

interface NotificationsState {
  unreadCount: number;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: NotificationsState = {
  unreadCount: 0,
  status: 'idle',
  error: null,
};

export const fetchNotificationsCountAsync = createAsyncThunk(
  'notifications/fetchCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getNotifications();
      const notifications = Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
      const unread = notifications.filter((n: any) => !n.isRead).length;
      return unread;
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to fetch notifications');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    markAllAsReadLocally(state) {
      state.unreadCount = 0;
    },
    decrementUnreadCount(state) {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotificationsCountAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotificationsCountAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.unreadCount = action.payload;
      })
      .addCase(fetchNotificationsCountAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { markAllAsReadLocally, decrementUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;
