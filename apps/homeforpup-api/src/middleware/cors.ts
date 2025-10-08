import { APIGatewayProxyResult } from 'aws-lambda';

const ALLOWED_ORIGINS = [
  'https://homeforpup.com',
  'https://www.homeforpup.com',
  'https://breeder.homeforpup.com',
  'http://localhost:3000',
  'http://localhost:3001',
];

export function addCorsHeaders(
  response: APIGatewayProxyResult,
  origin?: string
): APIGatewayProxyResult {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    ...response,
    headers: {
      ...response.headers,
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Api-Key',
    },
  };
}

