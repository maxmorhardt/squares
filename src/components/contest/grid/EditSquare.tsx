import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { useAuth } from 'react-oidc-context';
import {
  selectCurrentContest,
  selectCurrentSquare,
  selectSquareLoading,
} from '../../../features/contests/contestSelectors';

import { clearSquare } from '../../../features/contests/contestThunks';
import { useAppDispatch, useAppSelector } from '../../../hooks/reduxHooks';

interface EditSquareProps {
  open: boolean;
  onClose: () => void;
}

export default function EditSquare({ open, onClose }: EditSquareProps) {
  const dispatch = useAppDispatch();
  const auth = useAuth();

  const currentSquare = useAppSelector(selectCurrentSquare);
  const currentContest = useAppSelector(selectCurrentContest);
  const loading = useAppSelector(selectSquareLoading);

  if (!currentSquare) {
    return;
  }

  const isOwner = currentSquare.owner === auth?.user?.profile?.email;
  const isActive = currentContest?.status === 'ACTIVE';
  const isClaimed = Boolean(currentSquare.value && currentSquare.value.trim());

  const winningQuarters =
    currentContest?.quarterResults
      ?.filter((qr) => qr.winnerRow === currentSquare?.row && qr.winnerCol === currentSquare?.col)
      .map((qr) => qr.quarter)
      .sort((a, b) => a - b) ?? [];

  const isWinner = winningQuarters.length > 0;

  const handleClear = async () => {
    try {
      await dispatch(
        clearSquare({
          contestId: currentSquare.contestId,
          squareId: currentSquare.id,
        })
      ).unwrap();
      onClose();
    } catch (error) {
      console.error('Failed to clear square:', error);
    }
  };

  const canClear = isActive && isOwner && isClaimed;
  const title = isOwner ? 'Your Square' : isClaimed ? 'Square Details' : 'Empty Square';

  // the initials preview tile echoes the grid's glass styling, tinted for the
  // current viewer's own squares and for winning squares
  const tileBackground = isWinner
    ? 'rgba(67, 233, 123, 0.18)'
    : isOwner
      ? 'rgba(102, 126, 234, 0.2)'
      : 'rgba(255, 255, 255, 0.06)';
  const tileBorder = isWinner
    ? '2px solid rgba(67, 233, 123, 0.6)'
    : isOwner
      ? '1px solid rgba(102, 126, 234, 0.5)'
      : '1px solid rgba(255, 255, 255, 0.15)';

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 3,
            border: '1px solid rgba(255,255,255,0.1)',
            backgroundImage: 'none',
          },
        },
      }}
    >
      {/* dialog title with close button */}
      <DialogTitle sx={{ fontSize: 20, fontWeight: 700, pr: 6 }}>
        {title}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            pt: 1,
          }}
        >
          {/* initials preview tile */}
          <Box
            sx={{
              width: 92,
              height: 92,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 2.5,
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'white',
              background: tileBackground,
              border: tileBorder,
              backdropFilter: 'blur(10px)',
              boxShadow: isWinner ? '0 0 22px rgba(67, 233, 123, 0.25)' : 'none',
            }}
          >
            {isClaimed ? currentSquare.value : '—'}
          </Box>

          {/* square owner */}
          {isClaimed ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                {isOwner ? 'Claimed by you' : 'Claimed by'}
              </Typography>
              <Typography sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>
                {currentSquare.ownerName || currentSquare.owner}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              This square is unclaimed
            </Typography>
          )}

          {/* winner badge if square won any quarters */}
          {isWinner && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 0.75,
                borderRadius: 999,
                background: 'rgba(67, 233, 123, 0.12)',
                border: '1px solid rgba(67, 233, 123, 0.4)',
              }}
            >
              <EmojiEventsIcon sx={{ fontSize: 18, color: 'rgba(67, 233, 123, 0.9)' }} />
              <Typography
                variant="body2"
                sx={{ color: 'rgba(67, 233, 123, 0.9)', fontWeight: 700 }}
              >
                Winner · {winningQuarters.map((q) => `Q${q}`).join(', ')}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      {/* clear action, only for the owner while the contest is active */}
      {canClear && (
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button
            onClick={handleClear}
            variant="outlined"
            color="warning"
            disabled={loading}
            sx={{ minHeight: 37, minWidth: 120 }}
          >
            {loading ? <CircularProgress size={16} color="inherit" /> : 'Clear Square'}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
