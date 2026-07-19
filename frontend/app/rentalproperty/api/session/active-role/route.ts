import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '@/lib/require-user';
import { dbConnect } from '@/lib/db';
import { AppRole, getActiveMembershipRoles } from '@/lib/role-selection';

export async function POST(req: NextRequest) {
  const authUser = await requireUser();
  if (!authUser) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const body = await req.json();
  const requestedRole = body?.role as AppRole | undefined;
  if (!requestedRole) return NextResponse.json({ error: 'ROLE_REQUIRED' }, { status: 400 });

  await dbConnect();
  const roles = await getActiveMembershipRoles(authUser.id);
  if (!roles.includes(requestedRole)) {
    return NextResponse.json({ error: 'ROLE_NOT_ALLOWED' }, { status: 403 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set('active_role', requestedRole, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
