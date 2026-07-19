import { notFound, redirect } from 'next/navigation';
import { Box, Chip, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { getPropertyAccess } from '@/lib/authz';
import Property from '@/models/Property';
import Unit from '@/models/Unit';
import Stay from '@/models/Stay';
import { CreateStayForm } from '@/components/create-stay-form';

export default async function PropertyStaysPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const authUser = await requireUser();
  if (!authUser) redirect('/rentalproperty/signin');

  await dbConnect();

  const access = await getPropertyAccess(authUser.id, propertyId);
  if (!access.exists) notFound();
  if (!access.canAccess) redirect('/rentalproperty/dashboard');

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

  const staysQuery: any = { propertyId: new Types.ObjectId(propertyId) };
  if (!access.canManage) staysQuery.occupantId = new Types.ObjectId(authUser.id);

  const staysRaw = (await Stay.find(staysQuery)
    .sort({ createdAt: -1 })
    .limit(30)
    .lean()) as any[];

  const stays = staysRaw.map((s) => ({
    id: String(s._id),
    unitName: units.find((u) => u.id === String(s.unitId))?.name || String(s.unitId),
    billingType: s.billingType,
    rate: s.rate,
    status: s.status,
    scheduledStart: s.scheduledStart,
    scheduledEnd: s.scheduledEnd,
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={1.5} sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' } }}>
            <Typography variant="h5">{property.name} - Stays</Typography>
            {access.role === 'tenant' ? <Chip label="Tenant Dashboard" color="info" size="small" /> : null}
          </Stack>
          <Typography color="text.secondary">
            {access.canManage ? 'Manage occupancy and booking windows.' : 'View your occupancy details for this property.'}
          </Typography>
        </Paper>

        {access.canManage ? (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create Stay
            </Typography>
            <CreateStayForm propertyId={propertyId} units={units} />
          </Paper>
        ) : null}

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6">Recent Stays</Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1.5}>
            {stays.length === 0 ? (
              <Typography color="text.secondary">No stays yet.</Typography>
            ) : (
              stays.map((stay) => (
                <Box
                  key={stay.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>{stay.unitName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stay.billingType} | {stay.status} | rate {stay.rate}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(stay.scheduledStart).toLocaleString()} -{' '}
                    {stay.scheduledEnd ? new Date(stay.scheduledEnd).toLocaleString() : 'open-ended'}
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
