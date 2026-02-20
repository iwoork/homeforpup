// Load only Stripe env vars from root .env (breeder-app has its own config in .env.local)
const path = require('path');
const fs = require('fs');
const rootEnvPath = path.resolve(__dirname, '../../.env');
if (fs.existsSync(rootEnvPath)) {
  const rootEnv = require('dotenv').parse(fs.readFileSync(rootEnvPath));
  const stripeKeys = Object.entries(rootEnv).filter(([k]) => k.includes('STRIPE'));
  for (const [key, value] of stripeKeys) {
    if (!process.env[key]) process.env[key] = value;
  }
}

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
    NEXT_PUBLIC_AWS_S3_BUCKET: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
    NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN: process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    // SECURITY: AWS credentials and Stripe secret key are NOT exposed to client
  },
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/cssinjs'],
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
