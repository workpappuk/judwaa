'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Box, Button, MenuItem, Stack, TextField } from '@mui/material';

type UnitSummary = {
  id: string;
  name: string;
  isRentable: boolean;
};

const billingTypes = ['monthly', 'daily', 'hourly'];
const prorationPolicies = ['prorate', 'no_refund'];

export function CreateStayForm({ propertyId, units }: { propertyId: string; units: UnitSummary[] }) {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    unitId: '',
    billingType: 'monthly',
    rate: '',
    securityDeposit: '',
    scheduledStart: '',
    scheduledEnd: '',
    prorationPolicy: 'prorate',
    occupantName: '',
    occupantEmail: '',
    occupantPhone: '',
  });

  const rentableUnits = units.filter((u) => u.isRentable);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(`/rentalproperty/api/properties/${propertyId}/stays`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        unitId: form.unitId,
        billingType: form.billingType,
        rate: Number(form.rate),
        securityDeposit: Number(form.securityDeposit || 0),
        scheduledStart: form.scheduledStart,
        scheduledEnd: form.scheduledEnd || null,
        prorationPolicy: form.prorationPolicy,
        occupantDetails: form.occupantName
          ? {
              name: form.occupantName,
              email: form.occupantEmail || undefined,
              phone: form.occupantPhone || undefined,
            }
          : undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create stay');
      return;
    }

    setForm({
      unitId: '',
      billingType: 'monthly',
      rate: '',
      securityDeposit: '',
      scheduledStart: '',
      scheduledEnd: '',
      prorationPolicy: 'prorate',
      occupantName: '',
      occupantEmail: '',
      occupantPhone: '',
    });
    router.refresh();
  };

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}

        <TextField
          select
          label="Rentable Unit"
          value={form.unitId}
          onChange={(e) => setForm((f) => ({ ...f, unitId: e.target.value }))}
          required
          fullWidth
        >
          {rentableUnits.map((unit) => (
            <MenuItem key={unit.id} value={unit.id}>
              {unit.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Billing Type"
          value={form.billingType}
          onChange={(e) => setForm((f) => ({ ...f, billingType: e.target.value }))}
          fullWidth
        >
          {billingTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Rate"
          type="number"
          value={form.rate}
          onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
          required
          fullWidth
        />

        <TextField
          label="Security Deposit"
          type="number"
          value={form.securityDeposit}
          onChange={(e) => setForm((f) => ({ ...f, securityDeposit: e.target.value }))}
          fullWidth
        />

        <TextField
          label="Scheduled Start"
          type="datetime-local"
          value={form.scheduledStart}
          onChange={(e) => setForm((f) => ({ ...f, scheduledStart: e.target.value }))}
          required
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Scheduled End"
          type="datetime-local"
          value={form.scheduledEnd}
          onChange={(e) => setForm((f) => ({ ...f, scheduledEnd: e.target.value }))}
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          select
          label="Proration Policy"
          value={form.prorationPolicy}
          onChange={(e) => setForm((f) => ({ ...f, prorationPolicy: e.target.value }))}
          fullWidth
        >
          {prorationPolicies.map((policy) => (
            <MenuItem key={policy} value={policy}>
              {policy}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Occupant Name (optional)"
          value={form.occupantName}
          onChange={(e) => setForm((f) => ({ ...f, occupantName: e.target.value }))}
          fullWidth
        />

        <TextField
          label="Occupant Email (optional)"
          type="email"
          value={form.occupantEmail}
          onChange={(e) => setForm((f) => ({ ...f, occupantEmail: e.target.value }))}
          fullWidth
        />

        <TextField
          label="Occupant Phone (optional)"
          value={form.occupantPhone}
          onChange={(e) => setForm((f) => ({ ...f, occupantPhone: e.target.value }))}
          fullWidth
        />

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Creating...' : 'Create Stay'}
        </Button>
      </Stack>
    </Box>
  );
}
