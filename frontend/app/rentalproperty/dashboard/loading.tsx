import { Container, Grid, Paper, Skeleton, Stack } from '@mui/material';

export default function DashboardLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Skeleton variant="text" width="30%" height={42} />
          <Skeleton variant="text" width="55%" />
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Skeleton variant="text" width="25%" height={32} sx={{ mb: 1 }} />
          <Grid container spacing={2}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                <Skeleton variant="rectangular" height={92} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Stack>
    </Container>
  );
}
