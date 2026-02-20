import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

export interface AuthenticatedEvent extends APIGatewayProxyEvent {
  requestContext: APIGatewayProxyEvent['requestContext'] & {
    authorizer?: {
      sub: string;
      email: string;
      userType: string;
      [key: string]: string;
    };
  };
}

export type LambdaHandler = (
  event: APIGatewayProxyEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

export type AuthenticatedLambdaHandler = (
  event: AuthenticatedEvent,
  context: Context
) => Promise<APIGatewayProxyResult>;

export interface SuccessResponse<T = any> {
  statusCode: number;
  body: string;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    [key: string]: string;
  };
}

export function createResponse<T>(
  statusCode: number,
  data: T,
  headers: Record<string, string> = {}
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      ...headers,
    },
    body: JSON.stringify(data),
  };
}

export function successResponse<T>(
  data: T,
  statusCode: number = 200
): APIGatewayProxyResult {
  return createResponse(statusCode, data);
}

export function errorResponse(
  message: string,
  statusCode: number = 500,
  details?: any
): APIGatewayProxyResult {
  return createResponse(statusCode, {
    error: message,
    details,
  });
}
