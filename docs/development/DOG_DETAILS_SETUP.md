# Dog Details Feature Setup

## Environment Variables Required

To use the dog details feature with photo uploads, you need to set up the following environment variables in your `.env.local` file:

```bash
# AWS Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_AWS_S3_BUCKET=your-s3-bucket-name
NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN=your-custom-domain.com

# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# DynamoDB Table Names
DOGS_TABLE_NAME=homeforpup-dogs
KENNELS_TABLE_NAME=homeforpup-kennels

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-key-here
```

## Custom Domain Setup (Optional)

To use a custom domain like `img.homeforpup.com` for your S3 bucket:

1. **Set up CloudFront Distribution**:
   - Create CloudFront distribution pointing to your S3 bucket
   - Configure alternate domain name: `img.homeforpup.com`
   - Set up SSL certificate for your domain

2. **Configure DNS**:
   - Create CNAME record: `img` → `your-cloudfront-domain.cloudfront.net`

3. **Update Environment Variable**:
   ```bash
   NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN=img.homeforpup.com
   ```

## Features Implemented

### 1. Dog Details Page (`/dogs/[id]`)
- **Overview Tab**: Basic dog information, health status, and photo gallery
- **Veterinary Visits Tab**: Track vet visits with detailed medical records
- **Training Records Tab**: Manage training sessions and skill progress

### 2. Photo Management
- Integrated photo uploader with S3 storage
- Image cropping with multiple aspect ratios
- Photo categorization (general, vet visits, training, etc.)
- Profile photo designation
- **Edit Dog Form**: Photo upload functionality added to edit dog modal

### 3. Veterinary Visits Tracking
- Visit dates and types (routine, emergency, vaccination, etc.)
- Veterinarian and clinic information
- Medical data (weight, temperature, heart rate)
- Diagnosis, treatment, and medications
- Follow-up scheduling and cost tracking

### 4. Training Records
- Session dates and duration
- Training types (obedience, agility, therapy, etc.)
- Trainer information and credentials
- Skills tracking with progress levels
- Location and notes

### 5. Navigation
- "View" buttons in kennel dogs table
- Opens dog details in new tabs
- Updated dashboard navigation

## API Endpoints

- `POST/GET /api/dogs/[id]/vet-visits` - Veterinary visit management
- `POST/GET /api/dogs/[id]/training` - Training record management  
- `POST/GET /api/dogs/[id]/photos` - Photo gallery management
- `POST /api/upload` - Server-side file upload to S3 (avoids CORS issues)

## Troubleshooting

### S3 Upload Errors
If you see "Empty value provided for input HTTP label: Bucket" error:
1. Make sure `NEXT_PUBLIC_AWS_S3_BUCKET` is set in your `.env.local`
2. Verify your AWS credentials are correct
3. Ensure the S3 bucket exists and you have write permissions

### CORS Errors
The app now uses server-side uploads to avoid CORS issues. If you still see CORS errors:
1. The upload API (`/api/upload`) handles file uploads server-side
2. No CORS configuration needed on the S3 bucket for this approach
3. Make sure the upload API endpoint is working correctly

### Form Warnings
The form warnings about single child elements are resolved by using a custom wrapper instead of Form.Item for the PhotoUpload component.

### React 19 Compatibility
The app uses Antd's App component to provide context for static functions like message notifications. All message API calls now use the `useApp` hook instead of the static `message` import to ensure proper context access.
