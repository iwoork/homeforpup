import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as certificatemanager from 'aws-cdk-lib/aws-certificatemanager';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
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
  public readonly authorizer: apigateway.TokenAuthorizer;
  private readonly configValue: EnvironmentConfig;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { config } = props;
    this.configValue = config;

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

    // Create Clerk authorizer Lambda
    const clerkAuthorizerFn = new lambda.Function(this, 'ClerkAuthorizerFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../../dist/functions/auth/clerk-authorizer')),
      environment: {
        CLERK_SECRET_KEY: config.clerkSecretKey,
      },
      timeout: cdk.Duration.seconds(10),
    });

    // Create Lambda Token Authorizer
    this.authorizer = new apigateway.TokenAuthorizer(this, 'ClerkAuthorizer', {
      handler: clerkAuthorizerFn,
      identitySource: 'method.request.header.Authorization',
      resultsCacheTtl: cdk.Duration.minutes(5),
    });

    new cdk.CfnOutput(this, 'AuthorizerId', {
      value: this.authorizer.authorizerId,
      description: 'Clerk Authorizer ID (for debugging)',
    });

    // Create API resources and routes
    // All Lambda functions now use DATABASE_URL (injected by LambdaApi construct)
    this.createDogsApi();
    this.createProfilesApi();
    this.createKennelsApi();
    this.createLittersApi();
    this.createVetVisitsApi();
    this.createVeterinariansApi();
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

    const listDogsFunction = new LambdaApi(this, 'ListDogsFunction', {
      functionName: 'list-dogs',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/dogs/list'),
      config,
    });
    dogsResource.addMethod('GET', listDogsFunction.createIntegration());

    const getDogFunction = new LambdaApi(this, 'GetDogFunction', {
      functionName: 'get-dog',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/dogs/get'),
      config,
    });
    dogIdResource.addMethod('GET', getDogFunction.createIntegration());

    const createDogFunction = new LambdaApi(this, 'CreateDogFunction', {
      functionName: 'create-dog',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/dogs/create'),
      config,
    });
    dogsResource.addMethod('POST', createDogFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const updateDogFunction = new LambdaApi(this, 'UpdateDogFunction', {
      functionName: 'update-dog',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/dogs/update'),
      config,
    });
    dogIdResource.addMethod('PUT', updateDogFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const deleteDogFunction = new LambdaApi(this, 'DeleteDogFunction', {
      functionName: 'delete-dog',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/dogs/delete'),
      config,
    });
    dogIdResource.addMethod('DELETE', deleteDogFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });
  }

  private createProfilesApi() {
    const { config } = this;
    const profilesResource = this.api.root.addResource('profiles');
    const profileIdResource = profilesResource.addResource('{id}');

    const getProfileFunction = new LambdaApi(this, 'GetProfileFunction', {
      functionName: 'get-profile',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/profiles/get'),
      config,
    });
    profileIdResource.addMethod('GET', getProfileFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const updateProfileFunction = new LambdaApi(this, 'UpdateProfileFunction', {
      functionName: 'update-profile',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/profiles/update'),
      config,
    });
    profileIdResource.addMethod('PUT', updateProfileFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });
  }

  private createKennelsApi() {
    const { config } = this;
    const kennelsResource = this.api.root.addResource('kennels');
    const kennelIdResource = kennelsResource.addResource('{id}');

    const listKennelsFunction = new LambdaApi(this, 'ListKennelsFunction', {
      functionName: 'list-kennels',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/kennels/list'),
      config,
    });
    kennelsResource.addMethod('GET', listKennelsFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const getKennelFunction = new LambdaApi(this, 'GetKennelFunction', {
      functionName: 'get-kennel',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/kennels/get'),
      config,
    });
    kennelIdResource.addMethod('GET', getKennelFunction.createIntegration());

    const createKennelFunction = new LambdaApi(this, 'CreateKennelFunction', {
      functionName: 'create-kennel',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/kennels/create'),
      config,
    });
    kennelsResource.addMethod('POST', createKennelFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const updateKennelFunction = new LambdaApi(this, 'UpdateKennelFunction', {
      functionName: 'update-kennel',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/kennels/update'),
      config,
    });
    kennelIdResource.addMethod('PUT', updateKennelFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const deleteKennelFunction = new LambdaApi(this, 'DeleteKennelFunction', {
      functionName: 'delete-kennel',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/kennels/delete'),
      config,
    });
    kennelIdResource.addMethod('DELETE', deleteKennelFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });
  }

  private createLittersApi() {
    const { config } = this;
    const littersResource = this.api.root.addResource('litters');
    const litterIdResource = littersResource.addResource('{id}');

    const listLittersFunction = new LambdaApi(this, 'ListLittersFunction', {
      functionName: 'list-litters',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/litters/list'),
      config,
    });
    littersResource.addMethod('GET', listLittersFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const getLitterFunction = new LambdaApi(this, 'GetLitterFunction', {
      functionName: 'get-litter',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/litters/get'),
      config,
    });
    litterIdResource.addMethod('GET', getLitterFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const createLitterFunction = new LambdaApi(this, 'CreateLitterFunction', {
      functionName: 'create-litter',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/litters/create'),
      config,
    });
    littersResource.addMethod('POST', createLitterFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const updateLitterFunction = new LambdaApi(this, 'UpdateLitterFunction', {
      functionName: 'update-litter',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/litters/update'),
      config,
    });
    litterIdResource.addMethod('PUT', updateLitterFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const deleteLitterFunction = new LambdaApi(this, 'DeleteLitterFunction', {
      functionName: 'delete-litter',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/litters/delete'),
      config,
    });
    litterIdResource.addMethod('DELETE', deleteLitterFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });
  }

  private createVetVisitsApi() {
    const { config } = this;
    const vetVisitsResource = this.api.root.addResource('vet-visits');
    const vetVisitIdResource = vetVisitsResource.addResource('{id}');

    const listVetVisitsFunction = new LambdaApi(this, 'ListVetVisitsFunction', {
      functionName: 'list-vet-visits',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/vet-visits/list'),
      config,
    });
    vetVisitsResource.addMethod('GET', listVetVisitsFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const createVetVisitFunction = new LambdaApi(this, 'CreateVetVisitFunction', {
      functionName: 'create-vet-visit',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/vet-visits/create'),
      config,
    });
    vetVisitsResource.addMethod('POST', createVetVisitFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const getVetVisitFunction = new LambdaApi(this, 'GetVetVisitFunction', {
      functionName: 'get-vet-visit',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/vet-visits/get'),
      config,
    });
    vetVisitIdResource.addMethod('GET', getVetVisitFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const updateVetVisitFunction = new LambdaApi(this, 'UpdateVetVisitFunction', {
      functionName: 'update-vet-visit',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/vet-visits/update'),
      config,
    });
    vetVisitIdResource.addMethod('PUT', updateVetVisitFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const deleteVetVisitFunction = new LambdaApi(this, 'DeleteVetVisitFunction', {
      functionName: 'delete-vet-visit',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/vet-visits/delete'),
      config,
    });
    vetVisitIdResource.addMethod('DELETE', deleteVetVisitFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });
  }

  private createVeterinariansApi() {
    const { config } = this;
    const veterinariansResource = this.api.root.addResource('veterinarians');
    const veterinarianIdResource = veterinariansResource.addResource('{id}');

    const listVeterinariansFunction = new LambdaApi(this, 'ListVeterinariansFunction', {
      functionName: 'list-veterinarians',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/veterinarians/list'),
      config,
    });
    veterinariansResource.addMethod('GET', listVeterinariansFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const createVeterinarianFunction = new LambdaApi(this, 'CreateVeterinarianFunction', {
      functionName: 'create-veterinarian',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/veterinarians/create'),
      config,
    });
    veterinariansResource.addMethod('POST', createVeterinarianFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const getVeterinarianFunction = new LambdaApi(this, 'GetVeterinarianFunction', {
      functionName: 'get-veterinarian',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/veterinarians/get'),
      config,
    });
    veterinarianIdResource.addMethod('GET', getVeterinarianFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const updateVeterinarianFunction = new LambdaApi(this, 'UpdateVeterinarianFunction', {
      functionName: 'update-veterinarian',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/veterinarians/update'),
      config,
    });
    veterinarianIdResource.addMethod('PUT', updateVeterinarianFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const deleteVeterinarianFunction = new LambdaApi(this, 'DeleteVeterinarianFunction', {
      functionName: 'delete-veterinarian',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/veterinarians/delete'),
      config,
    });
    veterinarianIdResource.addMethod('DELETE', deleteVeterinarianFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });
  }

  private createMessagesApi() {
    const { config } = this;
    const messagesResource = this.api.root.addResource('messages');

    const sendMessageFunction = new LambdaApi(this, 'SendMessageFunction', {
      functionName: 'send-message',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/messages/send'),
      config,
    });
    const sendResource = messagesResource.addResource('send');
    sendResource.addMethod('POST', sendMessageFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const replyMessageFunction = new LambdaApi(this, 'ReplyMessageFunction', {
      functionName: 'reply-message',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/messages/reply'),
      config,
    });
    const replyResource = messagesResource.addResource('reply');
    replyResource.addMethod('POST', replyMessageFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const threadsResource = messagesResource.addResource('threads');

    const listThreadsFunction = new LambdaApi(this, 'ListThreadsFunction', {
      functionName: 'list-threads',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/messages/threads/list'),
      config,
    });
    threadsResource.addMethod('GET', listThreadsFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const threadIdResource = threadsResource.addResource('{threadId}');
    const threadMessagesResource = threadIdResource.addResource('messages');

    const getThreadMessagesFunction = new LambdaApi(this, 'GetThreadMessagesFunction', {
      functionName: 'get-thread-messages',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/messages/threads/messages'),
      config,
    });
    threadMessagesResource.addMethod('GET', getThreadMessagesFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });

    const readResource = threadIdResource.addResource('read');

    const markThreadReadFunction = new LambdaApi(this, 'MarkThreadReadFunction', {
      functionName: 'mark-thread-read',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/messages/threads/read'),
      config,
    });
    readResource.addMethod('PATCH', markThreadReadFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });
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

    const listBreedsFunction = new LambdaApi(this, 'ListBreedsFunction', {
      functionName: 'list-breeds',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/breeds/list'),
      config,
    });
    breedsResource.addMethod('GET', listBreedsFunction.createIntegration());
  }

  private createPhotosApi() {
    const { config } = this;
    const photosResource = this.api.root.addResource('photos');
    const uploadUrlResource = photosResource.addResource('upload-url');

    const getUploadUrlFunction = new LambdaApi(this, 'GetUploadUrlFunction', {
      functionName: 'get-upload-url',
      handler: 'index.handler',
      entry: path.join(__dirname, '../../src/functions/photos/upload-url'),
      config,
      environment: {
        PHOTOS_BUCKET: config.photosBucket || 'homeforpup-images',
      },
    });

    getUploadUrlFunction.function.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject', 's3:PutObjectAcl'],
        resources: [`arn:aws:s3:::${config.photosBucket || 'homeforpup-images'}/*`],
      })
    );

    uploadUrlResource.addMethod('POST', getUploadUrlFunction.createIntegration(), {
      authorizer: this.authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
    });
  }

  private addCustomDomain(config: EnvironmentConfig) {
    if (!config.apiDomainName || !config.certificateArn) return;

    const certificate = certificatemanager.Certificate.fromCertificateArn(
      this, 'Certificate', config.certificateArn
    );

    const domain = new apigateway.DomainName(this, 'CustomDomain', {
      domainName: config.apiDomainName,
      certificate,
      endpointType: apigateway.EndpointType.REGIONAL,
      securityPolicy: apigateway.SecurityPolicy.TLS_1_2,
    });

    new apigateway.BasePathMapping(this, 'BasePathMapping', {
      domainName: domain,
      restApi: this.api,
      stage: this.api.deploymentStage,
    });

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
  }

  private addWaf(config: EnvironmentConfig) {
    // WAF configuration would go here
  }

  private get config(): EnvironmentConfig {
    return (this as any).configValue;
  }
}
