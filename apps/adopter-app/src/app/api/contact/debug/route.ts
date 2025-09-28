import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting contact form debug...');

    // Test AWS SES import
    let sesClient;
    let SendEmailCommand;
    
    try {
      const sesModule = await import('@aws-sdk/client-ses');
      sesClient = sesModule.SESClient;
      SendEmailCommand = sesModule.SendEmailCommand;
      console.log('✅ AWS SES module imported successfully');
    } catch (importError) {
      console.error('❌ Failed to import AWS SES:', importError);
      return NextResponse.json(
        { message: 'Failed to import AWS SES module', error: importError.message },
        { status: 500 }
      );
    }

    // Test environment variables
    const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
    const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
    const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
    const SES_FROM_EMAIL = process.env.SES_FROM_EMAIL || 'support@homeforpup.com';
    const SES_SUPPORT_EMAIL = process.env.SES_SUPPORT_EMAIL || 'support@homeforpup.com';

    console.log('Environment variables:', {
      hasAccessKey: !!AWS_ACCESS_KEY_ID,
      hasSecretKey: !!AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION,
      fromEmail: SES_FROM_EMAIL,
      supportEmail: SES_SUPPORT_EMAIL
    });

    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        { message: 'AWS credentials not configured' },
        { status: 500 }
      );
    }

    // Test SES client creation
    let client;
    try {
      client = new sesClient({
        region: AWS_REGION,
        credentials: {
          accessKeyId: AWS_ACCESS_KEY_ID,
          secretAccessKey: AWS_SECRET_ACCESS_KEY,
        }
      });
      console.log('✅ SES client created successfully');
    } catch (clientError) {
      console.error('❌ Failed to create SES client:', clientError);
      return NextResponse.json(
        { message: 'Failed to create SES client', error: clientError.message },
        { status: 500 }
      );
    }

    // Test email command creation
    let emailCommand;
    try {
      emailCommand = new SendEmailCommand({
        Source: SES_FROM_EMAIL,
        Destination: {
          ToAddresses: [SES_SUPPORT_EMAIL],
        },
        Message: {
          Subject: {
            Data: 'Test Email',
            Charset: 'UTF-8',
          },
          Body: {
            Text: {
              Data: 'This is a test email',
              Charset: 'UTF-8',
            },
          },
        },
      });
      console.log('✅ Email command created successfully');
    } catch (commandError) {
      console.error('❌ Failed to create email command:', commandError);
      return NextResponse.json(
        { message: 'Failed to create email command', error: commandError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: 'All AWS SES components initialized successfully',
        success: true,
        details: {
          region: AWS_REGION,
          fromEmail: SES_FROM_EMAIL,
          supportEmail: SES_SUPPORT_EMAIL,
          hasCredentials: !!(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY)
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { 
        message: 'Debug failed: ' + error.message,
        error: error.stack
      },
      { status: 500 }
    );
  }
}
