'use client';

import { useState } from 'react';
import { Alert, Box, Button, Link, MenuItem, Stack, TextField, Typography } from '@mui/material';

type UnitSummary = {
  id: string;
  name: string;
  isRentable: boolean;
};

export function CreateInviteForm({ propertyId, units }: { propertyId: string; units: UnitSummary[] }) {
  const [error, setError] = useState<string>('');
  const [inviteUrl, setInviteUrl] = useState<string>('');
  const [copyMessage, setCopyMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    role: 'tenant',
    unitId: '',
    invitedEmail: '',
  });

  const rentableUnits = units.filter((u) => u.isRentable);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInviteUrl('');
    setLoading(true);

    const res = await fetch(`/rentalproperty/api/properties/${propertyId}/invitations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        role: form.role,
        unitId: form.role === 'tenant' ? form.unitId : null,
        invitedEmail: form.invitedEmail || undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to create invitation');
      return;
    }

    const data = await res.json();
    setInviteUrl(data.inviteUrl);
    setCopyMessage('');
  };

  const onCopyLink = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopyMessage('Invitation link copied.');
    } catch {
      setCopyMessage('Unable to copy automatically. Please copy the link manually.');
    }
  };

  const onShareLink = async () => {
    if (!inviteUrl) return;
    const shareData = {
      title: 'Property Invitation',
      text: 'Join this property on Rental SaaS',
      url: inviteUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`${shareData.text}: ${inviteUrl}`)}`,
          '_blank',
          'noopener,noreferrer'
        );
      }
    } catch {
      // Ignore share cancel/errors to avoid breaking form flow.
    }
  };

  const onWhatsAppShare = () => {
    if (!inviteUrl) return;
    const message = `Join this property on Rental SaaS: ${inviteUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Stack spacing={2}>
        {error ? <Alert severity="error">{error}</Alert> : null}
        <TextField
          select
          label="Role"
          slotProps={{ htmlInput: { 'data-testid': 'invite-role' } }}
          value={form.role}
          onChange={(e) => setForm((f) => ({ ...f, role: e.target.value, unitId: '' }))}
          fullWidth
        >
          <MenuItem value="tenant">tenant</MenuItem>
          <MenuItem value="manager">manager</MenuItem>
        </TextField>

        {form.role === 'tenant' ? (
          <TextField
            select
            label="Rentable Unit"
            slotProps={{ htmlInput: { 'data-testid': 'invite-unit' } }}
            value={form.unitId}
            onChange={(e) => setForm((f) => ({ ...f, unitId: e.target.value }))}
            required
            fullWidth
          >
            {rentableUnits.map((u) => (
              <MenuItem key={u.id} value={u.id}>
                {u.name}
              </MenuItem>
            ))}
          </TextField>
        ) : null}

        <TextField
          label="Invited Email (optional)"
          type="email"
          slotProps={{ htmlInput: { 'data-testid': 'invite-email' } }}
          value={form.invitedEmail}
          onChange={(e) => setForm((f) => ({ ...f, invitedEmail: e.target.value }))}
          fullWidth
        />

        <Button type="submit" variant="contained" disabled={loading} data-testid="invite-submit">
          {loading ? 'Creating...' : 'Generate Invitation'}
        </Button>

        {inviteUrl ? (
          <Alert severity="success">
            <Typography variant="body2" sx={{ mb: 1 }}>
              Invitation created.
            </Typography>
            <Link href={inviteUrl} target="_blank" rel="noreferrer">
              {inviteUrl}
            </Link>
            <Typography variant="body2" data-testid="invite-url" sx={{ mt: 1 }}>
              {inviteUrl}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
              <Button variant="contained" size="small" onClick={onCopyLink}>
                Copy Link
              </Button>
              <Button variant="outlined" size="small" onClick={onShareLink}>
                Share
              </Button>
              <Button variant="outlined" size="small" color="success" onClick={onWhatsAppShare}>
                WhatsApp
              </Button>
            </Stack>
            {copyMessage ? (
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                {copyMessage}
              </Typography>
            ) : null}
          </Alert>
        ) : null}
      </Stack>
    </Box>
  );
}
