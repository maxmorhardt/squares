import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createTheme, ThemeProvider } from '@mui/material';
import { MemoryRouter } from 'react-router-dom';
import DebugPage from './DebugPage';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useNavigate: () => vi.fn() };
});

vi.mock('react-oidc-context', () => ({
  useAuth: () => ({ isAuthenticated: false }),
}));

const theme = createTheme();

function renderComponent() {
  return render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <DebugPage />
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe('DebugPage', () => {
  it('renders the debug heading', () => {
    renderComponent();
    expect(screen.getByText('Error State Debug')).toBeInTheDocument();
  });

  it('shows the error boundary fallback by default', () => {
    renderComponent();
    expect(screen.getByText('Something Went Wrong')).toBeInTheDocument();
  });

  it('switches the preview when another state is selected', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: '404' }));
    expect(screen.getByText('Page Not Found')).toBeInTheDocument();
  });

  it('renders the join full preview with the sample contest name', () => {
    renderComponent();
    fireEvent.click(screen.getByRole('button', { name: 'Join Full' }));
    expect(screen.getByText('No Squares Available')).toBeInTheDocument();
    expect(screen.getByText('Super Bowl Contest')).toBeInTheDocument();
  });

  it('throws when Throw Real Error is clicked', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderComponent();
    expect(() =>
      fireEvent.click(screen.getByRole('button', { name: /throw real error/i }))
    ).toThrow(/intentional error/);
    consoleError.mockRestore();
  });
});
