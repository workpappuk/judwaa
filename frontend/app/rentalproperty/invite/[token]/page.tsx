import { redirect } from 'next/navigation';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';
import { dbConnect } from '@/lib/db';
import Invitation from '@/models/Invitation';
import Property from '@/models/Property';
import Unit from '@/models/Unit';
import { getAuthSession } from '@/lib/auth';
import { AcceptInviteButton } from '@/components/accept-invite-button';

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  await dbConnect();

  const session = await getAuthSession();

  const invite = (await Invitation.findOne({ token }).lean()) as any;
  if (!invite || Array.isArray(invite)) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6">Invitation not found</Typography>
        </Paper>
      </Container>
    );
  }

  const property = (await Property.findById(invite.propertyId).lean()) as any;
  const unit = invite.unitId ? ((await Unit.findById(invite.unitId).lean()) as any) : null;
  const expired = new Date(invite.expiresAt).getTime() < Date.now();

  if (!session?.user?.email) {
    redirect(`/rentalproperty/signin?callbackUrl=/rentalproperty/invite/${token}`);
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', p: 2 }}>
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          <Stack spacing={2}>
            <Typography variant="h5">Invitation</Typography>
            <Typography color="text.secondary">
              You are invited as <strong>{invite.role}</strong>
              {property ? ` to ${property.name}` : ''}.
            </Typography>
            {unit ? <Typography color="text.secondary">Unit: {unit.name}</Typography> : null}
            {invite.invitedEmail ? (
              <Typography color="text.secondary">Restricted to: {invite.invitedEmail}</Typography>
            ) : null}
            <Typography color="text.secondary">Status: {expired ? 'expired' : invite.status}</Typography>

            {invite.status === 'pending' && !expired ? (
              <AcceptInviteButton token={token} />
            ) : (
              <Button href="/rentalproperty/dashboard" variant="contained">
                Go to Dashboard
              </Button>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
