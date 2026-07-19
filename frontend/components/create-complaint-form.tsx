'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Alert, Box, Button, MenuItem, Stack, TextField } from '@mui/material';

type UnitSummary = {
  id: string;
  name: string;
};

const categories = ['plumbing', 'electrical', 'appliance', 'cleanliness', 'security', 'other'];
const priorities = ['low', 'medium', 'high'];

export function CreateComplaintForm({ propertyId, units }: { propertyId: string; units: UnitSummary[] }) {
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    unitId: '',
    category: 'other',
    title: '',
    description: '',
    priority: 'medium',
  });

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch(`/rentalproperty/api/properties/${propertyId}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create complaint');
      return;
    }

    setForm({ unitId: '', category: 'other', title: '', description: '', priority: 'medium' });
    router.refresh();
  };

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}

        <TextField
          select
          label="Unit"
          value={form.unitId}
          onChange={(e) => setForm((f) => ({ ...f, unitId: e.target.value }))}
          required
          fullWidth
        >
          {units.map((unit) => (
            <MenuItem key={unit.id} value={unit.id}>
              {unit.name}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          label="Category"
          value={form.category}
          onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
          fullWidth
        >
          {categories.map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Title"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
          fullWidth
        />

        <TextField
          label="Description"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          required
          fullWidth
          multiline
          minRows={3}
        />

        <TextField
          select
          label="Priority"
          value={form.priority}
          onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
          fullWidth
        >
          {priorities.map((priority) => (
            <MenuItem key={priority} value={priority}>
              {priority}
            </MenuItem>
          ))}
        </TextField>

        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Creating...' : 'Create Complaint'}
        </Button>
      </Stack>
    </Box>
  );
}
