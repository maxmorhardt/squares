import { createAsyncThunk } from '@reduxjs/toolkit';
import { getLeaderboard, getMyRank } from '../../service/leaderboardService';
import type { APIError } from '../../types/error';
import type { LeaderboardRankResponse, LeaderboardResponse } from '../../types/leaderboard';

// TEMPORARY: preview data for local design work. Both operands are statically known at build
// time, so a production build folds this to false and drops the dynamic imports entirely.
// To remove: delete demoData.ts and the two DEMO_LEADERBOARD branches below.
const DEMO_LEADERBOARD = import.meta.env.DEV && import.meta.env.MODE !== 'test';

export const fetchLeaderboard = createAsyncThunk<
  LeaderboardResponse,
  number | undefined,
  { rejectValue: APIError }
>('leaderboard/fetch', async (limit, { rejectWithValue }) => {
  if (DEMO_LEADERBOARD) {
    return (await import('./demoData')).demoLeaderboard;
  }

  try {
    return await getLeaderboard(limit);
  } catch (err: unknown) {
    return rejectWithValue(err as APIError);
  }
});

export const fetchMyRank = createAsyncThunk<
  LeaderboardRankResponse,
  void,
  { rejectValue: APIError }
>('leaderboard/fetchMyRank', async (_, { rejectWithValue }) => {
  if (DEMO_LEADERBOARD) {
    return (await import('./demoData')).demoMyRank;
  }

  try {
    return await getMyRank();
  } catch (err: unknown) {
    return rejectWithValue(err as APIError);
  }
});
