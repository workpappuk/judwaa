import { notFound, redirect } from 'next/navigation';
import { Box, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { canManageProperty } from '@/lib/authz';
import Property from '@/models/Property';
import Unit from '@/models/Unit';
import { CreateUnitForm } from '@/components/create-unit-form';

export default async function PropertyUnitsPage({ params }: { params: Promise<{ propertyId: string }> }) {
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
    type: u.type,
    isRentable: u.isRentable,
    status: u.status,
    parentUnitId: u.parentUnitId ? String(u.parentUnitId) : null,
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h5">{property.name} - Units</Typography>
          <Typography color="text.secondary">
            {property.type} · {property.address.city}, {property.address.state}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Add Unit
          </Typography>
          <CreateUnitForm propertyId={propertyId} />
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6">All Units</Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1.5}>
            {units.length === 0 ? (
              <Typography color="text.secondary">No units yet.</Typography>
            ) : (
              units.map((unit) => (
                <Box
                  key={unit.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>{unit.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {unit.type} · {unit.isRentable ? 'rentable' : 'grouping'} · {unit.status}
                  </Typography>
                  {unit.parentUnitId ? (
                    <Typography variant="caption" color="text.secondary">
                      parent: {unit.parentUnitId}
                    </Typography>
                  ) : null}
                </Box>
              ))
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
