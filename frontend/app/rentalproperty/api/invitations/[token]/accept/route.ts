import { NextResponse } from 'next/server';
import mongoose, { Types } from 'mongoose';
import { dbConnect } from '@/lib/db';
import { requireUser } from '@/lib/require-user';
import Invitation from '@/models/Invitation';
import Membership from '@/models/Membership';
import Unit from '@/models/Unit';

export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const authUser = await requireUser();
  if (!authUser) return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });

  await dbConnect();

  const session = await mongoose.startSession();

  try {
    let responsePayload: { role: string; propertyId: string } = { role: '', propertyId: '' };

    await session.withTransaction(async () => {
      const invitation = await Invitation.findOne({ token }).session(session);
      if (!invitation) {
        throw new Error('INVITE_NOT_FOUND');
      }

      if (invitation.status !== 'pending') {
        throw new Error('INVITE_NOT_PENDING');
      }

      if (invitation.expiresAt.getTime() < Date.now()) {
        invitation.status = 'expired';
        await invitation.save({ session });
        throw new Error('INVITE_EXPIRED');
      }

      if (invitation.invitedEmail && invitation.invitedEmail !== authUser.email.toLowerCase()) {
        throw new Error('INVITE_EMAIL_MISMATCH');
      }

      if (invitation.role === 'tenant') {
        if (!invitation.unitId) {
          throw new Error('UNIT_REQUIRED_FOR_TENANT');
        }

        const unit = await Unit.findOne({
          _id: invitation.unitId,
          propertyId: invitation.propertyId,
        }).session(session);

        if (!unit) throw new Error('UNIT_NOT_FOUND');
        if (!unit.isRentable) throw new Error('UNIT_NOT_RENTABLE');
      }

      const existingMembership = await Membership.findOne({
        userId: new Types.ObjectId(authUser.id),
        propertyId: invitation.propertyId,
        unitId: invitation.unitId || null,
        role: invitation.role,
        status: 'active',
      }).session(session);

      if (!existingMembership) {
        await Membership.create(
          [
            {
              userId: new Types.ObjectId(authUser.id),
              propertyId: invitation.propertyId,
              unitId: invitation.unitId || null,
              role: invitation.role,
              status: 'active',
            },
          ],
          { session }
        );
      }

      invitation.status = 'accepted';
      invitation.acceptedBy = new Types.ObjectId(authUser.id);
      invitation.acceptedAt = new Date();
      await invitation.save({ session });

      responsePayload = {
        role: invitation.role,
        propertyId: String(invitation.propertyId),
      };
    });

    return NextResponse.json({ ok: true, role: responsePayload.role, propertyId: responsePayload.propertyId });
  } catch (error: any) {
    const code = error?.message || 'INVITE_ACCEPT_FAILED';
    const statusMap: Record<string, number> = {
      INVITE_NOT_FOUND: 404,
      INVITE_NOT_PENDING: 409,
      INVITE_EXPIRED: 410,
      INVITE_EMAIL_MISMATCH: 403,
      UNIT_REQUIRED_FOR_TENANT: 400,
      UNIT_NOT_FOUND: 404,
      UNIT_NOT_RENTABLE: 400,
      INVITE_ACCEPT_FAILED: 500,
    };

    return NextResponse.json({ error: code }, { status: statusMap[code] || 500 });
  } finally {
    session.endSession();
  }
}
