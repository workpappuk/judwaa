'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Box, Button, MenuItem, Stack, Switch, FormControlLabel, TextField } from '@mui/material';

const unitTypes = ['flat', 'villa', 'room', 'bed', 'commercial'];

export function CreateUnitForm({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'flat',
    isRentable: true,
    parentUnitId: '',
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(`/rentalproperty/api/properties/${propertyId}/units`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        type: form.type,
        isRentable: form.isRentable,
        parentUnitId: form.parentUnitId || null,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create unit');
      return;
    }

    setForm({ name: '', type: 'flat', isRentable: true, parentUnitId: '' });
    router.refresh();
  };

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          label="Unit Name"
          slotProps={{ htmlInput: { 'data-testid': 'unit-name' } }}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          required
          fullWidth
        />
        <TextField
          select
          label="Unit Type"
          slotProps={{ htmlInput: { 'data-testid': 'unit-type' } }}
          value={form.type}
          onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          fullWidth
        >
          {unitTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Parent Unit ID (optional)"
          slotProps={{ htmlInput: { 'data-testid': 'unit-parent-id' } }}
          value={form.parentUnitId}
          onChange={(e) => setForm((f) => ({ ...f, parentUnitId: e.target.value }))}
          fullWidth
        />
        <FormControlLabel
          control={
            <Switch
              checked={form.isRentable}
              onChange={(e) => setForm((f) => ({ ...f, isRentable: e.target.checked }))}
            />
          }
          label="Is Rentable"
        />
        <Button type="submit" variant="contained" disabled={loading} data-testid="unit-submit">
          {loading ? 'Creating...' : 'Create Unit'}
        </Button>
      </Stack>
    </Box>
  );
}
