export class ServiceError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

export const notFound = (message = 'Resource not found') =>
  new ServiceError(message, 404, 'NOT_FOUND');

export const unauthorized = (message = 'Unauthorized') =>
  new ServiceError(message, 401, 'UNAUTHORIZED');

export const badRequest = (message = 'Bad request') =>
  new ServiceError(message, 400, 'BAD_REQUEST');

export const conflict = (message = 'Resource conflict') =>
  new ServiceError(message, 409, 'CONFLICT');

export const internalError = (message = 'Internal server error') =>
  new ServiceError(message, 500, 'INTERNAL_ERROR');
