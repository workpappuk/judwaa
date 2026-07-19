'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Button, Stack } from '@mui/material';

type AppRole = 'owner' | 'manager' | 'tenant';

function getRouteForRole(role: AppRole) {
  return role === 'tenant' ? '/rentalproperty/dashboard/tenant' : '/rentalproperty/dashboard';
}

export function RoleSelectionButtons({ roles }: { roles: AppRole[] }) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loadingRole, setLoadingRole] = useState<AppRole | null>(null);

  const chooseRole = async (role: AppRole) => {
    setError('');
    setLoadingRole(role);

    const res = await fetch('/rentalproperty/api/session/active-role', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });

    setLoadingRole(null);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || 'Unable to set active role');
      return;
    }

    router.push(getRouteForRole(role));
  };

  return (
    <Stack spacing={1.5}>
      {error ? <Alert severity="error">{error}</Alert> : null}
      {roles.map((role) => (
        <Button
          key={role}
          variant="contained"
          onClick={() => chooseRole(role)}
          disabled={loadingRole !== null}
        >
          {loadingRole === role ? 'Switching...' : `Continue as ${role}`}
        </Button>
      ))}
    </Stack>
  );
}
