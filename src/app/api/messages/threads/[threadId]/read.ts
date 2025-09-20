// pages/api/messages/threads/[threadId]/read.ts (PATCH - Mark as read)
import { NextApiRequest, NextApiResponse } from 'next';
import { MessageService } from '@/services/messageService';
import { verifyJWT } from '@/utils/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { threadId } = req.query;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { userId } = await verifyJWT(token);
    const messageService = new MessageService();
    
    await messageService.markThreadAsRead(threadId as string, userId);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error marking thread as read:', error);
    res.status(500).json({ error: 'Failed to mark thread as read' });
  }
}