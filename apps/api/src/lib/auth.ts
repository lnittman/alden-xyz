import { auth } from '@repo/auth/server';
import { unauthorized } from './utils/errors';

/**
 * Define the type for your authenticated route handler
 */
type AuthenticatedHandler = (
  req: Request,
  { params, user }: { params?: any; user: { userId: string } }
) => Promise<Response>;

/**
 * Higher-order function to handle authentication.
 * It fetches the Clerk user ID and passes it to the wrapped handler.
 *
 * @param handler The actual route handler function to wrap.
 * @returns A new route handler that includes the authenticated userId in its context.
 */
export function withAuthenticatedUser(handler: AuthenticatedHandler) {
  return async (req: Request, context?: { params?: any }) => {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      throw unauthorized('User not authenticated');
    }

    return handler(req, {
      params: context?.params,
      user: { userId: clerkId },
    });
  };
}
