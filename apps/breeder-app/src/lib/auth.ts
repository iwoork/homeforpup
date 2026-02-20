import { auth, currentUser } from '@clerk/nextjs/server';

export async function getAuthUserId(): Promise<string> {
  const { userId } = await auth();
  if (!userId) throw new Error('Unauthorized');
  return userId;
}

export async function getAuthUser() {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');
  return {
    id: user.id,
    email: user.primaryEmailAddress?.emailAddress || '',
    name: user.fullName || user.firstName || 'User',
    userType: (user.publicMetadata?.userType as string) || 'breeder',
  };
}
