#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DynamoDBStack } from '../lib/stacks/dynamodb-stack';
import { S3Stack } from '../lib/stacks/s3-stack';
import { IAMStack } from '../lib/stacks/iam-stack';
import { getEnvironmentConfig } from '../lib/config/environments';
import { config as dotenvConfig } from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenvConfig({ path: path.join(__dirname, '../.env') });

const app = new cdk.App();

// Get environment from context or default to development
const environment = app.node.tryGetContext('environment') || process.env.ENVIRONMENT || 'development';
const config = getEnvironmentConfig(environment);

const stackProps = {
  env: {
    account: process.env.AWS_ACCOUNT_ID || process.env.CDK_DEFAULT_ACCOUNT,
    region: config.region,
  },
  tags: {
    Environment: config.environment,
    Project: 'HomeForPup',
    ManagedBy: 'CDK',
  },
};

// DynamoDB Stack
const dynamodbStack = new DynamoDBStack(app, `DynamoDBStack-${config.environment}`, {
  ...stackProps,
  stackName: `homeforpup-dynamodb-${config.environment}`,
  description: `HomeForPup DynamoDB Tables (${config.environment})`,
  config,
});

// S3 Stack
const s3Stack = new S3Stack(app, `S3Stack-${config.environment}`, {
  ...stackProps,
  stackName: `homeforpup-s3-${config.environment}`,
  description: `HomeForPup S3 Buckets (${config.environment})`,
  config,
});

// IAM Stack (depends on other stacks)
const iamStack = new IAMStack(app, `IAMStack-${config.environment}`, {
  ...stackProps,
  stackName: `homeforpup-iam-${config.environment}`,
  description: `HomeForPup IAM Roles and Policies (${config.environment})`,
  config,
  dynamodbStack,
  s3Stack,
});

// Add dependencies
iamStack.addDependency(dynamodbStack);
iamStack.addDependency(s3Stack);

app.synth();


