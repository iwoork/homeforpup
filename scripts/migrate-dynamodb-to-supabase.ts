/**
 * DynamoDB → Supabase PostgreSQL Migration Script
 *
 * Usage:
 *   npx tsx scripts/migrate-dynamodb-to-supabase.ts
 *
 * Required env vars:
 *   AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 *   DATABASE_URL (Supabase pooler connection string)
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../packages/database/src/schema';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const AWS_REGION = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const dynamoClient = new DynamoDBClient({ region: AWS_REGION });
const dynamodb = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: { removeUndefinedValues: true },
  unmarshallOptions: { wrapNumbers: false },
});

const pgClient = postgres(DATABASE_URL, { max: 5 });
const db = drizzle(pgClient, { schema });

const BATCH_SIZE = 100;

// ---------------------------------------------------------------------------
// DynamoDB table → PostgreSQL table mapping
// ---------------------------------------------------------------------------

interface TableMapping {
  dynamoTable: string;
  pgTable: any;
  mapRow: (item: any) => any;
}

const tableMappings: TableMapping[] = [
  {
    dynamoTable: 'homeforpup-profiles',
    pgTable: schema.profiles,
    mapRow: (item) => ({
      userId: item.userId,
      email: item.email || '',
      name: item.name || item.displayName || '',
      displayName: item.displayName,
      firstName: item.firstName,
      lastName: item.lastName,
      phone: item.phone,
      location: item.location,
      profileImage: item.profileImage,
      bio: item.bio,
      coordinates: item.coordinates,
      coverPhoto: item.coverPhoto,
      galleryPhotos: item.galleryPhotos,
      verified: item.verified ?? false,
      accountStatus: item.accountStatus || 'active',
      isPremium: item.isPremium,
      subscriptionPlan: item.subscriptionPlan,
      subscriptionStatus: item.subscriptionStatus,
      subscriptionStartDate: item.subscriptionStartDate,
      subscriptionEndDate: item.subscriptionEndDate,
      stripeCustomerId: item.stripeCustomerId,
      stripeSubscriptionId: item.stripeSubscriptionId,
      preferences: item.preferences,
      breederInfo: item.breederInfo,
      puppyParentInfo: item.puppyParentInfo || item.dogParentInfo,
      socialLinks: item.socialLinks,
      userType: item.userType,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
      lastActiveAt: item.lastActiveAt,
      profileViews: item.profileViews,
    }),
  },
  {
    dynamoTable: 'homeforpup-dogs',
    pgTable: schema.dogs,
    mapRow: (item) => ({
      id: item.id,
      ownerId: item.ownerId || item.breederId || '',
      kennelId: item.kennelId,
      name: item.name,
      callName: item.callName,
      breed: item.breed,
      gender: item.gender,
      birthDate: item.birthDate,
      weight: item.weight,
      color: item.color || '',
      photoUrl: item.photoUrl,
      photoGallery: item.photoGallery,
      lifeEvents: item.lifeEvents,
      healthTests: item.healthTests,
      pedigree: item.pedigree,
      description: item.description,
      height: item.height,
      eyeColor: item.eyeColor,
      markings: item.markings,
      temperament: item.temperament,
      specialNeeds: item.specialNeeds,
      notes: item.notes,
      sireId: item.sireId,
      damId: item.damId,
      sireName: item.sireName,
      damName: item.damName,
      breedingStatus: item.breedingStatus || 'not_ready',
      healthStatus: item.healthStatus || 'good',
      dogType: item.dogType || item.type || 'puppy',
      status: item.status,
      litterId: item.litterId,
      litterPosition: item.litterPosition,
      health: item.health,
      breeding: item.breeding,
      photos: item.photos,
      videos: item.videos,
      veterinaryVisits: item.veterinaryVisits,
      trainingRecords: item.trainingRecords,
      pedigreeInfo: item.pedigreeInfo,
      registrationNumber: item.registrationNumber,
      microchipNumber: item.microchipNumber,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }),
  },
  {
    dynamoTable: 'homeforpup-kennels',
    pgTable: schema.kennels,
    mapRow: (item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      businessName: item.businessName,
      website: item.website,
      phone: item.phone,
      email: item.email,
      address: item.address,
      facilities: item.facilities,
      capacity: item.capacity,
      owners: item.owners || [],
      managers: item.managers || [],
      createdBy: item.createdBy || item.ownerId || '',
      status: item.status || 'active',
      verified: item.verified ?? false,
      verificationDate: item.verificationDate,
      ownerId: item.ownerId,
      specialties: item.specialties,
      establishedDate: item.establishedDate,
      licenseNumber: item.licenseNumber,
      businessType: item.businessType,
      photoUrl: item.photoUrl,
      coverPhoto: item.coverPhoto,
      galleryPhotos: item.galleryPhotos,
      isActive: item.isActive ?? true,
      isPublic: item.isPublic ?? true,
      socialLinks: item.socialLinks,
      totalLitters: item.totalLitters,
      totalDogs: item.totalDogs,
      averageLitterSize: item.averageLitterSize,
      photos: item.photos,
      videos: item.videos,
      certifications: item.certifications,
      awards: item.awards,
      socialMedia: item.socialMedia,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }),
  },
  {
    dynamoTable: 'homeforpup-litters',
    pgTable: schema.litters,
    mapRow: (item) => ({
      id: item.id,
      breederId: item.breederId || '',
      kennelId: item.kennelId,
      name: item.name,
      breed: item.breed || '',
      sireId: item.sireId || '',
      damId: item.damId || '',
      sireName: item.sireName,
      damName: item.damName,
      breedingDate: item.breedingDate,
      expectedDate: item.expectedDate,
      birthDate: item.birthDate,
      season: item.season,
      puppyCount: item.puppyCount,
      maleCount: item.maleCount,
      femaleCount: item.femaleCount,
      availablePuppies: item.availablePuppies,
      expectedPuppyCount: item.expectedPuppyCount,
      actualPuppyCount: item.actualPuppyCount,
      description: item.description,
      photos: item.photos,
      status: item.status || 'planned',
      priceRange: item.priceRange,
      healthClearances: item.healthClearances,
      health: item.health,
      puppies: item.puppies,
      notes: item.notes,
      specialInstructions: item.specialInstructions,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }),
  },
  {
    dynamoTable: 'homeforpup-messages',
    pgTable: schema.messages,
    mapRow: (item) => {
      // DynamoDB uses PK/SK pattern: PK=MSG#<id>, SK=MSG#<id>
      // Extract the actual message id
      const id = item.id || (item.PK?.replace('MSG#', '') ?? item.SK?.replace('MSG#', ''));
      return {
        id,
        threadId: item.threadId || item.GSI1PK?.replace('THREAD#', '') || '',
        senderId: item.senderId || '',
        senderName: item.senderName || '',
        senderAvatar: item.senderAvatar,
        receiverId: item.receiverId || '',
        receiverName: item.receiverName,
        subject: item.subject,
        content: item.content || '',
        timestamp: item.timestamp || item.createdAt || new Date().toISOString(),
        read: item.read ?? false,
        messageType: item.messageType || 'general',
        attachments: item.attachments,
        replyTo: item.replyTo,
        createdAt: item.createdAt,
      };
    },
  },
  {
    dynamoTable: 'homeforpup-message-threads',
    pgTable: schema.messageThreads,
    mapRow: (item) => {
      // Filter: only migrate main thread records (not participant records)
      // Main threads have PK=THREAD#<id> without SK or with SK=METADATA
      if (item.PK && item.PK.startsWith('THREAD#') && (!item.SK || item.SK === 'METADATA' || item.SK === item.PK)) {
        const id = item.id || item.PK.replace('THREAD#', '');
        return {
          id,
          subject: item.subject,
          participants: item.participants || [],
          participantNames: item.participantNames,
          participantInfo: item.participantInfo,
          lastMessage: item.lastMessage,
          messageCount: item.messageCount || 0,
          unreadCount: item.unreadCount || {},
          createdAt: item.createdAt || new Date().toISOString(),
          updatedAt: item.updatedAt || new Date().toISOString(),
        };
      }
      // Skip participant records (they were GSI projections)
      return null;
    },
  },
  {
    dynamoTable: 'homeforpup-favorites',
    pgTable: schema.favorites,
    mapRow: (item) => ({
      userId: item.userId,
      puppyId: item.puppyId,
      puppyData: item.puppyData,
      createdAt: item.createdAt || new Date().toISOString(),
    }),
  },
  {
    dynamoTable: 'homeforpup-activities',
    pgTable: schema.activities,
    mapRow: (item) => ({
      id: item.id,
      userId: item.userId,
      type: item.type,
      title: item.title || '',
      description: item.description || '',
      metadata: item.metadata,
      timestamp: item.timestamp || item.createdAt || new Date().toISOString(),
      read: item.read ?? false,
      priority: item.priority || 'low',
      category: item.category || 'system',
    }),
  },
  {
    dynamoTable: 'homeforpup-breeds',
    pgTable: schema.breeds,
    mapRow: (item) => ({
      id: item.id,
      name: item.name,
      breedGroup: item.breedGroup || item.breed_group,
      sizeCategory: item.sizeCategory || item.size_category,
      breedType: item.breedType || item.breed_type,
      description: item.description,
      temperament: item.temperament,
      lifeSpan: item.lifeSpan || item.life_span,
      weight: item.weight,
      height: item.height,
      origin: item.origin,
      imageUrl: item.imageUrl || item.image_url,
      characteristics: item.characteristics,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }),
  },
  {
    dynamoTable: 'homeforpup-breeds-simple',
    pgTable: schema.breedsSimple,
    mapRow: (item) => ({
      id: String(item.id),
      name: item.name,
      altNames: item.alt_names || item.altNames,
      breedGroup: item.breed_group || item.breedGroup,
      sizeCategory: item.size_category || item.sizeCategory,
      breedType: item.breed_type || item.breedType,
      hybrid: item.hybrid,
      live: item.live,
      coverPhotoUrl: item.cover_photo_url || item.coverPhotoUrl,
      searchTerms: item.search_terms || item.searchTerms,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }),
  },
  {
    dynamoTable: 'homeforpup-veterinarians',
    pgTable: schema.veterinarians,
    mapRow: (item) => ({
      id: item.id,
      ownerId: item.ownerId || '',
      name: item.name || '',
      clinic: item.clinic || '',
      phone: item.phone,
      email: item.email,
      address: item.address,
      city: item.city,
      state: item.state,
      zipCode: item.zipCode,
      country: item.country,
      specialties: item.specialties,
      notes: item.notes,
      isActive: item.isActive ?? true,
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }),
  },
  {
    dynamoTable: 'homeforpup-vet-visits',
    pgTable: schema.vetVisits,
    mapRow: (item) => ({
      id: item.id,
      dogId: item.dogId || '',
      ownerId: item.ownerId || '',
      kennelId: item.kennelId,
      visitDate: item.visitDate || '',
      vetName: item.vetName || '',
      vetClinic: item.vetClinic || '',
      visitType: item.visitType || 'routine',
      reason: item.reason || '',
      diagnosis: item.diagnosis,
      treatment: item.treatment,
      medications: item.medications,
      weight: item.weight,
      temperature: item.temperature,
      followUpRequired: item.followUpRequired ?? false,
      followUpDate: item.followUpDate,
      followUpNotes: item.followUpNotes,
      cost: item.cost,
      currency: item.currency || 'USD',
      paid: item.paid ?? false,
      documents: item.documents,
      notes: item.notes,
      status: item.status || 'completed',
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: item.updatedAt || new Date().toISOString(),
    }),
  },
];

// ---------------------------------------------------------------------------
// Scan entire DynamoDB table (handles pagination)
// ---------------------------------------------------------------------------

async function scanFullTable(tableName: string): Promise<any[]> {
  const items: any[] = [];
  let lastKey: any = undefined;

  do {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastKey,
      })
    );
    if (result.Items) items.push(...result.Items);
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return items;
}

// ---------------------------------------------------------------------------
// Insert rows in batches
// ---------------------------------------------------------------------------

async function batchInsert(pgTable: any, rows: any[]) {
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    try {
      await db.insert(pgTable).values(batch).onConflictDoNothing();
    } catch (err) {
      console.error(`  Batch insert error at offset ${i}:`, err);
      // Try inserting one-by-one for this batch to identify the bad row
      for (const row of batch) {
        try {
          await db.insert(pgTable).values(row).onConflictDoNothing();
        } catch (rowErr) {
          console.error(`  Row insert error:`, rowErr, JSON.stringify(row).slice(0, 200));
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main migration
// ---------------------------------------------------------------------------

async function migrate() {
  console.log('=== DynamoDB → Supabase PostgreSQL Migration ===\n');

  for (const mapping of tableMappings) {
    console.log(`Migrating: ${mapping.dynamoTable}`);

    try {
      const items = await scanFullTable(mapping.dynamoTable);
      console.log(`  Scanned ${items.length} items from DynamoDB`);

      const rows = items
        .map(mapping.mapRow)
        .filter((row: any) => row !== null); // Filter out skipped records (e.g. participant thread records)

      console.log(`  Mapped ${rows.length} rows for PostgreSQL`);

      if (rows.length > 0) {
        await batchInsert(mapping.pgTable, rows);
        console.log(`  Inserted ${rows.length} rows into PostgreSQL`);
      }
    } catch (err) {
      console.error(`  ERROR migrating ${mapping.dynamoTable}:`, err);
    }

    console.log('');
  }

  console.log('=== Migration complete ===');
  await pgClient.end();
}

migrate().catch((err) => {
  console.error('Fatal migration error:', err);
  process.exit(1);
});
