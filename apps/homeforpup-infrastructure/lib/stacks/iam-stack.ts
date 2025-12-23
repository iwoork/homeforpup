import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config/environments';
import { DynamoDBStack } from './dynamodb-stack';
import { S3Stack } from './s3-stack';
import { CognitoStack } from './cognito-stack';

export interface IAMStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
  dynamodbStack?: DynamoDBStack;
  s3Stack?: S3Stack;
  cognitoStack?: CognitoStack;
}

export class IAMStack extends cdk.Stack {
  public readonly applicationRole: iam.Role;

  constructor(scope: Construct, id: string, props: IAMStackProps) {
    super(scope, id, props);

    const { config, dynamodbStack, s3Stack, cognitoStack } = props;
    const env = config.environment;

    // Create IAM Role for Application (Lambda, EC2, etc.)
    this.applicationRole = new iam.Role(this, 'ApplicationRole', {
      roleName: `homeforpup-application-role-${env}`,
      assumedBy: new iam.CompositePrincipal(
        new iam.ServicePrincipal('lambda.amazonaws.com'),
        new iam.ServicePrincipal('ec2.amazonaws.com')
      ),
      description: 'Role for HomeForPup application services',
    });
    cdk.Tags.of(this.applicationRole).add('Environment', env);
    cdk.Tags.of(this.applicationRole).add('Application', 'HomeForPup');
    cdk.Tags.of(this.applicationRole).add('Purpose', 'Application-service-role');

    // DynamoDB Permissions
    if (dynamodbStack) {
      const tableArns = Object.values(dynamodbStack.tables).map(
        table => table.tableArn
      );
      const indexArns = Object.values(dynamodbStack.tables).flatMap(table => {
        const indexes: string[] = [];
        // Get all GSI ARNs
        Object.keys(table).forEach(key => {
          if (key.includes('Index')) {
            indexes.push(`${table.tableArn}/index/*`);
          }
        });
        return indexes.length > 0 ? indexes : [`${table.tableArn}/index/*`];
      });

      this.applicationRole.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
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
          resources: [
            ...tableArns,
            ...tableArns.map(arn => `${arn}/index/*`),
          ],
        })
      );

      this.applicationRole.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'dynamodb:DescribeTable',
            'dynamodb:ListTables',
          ],
          resources: ['*'],
        })
      );
    }

    // S3 Permissions
    if (s3Stack) {
      // Image bucket - read/write access
      this.applicationRole.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            's3:GetObject',
            's3:PutObject',
            's3:DeleteObject',
            's3:ListBucket',
            's3:GetBucketLocation',
          ],
          resources: [
            s3Stack.imageBucket.bucketArn,
            `${s3Stack.imageBucket.bucketArn}/*`,
          ],
        })
      );

      // Upload bucket - read/write access
      this.applicationRole.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            's3:GetObject',
            's3:PutObject',
            's3:DeleteObject',
            's3:ListBucket',
            's3:GetBucketLocation',
          ],
          resources: [
            s3Stack.uploadBucket.bucketArn,
            `${s3Stack.uploadBucket.bucketArn}/*`,
          ],
        })
      );
    }

    // Cognito Permissions
    if (cognitoStack) {
      this.applicationRole.addToPolicy(
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: [
            'cognito-idp:DescribeUserPool',
            'cognito-idp:DescribeUserPoolClient',
            'cognito-idp:ListUsers',
            'cognito-idp:AdminGetUser',
            'cognito-idp:AdminUpdateUserAttributes',
          ],
          resources: [cognitoStack.userPool.userPoolArn],
        })
      );
    }

    // SES Permissions (for email sending)
    this.applicationRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'ses:SendEmail',
          'ses:SendRawEmail',
        ],
        resources: [`arn:aws:ses:${config.region}:${this.account}:identity/*`],
      })
    );

    // CloudWatch Logs Permissions
    this.applicationRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          'logs:CreateLogStream',
          'logs:PutLogEvents',
          'logs:FilterLogEvents',
          'logs:DescribeLogStreams',
        ],
        resources: [
          `arn:aws:logs:${config.region}:${this.account}:log-group:/aws/lambda/*-${env}-*:*`,
          `arn:aws:logs:${config.region}:${this.account}:log-group:/aws/lambda/*:*`,
        ],
      })
    );

    // Output Role ARN
    new cdk.CfnOutput(this, 'ApplicationRoleArn', {
      value: this.applicationRole.roleArn,
      exportName: `HomeForPup-ApplicationRoleArn-${env}`,
    });

    new cdk.CfnOutput(this, 'ApplicationRoleName', {
      value: this.applicationRole.roleName,
      exportName: `HomeForPup-ApplicationRoleName-${env}`,
    });
  }
}

