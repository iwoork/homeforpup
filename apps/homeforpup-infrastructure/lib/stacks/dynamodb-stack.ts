import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { EnvironmentConfig } from '../config/environments';

export interface DynamoDBStackProps extends cdk.StackProps {
  config: EnvironmentConfig;
}

export class DynamoDBStack extends cdk.Stack {
  public readonly tables: { [key: string]: dynamodb.Table } = {};

  constructor(scope: Construct, id: string, props: DynamoDBStackProps) {
    super(scope, id, props);

    const { config } = props;
    const env = config.environment;

    // Profiles Table
    this.tables.profiles = new dynamodb.Table(this, 'ProfilesTable', {
      tableName: config.tables.profiles,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: env === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      stream: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      pointInTimeRecovery: env === 'production',
    });
    cdk.Tags.of(this.tables.profiles).add('Environment', env);
    cdk.Tags.of(this.tables.profiles).add('Application', 'HomeForPup');
    cdk.Tags.of(this.tables.profiles).add('Purpose', 'User-profiles-application-data-only');

    // Dogs Table
    this.tables.dogs = new dynamodb.Table(this, 'DogsTable', {
      tableName: config.tables.dogs,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: env === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: env === 'production',
    });
    cdk.Tags.of(this.tables.dogs).add('Environment', env);
    cdk.Tags.of(this.tables.dogs).add('Application', 'HomeForPup');
    cdk.Tags.of(this.tables.dogs).add('Purpose', 'Dog-listings');

    // BreederIndex GSI for Dogs
    this.tables.dogs.addGlobalSecondaryIndex({
      indexName: 'BreederIndex',
      partitionKey: { name: 'breederId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Kennels Table
    this.tables.kennels = new dynamodb.Table(this, 'KennelsTable', {
      tableName: config.tables.kennels,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: env === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: env === 'production',
    });
    cdk.Tags.of(this.tables.kennels).add('Environment', env);
    cdk.Tags.of(this.tables.kennels).add('Application', 'HomeForPup');
    cdk.Tags.of(this.tables.kennels).add('Purpose', 'Kennel-management');

    // CreatedByIndex GSI for Kennels
    this.tables.kennels.addGlobalSecondaryIndex({
      indexName: 'CreatedByIndex',
      partitionKey: { name: 'createdBy', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Litters Table
    this.tables.litters = new dynamodb.Table(this, 'LittersTable', {
      tableName: config.tables.litters,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: env === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: env === 'production',
    });
    cdk.Tags.of(this.tables.litters).add('Environment', env);
    cdk.Tags.of(this.tables.litters).add('Application', 'HomeForPup');
    cdk.Tags.of(this.tables.litters).add('Purpose', 'Litter-management');

    // BreederIndex GSI for Litters
    this.tables.litters.addGlobalSecondaryIndex({
      indexName: 'BreederIndex',
      partitionKey: { name: 'breederId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'expectedDate', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // StatusIndex GSI for Litters
    this.tables.litters.addGlobalSecondaryIndex({
      indexName: 'StatusIndex',
      partitionKey: { name: 'status', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'expectedDate', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Messages Table
    this.tables.messages = new dynamodb.Table(this, 'MessagesTable', {
      tableName: config.tables.messages,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: env === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: env === 'production',
    });
    cdk.Tags.of(this.tables.messages).add('Environment', env);
    cdk.Tags.of(this.tables.messages).add('Application', 'HomeForPup');
    cdk.Tags.of(this.tables.messages).add('Purpose', 'Messaging');

    // GSI1 for Messages
    this.tables.messages.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // GSI2 for Messages
    this.tables.messages.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Message Threads Table
    this.tables.messageThreads = new dynamodb.Table(this, 'MessageThreadsTable', {
      tableName: config.tables.messageThreads,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: env === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: env === 'production',
    });
    cdk.Tags.of(this.tables.messageThreads).add('Environment', env);
    cdk.Tags.of(this.tables.messageThreads).add('Application', 'HomeForPup');
    cdk.Tags.of(this.tables.messageThreads).add('Purpose', 'Message-threads');

    // GSI1 for Message Threads
    this.tables.messageThreads.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Favorites Table
    this.tables.favorites = new dynamodb.Table(this, 'FavoritesTable', {
      tableName: config.tables.favorites,
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'puppyId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: env === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: env === 'production',
    });
    cdk.Tags.of(this.tables.favorites).add('Environment', env);
    cdk.Tags.of(this.tables.favorites).add('Application', 'HomeForPup');
    cdk.Tags.of(this.tables.favorites).add('Purpose', 'User-favorites');

    // GSI1 for Favorites
    this.tables.favorites.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Activities Table
    this.tables.activities = new dynamodb.Table(this, 'ActivitiesTable', {
      tableName: config.tables.activities,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: env === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: env === 'production',
    });
    cdk.Tags.of(this.tables.activities).add('Environment', env);
    cdk.Tags.of(this.tables.activities).add('Application', 'HomeForPup');
    cdk.Tags.of(this.tables.activities).add('Purpose', 'User-activities');

    // userId-timestamp-index GSI for Activities
    this.tables.activities.addGlobalSecondaryIndex({
      indexName: 'userId-timestamp-index',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'timestamp', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // userId-type-index GSI for Activities
    this.tables.activities.addGlobalSecondaryIndex({
      indexName: 'userId-type-index',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'type', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // userId-category-index GSI for Activities
    this.tables.activities.addGlobalSecondaryIndex({
      indexName: 'userId-category-index',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'category', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Breeds Table
    this.tables.breeds = new dynamodb.Table(this, 'BreedsTable', {
      tableName: config.tables.breeds,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: env === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: env === 'production',
    });
    cdk.Tags.of(this.tables.breeds).add('Environment', env);
    cdk.Tags.of(this.tables.breeds).add('Application', 'HomeForPup');
    cdk.Tags.of(this.tables.breeds).add('Purpose', 'Dog-breeds');

    // Breeds Simple Table
    this.tables.breedsSimple = new dynamodb.Table(this, 'BreedsSimpleTable', {
      tableName: config.tables.breedsSimple,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: env === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: env === 'production',
    });
    cdk.Tags.of(this.tables.breedsSimple).add('Environment', env);
    cdk.Tags.of(this.tables.breedsSimple).add('Application', 'HomeForPup');
    cdk.Tags.of(this.tables.breedsSimple).add('Purpose', 'Dog-breeds-simple');

    // Veterinarians Table
    this.tables.veterinarians = new dynamodb.Table(this, 'VeterinariansTable', {
      tableName: config.tables.veterinarians,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: env === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: env === 'production',
    });
    cdk.Tags.of(this.tables.veterinarians).add('Environment', env);
    cdk.Tags.of(this.tables.veterinarians).add('Application', 'HomeForPup');
    cdk.Tags.of(this.tables.veterinarians).add('Purpose', 'Veterinarians');

    // OwnerIdIndex GSI for Veterinarians
    this.tables.veterinarians.addGlobalSecondaryIndex({
      indexName: 'OwnerIdIndex',
      partitionKey: { name: 'ownerId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'createdAt', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Vet Visits Table
    this.tables.vetVisits = new dynamodb.Table(this, 'VetVisitsTable', {
      tableName: config.tables.vetVisits,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: env === 'production' 
        ? cdk.RemovalPolicy.RETAIN 
        : cdk.RemovalPolicy.DESTROY,
      pointInTimeRecovery: env === 'production',
    });
    cdk.Tags.of(this.tables.vetVisits).add('Environment', env);
    cdk.Tags.of(this.tables.vetVisits).add('Application', 'HomeForPup');
    cdk.Tags.of(this.tables.vetVisits).add('Purpose', 'Vet-visits');

    // DogIdIndex GSI for Vet Visits
    this.tables.vetVisits.addGlobalSecondaryIndex({
      indexName: 'DogIdIndex',
      partitionKey: { name: 'dogId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'visitDate', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // OwnerIdIndex GSI for Vet Visits
    this.tables.vetVisits.addGlobalSecondaryIndex({
      indexName: 'OwnerIdIndex',
      partitionKey: { name: 'ownerId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'visitDate', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // Output table names
    Object.entries(this.tables).forEach(([key, table]) => {
      new cdk.CfnOutput(this, `${key}TableName`, {
        value: table.tableName,
        exportName: `HomeForPup-${key}Table-${env}`,
      });

      new cdk.CfnOutput(this, `${key}TableArn`, {
        value: table.tableArn,
        exportName: `HomeForPup-${key}TableArn-${env}`,
      });
    });
  }
}

