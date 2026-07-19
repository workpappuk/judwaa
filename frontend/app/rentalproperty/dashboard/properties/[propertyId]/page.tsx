import { notFound, redirect } from 'next/navigation';
import { Button, Chip, Container, Paper, Stack, Typography } from '@mui/material';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { getPropertyAccess } from '@/lib/authz';
import Property from '@/models/Property';

export default async function PropertyDetailPage({ params }: { params: Promise<{ propertyId: string }> }) {
  const { propertyId } = await params;
  const authUser = await requireUser();
  if (!authUser) redirect('/rentalproperty/signin');

  await dbConnect();

  const access = await getPropertyAccess(authUser.id, propertyId);
  if (!access.exists) notFound();
  if (!access.canAccess) redirect('/rentalproperty/dashboard');

  const property = (await Property.findById(propertyId).lean()) as any;
  if (!property) notFound();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={1.5} sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' } }}>
            <Typography variant="h5">{property.name}</Typography>
            {access.role === 'tenant' ? <Chip label="Tenant Dashboard" color="info" size="small" /> : null}
          </Stack>
          <Typography color="text.secondary">
            {property.type} · {property.address.line1}, {property.address.city}, {property.address.state}
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            {access.canManage ? 'Manage This Property' : 'Property Access'}
          </Typography>
          {!access.canManage ? (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              You are viewing tenant-scoped actions for this property.
            </Typography>
          ) : null}
          <Stack spacing={1.5} sx={{ flexDirection: { xs: 'column', sm: 'row' }, flexWrap: 'wrap' }}>
            {access.canManage ? (
              <Button href={`/rentalproperty/dashboard/properties/${propertyId}/units`} variant="outlined">
                Units
              </Button>
            ) : null}
            {access.canManage ? (
              <Button href={`/rentalproperty/dashboard/properties/${propertyId}/invitations`} variant="outlined">
                Invitations
              </Button>
            ) : null}
            <Button href={`/rentalproperty/dashboard/properties/${propertyId}/stays`} variant="outlined">
              {access.canManage ? 'Stays' : 'My Stays'}
            </Button>
            <Button href={`/rentalproperty/dashboard/properties/${propertyId}/bills`} variant="outlined">
              {access.canManage ? 'Bills' : 'My Bills'}
            </Button>
            <Button href={`/rentalproperty/dashboard/properties/${propertyId}/complaints`} variant="outlined">
              {access.canManage ? 'Complaints' : 'My Complaints'}
            </Button>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
