import { getAuthSession } from '@/lib/auth';

export async function requireUser() {
  const session = await getAuthSession();
  if (!session?.user?.id || !session.user.email) {
    return null;
  }
  return {
    id: session.user.id,
    email: session.user.email.toLowerCase(),
    name: session.user.name || '',
  };
}
