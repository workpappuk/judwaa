import { notFound, redirect } from 'next/navigation';
import { Box, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { canManageProperty } from '@/lib/authz';
import Property from '@/models/Property';
import Unit from '@/models/Unit';
import Invitation from '@/models/Invitation';
import { CreateInviteForm } from '@/components/create-invite-form';

export default async function PropertyInvitationsPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const authUser = await requireUser();
  if (!authUser) redirect('/rentalproperty/signin');

  await dbConnect();

  const allowed = await canManageProperty(authUser.id, propertyId);
  if (!allowed) redirect('/rentalproperty/dashboard');

  const property = (await Property.findById(propertyId).lean()) as any;
  if (!property) notFound();

  const unitsRaw = (await Unit.find({ propertyId: new Types.ObjectId(propertyId) })
    .sort({ createdAt: -1 })
    .lean()) as any[];

  const units = unitsRaw.map((u) => ({
    id: String(u._id),
    name: u.name,
    isRentable: u.isRentable,
  }));

  const invitationsRaw = (await Invitation.find({ propertyId: new Types.ObjectId(propertyId) })
    .sort({ createdAt: -1 })
    .limit(30)
    .lean()) as any[];

  const invitations = invitationsRaw.map((invitation) => ({
    id: String(invitation._id),
    role: invitation.role,
    status: invitation.status,
    invitedEmail: invitation.invitedEmail || 'open invite',
    unitName: invitation.unitId
      ? units.find((u) => u.id === String(invitation.unitId))?.name || String(invitation.unitId)
      : '-',
    expiresAt: invitation.expiresAt,
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h5">{property.name} - Invitations</Typography>
          <Typography color="text.secondary">
            Generate manager/tenant invites and track status.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Generate Invitation
          </Typography>
          <CreateInviteForm propertyId={propertyId} units={units} />
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6">Recent Invitations</Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1.5}>
            {invitations.length === 0 ? (
              <Typography color="text.secondary">No invitations yet.</Typography>
            ) : (
              invitations.map((invitation) => (
                <Box
                  key={invitation.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>{invitation.invitedEmail}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invitation.role} | {invitation.status} | unit: {invitation.unitName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    expires: {new Date(invitation.expiresAt).toLocaleString()}
                  </Typography>
                </Box>
              ))
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
