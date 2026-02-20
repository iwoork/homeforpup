import { AuthenticatedEvent } from '../types/lambda';

export function getUserIdFromEvent(event: AuthenticatedEvent): string {
  const userId = event.requestContext.authorizer?.sub;
  if (!userId) {
    throw new Error('User ID not found in request context');
  }
  return userId;
}

export function getUserEmailFromEvent(event: AuthenticatedEvent): string {
  const email = event.requestContext.authorizer?.email;
  if (!email) {
    throw new Error('User email not found in request context');
  }
  return email;
}

export function getUserTypeFromEvent(event: AuthenticatedEvent): string {
  return event.requestContext.authorizer?.userType || 'dog-parent';
}

export function isAuthenticated(event: AuthenticatedEvent): boolean {
  return !!event.requestContext.authorizer?.sub;
}

export function requireAuth(event: AuthenticatedEvent): void {
  if (!isAuthenticated(event)) {
    throw new Error('Unauthorized: Authentication required');
  }
}
