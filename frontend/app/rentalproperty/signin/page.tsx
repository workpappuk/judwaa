'use client';

import { Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/rentalproperty/dashboard';

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
            <Typography variant="h5">Sign in</Typography>
            <Typography color="text.secondary">
              OAuth only. No password management required.
            </Typography>
            <Button variant="contained" onClick={() => signIn('google', { callbackUrl })}>
              Continue with Google
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div />}>
      <SignInContent />
    </Suspense>
  );
}
