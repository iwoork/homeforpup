import { AuthenticatedEvent } from '../types/lambda';

export function getUserIdFromEvent(event: AuthenticatedEvent): string {
  const userId = event.requestContext.authorizer?.claims.sub;
  if (!userId) {
    throw new Error('User ID not found in request context');
  }
  return userId;
}

export function getUserEmailFromEvent(event: AuthenticatedEvent): string {
  const email = event.requestContext.authorizer?.claims.email;
  if (!email) {
    throw new Error('User email not found in request context');
  }
  return email;
}

export function isAuthenticated(event: AuthenticatedEvent): boolean {
  return !!event.requestContext.authorizer?.claims.sub;
}

export function requireAuth(event: AuthenticatedEvent): void {
  if (!isAuthenticated(event)) {
    throw new Error('Unauthorized: Authentication required');
  }
}

