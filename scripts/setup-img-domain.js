#!/usr/bin/env node

/**
 * Setup script for img.homeforpup.com CloudFront distribution
 * This script automates the creation of CloudFront distribution with S3 origin
 */

const { 
  CloudFrontClient, 
  CreateDistributionCommand,
  CreateOriginAccessControlCommand,
  GetDistributionCommand
} = require('@aws-sdk/client-cloudfront');

const { 
  S3Client, 
  PutBucketPolicyCommand,
  GetBucketLocationCommand 
} = require('@aws-sdk/client-s3');

const { 
  ACMClient, 
  ListCertificatesCommand 
} = require('@aws-sdk/client-acm');

require('dotenv').config({ path: '.env.local' });

const REGION = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'homeforpup-images';
const CUSTOM_DOMAIN = process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN || 'img.homeforpup.com';

const cloudfront = new CloudFrontClient({ region: 'us-east-1' }); // CloudFront is global but managed from us-east-1
const s3 = new S3Client({ region: REGION });
const acm = new ACMClient({ region: 'us-east-1' }); // ACM certificates for CloudFront must be in us-east-1

async function findSSLCertificate() {
  console.log('🔍 Looking for SSL certificate...');
  
  try {
    const command = new ListCertificatesCommand({
      CertificateStatuses: ['ISSUED']
    });
    
    const response = await acm.send(command);
    
    // Look for wildcard certificate that covers our domain
    const certificate = response.CertificateSummaryList.find(cert => 
      cert.DomainName === '*.homeforpup.com' || 
      cert.SubjectAlternativeNameSummary?.includes('*.homeforpup.com')
    );
    
    if (certificate) {
      console.log('✅ Found SSL certificate:', certificate.CertificateArn);
      return certificate.CertificateArn;
    } else {
      console.log('❌ No SSL certificate found for *.homeforpup.com');
      console.log('📋 Please create an SSL certificate first:');
      console.log('   1. Go to AWS Certificate Manager (us-east-1 region)');
      console.log('   2. Request certificate for *.homeforpup.com');
      console.log('   3. Use DNS validation');
      console.log('   4. Run this script again after validation');
      return null;
    }
  } catch (error) {
    console.error('❌ Error finding SSL certificate:', error.message);
    return null;
  }
}

async function createOriginAccessControl() {
  console.log('🔧 Creating Origin Access Control...');
  
  try {
    const command = new CreateOriginAccessControlCommand({
      OriginAccessControlConfig: {
        Name: `${BUCKET_NAME}-oac`,
        Description: `OAC for ${BUCKET_NAME} S3 bucket`,
        OriginAccessControlOriginType: 'S3',
        SigningBehavior: 'always',
        SigningProtocol: 'sigv4'
      }
    });
    
    const response = await cloudfront.send(command);
    console.log('✅ Created Origin Access Control:', response.OriginAccessControl.Id);
    return response.OriginAccessControl.Id;
  } catch (error) {
    console.error('❌ Error creating Origin Access Control:', error.message);
    throw error;
  }
}

async function createCloudFrontDistribution(certificateArn, oacId) {
  console.log('🌐 Creating CloudFront distribution...');
  
  try {
    const distributionConfig = {
      CallerReference: `homeforpup-img-${Date.now()}`,
      Comment: `CloudFront distribution for ${CUSTOM_DOMAIN}`,
      Enabled: true,
      Origins: {
        Quantity: 1,
        Items: [
          {
            Id: 'homeforpup-s3-origin',
            DomainName: `${BUCKET_NAME}.s3.${REGION}.amazonaws.com`,
            OriginPath: '',
            S3OriginConfig: {
              OriginAccessIdentity: '' // Empty for OAC
            },
            OriginAccessControlId: oacId
          }
        ]
      },
      DefaultCacheBehavior: {
        TargetOriginId: 'homeforpup-s3-origin',
        ViewerProtocolPolicy: 'redirect-to-https',
        AllowedMethods: {
          Quantity: 7,
          Items: ['GET', 'HEAD', 'OPTIONS', 'PUT', 'POST', 'PATCH', 'DELETE'],
          CachedMethods: {
            Quantity: 2,
            Items: ['GET', 'HEAD']
          }
        },
        ForwardedValues: {
          QueryString: false,
          Cookies: {
            Forward: 'none'
          },
          Headers: {
            Quantity: 4,
            Items: ['Origin', 'Access-Control-Request-Method', 'Access-Control-Request-Headers', 'Authorization']
          }
        },
        TrustedSigners: {
          Enabled: false,
          Quantity: 0
        },
        MinTTL: 0,
        DefaultTTL: 86400,
        MaxTTL: 31536000,
        Compress: true
      },
      Aliases: {
        Quantity: 1,
        Items: [CUSTOM_DOMAIN]
      },
      ViewerCertificate: {
        ACMCertificateArn: certificateArn,
        SSLSupportMethod: 'sni-only',
        MinimumProtocolVersion: 'TLSv1.2_2021'
      },
      PriceClass: 'PriceClass_100',
      HttpVersion: 'http2and3',
      IsIPV6Enabled: true
    };
    
    const command = new CreateDistributionCommand({
      DistributionConfig: distributionConfig
    });
    
    const response = await cloudfront.send(command);
    const distribution = response.Distribution;
    
    console.log('✅ Created CloudFront distribution:');
    console.log('   Distribution ID:', distribution.Id);
    console.log('   Domain Name:', distribution.DomainName);
    console.log('   Status:', distribution.Status);
    
    return {
      id: distribution.Id,
      domainName: distribution.DomainName,
      arn: distribution.ARN
    };
  } catch (error) {
    console.error('❌ Error creating CloudFront distribution:', error.message);
    throw error;
  }
}

async function updateS3BucketPolicy(distributionArn) {
  console.log('🔒 Updating S3 bucket policy...');
  
  // Get AWS account ID from the distribution ARN
  const accountId = distributionArn.split(':')[4];
  
  const bucketPolicy = {
    Version: '2012-10-17',
    Statement: [
      {
        Sid: 'AllowCloudFrontServicePrincipal',
        Effect: 'Allow',
        Principal: {
          Service: 'cloudfront.amazonaws.com'
        },
        Action: 's3:GetObject',
        Resource: `arn:aws:s3:::${BUCKET_NAME}/*`,
        Condition: {
          StringEquals: {
            'AWS:SourceArn': distributionArn
          }
        }
      }
    ]
  };
  
  try {
    const command = new PutBucketPolicyCommand({
      Bucket: BUCKET_NAME,
      Policy: JSON.stringify(bucketPolicy)
    });
    
    await s3.send(command);
    console.log('✅ Updated S3 bucket policy');
  } catch (error) {
    console.error('❌ Error updating S3 bucket policy:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Setting up img.homeforpup.com CloudFront distribution...\n');
  
  console.log('Configuration:');
  console.log('  Region:', REGION);
  console.log('  S3 Bucket:', BUCKET_NAME);
  console.log('  Custom Domain:', CUSTOM_DOMAIN);
  console.log('');
  
  try {
    // Step 1: Find SSL certificate
    const certificateArn = await findSSLCertificate();
    if (!certificateArn) {
      process.exit(1);
    }
    
    // Step 2: Create Origin Access Control
    const oacId = await createOriginAccessControl();
    
    // Step 3: Create CloudFront distribution
    const distribution = await createCloudFrontDistribution(certificateArn, oacId);
    
    // Step 4: Update S3 bucket policy
    await updateS3BucketPolicy(distribution.arn);
    
    console.log('\n🎉 Setup completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Wait for CloudFront distribution to deploy (15-20 minutes)');
    console.log('2. Create DNS CNAME record:');
    console.log(`   Name: img`);
    console.log(`   Value: ${distribution.domainName}`);
    console.log('3. Test the setup:');
    console.log(`   curl -I https://${CUSTOM_DOMAIN}/`);
    console.log('\n⚠️  Note: DNS propagation may take up to 48 hours');
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
