import type { LeaderboardRankResponse, LeaderboardResponse } from '../../types/leaderboard';

// TEMPORARY preview data for local design work, imported only from the dev-only branches in
// leaderboardThunks.ts. Delete this file when the real board has enough data to look at.

export const demoLeaderboard: LeaderboardResponse = {
  entries: [
    { rank: 1, displayName: 'Marcus T.', quarterWins: 24, squaresClaimed: 96 },
    { rank: 2, displayName: 'Priya N.', quarterWins: 19, squaresClaimed: 88 },
    { rank: 3, displayName: 'Dave R.', quarterWins: 17, squaresClaimed: 102 },
    { rank: 4, displayName: 'Max M.', quarterWins: 14, squaresClaimed: 61 },
    // a tie, so the shared rank and the skip to 7 are visible
    { rank: 5, displayName: 'Sofia L.', quarterWins: 12, squaresClaimed: 74 },
    { rank: 5, displayName: 'Chen W.', quarterWins: 12, squaresClaimed: 55 },
    { rank: 7, displayName: 'Aaliyah B.', quarterWins: 9, squaresClaimed: 48 },
    { rank: 8, displayName: 'Tom H.', quarterWins: 6, squaresClaimed: 39 },
    { rank: 9, displayName: 'Jordan', quarterWins: 4, squaresClaimed: 52 },
    { rank: 10, displayName: 'Elena V.', quarterWins: 2, squaresClaimed: 18 },
  ],
};

export const demoMyRank: LeaderboardRankResponse = {
  rank: 4,
  totalRanked: demoLeaderboard.entries.length,
  quarterWins: 14,
  ranked: true,
};
