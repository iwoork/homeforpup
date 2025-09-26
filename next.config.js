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
        }
      ],
    },
    env: {
      NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
      NEXT_PUBLIC_AWS_USER_POOL_ID: process.env.NEXT_PUBLIC_AWS_USER_POOL_ID,
      NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID: process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID,
      NEXT_PUBLIC_AWS_S3_BUCKET: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
      NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN: process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN,
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    },
    typescript: {
      ignoreBuildErrors: false,
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
  }
  
  module.exports = nextConfig