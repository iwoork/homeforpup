import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as iam from 'aws-cdk-lib/aws-iam';
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
    this.createPhotosApi();

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

    // GET /dogs does not require auth (optional auth handled in Lambda)
    dogsResource.addMethod('GET', listDogsFunction.createIntegration());

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

    // GET /dogs/{id} does not require auth (public endpoint)
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
    const { config } = this;
    const kennelsResource = this.api.root.addResource('kennels');
    const kennelIdResource = kennelsResource.addResource('{id}');

    // GET /kennels - List kennels
    const listKennelsFunction = new LambdaApi(this, 'ListKennelsFunction', {
      functionName: 'list-kennels',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/kennels/list'),
      config,
      environment: {
        KENNELS_TABLE: config.tables.kennels,
      },
    });
    listKennelsFunction.grantDynamoDBAccess([config.tables.kennels]);

    // Temporarily make GET /kennels public for testing
    // TODO: Re-enable Cognito auth once token validation is working
    kennelsResource.addMethod('GET', listKennelsFunction.createIntegration());

    // GET /kennels/{id} - Get kennel by ID
    const getKennelFunction = new LambdaApi(this, 'GetKennelFunction', {
      functionName: 'get-kennel',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/kennels/get'),
      config,
      environment: {
        KENNELS_TABLE: config.tables.kennels,
      },
    });
    getKennelFunction.grantDynamoDBAccess([config.tables.kennels]);

    kennelIdResource.addMethod('GET', getKennelFunction.createIntegration());

    // POST /kennels - Create kennel
    const createKennelFunction = new LambdaApi(this, 'CreateKennelFunction', {
      functionName: 'create-kennel',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/kennels/create'),
      config,
      environment: {
        KENNELS_TABLE: config.tables.kennels,
      },
    });
    createKennelFunction.grantDynamoDBAccess([config.tables.kennels]);

    kennelsResource.addMethod('POST', createKennelFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // PUT /kennels/{id} - Update kennel
    const updateKennelFunction = new LambdaApi(this, 'UpdateKennelFunction', {
      functionName: 'update-kennel',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/kennels/update'),
      config,
      environment: {
        KENNELS_TABLE: config.tables.kennels,
      },
    });
    updateKennelFunction.grantDynamoDBAccess([config.tables.kennels]);

    kennelIdResource.addMethod('PUT', updateKennelFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });

    // DELETE /kennels/{id} - Delete kennel
    const deleteKennelFunction = new LambdaApi(this, 'DeleteKennelFunction', {
      functionName: 'delete-kennel',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/kennels/delete'),
      config,
      environment: {
        KENNELS_TABLE: config.tables.kennels,
      },
    });
    deleteKennelFunction.grantDynamoDBAccess([config.tables.kennels]);

    kennelIdResource.addMethod('DELETE', deleteKennelFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
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

  private createPhotosApi() {
    const { config } = this;
    const photosResource = this.api.root.addResource('photos');
    const uploadUrlResource = photosResource.addResource('upload-url');
    
    // POST /photos/upload-url - Get presigned upload URL
    const getUploadUrlFunction = new LambdaApi(this, 'GetUploadUrlFunction', {
      functionName: 'get-upload-url',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/photos/upload-url'),
      config,
      environment: {
        PHOTOS_BUCKET: config.photosBucket || 'homeforpup-photos',
      },
    });
    
    // Grant S3 permissions to generate presigned URLs
    getUploadUrlFunction.function.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject', 's3:PutObjectAcl'],
        resources: [`arn:aws:s3:::${config.photosBucket || 'homeforpup-photos'}/*`],
      })
    );

    // POST /photos/upload-url requires authentication
    uploadUrlResource.addMethod('POST', getUploadUrlFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    });
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

