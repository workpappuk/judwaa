'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@/lib/theme';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider basePath="/rentalproperty/api/auth">
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}
