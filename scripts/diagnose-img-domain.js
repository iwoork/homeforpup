#!/usr/bin/env node

/**
 * Diagnostic script for img.homeforpup.com setup
 * This script checks the current status and provides specific fix instructions
 */

const { 
  CloudFrontClient, 
  GetDistributionCommand,
  ListDistributionsCommand
} = require('@aws-sdk/client-cloudfront');

const { 
  ACMClient, 
  ListCertificatesCommand 
} = require('@aws-sdk/client-acm');

const { 
  S3Client, 
  GetBucketPolicyCommand 
} = require('@aws-sdk/client-s3');

require('dotenv').config({ path: '.env.local' });

const REGION = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
const BUCKET_NAME = process.env.NEXT_PUBLIC_AWS_S3_BUCKET || 'homeforpup-images';
const CUSTOM_DOMAIN = process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN || 'img.homeforpup.com';
const CLOUDFRONT_DOMAIN = 'd3phuzrahdouqe.cloudfront.net'; // From DNS lookup

const cloudfront = new CloudFrontClient({ region: 'us-east-1' });
const s3 = new S3Client({ region: REGION });
const acm = new ACMClient({ region: 'us-east-1' });

async function findCloudFrontDistribution() {
  console.log('🔍 Finding CloudFront distribution...');
  
  try {
    const command = new ListDistributionsCommand({});
    const response = await cloudfront.send(command);
    
    // Find distribution that matches our domain
    const distribution = response.DistributionList?.Items?.find(dist => 
      dist.DomainName === CLOUDFRONT_DOMAIN ||
      dist.Aliases?.Items?.includes(CUSTOM_DOMAIN)
    );
    
    if (distribution) {
      console.log('✅ Found CloudFront distribution:');
      console.log('   ID:', distribution.Id);
      console.log('   Domain:', distribution.DomainName);
      console.log('   Status:', distribution.Status);
      console.log('   Aliases:', distribution.Aliases?.Items || 'None');
      
      // Get detailed configuration
      const detailCommand = new GetDistributionCommand({ Id: distribution.Id });
      const detail = await cloudfront.send(detailCommand);
      
      console.log('   SSL Certificate:', detail.Distribution.DistributionConfig.ViewerCertificate?.ACMCertificateArn || 'Default CloudFront');
      console.log('   Origins:', detail.Distribution.DistributionConfig.Origins.Items.map(o => o.DomainName));
      
      return {
        id: distribution.Id,
        arn: distribution.ARN,
        config: detail.Distribution.DistributionConfig
      };
    } else {
      console.log('❌ No matching CloudFront distribution found');
      return null;
    }
  } catch (error) {
    console.error('❌ Error finding CloudFront distribution:', error.message);
    return null;
  }
}

async function checkSSLCertificates() {
  console.log('\n🔍 Checking SSL certificates...');
  
  try {
    const command = new ListCertificatesCommand({
      CertificateStatuses: ['ISSUED']
    });
    
    const response = await acm.send(command);
    
    console.log('📋 Available certificates:');
    response.CertificateSummaryList?.forEach(cert => {
      console.log(`   - ${cert.DomainName} (${cert.CertificateArn})`);
      if (cert.SubjectAlternativeNameSummary) {
        console.log(`     SANs: ${cert.SubjectAlternativeNameSummary.join(', ')}`);
      }
    });
    
    // Check for wildcard certificate
    const wildcardCert = response.CertificateSummaryList?.find(cert => 
      cert.DomainName === '*.homeforpup.com' || 
      cert.SubjectAlternativeNameSummary?.includes('*.homeforpup.com')
    );
    
    if (wildcardCert) {
      console.log('\n✅ Found wildcard certificate for *.homeforpup.com');
      return wildcardCert.CertificateArn;
    } else {
      console.log('\n❌ No wildcard certificate found for *.homeforpup.com');
      return null;
    }
  } catch (error) {
    console.error('❌ Error checking SSL certificates:', error.message);
    return null;
  }
}

async function checkS3BucketPolicy() {
  console.log('\n🔍 Checking S3 bucket policy...');
  
  try {
    const command = new GetBucketPolicyCommand({
      Bucket: BUCKET_NAME
    });
    
    const response = await s3.send(command);
    const policy = JSON.parse(response.Policy);
    
    console.log('📋 Current S3 bucket policy:');
    console.log(JSON.stringify(policy, null, 2));
    
    // Check if CloudFront has access
    const hasCloudFrontAccess = policy.Statement?.some(statement => 
      statement.Principal?.Service === 'cloudfront.amazonaws.com' &&
      statement.Action?.includes('s3:GetObject')
    );
    
    if (hasCloudFrontAccess) {
      console.log('✅ S3 bucket policy allows CloudFront access');
    } else {
      console.log('❌ S3 bucket policy does NOT allow CloudFront access');
    }
    
    return policy;
  } catch (error) {
    if (error.name === 'NoSuchBucketPolicy') {
      console.log('❌ No bucket policy found');
    } else {
      console.error('❌ Error checking S3 bucket policy:', error.message);
    }
    return null;
  }
}

async function generateFixInstructions(distribution, certificateArn, bucketPolicy) {
  console.log('\n🔧 RECOMMENDED FIXES:\n');
  
  // SSL Certificate fix
  if (!certificateArn) {
    console.log('1. CREATE SSL CERTIFICATE:');
    console.log('   aws acm request-certificate \\');
    console.log('     --domain-name "*.homeforpup.com" \\');
    console.log('     --subject-alternative-names "homeforpup.com" \\');
    console.log('     --validation-method DNS \\');
    console.log('     --region us-east-1\n');
  } else if (distribution && distribution.config.ViewerCertificate?.ACMCertificateArn !== certificateArn) {
    console.log('1. UPDATE CLOUDFRONT DISTRIBUTION SSL:');
    console.log('   - Go to CloudFront console');
    console.log(`   - Edit distribution ${distribution.id}`);
    console.log('   - Update SSL certificate to use:', certificateArn);
    console.log('   - Save and wait for deployment\n');
  } else {
    console.log('1. ✅ SSL Certificate is properly configured\n');
  }
  
  // S3 Bucket Policy fix
  if (!bucketPolicy || !bucketPolicy.Statement?.some(s => s.Principal?.Service === 'cloudfront.amazonaws.com')) {
    console.log('2. UPDATE S3 BUCKET POLICY:');
    if (distribution) {
      const accountId = distribution.arn.split(':')[4];
      console.log(`   Replace with this policy (update ACCOUNT_ID to ${accountId}):`);
      console.log(`   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "AllowCloudFrontServicePrincipal",
         "Effect": "Allow",
         "Principal": {
           "Service": "cloudfront.amazonaws.com"
         },
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::${BUCKET_NAME}/*",
         "Condition": {
           "StringEquals": {
             "AWS:SourceArn": "${distribution.arn}"
           }
         }
       }
     ]
   }\n`);
    } else {
      console.log('   Cannot generate policy without distribution info\n');
    }
  } else {
    console.log('2. ✅ S3 Bucket Policy allows CloudFront access\n');
  }
  
  // Test instructions
  console.log('3. AFTER FIXES, TEST WITH:');
  console.log(`   curl -I https://${CUSTOM_DOMAIN}/`);
  console.log('   (Should return 200 OK or 404, not 403 Forbidden)\n');
}

async function main() {
  console.log('🔍 DIAGNOSING img.homeforpup.com SETUP\n');
  
  console.log('Configuration:');
  console.log('  Custom Domain:', CUSTOM_DOMAIN);
  console.log('  CloudFront Domain:', CLOUDFRONT_DOMAIN);
  console.log('  S3 Bucket:', BUCKET_NAME);
  console.log('  Region:', REGION);
  console.log('');
  
  try {
    // Check all components
    const distribution = await findCloudFrontDistribution();
    const certificateArn = await checkSSLCertificates();
    const bucketPolicy = await checkS3BucketPolicy();
    
    // Generate fix instructions
    await generateFixInstructions(distribution, certificateArn, bucketPolicy);
    
  } catch (error) {
    console.error('\n❌ Diagnosis failed:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
