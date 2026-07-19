import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { Box, Button, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import Property from '@/models/Property';
import Membership from '@/models/Membership';
import { Types } from 'mongoose';
import { CreatePropertyForm } from '@/components/create-property-form';
import { AppRole, getActiveMembershipRoles } from '@/lib/role-selection';

export default async function DashboardPage() {
  const authUser = await requireUser();
  if (!authUser) redirect('/rentalproperty/signin');

  await dbConnect();

  const roles = await getActiveMembershipRoles(authUser.id);
  const cookieStore = await cookies();
  const activeRole = cookieStore.get('active_role')?.value as AppRole | undefined;

  if (roles.length > 1 && (!activeRole || !roles.includes(activeRole))) {
    redirect('/rentalproperty/dashboard/select-role');
  }

  if (roles.length === 1 && roles[0] === 'tenant') {
    redirect('/rentalproperty/dashboard/tenant');
  }

  if (activeRole === 'tenant') {
    redirect('/rentalproperty/dashboard/tenant');
  }

  const owned = await Property.find({ ownerId: new Types.ObjectId(authUser.id), isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  const memberships = await Membership.find({ userId: new Types.ObjectId(authUser.id), status: 'active' }).lean();
  const joinedIds = memberships.map((m) => m.propertyId);
  const joined = joinedIds.length ? await Property.find({ _id: { $in: joinedIds }, isActive: true }).lean() : [];

  const map = new Map<string, any>();
  [...owned, ...joined].forEach((p) => map.set(String(p._id), p));
  const properties = Array.from(map.values());

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Stack
          sx={{
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { sm: 'center' },
          }}
        >
          <Typography variant="h4">Dashboard</Typography>
        </Stack>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Create Property
          </Typography>
          <CreatePropertyForm />
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6">Your Properties</Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={2}>
            {properties.length === 0 ? (
              <Typography color="text.secondary">No properties yet.</Typography>
            ) : (
              properties.map((property) => (
                <Box
                  key={String(property._id)}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>{property.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {property.type} · {property.address.city}, {property.address.state}
                    </Typography>
                  </Box>
                  <Button href={`/rentalproperty/dashboard/properties/${String(property._id)}`} variant="outlined">
                    Open
                  </Button>
                </Box>
              ))
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
