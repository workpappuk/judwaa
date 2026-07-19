import { Types } from 'mongoose';
import Membership from '@/models/Membership';

export type AppRole = 'owner' | 'manager' | 'tenant';

export async function getActiveMembershipRoles(userId: string): Promise<AppRole[]> {
  const memberships = (await Membership.find({
    userId: new Types.ObjectId(userId),
    status: 'active',
  })
    .select('role')
    .lean()) as any[];

  const roleSet = new Set<AppRole>();
  for (const membership of memberships) {
    if (membership.role === 'owner' || membership.role === 'manager' || membership.role === 'tenant') {
      roleSet.add(membership.role);
    }
  }

  return Array.from(roleSet);
}

export function getDefaultRouteForRole(role: AppRole): string {
  if (role === 'tenant') return '/rentalproperty/dashboard/tenant';
  return '/rentalproperty/dashboard';
}
