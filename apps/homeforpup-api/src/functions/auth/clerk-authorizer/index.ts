import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, Context } from 'aws-lambda';
import { createClerkClient } from '@clerk/backend';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export const handler = async (
  event: APIGatewayTokenAuthorizerEvent,
  _context: Context
): Promise<APIGatewayAuthorizerResult> => {
  const token = event.authorizationToken?.replace('Bearer ', '');

  if (!token) {
    console.error('No token provided');
    throw new Error('Unauthorized');
  }

  try {
    const { sub, email, metadata } = await clerkClient.verifyToken(token);

    if (!sub) {
      console.error('Token verification failed: no sub claim');
      throw new Error('Unauthorized');
    }

    const userType = (metadata as any)?.userType || 'dog-parent';

    return generatePolicy(sub, 'Allow', event.methodArn, {
      sub,
      email: email || '',
      userType,
    });
  } catch (error) {
    console.error('Token verification failed:', error);
    throw new Error('Unauthorized');
  }
};

function generatePolicy(
  principalId: string,
  effect: 'Allow' | 'Deny',
  resource: string,
  context: Record<string, string>
): APIGatewayAuthorizerResult {
  // Extract the base resource ARN (everything before the method/path)
  // e.g., arn:aws:execute-api:region:account:api-id/stage/*
  const arnParts = resource.split(':');
  const apiGatewayArnPart = arnParts[5].split('/');
  const wildcardArn = `${arnParts.slice(0, 5).join(':')}:${apiGatewayArnPart[0]}/${apiGatewayArnPart[1]}/*`;

  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: wildcardArn,
        },
      ],
    },
    context,
  };
}
