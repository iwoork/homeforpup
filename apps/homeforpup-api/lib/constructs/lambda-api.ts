import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config/environments';

export interface LambdaApiProps {
  functionName: string;
  handler: string;
  entry: string;
  config: EnvironmentConfig;
  environment?: { [key: string]: string };
  timeout?: cdk.Duration;
  memorySize?: number;
}

/**
 * Reusable construct for creating Lambda functions with best practices.
 * All functions receive DATABASE_URL for Supabase PostgreSQL access.
 */
export class LambdaApi extends Construct {
  public readonly function: nodejs.NodejsFunction;

  constructor(scope: Construct, id: string, props: LambdaApiProps) {
    super(scope, id);

    const {
      functionName,
      handler,
      entry,
      config,
      environment = {},
      timeout,
      memorySize,
    } = props;

    // Create Lambda function using NodejsFunction for automatic bundling
    this.function = new nodejs.NodejsFunction(this, 'Function', {
      functionName: `${functionName}-${config.environment}`,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler,
      entry: `${entry}/index.ts`,
      timeout: timeout || cdk.Duration.seconds(config.lambda.timeout),
      memorySize: memorySize || config.lambda.memorySize,
      environment: {
        NODE_ENV: config.environment,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        // Single DATABASE_URL replaces all *_TABLE env vars
        DATABASE_URL: config.databaseUrl,
        ...environment,
      },
      bundling: {
        minify: false,
        sourceMap: true,
        // Only externalize aws-sdk (for S3); drizzle-orm + postgres must be bundled
        externalModules: [
          'aws-sdk',
        ],
      },
      tracing: config.features.xrayTracing
        ? lambda.Tracing.ACTIVE
        : lambda.Tracing.DISABLED,
      logRetention: logs.RetentionDays.ONE_WEEK,
      description: `${functionName} API handler (${config.environment})`,
    });

    // Add CloudWatch Logs permissions
    this.function.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: [
          'logs:CreateLogGroup',
          'logs:CreateLogStream',
          'logs:PutLogEvents',
        ],
        resources: ['*'],
      })
    );

    // Add X-Ray permissions if enabled
    if (config.features.xrayTracing) {
      this.function.addToRolePolicy(
        new cdk.aws_iam.PolicyStatement({
          actions: [
            'xray:PutTraceSegments',
            'xray:PutTelemetryRecords',
          ],
          resources: ['*'],
        })
      );
    }

    // Tags
    cdk.Tags.of(this.function).add('Function', functionName);
    cdk.Tags.of(this.function).add('Environment', config.environment);
  }

  /**
   * Grant S3 access to the Lambda function
   */
  public grantS3Access(bucketName: string, readonly: boolean = false) {
    const actions = readonly
      ? ['s3:GetObject', 's3:ListBucket']
      : ['s3:GetObject', 's3:PutObject', 's3:DeleteObject', 's3:ListBucket'];

    this.function.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions,
        resources: [
          `arn:aws:s3:::${bucketName}`,
          `arn:aws:s3:::${bucketName}/*`,
        ],
      })
    );
  }

  /**
   * Create API Gateway integration for this Lambda
   */
  public createIntegration(): apigateway.LambdaIntegration {
    return new apigateway.LambdaIntegration(this.function, {
      proxy: true,
      allowTestInvoke: true,
    });
  }
}
