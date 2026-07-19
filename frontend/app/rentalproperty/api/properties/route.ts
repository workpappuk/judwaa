import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import Property from '@/models/Property';
import Membership from '@/models/Membership';

export async function GET() {
  const authUser = await requireUser();
  if (!authUser) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  await dbConnect();

  const owned = await Property.find({ ownerId: new Types.ObjectId(authUser.id), isActive: true })
    .sort({ createdAt: -1 })
    .lean();

  const memberships = await Membership.find({ userId: authUser.id, status: 'active' }).lean();
  const propertyIds = memberships.map((m) => m.propertyId);
  const joined = propertyIds.length
    ? await Property.find({ _id: { $in: propertyIds }, isActive: true }).lean()
    : [];

  const unique = new Map<string, any>();
  [...owned, ...joined].forEach((p) => unique.set(String(p._id), p));

  return NextResponse.json({
    properties: Array.from(unique.values()).map((p) => ({
      id: String(p._id),
      name: p.name,
      type: p.type,
      city: p.address.city,
      state: p.address.state,
      country: p.address.country,
    })),
  });
}

export async function POST(req: NextRequest) {
  const authUser = await requireUser();
  if (!authUser) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  const body = await req.json();
  if (!body?.name || !body?.type || !body?.address?.line1 || !body?.address?.city || !body?.address?.state || !body?.address?.pincode) {
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }

  await dbConnect();

  const property = await Property.create({
    ownerId: new Types.ObjectId(authUser.id),
    name: body.name,
    type: body.type,
    address: {
      line1: body.address.line1,
      line2: body.address.line2 || '',
      city: body.address.city,
      state: body.address.state,
      pincode: body.address.pincode,
      country: body.address.country || 'IN',
    },
  });

  await Membership.create({
    userId: new Types.ObjectId(authUser.id),
    propertyId: property._id,
    role: 'owner',
    status: 'active',
  });

  return NextResponse.json({ id: String(property._id) }, { status: 201 });
}
