import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { userReducer } from '../features/user/userSlice';
import type { UserProfile } from '../types/user';
import { useEnsureInitials } from './useEnsureInitials';

vi.mock('../service/userService', () => ({
  getMyProfile: vi.fn(),
}));

import { getMyProfile } from '../service/userService';

const profile: UserProfile = {
  email: 'bob',
  displayName: 'Bob Smith',
  defaultInitials: 'BS',
  createdAt: '',
};

function makeStore(preloadedProfile: UserProfile | null) {
  return configureStore({
    reducer: { user: userReducer },
    preloadedState: {
      user: {
        ...userReducer(undefined, { type: '' }),
        profile: preloadedProfile,
      } as ReturnType<typeof userReducer>,
    },
  });
}

function wrapper(store: ReturnType<typeof makeStore>) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(Provider, { store, children });
  };
}

describe('useEnsureInitials', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the store initials without hitting the backend when present', async () => {
    const store = makeStore(profile);
    const { result } = renderHook(() => useEnsureInitials(), { wrapper: wrapper(store) });

    await expect(result.current()).resolves.toBe('BS');
    expect(getMyProfile).not.toHaveBeenCalled();
  });

  it('refetches the profile when the store has no initials', async () => {
    vi.mocked(getMyProfile).mockResolvedValue(profile);
    const store = makeStore(null);
    const { result } = renderHook(() => useEnsureInitials(), { wrapper: wrapper(store) });

    await expect(result.current()).resolves.toBe('BS');
    expect(getMyProfile).toHaveBeenCalledTimes(1);
    expect(store.getState().user.profile?.defaultInitials).toBe('BS');
  });

  it('returns an empty string when the store and profile both have no initials', async () => {
    vi.mocked(getMyProfile).mockResolvedValue({ ...profile, defaultInitials: '' });
    const store = makeStore(null);
    const { result } = renderHook(() => useEnsureInitials(), { wrapper: wrapper(store) });

    await expect(result.current()).resolves.toBe('');
  });

  it('rejects when the refetch fails so callers can distinguish it from unset initials', async () => {
    vi.mocked(getMyProfile).mockRejectedValue(new Error('down'));
    const store = makeStore(null);
    const { result } = renderHook(() => useEnsureInitials(), { wrapper: wrapper(store) });

    await expect(result.current()).rejects.toThrow();
  });
});
