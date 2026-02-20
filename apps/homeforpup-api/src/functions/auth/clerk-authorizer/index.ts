import { APIGatewayTokenAuthorizerEvent, APIGatewayAuthorizerResult, Context } from 'aws-lambda';
import { verifyToken } from '@clerk/backend';

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
    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY!,
    });

    if (!payload.sub) {
      console.error('Token verification failed: no sub claim');
      throw new Error('Unauthorized');
    }

    // Custom session claims configured in Clerk dashboard
    const userType = (payload as Record<string, unknown>).userType as string || 'dog-parent';

    return generatePolicy(payload.sub, 'Allow', event.methodArn, {
      sub: payload.sub,
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
