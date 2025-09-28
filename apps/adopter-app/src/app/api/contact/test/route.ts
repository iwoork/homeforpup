import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, type } = body;

    console.log('Contact form test - received data:', {
      name,
      email,
      subject,
      message,
      type
    });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check environment variables
    const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
    const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL || 'support@homeforpup.com';
    const SES_SUPPORT_EMAIL = process.env.SES_SUPPORT_EMAIL || 'support@homeforpup.com';

    console.log('Environment variables check:', {
      hasAccessKey: !!AWS_ACCESS_KEY_ID,
      hasSecretKey: !!AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION,
      fromEmail: SES_FROM_EMAIL,
      supportEmail: SES_SUPPORT_EMAIL
    });

    // Simulate email sending (without actually sending)
    console.log('Would send support email to:', SES_SUPPORT_EMAIL);
    console.log('Would send confirmation email to:', email);

    return NextResponse.json(
      { 
        message: 'Contact form test successful - no emails sent',
        success: true,
        data: {
          name,
          email,
          subject,
          message,
          type,
          timestamp: new Date().toISOString()
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form test error:', error);
    return NextResponse.json(
      { 
        message: 'Test error: ' + error.message,
        error: error.stack
      },
      { status: 500 }
    );
  }
}
