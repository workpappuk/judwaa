import { AuthOptions, getServerSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { cookies } from 'next/headers';
import User from '@/models/User';
import { dbConnect } from '@/lib/db';

const isProd = process.env.NODE_ENV === 'production';
const resolvedAuthSecret = process.env.NEXTAUTH_SECRET || 'dev-insecure-nextauth-secret-change-me';

if (!process.env.NEXTAUTH_SECRET && !isProd) {
  console.warn('[auth] NEXTAUTH_SECRET is missing. Using a temporary development fallback secret.');
}

if (!process.env.NEXTAUTH_SECRET && isProd) {
  console.warn('[auth] NEXTAUTH_SECRET is missing in production. Configure a strong secret immediately.');
}

export const authOptions: AuthOptions = {
  secret: resolvedAuthSecret,
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email || !account?.providerAccountId || !account.provider) {
        return false;
      }

      await dbConnect();
      await User.findOneAndUpdate(
        { email: user.email.toLowerCase() },
        {
          name: user.name || user.email,
          email: user.email.toLowerCase(),
          image: user.image,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        await dbConnect();
        const existingUser = (await User.findOne({ email: token.email.toLowerCase() }).lean()) as any;
        if (existingUser?._id) {
          token.userId = String(existingUser._id);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId || '';
      }
      return session;
    },
  },
  pages: {
    signIn: '/rentalproperty/signin',
  },
};

export async function getAuthSession() {
  if (process.env.E2E_AUTH_BYPASS === 'true') {
    const cookieStore = await cookies();
    const cookieUserId = cookieStore.get('e2e_user_id')?.value;
    const cookieUserEmail = cookieStore.get('e2e_user_email')?.value;
    const cookieUserName = cookieStore.get('e2e_user_name')?.value;

    return {
      user: {
        id: cookieUserId || process.env.E2E_TEST_USER_ID || '66f0a1b9b2c3d4e5f6071829',
        email: cookieUserEmail || process.env.E2E_TEST_USER_EMAIL || 'e2e-owner@example.com',
        name: cookieUserName || process.env.E2E_TEST_USER_NAME || 'E2E Owner',
      },
      expires: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    } as any;
  }

  return getServerSession(authOptions);
}
