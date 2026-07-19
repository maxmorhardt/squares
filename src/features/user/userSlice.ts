import { createSlice } from '@reduxjs/toolkit';
import type { UserProfile, UserStats } from '../../types/user';
import { loadUserProfile, loadUserStats, updateUserInitials } from './userThunks';

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  stats: UserStats | null;
  statsError: boolean;
}

const initialState: UserState = {
  profile: null,
  loading: false,
  error: null,
  stats: null,
  statsError: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(loadUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message ?? 'Failed to load profile';
      })
      .addCase(loadUserStats.pending, (state) => {
        state.statsError = false;
      })
      .addCase(loadUserStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      })
      .addCase(loadUserStats.rejected, (state) => {
        state.statsError = true;
      })
      .addCase(updateUserInitials.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

export const userReducer = userSlice.reducer;
