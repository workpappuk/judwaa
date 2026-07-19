'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Stack } from '@mui/material';

type Props = {
  token: string;
  disabled?: boolean;
};

export function AcceptInviteButton({ token, disabled }: Props) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const acceptInvite = async () => {
    setError('');
    setLoading(true);

    const res = await fetch(`/rentalproperty/api/invitations/${token}/accept`, { method: 'POST' });
    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Failed to accept invitation');
      return;
    }

    const data = await res.json();

    if (data.role === 'tenant' && data.propertyId) {
      router.push(`/rentalproperty/dashboard/properties/${data.propertyId}`);
      return;
    }

    router.push('/rentalproperty/dashboard');
  };

  return (
    <Stack spacing={2}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      <Button variant="contained" onClick={acceptInvite} disabled={loading || disabled} data-testid="accept-invite">
        {loading ? 'Accepting...' : 'Accept Invitation'}
      </Button>
    </Stack>
  );
}
