import { NextRequest, NextResponse } from 'next/server';
import { sendContactEmail } from '@/lib/email';

import { auth } from '@clerk/nextjs/server';
interface ContactBreederRequest {
  puppyName: string;
  breederName: string;
  senderName: string;
  senderEmail: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactBreederRequest = await request.json();
    const { puppyName, breederName, senderName, senderEmail, message } = body;

    // Validate required fields
    if (!puppyName || !breederName || !senderName || !senderEmail || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send emails using the email service
    const emailSent = await sendContactEmail({
      puppyName,
      breederName,
      senderName,
      senderEmail,
      message,
    });

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
    });

  } catch (error) {
    console.error('Error in contact-breeder API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
