import Membership from '@/models/Membership';
import { Types } from 'mongoose';

/**
 * Authorization scoping — the single choke point for tenant isolation.
 *
 * THE RULE: no API route or server action ever queries Property, Unit,
 * Stay, Bill, Complaint, or Invitation using a propertyId taken directly
 * from the request (URL param, body, query string) without first
 * checking that ID against what this file returns. Object IDs are
 * guessable/enumerable — an admin on Property A hitting
 * /api/properties/{B_id}/units must be rejected by the SERVER, not just
 * hidden from Property A's UI. Never rely on the frontend to withhold a
 * link as your only protection.
 *
 * super_admin is the one deliberate bypass — checked first, everywhere,
 * so it's one flag to audit rather than scattered special-cases.
 */

export interface AuthContext {
  userId: Types.ObjectId;
  platformRole: 'user' | 'super_admin';
}

/** Returns the propertyIds this user has ANY active Membership on. */
export async function getAccessiblePropertyIds(
  auth: AuthContext
): Promise<Types.ObjectId[] | 'ALL'> {
  if (auth.platformRole === 'super_admin') return 'ALL';

  const memberships = await Membership.find(
    { userId: auth.userId, status: 'active' },
    { propertyId: 1 }
  ).lean();

  return memberships.map((m) => m.propertyId);
}

/**
 * Throws if the user has no active Membership on propertyId (and isn't
 * super_admin). Call this at the TOP of every route handler that takes
 * a :propertyId param, before touching any other model.
 */
export async function assertPropertyAccess(
  auth: AuthContext,
  propertyId: Types.ObjectId,
  requiredRoles?: Array<'owner' | 'manager' | 'tenant' | 'guest'>
): Promise<void> {
  if (auth.platformRole === 'super_admin') return;

  const membership = await Membership.findOne({
    userId: auth.userId,
    propertyId,
    status: 'active',
    ...(requiredRoles ? { role: { $in: requiredRoles } } : {}),
  }).lean();

  if (!membership) {
    // Same error for "doesn't exist" and "exists but not yours" —
    // don't leak which properties exist to someone who can't see them.
    throw new Error('NOT_FOUND_OR_FORBIDDEN');
  }
}

/**
 * For a request scoped to a specific unit (e.g. a tenant/guest viewing
 * their own Stay/Bill), verify the Membership ties them to THAT unit
 * specifically — not just anywhere in the property. Owners/managers
 * pass unitId as undefined since their Membership.unitId is null
 * (property-wide access).
 */
export async function assertUnitAccess(
  auth: AuthContext,
  propertyId: Types.ObjectId,
  unitId: Types.ObjectId
): Promise<void> {
  if (auth.platformRole === 'super_admin') return;

  const membership = await Membership.findOne({
    userId: auth.userId,
    propertyId,
    status: 'active',
    $or: [
      { role: { $in: ['owner', 'manager'] } }, // property-wide roles
      { unitId }, // tenant/guest scoped to exactly this unit
    ],
  }).lean();

  if (!membership) {
    throw new Error('NOT_FOUND_OR_FORBIDDEN');
  }
}

/**
 * Usage inside an API route (App Router example):
 *
 *   export async function GET(req: Request, { params }: { params: { propertyId: string } }) {
 *     const auth = await getAuthContext(req); // your session -> { userId, platformRole }
 *     await assertPropertyAccess(auth, new Types.ObjectId(params.propertyId), ['owner', 'manager']);
 *     const units = await Unit.find({ propertyId: params.propertyId });
 *     return Response.json(units);
 *   }
 *
 * Every list/aggregate query (dashboards, reports) should ALSO filter
 * by the accessible set rather than trusting a single assert:
 *
 *   const propertyIds = await getAccessiblePropertyIds(auth);
 *   const filter = propertyIds === 'ALL' ? {} : { propertyId: { $in: propertyIds } };
 *   const bills = await Bill.find(filter);
 */
