import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as wafv2 from 'aws-cdk-lib/aws-wafv2';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config/environments';
import { LambdaApi } from '../constructs/lambda-api';
import * as path from 'path';

export interface ApiStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
}

export class ApiStack extends cdk.Stack {
  public readonly api: apigateway.RestApi;
  public readonly authorizer: apigateway.CognitoUserPoolsAuthorizer;
  private readonly configValue: EnvironmentConfig;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { config } = props;
    this.configValue = config;

    // Import existing Cognito User Pool
    const userPool = cognito.UserPool.fromUserPoolArn(
      this,
      'UserPool',
      config.cognitoUserPoolArn
    );

    // Create API Gateway
    this.api = new apigateway.RestApi(this, 'Api', {
      restApiName: `homeforpup-api-${config.environment}`,
      description: `HomeForPup API (${config.environment})`,
      deployOptions: {
        stageName: config.environment,
        throttlingRateLimit: 1000,
        throttlingBurstLimit: 2000,
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: config.environment === 'development',
        metricsEnabled: true,
        tracingEnabled: config.features.xrayTracing,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: config.allowedOrigins,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        allowCredentials: true,
        maxAge: cdk.Duration.hours(1),
      },
      cloudWatchRole: true,
      endpointConfiguration: {
        types: [apigateway.EndpointType.REGIONAL],
      },
    });

    // Create Cognito Authorizer
    this.authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      'CognitoAuthorizer',
      {
        cognitoUserPools: [userPool],
        authorizerName: `homeforpup-authorizer-${config.environment}`,
        identitySource: 'method.request.header.Authorization',
      }
    );

    // Create API resources and routes
    this.createDogsApi();
    this.createUsersApi();
    this.createKennelsApi();
    this.createMessagesApi();
    this.createFavoritesApi();
    this.createActivitiesApi();
    this.createBreedsApi();

    // Add custom domain if configured
    if (config.apiDomainName && config.certificateArn) {
      this.addCustomDomain(config);
    }

    // Add WAF if enabled
    if (config.features.wafEnabled) {
      this.addWaf(config);
    }

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: this.api.url,
      description: 'API Gateway URL',
      exportName: `${config.environment}-api-url`,
    });

    new cdk.CfnOutput(this, 'ApiId', {
      value: this.api.restApiId,
      description: 'API Gateway ID',
      exportName: `${config.environment}-api-id`,
    });
  }

  private createDogsApi() {
    const { config } = this;
    const dogsResource = this.api.root.addResource('dogs');
    const dogIdResource = dogsResource.addResource('{id}');

    // GET /dogs - List dogs
    const listDogsFunction = new LambdaApi(this, 'ListDogsFunction', {
      functionName: 'list-dogs',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/dogs/list'),
      config,
      environment: {
        DOGS_TABLE: config.tables.dogs,
      },
    });
    listDogsFunction.grantDynamoDBAccess([
      config.tables.dogs,
    ]);

    dogsResource.addMethod('GET', listDogsFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // GET /dogs/{id} - Get dog by ID
    const getDogFunction = new LambdaApi(this, 'GetDogFunction', {
      functionName: 'get-dog',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/dogs/get'),
      config,
      environment: {
        DOGS_TABLE: config.tables.dogs,
      },
    });
    getDogFunction.grantDynamoDBAccess([
      config.tables.dogs,
    ]);

    dogIdResource.addMethod('GET', getDogFunction.createIntegration());

    // POST /dogs - Create dog
    const createDogFunction = new LambdaApi(this, 'CreateDogFunction', {
      functionName: 'create-dog',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/dogs/create'),
      config,
      environment: {
        DOGS_TABLE: config.tables.dogs,
      },
    });
    createDogFunction.grantDynamoDBAccess([
      config.tables.dogs,
    ]);

    dogsResource.addMethod('POST', createDogFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // PUT /dogs/{id} - Update dog
    const updateDogFunction = new LambdaApi(this, 'UpdateDogFunction', {
      functionName: 'update-dog',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/dogs/update'),
      config,
      environment: {
        DOGS_TABLE: config.tables.dogs,
      },
    });
    updateDogFunction.grantDynamoDBAccess([
      config.tables.dogs,
    ]);

    dogIdResource.addMethod('PUT', updateDogFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // DELETE /dogs/{id} - Delete dog
    const deleteDogFunction = new LambdaApi(this, 'DeleteDogFunction', {
      functionName: 'delete-dog',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/dogs/delete'),
      config,
      environment: {
        DOGS_TABLE: config.tables.dogs,
      },
    });
    deleteDogFunction.grantDynamoDBAccess([
      config.tables.dogs,
    ]);

    dogIdResource.addMethod('DELETE', deleteDogFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
  }

  private createUsersApi() {
    const { config } = this;
    const usersResource = this.api.root.addResource('users');
    const userIdResource = usersResource.addResource('{id}');

    // GET /users/{id} - Get user profile
    const getUserFunction = new LambdaApi(this, 'GetUserFunction', {
      functionName: 'get-user',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/users/get'),
      config,
      environment: {
        USERS_TABLE: config.tables.users,
      },
    });
    getUserFunction.grantDynamoDBAccess([
      config.tables.users,
    ]);

    userIdResource.addMethod('GET', getUserFunction.createIntegration());

    // PUT /users/{id} - Update user profile
    const updateUserFunction = new LambdaApi(this, 'UpdateUserFunction', {
      functionName: 'update-user',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/users/update'),
      config,
      environment: {
        USERS_TABLE: config.tables.users,
      },
    });
    updateUserFunction.grantDynamoDBAccess([
      config.tables.users,
    ]);

    userIdResource.addMethod('PUT', updateUserFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
  }

  private createKennelsApi() {
    const kennelsResource = this.api.root.addResource('kennels');
    // Add kennel routes here
  }

  private createMessagesApi() {
    const messagesResource = this.api.root.addResource('messages');
    // Add message routes here
  }

  private createFavoritesApi() {
    const favoritesResource = this.api.root.addResource('favorites');
    // Add favorites routes here
  }

  private createActivitiesApi() {
    const activitiesResource = this.api.root.addResource('activities');
    // Add activities routes here
  }

  private createBreedsApi() {
    const { config } = this;
    const breedsResource = this.api.root.addResource('breeds');
    
    // GET /breeds - List breeds
    const listBreedsFunction = new LambdaApi(this, 'ListBreedsFunction', {
      functionName: 'list-breeds',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/breeds/list'),
      config,
      environment: {
        BREEDS_TABLE: config.tables.breeds,
      },
    });
    listBreedsFunction.grantDynamoDBAccess([
      config.tables.breeds,
    ]);

    breedsResource.addMethod('GET', listBreedsFunction.createIntegration());
  }

  private addCustomDomain(config: EnvironmentConfig) {
    if (!config.apiDomainName || !config.certificateArn) {
      console.warn('Custom domain not configured - skipping');
      return;
    }

    // Import ACM certificate
    const certificate = certificatemanager.Certificate.fromCertificateArn(
      this,
      'Certificate',
      config.certificateArn
    );

    // Create custom domain
    const domain = new apigateway.DomainName(this, 'CustomDomain', {
      domainName: config.apiDomainName,
      certificate,
      endpointType: apigateway.EndpointType.REGIONAL,
      securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
    });

    // Map domain to API
    new apigateway.BasePathMapping(this, 'BasePathMapping', {
      domainName: domain,
      restApi: this.api,
      stage: this.api.deploymentStage,
    });

    // Output custom domain info
    new cdk.CfnOutput(this, 'CustomDomainName', {
      value: domain.domainName,
      description: 'Custom API domain name',
      exportName: `${config.environment}-custom-domain`,
    });

    new cdk.CfnOutput(this, 'CustomDomainTarget', {
      value: domain.domainNameAliasDomainName,
      description: 'Target for DNS CNAME/Alias record',
      exportName: `${config.environment}-domain-target`,
    });

    console.log(`✅ Custom domain configured: ${config.apiDomainName}`);
    console.log(`   Point your DNS to: ${domain.domainNameAliasDomainName}`);
  }

  private addWaf(config: EnvironmentConfig) {
    // WAF configuration would go here
    // This adds DDoS protection and rate limiting
  }

  private get config(): EnvironmentConfig {
    return (this as any).configValue;
  }
}

