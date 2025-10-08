import { APIGatewayProxyResult } from 'aws-lambda';
import { errorResponse } from '../types/lambda';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleError(error: unknown): APIGatewayProxyResult {
  console.error('Error:', error);

  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode, error.details);
  }

  if (error instanceof Error) {
    // Common error patterns
    if (error.message.includes('not found')) {
      return errorResponse(error.message, 404);
    }
    if (error.message.includes('Unauthorized') || error.message.includes('Authentication')) {
      return errorResponse(error.message, 401);
    }
    if (error.message.includes('Forbidden') || error.message.includes('Permission')) {
      return errorResponse(error.message, 403);
    }
    if (error.message.includes('Invalid') || error.message.includes('validation')) {
      return errorResponse(error.message, 400);
    }

    return errorResponse(error.message, 500);
  }

  return errorResponse('Internal server error', 500);
}

export function wrapHandler<T extends (...args: any[]) => Promise<APIGatewayProxyResult>>(
  handler: T
): T {
  return (async (...args: any[]) => {
    try {
      return await handler(...args);
    } catch (error) {
      return handleError(error);
    }
  }) as T;
}

