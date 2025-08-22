// Auth utility functions have been moved to @repo/api/src/utils/user.ts
// to avoid circular dependencies

// Re-export utility functions that don't depend on ApiError
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
