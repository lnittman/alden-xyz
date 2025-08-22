import jwt from 'jsonwebtoken';

/**
 * Create a signed JWT for the given user id.
 * This token mirrors the FastAPI token used by the legacy service
 * but is generated locally using the `JWT_SECRET` environment variable.
 */
export function createToken(userId: string, expiresIn = '7d'): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable not set');
  }
  return jwt.sign({ sub: userId }, secret, { algorithm: 'HS256', expiresIn });
}
