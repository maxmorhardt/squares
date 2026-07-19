import { Box, Button, Container, Divider, Typography } from '@mui/material';
import { useState, type ReactNode } from 'react';
import ContestError from '../../components/contest/ContestError';
import JoinError from '../../components/join/JoinError';
import { ErrorFallback } from '../error/ErrorBoundary';
import ForbiddenPage from '../error/ForbiddenPage';
import NotFoundPage from '../error/NotFoundPage';
import UnauthorizedPage from '../error/UnauthorizedPage';
import type { InvitePreviewResponse } from '../../types/contest';

const samplePreview: InvitePreviewResponse = {
  contestId: 'debug-contest',
  contestName: 'Super Bowl Contest',
  maxSquares: 2,
  owner: 'alice',
  role: 'participant',
};

const previews: { key: string; label: string; render: () => ReactNode }[] = [
  { key: 'fallback', label: 'Error Boundary', render: () => <ErrorFallback /> },
  { key: 'not-found', label: '404', render: () => <NotFoundPage /> },
  { key: 'forbidden', label: '403', render: () => <ForbiddenPage /> },
  { key: 'unauthorized', label: '401', render: () => <UnauthorizedPage /> },
  { key: 'contest', label: 'Contest Error', render: () => <ContestError /> },
  {
    key: 'join-error',
    label: 'Join Error',
    render: () => <JoinError variant="error" message="Invite not found" />,
  },
  {
    key: 'join-full',
    label: 'Join Full',
    render: () => <JoinError variant="no-squares" preview={samplePreview} />,
  },
];

// throws during render so the nearest error boundary catches it
function Bomb(): never {
  throw new Error('Debug: intentional error to exercise the error boundary');
}

export default function DebugPage() {
  const [selected, setSelected] = useState('fallback');
  const [exploded, setExploded] = useState(false);

  if (exploded) {
    return <Bomb />;
  }

  const active = previews.find((preview) => preview.key === selected);

  return (
    <Box>
      <Container maxWidth="md" sx={{ pt: 4, px: { xs: 3, sm: 4 } }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.25rem', color: 'white', mb: 0.5 }}>
          Error State Debug
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem', mb: 2.5 }}>
          Dev-only preview of every error screen. &quot;Throw Real Error&quot; renders a component
          that throws, so the actual boundary catches it.
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {previews.map((preview) => (
            <Button
              key={preview.key}
              size="small"
              variant={preview.key === selected ? 'contained' : 'outlined'}
              onClick={() => setSelected(preview.key)}
              sx={{ textTransform: 'none' }}
            >
              {preview.label}
            </Button>
          ))}
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => setExploded(true)}
            sx={{ textTransform: 'none' }}
          >
            Throw Real Error
          </Button>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />
      </Container>

      {active?.render()}
    </Box>
  );
}
