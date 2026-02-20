/**
 * Verify DynamoDB → Supabase PostgreSQL Migration
 *
 * Compares row counts and spot-checks random records between DynamoDB and PostgreSQL.
 *
 * Usage:
 *   npx tsx scripts/verify-migration.ts
 *
 * Required env vars:
 *   AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
 *   DATABASE_URL (Supabase pooler connection string)
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';

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
const db = drizzle(pgClient);

// ---------------------------------------------------------------------------
// Tables to verify
// ---------------------------------------------------------------------------

interface TableVerification {
  dynamoTable: string;
  pgTableName: string;
  dynamoPK: string;
  pgPK: string;
}

const tables: TableVerification[] = [
  { dynamoTable: 'homeforpup-profiles', pgTableName: 'profiles', dynamoPK: 'userId', pgPK: 'user_id' },
  { dynamoTable: 'homeforpup-dogs', pgTableName: 'dogs', dynamoPK: 'id', pgPK: 'id' },
  { dynamoTable: 'homeforpup-kennels', pgTableName: 'kennels', dynamoPK: 'id', pgPK: 'id' },
  { dynamoTable: 'homeforpup-litters', pgTableName: 'litters', dynamoPK: 'id', pgPK: 'id' },
  { dynamoTable: 'homeforpup-messages', pgTableName: 'messages', dynamoPK: 'id', pgPK: 'id' },
  { dynamoTable: 'homeforpup-message-threads', pgTableName: 'message_threads', dynamoPK: 'PK', pgPK: 'id' },
  { dynamoTable: 'homeforpup-favorites', pgTableName: 'favorites', dynamoPK: 'userId', pgPK: 'user_id' },
  { dynamoTable: 'homeforpup-activities', pgTableName: 'activities', dynamoPK: 'id', pgPK: 'id' },
  { dynamoTable: 'homeforpup-breeds', pgTableName: 'breeds', dynamoPK: 'id', pgPK: 'id' },
  { dynamoTable: 'homeforpup-breeds-simple', pgTableName: 'breeds_simple', dynamoPK: 'id', pgPK: 'id' },
  { dynamoTable: 'homeforpup-veterinarians', pgTableName: 'veterinarians', dynamoPK: 'id', pgPK: 'id' },
  { dynamoTable: 'homeforpup-vet-visits', pgTableName: 'vet_visits', dynamoPK: 'id', pgPK: 'id' },
];

// ---------------------------------------------------------------------------
// Count helpers
// ---------------------------------------------------------------------------

async function getDynamoCount(tableName: string): Promise<number> {
  let count = 0;
  let lastKey: any = undefined;

  do {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: tableName,
        Select: 'COUNT',
        ExclusiveStartKey: lastKey,
      })
    );
    count += result.Count || 0;
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return count;
}

async function getPgCount(tableName: string): Promise<number> {
  const [result] = await db.execute(sql.raw(`SELECT count(*)::int as count FROM ${tableName}`));
  return (result as any).count;
}

// ---------------------------------------------------------------------------
// Spot-check: grab N random DynamoDB items and verify they exist in PG
// ---------------------------------------------------------------------------

async function spotCheck(table: TableVerification, sampleSize = 3): Promise<{ passed: number; failed: number; errors: string[] }> {
  const errors: string[] = [];
  let passed = 0;
  let failed = 0;

  // Get a few items from DynamoDB
  const result = await dynamodb.send(
    new ScanCommand({
      TableName: table.dynamoTable,
      Limit: sampleSize,
    })
  );

  if (!result.Items || result.Items.length === 0) {
    return { passed: 0, failed: 0, errors: ['No items in DynamoDB to spot-check'] };
  }

  for (const item of result.Items) {
    const pkValue = item[table.dynamoPK];
    if (!pkValue) {
      errors.push(`Item missing PK field "${table.dynamoPK}"`);
      failed++;
      continue;
    }

    // For message-threads, extract id from PK=THREAD#<id>
    let lookupValue = String(pkValue);
    if (table.pgTableName === 'message_threads' && lookupValue.startsWith('THREAD#')) {
      lookupValue = lookupValue.replace('THREAD#', '');
    }

    try {
      const [pgRow] = await db.execute(
        sql.raw(`SELECT 1 FROM ${table.pgTableName} WHERE ${table.pgPK} = '${lookupValue.replace(/'/g, "''")}' LIMIT 1`)
      );
      if (pgRow) {
        passed++;
      } else {
        errors.push(`PK=${lookupValue} exists in DynamoDB but NOT in PostgreSQL`);
        failed++;
      }
    } catch (err) {
      errors.push(`Query error for PK=${lookupValue}: ${err}`);
      failed++;
    }
  }

  return { passed, failed, errors };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function verify() {
  console.log('=== Migration Verification ===\n');
  let allPassed = true;

  for (const table of tables) {
    process.stdout.write(`${table.dynamoTable} → ${table.pgTableName}: `);

    try {
      const [dynamoCount, pgCount] = await Promise.all([
        getDynamoCount(table.dynamoTable),
        getPgCount(table.pgTableName),
      ]);

      const countMatch = dynamoCount === pgCount;
      // For message-threads, PG may have fewer rows due to filtered participant records
      const acceptable = countMatch || (table.pgTableName === 'message_threads' && pgCount <= dynamoCount);

      if (acceptable) {
        process.stdout.write(`PASS (${dynamoCount} → ${pgCount})`);
      } else {
        process.stdout.write(`MISMATCH (DynamoDB: ${dynamoCount}, PG: ${pgCount})`);
        allPassed = false;
      }

      // Spot-check
      const check = await spotCheck(table);
      if (check.failed > 0) {
        console.log(` | Spot-check: ${check.passed}/${check.passed + check.failed} passed`);
        check.errors.forEach((e) => console.log(`    - ${e}`));
        allPassed = false;
      } else if (check.passed > 0) {
        console.log(` | Spot-check: ${check.passed}/${check.passed} passed`);
      } else {
        console.log(` | Spot-check: (empty table)`);
      }
    } catch (err) {
      console.log(`ERROR: ${err}`);
      allPassed = false;
    }
  }

  console.log(`\n=== Verification ${allPassed ? 'PASSED' : 'FAILED (see issues above)'} ===`);
  await pgClient.end();
  process.exit(allPassed ? 0 : 1);
}

verify().catch((err) => {
  console.error('Fatal verification error:', err);
  process.exit(1);
});
