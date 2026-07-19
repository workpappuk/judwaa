'use client';

import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';

export default function HomePage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(120deg, #EAF1FF 0%, #F4F7FB 45%, #E7FBF6 100%)',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="md">
        <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: 4 }}>
          <Stack spacing={2}>
            <Typography variant="overline" color="primary">
              Production-Ready Starter
            </Typography>
            <Typography variant="h4">Manage anything rentable from one platform</Typography>
            <Typography color="text.secondary">
              Generic domain model with Property, Unit, Membership, Invitation, Stay, Bill, and Complaint.
              Invitation, occupancy, billing, and complaint flows are wired from day one.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Button href="/rentalproperty/signin" variant="contained" size="large">
                Sign In
              </Button>
              <Button href="/rentalproperty/dashboard" variant="outlined" size="large">
                Go to Dashboard
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
