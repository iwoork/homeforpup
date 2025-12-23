import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config/environments';

export interface S3StackProps extends cdk.StackProps {
  config: EnvironmentConfig;
}

export class S3Stack extends cdk.Stack {
  public readonly imageBucket: s3.IBucket;
  public readonly uploadBucket: s3.IBucket;

  constructor(scope: Construct, id: string, props: S3StackProps) {
    super(scope, id, props);

    const { config } = props;
    const env = config.environment;

    // Check if we should import existing buckets
    const importExistingBuckets = process.env.IMPORT_EXISTING_S3_BUCKETS === 'true';

    if (importExistingBuckets) {
      // Import existing buckets
      this.imageBucket = s3.Bucket.fromBucketName(this, 'ImageBucket', config.imageBucket);
      this.uploadBucket = s3.Bucket.fromBucketName(this, 'UploadBucket', config.uploadBucket);
    } else {
      // Create new buckets
      // Image Bucket (for public images)
      this.imageBucket = new s3.Bucket(this, 'ImageBucket', {
        bucketName: config.imageBucket,
        removalPolicy: env === 'production' 
          ? cdk.RemovalPolicy.RETAIN 
          : cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: env !== 'production',
        versioned: env === 'production',
        encryption: s3.BucketEncryption.S3_MANAGED,
        blockPublicAccess: new s3.BlockPublicAccess({
          blockPublicAcls: false,
          blockPublicPolicy: false,
          ignorePublicAcls: false,
          restrictPublicBuckets: false,
        }),
        publicReadAccess: true,
        cors: [
          {
            allowedOrigins: ['*'],
            allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.DELETE],
            allowedHeaders: ['*'],
            exposedHeaders: ['ETag'],
            maxAge: 3000,
          },
        ],
        lifecycleRules: [
          {
            id: 'DeleteOldVersions',
            enabled: env === 'production',
            noncurrentVersionExpiration: cdk.Duration.days(90),
          },
          {
            id: 'TransitionToIA',
            enabled: env === 'production',
            transitions: [
              {
                storageClass: s3.StorageClass.INFREQUENT_ACCESS,
                transitionAfter: cdk.Duration.days(90),
              },
            ],
          },
        ],
      });
      cdk.Tags.of(this.imageBucket).add('Environment', env);
      cdk.Tags.of(this.imageBucket).add('Application', 'HomeForPup');
      cdk.Tags.of(this.imageBucket).add('Purpose', 'Public-image-storage');

      // Upload Bucket (for temporary uploads)
      this.uploadBucket = new s3.Bucket(this, 'UploadBucket', {
        bucketName: config.uploadBucket,
        removalPolicy: env === 'production' 
          ? cdk.RemovalPolicy.RETAIN 
          : cdk.RemovalPolicy.DESTROY,
        autoDeleteObjects: env !== 'production',
        versioned: false,
        encryption: s3.BucketEncryption.S3_MANAGED,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        publicReadAccess: false,
        lifecycleRules: [
          {
            id: 'DeleteOldUploads',
            enabled: true,
            expiration: cdk.Duration.days(7), // Delete uploads older than 7 days
          },
        ],
      });
      cdk.Tags.of(this.uploadBucket).add('Environment', env);
      cdk.Tags.of(this.uploadBucket).add('Application', 'HomeForPup');
      cdk.Tags.of(this.uploadBucket).add('Purpose', 'Temporary-upload-storage');
    }

    // Output bucket names and ARNs
    new cdk.CfnOutput(this, 'ImageBucketName', {
      value: this.imageBucket.bucketName,
      exportName: `HomeForPup-ImageBucket-${env}`,
    });

    new cdk.CfnOutput(this, 'ImageBucketArn', {
      value: this.imageBucket.bucketArn,
      exportName: `HomeForPup-ImageBucketArn-${env}`,
    });

    new cdk.CfnOutput(this, 'ImageBucketDomainName', {
      value: this.imageBucket.bucketDomainName,
      exportName: `HomeForPup-ImageBucketDomain-${env}`,
    });

    new cdk.CfnOutput(this, 'UploadBucketName', {
      value: this.uploadBucket.bucketName,
      exportName: `HomeForPup-UploadBucket-${env}`,
    });

    new cdk.CfnOutput(this, 'UploadBucketArn', {
      value: this.uploadBucket.bucketArn,
      exportName: `HomeForPup-UploadBucketArn-${env}`,
    });
  }
}

