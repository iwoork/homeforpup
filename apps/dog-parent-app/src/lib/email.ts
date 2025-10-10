import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

// Initialize SES client
const sesClient = new SESClient({
  region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

export interface ContactEmailData {
  puppyName: string;
  breederName: string;
  senderName: string;
  senderEmail: string;
  message: string;
}

export const sendContactEmail = async (data: ContactEmailData): Promise<boolean> => {
  try {
    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      console.log('⚠️  AWS credentials not configured. Logging email instead of sending:');
      console.log('📧 === NEW PUPPY INQUIRY ===');
      console.log('🐕 Puppy:', data.puppyName);
      console.log('🏢 Breeder:', data.breederName);
      console.log('👤 Sender:', data.senderName, data.senderEmail);
      console.log('💬 Message:', data.message);
      console.log('📧 === END INQUIRY ===');
      return true; // Return true for testing purposes
    }

    const fromEmail = process.env.SES_FROM_EMAIL || 'support@homeforpup.com';
    const supportEmail = process.env.SES_SUPPORT_EMAIL || 'support@homeforpup.com';

    // Send email to support team
    const supportEmailParams = {
      Source: fromEmail,
      Destination: {
        ToAddresses: [supportEmail],
      },
      Message: {
        Subject: {
          Data: `New Puppy Inquiry: ${data.puppyName} from ${data.senderName}`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #08979C;">🐕 New Puppy Inquiry</h2>
                
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">Puppy Details</h3>
                  <p><strong>Puppy Name:</strong> ${data.puppyName}</p>
                  <p><strong>Breeder:</strong> ${data.breederName}</p>
                </div>

                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">Sender Information</h3>
                  <p><strong>Name:</strong> ${data.senderName}</p>
                  <p><strong>Email:</strong> ${data.senderEmail}</p>
                </div>

                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">Message</h3>
                  <p style="white-space: pre-wrap;">${data.message}</p>
                </div>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                  <p style="color: #666; font-size: 14px;">
                    This message was sent through the HomeForPup contact form.<br>
                    Please respond directly to ${data.senderEmail}.
                  </p>
                </div>
              </div>
            `,
            Charset: 'UTF-8',
          },
          Text: {
            Data: `
New Puppy Inquiry: ${data.puppyName}

Puppy Details:
- Puppy Name: ${data.puppyName}
- Breeder: ${data.breederName}

Sender Information:
- Name: ${data.senderName}
- Email: ${data.senderEmail}

Message:
${data.message}

---
This message was sent through the HomeForPup contact form.
Please respond directly to ${data.senderEmail}.
            `,
            Charset: 'UTF-8',
          },
        },
      },
    };

    // Send support email
    await sesClient.send(new SendEmailCommand(supportEmailParams));
    console.log('✅ Support email sent successfully to', supportEmail);

    // Send confirmation email to sender
    const confirmationEmailParams = {
      Source: fromEmail,
      Destination: {
        ToAddresses: [data.senderEmail],
      },
      Message: {
        Subject: {
          Data: `Thank you for your interest in ${data.puppyName}!`,
          Charset: 'UTF-8',
        },
        Body: {
          Html: {
            Data: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #08979C;">🐕 Thank You for Your Interest!</h2>
                
                <p>Hi ${data.senderName},</p>
                
                <p>Thank you for your interest in <strong>${data.puppyName}</strong> from <strong>${data.breederName}</strong>!</p>
                
                <p>We've received your message and forwarded it to our team. We'll make sure the breeder gets back to you as soon as possible.</p>

                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">Your Message</h3>
                  <p style="white-space: pre-wrap;">${data.message}</p>
                </div>

                <p>In the meantime, feel free to browse other available puppies on our platform or check out our adoption guide for helpful tips.</p>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                  <p style="color: #666; font-size: 14px;">
                    Best regards,<br>
                    The HomeForPup Team
                  </p>
                </div>
              </div>
            `,
            Charset: 'UTF-8',
          },
          Text: {
            Data: `
Hi ${data.senderName},

Thank you for your interest in ${data.puppyName} from ${data.breederName}!

We've received your message and forwarded it to our team. We'll make sure the breeder gets back to you as soon as possible.

Your Message:
${data.message}

In the meantime, feel free to browse other available puppies on our platform or check out our adoption guide for helpful tips.

Best regards,
The HomeForPup Team
            `,
            Charset: 'UTF-8',
          },
        },
      },
    };

    // Send confirmation email (only if sender email is verified or in production mode)
    try {
      await sesClient.send(new SendEmailCommand(confirmationEmailParams));
      console.log('✅ Confirmation email sent successfully to', data.senderEmail);
    } catch (confirmationError: any) {
      // If confirmation email fails due to unverified email, log it but don't fail the entire operation
      if (confirmationError.name === 'MessageRejected' && confirmationError.message.includes('not verified')) {
        console.log('⚠️  Confirmation email skipped - sender email not verified in SES sandbox mode:', data.senderEmail);
        console.log('💡 To enable confirmation emails, verify the sender email or request production access');
      } else {
        // Re-throw other errors
        throw confirmationError;
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Failed to send email via AWS SES:', error);
    return false;
  }
};
