#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ApiStack } from '../lib/stacks/api-stack';
import { getEnvironmentConfig } from '../lib/config/environments';
import { config as dotenvConfig } from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Try multiple paths to find the root .env file
// When compiled, __dirname points to dist/bin, so we need to go up more levels
const possibleEnvPaths = [
  path.resolve(__dirname, '../../../.env'), // From dist/bin to root
  path.resolve(__dirname, '../../../../.env'), // From dist/bin (if nested deeper)
  path.resolve(process.cwd(), '.env'), // Current working directory
  path.resolve(process.cwd(), '../.env'), // Parent of current directory
  path.resolve(process.cwd(), '../../.env'), // Two levels up
];

// Find the first existing .env file
let envPath: string | undefined;
for (const envFile of possibleEnvPaths) {
  if (fs.existsSync(envFile)) {
    envPath = envFile;
    console.log(`📁 Loading environment from: ${envPath}`);
    break;
  }
}

if (envPath) {
  const result = dotenvConfig({ path: envPath });
  if (result.error) {
    console.warn(`⚠️  Warning: Error loading .env file: ${result.error.message}`);
  } else {
    console.log(`✅ Loaded ${Object.keys(result.parsed || {}).length} environment variables from ${envPath}`);
  }
} else {
  console.warn('⚠️  Warning: No .env file found. Tried paths:');
  possibleEnvPaths.forEach(p => console.warn(`   - ${p}`));
  console.warn('   Using environment variables from process.env only');
}

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

