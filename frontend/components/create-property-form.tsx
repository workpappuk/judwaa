'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Box, Button, MenuItem, Stack, TextField } from '@mui/material';

const propertyTypes = ['apartment', 'flat', 'pg', 'villa', 'commercial'];

export function CreatePropertyForm() {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'apartment',
    line1: '',
    city: '',
    state: '',
    pincode: '',
    country: 'IN',
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/rentalproperty/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        type: form.type,
        address: {
          line1: form.line1,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: form.country,
        },
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create property');
      return;
    }

    setForm({ name: '', type: 'apartment', line1: '', city: '', state: '', pincode: '', country: 'IN' });
    router.refresh();
  };

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label="Property Name"
          slotProps={{ htmlInput: { 'data-testid': 'property-name' } }}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          fullWidth
        />
        <TextField
          select
          label="Type"
          slotProps={{ htmlInput: { 'data-testid': 'property-type' } }}
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          fullWidth
        >
          {propertyTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Address Line 1"
          slotProps={{ htmlInput: { 'data-testid': 'property-line1' } }}
          value={form.line1}
          onChange={(e) => setForm((f) => ({ ...f, line1: e.target.value }))}
          required
          fullWidth
        />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="City"
            slotProps={{ htmlInput: { 'data-testid': 'property-city' } }}
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="State"
            slotProps={{ htmlInput: { 'data-testid': 'property-state' } }}
            value={form.state}
            onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
            required
            fullWidth
          />
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Pincode"
            slotProps={{ htmlInput: { 'data-testid': 'property-pincode' } }}
            value={form.pincode}
            onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
            required
            fullWidth
          />
          <TextField
            label="Country"
            value={form.country}
            onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
            required
            fullWidth
          />
        </Stack>
        <Button type="submit" variant="contained" disabled={loading} data-testid="property-submit">
          {loading ? 'Creating...' : 'Create Property'}
        </Button>
      </Stack>
    </Box>
  );
}
