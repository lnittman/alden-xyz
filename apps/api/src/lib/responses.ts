import { ApiError } from './errors';

export class ApiResponse {
  static success<T>(data: T, status = 200) {
    return new Response(JSON.stringify({ success: true, data }), {
      status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  static error(error: ApiError | Error | string, status?: number) {
    if (typeof error === 'string') {
      error = new ApiError('UNKNOWN_ERROR', error);
    }

    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError(
            'INTERNAL_ERROR',
            error.message || 'Internal server error'
          );

    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: apiError.code,
          message: apiError.message,
          details: apiError.details,
        },
      }),
      {
        status: status || apiError.status,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
