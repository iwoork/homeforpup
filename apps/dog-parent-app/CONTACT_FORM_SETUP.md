# Contact Form Setup with AWS SES

This contact form is powered by AWS SES (Simple Email Service) with Nodemailer for reliable email delivery.

## Features

- **Contact Form**: Multi-field contact form with validation
- **AWS SES Integration**: Sends emails through AWS Simple Email Service
- **Dual Email System**: Sends notification to support team and confirmation to user
- **Inquiry Types**: Categorizes inquiries (General, Support, Breeder, Feedback, Partnership)
- **Professional Email Templates**: Beautiful HTML and plain text email templates
- **Response Tracking**: Tracks response times and inquiry types

## Setup Instructions

### 1. AWS SES Configuration

1. Set up AWS SES in your AWS account
2. Verify your sending domain (homeforpup.com)
3. Verify your sending email address (support@homeforpup.com)
4. Request production access if needed (for sending to unverified emails)

### 2. Environment Variables

Add these variables to your `.env.local` file:

```bash
# AWS Configuration (already configured)
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1

# Contact Form Email Configuration
SES_FROM_EMAIL=support@homeforpup.com
SES_SUPPORT_EMAIL=support@homeforpup.com
```

### 3. AWS SES Setup Steps

1. **Verify Domain**: In AWS SES console, verify homeforpup.com
2. **Verify Email**: Verify support@homeforpup.com as a sending address
3. **Request Production Access**: If you need to send to unverified emails
4. **Set Up DKIM**: Configure DKIM for better email deliverability
5. **Configure SPF Record**: Add SPF record to your domain DNS

### 4. Email Templates

The system sends two emails:

#### Support Team Notification
- **To**: support@homeforpup.com
- **Subject**: `[Contact Form] {Inquiry Type}: {Subject}`
- **Content**: Professional HTML template with contact details and message
- **Reply-To**: User's email address for easy responses

#### User Confirmation
- **To**: User's email address
- **Subject**: `Thank you for contacting HomeForPup - {Subject}`
- **Content**: Confirmation with response time expectations

## Form Fields

- **Name**: Required, minimum 2 characters
- **Email**: Required, must be valid email format
- **Inquiry Type**: Required, radio button selection
- **Subject**: Required, minimum 5 characters
- **Message**: Required, minimum 10 characters

## Inquiry Types

1. **General Inquiry**: General questions about the platform
2. **Technical Support**: Technical issues or bugs
3. **Breeder Support**: Support for breeders using the platform
4. **Feedback**: Suggestions and feedback
5. **Partnership**: Partnership and collaboration inquiries

## Response Times

- General inquiries: 24 hours
- Technical support: 12 hours
- Urgent matters: 4 hours

## Testing

1. Fill out the contact form with test data
2. Check your email inbox for the confirmation email
3. Check support@homeforpup.com for the notification email
4. Verify email templates render correctly

## Troubleshooting

### Common Issues

1. **"Email service not configured"**: Check AWS credentials in environment variables
2. **"Failed to send email"**: Check AWS SES configuration and permissions
3. **Emails not delivered**: Check spam folder, verify domain/email in SES
4. **Rate limiting**: AWS SES has sending limits in sandbox mode

### Debug Mode

Check the server logs for detailed error messages:
```bash
# In development
npm run dev

# Check console for contact form errors
```

### AWS SES Troubleshooting

1. **Check SES Console**: Verify sending statistics and bounces
2. **Check CloudWatch Logs**: Look for SES-related errors
3. **Verify Domain**: Ensure domain is verified in SES
4. **Check Reputation**: Monitor bounce and complaint rates

## Security

- Form validation on both client and server side
- Email format validation
- Rate limiting (consider implementing)
- CSRF protection via Next.js built-in features
- Input sanitization for XSS prevention
- AWS IAM permissions for SES access

## Customization

### Styling
- Modify `apps/dog-parent-app/src/app/contact/page.tsx` for styling changes
- Uses Ant Design components for consistent UI

### Email Templates
- Modify HTML templates in the API route
- Update both support notification and user confirmation templates
- Test email rendering across different clients

### Form Fields
- Add new fields in the form component
- Update API route to handle new fields
- Modify email templates to include new fields

### Inquiry Types
- Add new types in the `contactTypes` array
- Update email templates to handle new inquiry types
