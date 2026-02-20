import { NextRequest, NextResponse } from 'next/server';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

import { auth } from '@clerk/nextjs/server';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message, type } = body;

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

    // Prepare email content
    const inquiryTypeLabels = {
      general: 'General Inquiry',
      support: 'Technical Support',
      breeder: 'Breeder Support',
      feedback: 'Feedback',
      partnership: 'Partnership'
    };

    const inquiryTypeLabel = inquiryTypeLabels[type as keyof typeof inquiryTypeLabels] || 'General Inquiry';
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    // Email to support team
    const supportEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #08979C 0%, #FA8072 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">HomeForPup Contact Form</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Contact Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}" style="color: #08979C;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Inquiry Type:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                  <span style="background: #e6f7ff; color: #08979C; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                    ${inquiryTypeLabel}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Subject:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Submitted:</td>
                <td style="padding: 8px 0;">${timestamp} EST</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #333; margin-top: 0;">Message</h2>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 4px; border-left: 4px solid #08979C; white-space: pre-wrap; line-height: 1.6;">
${message}
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #e6f7ff; border-radius: 8px; border-left: 4px solid #08979C;">
            <p style="margin: 0; color: #333; font-weight: bold;">Quick Actions:</p>
            <p style="margin: 5px 0 0 0; color: #666;">
              • Reply directly to: <a href="mailto:${email}" style="color: #08979C;">${email}</a><br>
              • View in admin panel: <a href="https://homeforpup.com/admin/contacts" style="color: #08979C;">Admin Panel</a>
            </p>
          </div>
        </div>
      </div>
    `;

    const supportEmailText = `
New Contact Form Submission - HomeForPup

Contact Details:
- Name: ${name}
- Email: ${email}
- Inquiry Type: ${inquiryTypeLabel}
- Subject: ${subject}
- Submitted: ${timestamp} EST

Message:
${message}

Quick Actions:
- Reply directly to: ${email}
- View in admin panel: https://homeforpup.com/admin/contacts
    `;

    // Send email to support team
    console.log('Preparing to send support email...');
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
            Data: supportEmailHtml,
            Charset: 'UTF-8',
          },
          Text: {
            Data: supportEmailText,
            Charset: 'UTF-8',
          },
        },
      },
      ReplyToAddresses: [email],
    });

    console.log('Sending support email...');
    await sesClient.send(supportEmailCommand);
    console.log('Support email sent successfully');

    // Send confirmation email to user
    const confirmationEmailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #08979C 0%, #FA8072 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Thank You for Contacting Us!</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 16px;">We've received your message and will get back to you soon.</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid #e9ecef;">
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">Your Message Details</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Subject:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold;">Inquiry Type:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">
                  <span style="background: #e6f7ff; color: #08979C; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold;">
                    ${inquiryTypeLabel}
                  </span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">Submitted:</td>
                <td style="padding: 8px 0;">${timestamp} EST</td>
              </tr>
            </table>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">What Happens Next?</h2>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li><strong>General Inquiries:</strong> We'll respond within 24 hours</li>
              <li><strong>Technical Support:</strong> We'll respond within 12 hours</li>
              <li><strong>Urgent Matters:</strong> We'll respond within 4 hours</li>
            </ul>
          </div>
          
          <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; border-left: 4px solid #08979C;">
            <h3 style="color: #333; margin-top: 0;">Need Immediate Help?</h3>
            <p style="margin: 0 0 10px 0; color: #666;">
              If you have an urgent question, you can also reach us at:
            </p>
            <p style="margin: 0; color: #08979C; font-weight: bold;">
              📧 support@homeforpup.com
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              Thanks for choosing HomeForPup! 🐕
            </p>
          </div>
        </div>
      </div>
    `;

    const confirmationEmailText = `
Thank You for Contacting HomeForPup!

We've received your message and will get back to you soon.

Your Message Details:
- Subject: ${subject}
- Inquiry Type: ${inquiryTypeLabel}
- Submitted: ${timestamp} EST

What Happens Next?
- General Inquiries: We'll respond within 24 hours
- Technical Support: We'll respond within 12 hours
- Urgent Matters: We'll respond within 4 hours

Need Immediate Help?
If you have an urgent question, you can also reach us at:
📧 support@homeforpup.com

Thanks for choosing HomeForPup! 🐕
    `;

    // Send confirmation email to user
    console.log('Preparing to send confirmation email...');
    const confirmationEmailCommand = new SendEmailCommand({
      Source: SES_FROM_EMAIL,
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: `Thank you for contacting HomeForPup - ${subject}`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: confirmationEmailHtml,
            Charset: 'UTF-8',
          },
          Text: {
            Data: confirmationEmailText,
            Charset: 'UTF-8',
          },
        },
      },
    });

    console.log('Sending confirmation email...');
    await sesClient.send(confirmationEmailCommand);
    console.log('Confirmation email sent successfully');

    // Log the contact submission for internal tracking
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      type,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { 
        message: 'Contact form submitted successfully',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace available',
      name: error instanceof Error ? error.name : 'Unknown'
    });
    
    // Return more specific error messages for debugging
    if (error instanceof Error && error.message?.includes('InvalidParameterValue')) {
      return NextResponse.json(
        { message: 'Invalid email configuration. Please check AWS SES setup.' },
        { status: 500 }
      );
    }
    
    if (error instanceof Error && error.message?.includes('MessageRejected')) {
      return NextResponse.json(
        { message: 'Email was rejected. Please check email addresses and try again.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
