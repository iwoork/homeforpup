const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
require('dotenv').config();

async function testSES() {
  console.log('🧪 Testing AWS SES Configuration...');
  
  // Check environment variables
  console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Not set');
  console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set');
  console.log('AWS_REGION:', process.env.AWS_REGION || 'us-east-1');
  
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.log('❌ AWS credentials not configured. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY');
    return;
  }

  try {
    const sesClient = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    // Test email parameters
    const testEmailParams = {
      Source: process.env.SES_FROM_EMAIL || 'support@homeforpup.com',
      Destination: {
        ToAddresses: [process.env.SES_SUPPORT_EMAIL || 'support@homeforpup.com'],
      },
      Message: {
        Subject: {
          Data: 'Test Email from HomeForPup',
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: 'This is a test email from HomeForPup to verify SES configuration.',
            Charset: 'UTF-8',
          },
        },
      },
    };

    console.log('📧 Sending test email...');
    const result = await sesClient.send(new SendEmailCommand(testEmailParams));
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.MessageId);
    
  } catch (error) {
    console.error('❌ Error testing SES:', error.message);
    console.error('Full error:', error);
  }
}

testSES();
