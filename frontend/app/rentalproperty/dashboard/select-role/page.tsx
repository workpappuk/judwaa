import { redirect } from 'next/navigation';
import { Alert, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { getActiveMembershipRoles } from '@/lib/role-selection';
import { RoleSelectionButtons } from '@/components/role-selection-buttons';

export default async function SelectRolePage() {
  const authUser = await requireUser();
  if (!authUser) redirect('/rentalproperty/signin');

  await dbConnect();
  const roles = await getActiveMembershipRoles(authUser.id);

  if (roles.length === 0) {
    redirect('/rentalproperty/dashboard');
  }

  if (roles.length === 1) {
    if (roles[0] === 'tenant') redirect('/rentalproperty/dashboard/tenant');
    redirect('/rentalproperty/dashboard');
  }

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 4, borderRadius: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5">Choose Role</Typography>
          <Typography color="text.secondary">
            You have multiple active memberships. Select how you want to continue.
          </Typography>

          <RoleSelectionButtons roles={roles} />

          <Alert severity="info">You can switch role later by visiting this page again.</Alert>
          <Button href="/rentalproperty/dashboard" variant="text">Back</Button>
        </Stack>
      </Paper>
    </Container>
  );
}
