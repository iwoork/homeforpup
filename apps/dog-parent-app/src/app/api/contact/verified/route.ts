import { NextRequest, NextResponse } from 'next/server';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import { auth } from '@clerk/nextjs/server';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, type } = body;

    console.log('Verified contact form - received data:', { name, email, subject, message, type });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // AWS SES configuration
    const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
    const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL || 'support@homeforpup.com';
    const SES_SUPPORT_EMAIL = process.env.SES_SUPPORT_EMAIL || 'support@homeforpup.com';

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      console.error('AWS SES configuration missing');
      return NextResponse.json(
        { message: 'Email service not configured' },
        { status: 500 }
      );
    }

    // Create AWS SES client
    const sesClient = new SESClient({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      }
    });

    // Simple email content
    const inquiryTypeLabels = {
      general: 'General Inquiry',
      support: 'Technical Support',
      breeder: 'Breeder Support',
      feedback: 'Feedback',
      partnership: 'Partnership'
    };

    const inquiryTypeLabel = inquiryTypeLabels[type as keyof typeof inquiryTypeLabels] || 'General Inquiry';

    // Simple HTML email
    const simpleHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Type:</strong> ${inquiryTypeLabel}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    const simpleText = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Type: ${inquiryTypeLabel}
Subject: ${subject}

Message:
${message}
    `;

    // Only send to support team (verified email)
    console.log('Sending support email to verified address...');
    const supportEmailCommand = new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [SES_SUPPORT_EMAIL],
      },
      Message: {
        Subject: {
          Data: `[Contact Form] ${inquiryTypeLabel}: ${subject}`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: simpleHtml,
            Charset: 'UTF-8',
          },
          Text: {
            Data: simpleText,
            Charset: 'UTF-8',
          },
        },
      },
      ReplyToAddresses: [email],
    });

    await sesClient.send(supportEmailCommand);
    console.log('Support email sent successfully');

    // Skip confirmation email to avoid verification issues
    console.log('Skipping confirmation email due to SES sandbox mode');

    return NextResponse.json(
      { 
        message: 'Contact form submitted successfully. We will respond to your email address.',
        success: true,
        note: 'Confirmation email skipped due to AWS SES sandbox mode'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Verified contact form error:', error);
    
    return NextResponse.json(
      { 
        message: 'Error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        error: error instanceof Error ? error.stack : 'No stack trace available'
      },
      { status: 500 }
    );
  }
}
