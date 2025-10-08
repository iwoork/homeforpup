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
 * Reusable construct for creating Lambda functions with best practices
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
        ...environment,
      },
      bundling: {
        minify: false,
        sourceMap: true,
        externalModules: [
          '@aws-sdk/*',
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
   * Grant DynamoDB access to the Lambda function
   */
  public grantDynamoDBAccess(tableNames: string[]) {
    const resources: string[] = [];
    
    // Add table ARNs and index ARNs
    tableNames.forEach((tableName) => {
      const tableArn = `arn:aws:dynamodb:${cdk.Stack.of(this).region}:${
        cdk.Stack.of(this).account
      }:table/${tableName}`;
      
      resources.push(tableArn);
      // Also grant access to all indexes on the table
      resources.push(`${tableArn}/index/*`);
    });
    
    this.function.addToRolePolicy(
      new cdk.aws_iam.PolicyStatement({
        actions: [
          'dynamodb:GetItem',
          'dynamodb:PutItem',
          'dynamodb:UpdateItem',
          'dynamodb:DeleteItem',
          'dynamodb:Query',
          'dynamodb:Scan',
          'dynamodb:BatchGetItem',
          'dynamodb:BatchWriteItem',
        ],
        resources,
      })
    );
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

