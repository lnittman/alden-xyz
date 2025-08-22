import { db, eq, schema } from '@repo/database';
import { notFound, unauthorized } from './utils/errors';

export async function getAuthenticatedUser(userId?: string | null) {
  if (!userId) {
    throw unauthorized('Unauthorized');
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.clerkId, userId))
    .limit(1);

  if (!user) {
    throw notFound('User not found');
  }

  return user;
}

export async function withAuthenticatedUser<T>(
  handler: (
    user: Awaited<ReturnType<typeof getAuthenticatedUser>>
  ) => Promise<T>
): Promise<T> {
  const user = await getAuthenticatedUser();
  return await handler(user);
}

export function generateUsername(email: string): string {
  const [localPart] = email.split('@');
  const cleanUsername = localPart
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);

  return cleanUsername || 'user';
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
