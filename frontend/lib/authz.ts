import { Types } from 'mongoose';
import Membership from '@/models/Membership';
import Property from '@/models/Property';

type MembershipRole = 'owner' | 'manager' | 'tenant' | 'guest';

export type PropertyAccess = {
  exists: boolean;
  canAccess: boolean;
  canManage: boolean;
  role: MembershipRole | null;
  unitId: string | null;
};

export async function getPropertyAccess(userId: string, propertyId: string): Promise<PropertyAccess> {
  const property = (await Property.findById(propertyId).lean()) as any;
  if (!property) {
    return { exists: false, canAccess: false, canManage: false, role: null, unitId: null };
  }

  if (String(property.ownerId) === userId) {
    return { exists: true, canAccess: true, canManage: true, role: 'owner', unitId: null };
  }

  const membership = (await Membership.findOne({
    userId: new Types.ObjectId(userId),
    propertyId: new Types.ObjectId(propertyId),
    status: 'active',
  }).lean()) as any;

  if (!membership) {
    return { exists: true, canAccess: false, canManage: false, role: null, unitId: null };
  }

  const role = membership.role as MembershipRole;
  const canManage = role === 'owner' || role === 'manager';

  return {
    exists: true,
    canAccess: true,
    canManage,
    role,
    unitId: membership.unitId ? String(membership.unitId) : null,
  };
}

export async function canAccessProperty(userId: string, propertyId: string): Promise<boolean> {
  const access = await getPropertyAccess(userId, propertyId);
  return access.canAccess;
}

export async function canManageProperty(userId: string, propertyId: string): Promise<boolean> {
  const access = await getPropertyAccess(userId, propertyId);
  return access.canManage;
}
