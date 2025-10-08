#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/stacks/api-stack';
import { getEnvironmentConfig } from '../lib/config/environments';
import { config as dotenvConfig } from 'dotenv';
import * as path from 'path';

// Load environment variables from .env file
dotenvConfig({ path: path.join(__dirname, '../.env') });

const app = new cdk.App();

// Get environment from context or default to development
const environment = app.node.tryGetContext('environment') || 'development';
const config = getEnvironmentConfig(environment);

// Main API Stack
new ApiStack(app, `HomeForPupApiStack-${config.environment}`, {
  env: {
    account: process.env.AWS_ACCOUNT_ID || process.env.CDK_DEFAULT_ACCOUNT || '249730500554',
    region: config.region,
  },
  stackName: `homeforpup-api-${config.environment}`,
  description: `HomeForPup API Gateway and Lambda Functions (${config.environment})`,
  config,
  tags: {
    Environment: config.environment,
    Project: 'HomeForPup',
    ManagedBy: 'CDK',
  },
});

app.synth();

