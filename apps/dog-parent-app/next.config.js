// Load environment variables from root .env file
const path = require('path');
const { config } = require('dotenv');

// Load root .env file (go up two levels from apps/dog-parent-app to root)
config({ path: path.resolve(__dirname, '../../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'img.homeforpup.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placedog.net',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dog.ceo',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.gooddog.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      }
    ],
  },
  env: {
    // Only expose intentionally public variables to the client
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
    NEXT_PUBLIC_AWS_USER_POOL_ID: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
    NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
    NEXT_PUBLIC_COGNITO_AUTHORITY: process.env.NEXT_PUBLIC_COGNITO_AUTHORITY,
    NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
    NEXT_PUBLIC_AWS_S3_BUCKET: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
    NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN: process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN,
    NEXT_PUBLIC_BREEDER_APP_URL: process.env.NEXT_PUBLIC_BREEDER_APP_URL,
    // SECURITY: AWS credentials are NOT exposed to client - they should only be used server-side
    // AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are only available on the server
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
