import { Box, Container, Paper, Skeleton, Stack } from '@mui/material';

export default function RootLoading() {
  return (
    <Box sx={{ minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: 4, borderRadius: 3 }}>
          <Stack spacing={2}>
            <Skeleton variant="text" width="40%" height={44} />
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 2 }} />
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
