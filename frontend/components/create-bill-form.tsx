'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Box, Button, FormControlLabel, MenuItem, Stack, Switch, TextField } from '@mui/material';

type StaySummary = {
  id: string;
  unitName: string;
  billingType: string;
  status: string;
};

export function CreateBillForm({ propertyId, stays }: { propertyId: string; stays: StaySummary[] }) {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    stayId: '',
    periodStart: '',
    periodEnd: '',
    isFinal: false,
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(`/rentalproperty/api/properties/${propertyId}/bills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create bill');
      return;
    }

    setForm({ stayId: '', periodStart: '', periodEnd: '', isFinal: false });
    router.refresh();
  };

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}

        <TextField
          select
          label="Stay"
          value={form.stayId}
          onChange={(e) => setForm((f) => ({ ...f, stayId: e.target.value }))}
          required
          fullWidth
        >
          {stays.map((stay) => (
            <MenuItem key={stay.id} value={stay.id}>
              {stay.unitName} | {stay.billingType} | {stay.status}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Period Start"
          type="datetime-local"
          value={form.periodStart}
          onChange={(e) => setForm((f) => ({ ...f, periodStart: e.target.value }))}
          required
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <TextField
          label="Period End"
          type="datetime-local"
          value={form.periodEnd}
          onChange={(e) => setForm((f) => ({ ...f, periodEnd: e.target.value }))}
          required
          fullWidth
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <FormControlLabel
          control={<Switch checked={form.isFinal} onChange={(e) => setForm((f) => ({ ...f, isFinal: e.target.checked }))} />}
          label="Final bill"
        />

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Creating...' : 'Create Bill'}
        </Button>
      </Stack>
    </Box>
  );
}
