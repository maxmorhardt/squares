import { useCallback } from 'react';
import { selectDefaultInitials } from '../features/user/userSelectors';
import { loadUserProfile } from '../features/user/userThunks';
import { useAppDispatch, useAppStore } from './reduxHooks';

// returns the user's default initials, refreshing from the backend if the store has none.
// the app-wide profile load can fail, race, or time out, so the store may be stale even when
// the backend has initials — re-fetch before treating them as unset (e.g. blocking a claim)
export function useEnsureInitials() {
  const dispatch = useAppDispatch();
  const store = useAppStore();

  return useCallback(async (): Promise<string> => {
    const current = selectDefaultInitials(store.getState());
    if (current) {
      return current;
    }

    try {
      const profile = await dispatch(loadUserProfile()).unwrap();
      return profile.defaultInitials ?? '';
    } catch {
      return '';
    }
  }, [dispatch, store]);
}
