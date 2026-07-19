import { notFound, redirect } from 'next/navigation';
import { Box, Chip, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { getPropertyAccess } from '@/lib/authz';
import Property from '@/models/Property';
import Unit from '@/models/Unit';
import Complaint from '@/models/Complaint';
import { CreateComplaintForm } from '@/components/create-complaint-form';

export default async function PropertyComplaintsPage({ params }: { params: Promise<{ propertyId: string }> }) {
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
  const allUnits = unitsRaw.map((u) => ({ id: String(u._id), name: u.name }));
  const units = access.canManage
    ? allUnits
    : access.unitId
    ? allUnits.filter((u) => u.id === access.unitId)
    : allUnits;

  const complaintsQuery: any = { propertyId: new Types.ObjectId(propertyId) };
  if (!access.canManage) complaintsQuery.raisedBy = new Types.ObjectId(authUser.id);

  const complaintsRaw = (await Complaint.find(complaintsQuery)
    .sort({ createdAt: -1 })
    .limit(30)
    .lean()) as any[];

  const complaints = complaintsRaw.map((c) => ({
    id: String(c._id),
    unitName: units.find((u) => u.id === String(c.unitId))?.name || String(c.unitId),
    title: c.title,
    category: c.category,
    priority: c.priority,
    status: c.status,
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={1.5} sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' } }}>
            <Typography variant="h5">{property.name} - Complaints</Typography>
            {access.role === 'tenant' ? <Chip label="Tenant Dashboard" color="info" size="small" /> : null}
          </Stack>
          <Typography color="text.secondary">
            {access.canManage ? 'Track issues and resolution status by unit.' : 'Raise and track your complaint tickets.'}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Create Complaint
          </Typography>
          <CreateComplaintForm propertyId={propertyId} units={units} />
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6">Recent Complaints</Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1.5}>
            {complaints.length === 0 ? (
              <Typography color="text.secondary">No complaints yet.</Typography>
            ) : (
              complaints.map((complaint) => (
                <Box
                  key={complaint.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>{complaint.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {complaint.unitName} | {complaint.category} | {complaint.priority} | {complaint.status}
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
