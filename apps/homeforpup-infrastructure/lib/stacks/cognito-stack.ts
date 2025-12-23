import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config/environments';

export interface CognitoStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
}

export class CognitoStack extends cdk.Stack {
  public readonly userPool: cognito.IUserPool;
  public readonly userPoolClient: cognito.IUserPoolClient;

  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props);

    const { config } = props;
    const env = config.environment;

    // If Cognito resources already exist, import them
    if (config.cognito?.userPoolId && config.cognito?.userPoolArn) {
      this.userPool = cognito.UserPool.fromUserPoolId(
        this,
        'ImportedUserPool',
        config.cognito.userPoolId
      );

      this.userPoolClient = cognito.UserPoolClient.fromUserPoolClientId(
        this,
        'ImportedUserPoolClient',
        config.cognito.clientId || ''
      );
    } else {
      // Create new Cognito User Pool
      this.userPool = new cognito.UserPool(this, 'UserPool', {
        userPoolName: `homeforpup-${env}`,
        removalPolicy: env === 'production' 
          ? cdk.RemovalPolicy.RETAIN 
          : cdk.RemovalPolicy.DESTROY,
        signInAliases: {
          email: true,
          username: false,
        },
        autoVerify: {
          email: true,
        },
        standardAttributes: {
          email: {
            required: true,
            mutable: true,
          },
          givenName: {
            required: false,
            mutable: true,
          },
          familyName: {
            required: false,
            mutable: true,
          },
          phoneNumber: {
            required: false,
            mutable: true,
          },
        },
        customAttributes: {
          userType: new cognito.StringAttribute({
            minLen: 1,
            maxLen: 50,
            mutable: true,
          }),
        },
        passwordPolicy: {
          minLength: 8,
          requireLowercase: true,
          requireUppercase: true,
          requireDigits: true,
          requireSymbols: false,
        },
        accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
        mfa: cognito.Mfa.OPTIONAL,
        mfaSecondFactor: {
          sms: true,
          otp: true,
        },
        email: cognito.UserPoolEmail.withSES({
          sesRegion: config.region,
          fromEmail: 'noreply@homeforpup.com',
          replyTo: 'support@homeforpup.com',
        }),
      });
      cdk.Tags.of(this.userPool).add('Environment', env);
      cdk.Tags.of(this.userPool).add('Application', 'HomeForPup');
      cdk.Tags.of(this.userPool).add('Purpose', 'User-authentication');

      // Create User Pool Client
      this.userPoolClient = this.userPool.addClient('UserPoolClient', {
        userPoolClientName: `homeforpup-client-${env}`,
        generateSecret: false, // Public client (mobile/web apps)
        authFlows: {
          userPassword: true,
          userSrp: true,
          adminUserPassword: false,
          custom: false,
        },
        oAuth: {
          flows: {
            authorizationCodeGrant: true,
            implicitCodeGrant: true,
          },
          scopes: [
            cognito.OAuthScope.EMAIL,
            cognito.OAuthScope.OPENID,
            cognito.OAuthScope.PROFILE,
          ],
          callbackUrls: env === 'production'
            ? [
                'https://homeforpup.com/api/auth/callback/cognito',
                'https://www.homeforpup.com/api/auth/callback/cognito',
                'https://breeder.homeforpup.com/api/auth/callback/cognito',
              ]
            : [
                'http://localhost:3000/api/auth/callback/cognito',
                'http://localhost:3001/api/auth/callback/cognito',
                'https://*.vercel.app/api/auth/callback/cognito',
              ],
          logoutUrls: env === 'production'
            ? [
                'https://homeforpup.com',
                'https://www.homeforpup.com',
                'https://breeder.homeforpup.com',
              ]
            : [
                'http://localhost:3000',
                'http://localhost:3001',
              ],
        },
        preventUserExistenceErrors: true,
      });

      // Create User Pool Domain
      const domain = this.userPool.addDomain('UserPoolDomain', {
        cognitoDomain: {
          domainPrefix: `homeforpup-${env}`,
        },
      });

      new cdk.CfnOutput(this, 'UserPoolDomain', {
        value: domain.domainName,
        exportName: `HomeForPup-UserPoolDomain-${env}`,
      });
    }

    // Output User Pool details
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      exportName: `HomeForPup-UserPoolId-${env}`,
    });

    new cdk.CfnOutput(this, 'UserPoolArn', {
      value: this.userPool.userPoolArn,
      exportName: `HomeForPup-UserPoolArn-${env}`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      exportName: `HomeForPup-UserPoolClientId-${env}`,
    });
  }
}

