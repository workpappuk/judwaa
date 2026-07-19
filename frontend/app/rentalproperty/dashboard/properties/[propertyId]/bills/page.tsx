import { notFound, redirect } from 'next/navigation';
import { Box, Chip, Container, Divider, Paper, Stack, Typography } from '@mui/material';
import { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import { getPropertyAccess } from '@/lib/authz';
import Property from '@/models/Property';
import Unit from '@/models/Unit';
import Stay from '@/models/Stay';
import Bill from '@/models/Bill';
import { CreateBillForm } from '@/components/create-bill-form';

export default async function PropertyBillsPage({ params }: { params: Promise<{ propertyId: string }> }) {
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
  const units = unitsRaw.map((u) => ({ id: String(u._id), name: u.name }));

  const staysQuery: any = { propertyId: new Types.ObjectId(propertyId) };
  if (!access.canManage) staysQuery.occupantId = new Types.ObjectId(authUser.id);

  const staysRaw = (await Stay.find(staysQuery)
    .sort({ createdAt: -1 })
    .limit(50)
    .lean()) as any[];

  const stayOptions = staysRaw.map((s) => ({
    id: String(s._id),
    unitName: units.find((u) => u.id === String(s.unitId))?.name || String(s.unitId),
    billingType: s.billingType,
    status: s.status,
  }));

  const billsQuery: any = { propertyId: new Types.ObjectId(propertyId) };
  if (!access.canManage) billsQuery.occupantId = new Types.ObjectId(authUser.id);

  const billsRaw = (await Bill.find(billsQuery)
    .sort({ createdAt: -1 })
    .limit(30)
    .lean()) as any[];

  const bills = billsRaw.map((b) => ({
    id: String(b._id),
    stayId: String(b.stayId),
    amount: b.amount,
    status: b.status,
    billingType: b.billingType,
    isFinal: b.isFinal,
    periodStart: b.periodStart,
    periodEnd: b.periodEnd,
  }));

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Stack spacing={1.5} sx={{ flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' } }}>
            <Typography variant="h5">{property.name} - Bills</Typography>
            {access.role === 'tenant' ? <Chip label="Tenant Dashboard" color="info" size="small" /> : null}
          </Stack>
          <Typography color="text.secondary">
            {access.canManage ? 'Generate and track billed amounts per stay.' : 'Track your billed amounts for this property.'}
          </Typography>
        </Paper>

        {access.canManage ? (
          <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create Bill
            </Typography>
            <CreateBillForm propertyId={propertyId} stays={stayOptions} />
          </Paper>
        ) : null}

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6">Recent Bills</Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1.5}>
            {bills.length === 0 ? (
              <Typography color="text.secondary">No bills yet.</Typography>
            ) : (
              bills.map((bill) => (
                <Box
                  key={bill.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography sx={{ fontWeight: 600 }}>{bill.amount}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {bill.billingType} | {bill.status} | {bill.isFinal ? 'final' : 'recurring'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(bill.periodStart).toLocaleString()} - {new Date(bill.periodEnd).toLocaleString()}
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
