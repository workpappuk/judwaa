import { redirect } from 'next/navigation';
import { Chip, Container, Paper, Stack, Typography, Button } from '@mui/material';
import { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import Membership from '@/models/Membership';
import Property from '@/models/Property';

export default async function TenantDashboardPage() {
  const authUser = await requireUser();
  if (!authUser) redirect('/rentalproperty/signin');

  await dbConnect();

  const memberships = (await Membership.find({
    userId: new Types.ObjectId(authUser.id),
    role: 'tenant',
    status: 'active',
  }).lean()) as any[];

  if (memberships.length === 0) {
    redirect('/rentalproperty/dashboard');
  }

  const propertyIds = memberships.map((m) => m.propertyId);
  const properties = (await Property.find({ _id: { $in: propertyIds }, isActive: true }).lean()) as any[];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={1.5} sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' } }}>
            <Typography variant="h4">Dashboard</Typography>
            <Chip label="Tenant Dashboard" color="info" size="small" />
          </Stack>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Access your property stays, bills, and complaints.
          </Typography>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6">Your Properties</Typography>
          <Stack spacing={1.5} sx={{ mt: 2 }}>
            {properties.length === 0 ? (
              <Typography color="text.secondary">No active tenant properties.</Typography>
            ) : (
              properties.map((property) => (
                <Stack
                  key={String(property._id)}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { sm: 'center' },
                  }}
                >
                  <Stack>
                    <Typography sx={{ fontWeight: 600 }}>{property.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {property.type} · {property.address.city}, {property.address.state}
                    </Typography>
                  </Stack>
                  <Stack spacing={1} sx={{ flexDirection: 'row' }}>
                    <Button href={`/rentalproperty/dashboard/properties/${String(property._id)}/stays`} variant="outlined" size="small">
                      My Stays
                    </Button>
                    <Button href={`/rentalproperty/dashboard/properties/${String(property._id)}/bills`} variant="outlined" size="small">
                      My Bills
                    </Button>
                    <Button href={`/rentalproperty/dashboard/properties/${String(property._id)}/complaints`} variant="outlined" size="small">
                      My Complaints
                    </Button>
                  </Stack>
                </Stack>
              ))
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
