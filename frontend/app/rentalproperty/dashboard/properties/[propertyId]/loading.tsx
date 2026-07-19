import { Container, Grid, Paper, Skeleton, Stack } from '@mui/material';

export default function PropertyLoading() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Skeleton variant="text" width="35%" height={40} />
          <Skeleton variant="text" width="60%" />
        </Paper>

        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid size={{ xs: 12, md: 6 }} key={index}>
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Skeleton variant="text" width="40%" height={30} sx={{ mb: 1 }} />
                <Stack spacing={1}>
                  <Skeleton variant="rectangular" height={42} sx={{ borderRadius: 1.5 }} />
                  <Skeleton variant="rectangular" height={42} sx={{ borderRadius: 1.5 }} />
                  <Skeleton variant="rectangular" height={42} sx={{ borderRadius: 1.5 }} />
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
