import { Box, Paper, Typography } from '@mui/material';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import {
  selectCurrentContest,
  selectParticipants,
} from '../../../features/contests/contestSelectors';
import { setCurrentSquare } from '../../../features/contests/contestSlice';
import { claimSquare } from '../../../features/contests/contestThunks';
import { selectDefaultInitials } from '../../../features/user/userSelectors';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxHooks';
import { useToast } from '../../../hooks/useToast';
import EditSquare from './EditSquare';
import Square from './Square';

interface ContestProps {
  newWinnerSquare?: { row: number; col: number } | null;
}

export default function Contest({ newWinnerSquare }: ContestProps) {
  const auth = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const currentContest = useAppSelector(selectCurrentContest);
  const participants = useAppSelector(selectParticipants);
  const defaultInitials = useAppSelector(selectDefaultInitials);
  const { showToast } = useToast();
  const [openEditSquare, setOpenEditSquare] = useState(false);

  const currentUsername = auth?.user?.profile?.email as string | undefined;
  const currentParticipant = participants.find((p) => p.userId === currentUsername);
  const isParticipant = !!currentParticipant;
  const isOwner = currentUsername === currentContest?.owner;
  const isReadOnly = !isParticipant && !isOwner;

  // the click handler needs the latest contest/state, but must stay referentially
  // stable so memoized squares don't all re-render on every websocket update. a ref
  // holds the current values and the callback reads through it
  const clickState = {
    currentContest,
    isReadOnly,
    isAuthenticated: auth?.isAuthenticated ?? false,
    signinRedirect: auth?.signinRedirect,
    currentUsername,
    currentParticipant,
    defaultInitials,
    showToast,
    navigate,
    dispatch,
  };
  const clickStateRef = useRef(clickState);
  clickStateRef.current = clickState;

  const handleSquareClick = useCallback((row: number, col: number) => {
    const {
      currentContest,
      isReadOnly,
      isAuthenticated,
      signinRedirect,
      currentUsername,
      currentParticipant,
      defaultInitials,
      showToast,
      navigate,
      dispatch,
    } = clickStateRef.current;

    if (!currentContest) {
      return;
    }

    // send unauthenticated users to sign in before they can interact with squares
    if (!isAuthenticated) {
      signinRedirect?.();
      return;
    }

    // block non-participants on public contests
    if (isReadOnly) {
      showToast('You need to be a participant to claim squares', 'info');
      return;
    }

    const square = currentContest.squares.find(
      (square) => square.row === row && square.col === col
    );

    if (!square) {
      showToast('Square not found', 'error');
      return;
    }

    const isEmpty = !square.value || square.value.trim() === '';
    const isActive = currentContest.status === 'ACTIVE';

    if (isEmpty && isActive) {
      // check square limit for non-owner participants
      const squaresClaimed = currentContest.squares.filter(
        (s) => s.owner === currentUsername
      ).length;
      if (currentParticipant && squaresClaimed >= currentParticipant.maxSquares) {
        showToast('Square limit reached', 'warning');
        return;
      }

      // require default initials to be set before claiming square
      if (!defaultInitials) {
        showToast('Set your initials in your profile before claiming a square', 'warning');
        navigate('/profile');
        return;
      }

      dispatch(
        claimSquare({
          contestId: currentContest.id,
          squareId: square.id,
        })
      );
    } else {
      // open edit dialog for filled squares
      dispatch(setCurrentSquare(square));
      setOpenEditSquare(true);
    }
  }, []);

  // set of "row-col" keys for winning squares, so each cell is an O(1) lookup
  // instead of scanning quarterResults on every render
  const winnerKeys = useMemo(() => {
    const keys = new Set<string>();
    currentContest?.quarterResults?.forEach((qr) => {
      keys.add(`${qr.winnerRow}-${qr.winnerCol}`);
    });
    return keys;
  }, [currentContest?.quarterResults]);

  if (
    !currentContest ||
    !currentContest.xLabels ||
    !currentContest.yLabels ||
    !currentContest.squares
  ) {
    return;
  }

  // build 2d matrix for grid display
  const numRows = currentContest.yLabels.length;
  const numCols = currentContest.xLabels.length;
  const contestMatrix: string[][] = Array.from({ length: numRows }, () => Array(numCols).fill(''));
  const ownerMatrix: string[][] = Array.from({ length: numRows }, () => Array(numCols).fill(''));

  // populate matrix with square values and owners
  currentContest.squares.forEach((square) => {
    if (square.row < numRows && square.col < numCols) {
      contestMatrix[square.row][square.col] = square.value;
      ownerMatrix[square.row][square.col] = square.owner;
    }
  });

  return (
    <>
      {/* contest grid container */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* grid paper wrapper */}
        <Paper
          sx={{
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 3,
            p: { xs: 0.75, sm: 1, md: 1.5 },
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            width: 'fit-content',
          }}
        >
          {/* grid layout */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 0.5,
            }}
          >
            {/* x-axis team label (away team) */}
            <Typography
              sx={{
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                fontSize: { xs: '0.65rem', sm: '0.8rem', md: '0.95rem' },
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                mb: { xs: 1.25, sm: 2.5 },
              }}
            >
              {currentContest.awayTeam || 'Away Team'}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', pb: { xs: 1.5, sm: 3.5 } }}>
              {/* y-axis team label (home team) */}
              <Typography
                sx={{
                  color: 'rgba(255,255,255,0.7)',
                  fontWeight: 600,
                  fontSize: { xs: '0.65rem', sm: '0.8rem', md: '0.95rem' },
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  mr: { xs: 2, sm: 3.5 },
                }}
              >
                {currentContest.homeTeam || 'Home Team'}
              </Typography>

              {/* grid rows */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.5,
                  pr: { xs: 3.5, sm: 5 },
                }}
              >
                {/* render each row */}
                {contestMatrix.map((rowData, rowIndex) => (
                  <Box
                    key={`${rowIndex}`}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {/* render each square in row */}
                    {rowData.map((squareData, colIndex) => (
                      <Square
                        key={`${rowIndex}-${colIndex}`}
                        rowIndex={rowIndex}
                        colIndex={colIndex}
                        squareData={squareData}
                        handleSquareClick={handleSquareClick}
                        xLabel={currentContest.xLabels[colIndex]}
                        yLabel={currentContest.yLabels[rowIndex]}
                        isWinner={winnerKeys.has(`${rowIndex}-${colIndex}`)}
                        isMine={
                          !!currentUsername && ownerMatrix[rowIndex][colIndex] === currentUsername
                        }
                        isNewWinner={
                          newWinnerSquare?.row === rowIndex && newWinnerSquare?.col === colIndex
                        }
                      />
                    ))}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* edit square modal */}
      <EditSquare open={openEditSquare} onClose={() => setOpenEditSquare(false)} />
    </>
  );
}
