// scripts/populate-breeds.js
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
require('dotenv').config();

// Configure AWS SDK v3
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
    convertClassInstanceToMap: false,
  },
});

const BREEDS_TABLE = process.env.BREEDS_TABLE_NAME || 'homeforpup-breeds-simple';

// Common dog breeds data
const commonBreeds = [
  // Popular breeds starting with A-G
  { id: 1, name: 'Golden Retriever', breed_group: 'sporting', size_category: 'large', breed_type: 'purebred', live: 'True' },
  { id: 2, name: 'Labrador Retriever', breed_group: 'sporting', size_category: 'large', breed_type: 'purebred', live: 'True' },
  { id: 3, name: 'German Shepherd', breed_group: 'herding', size_category: 'large', breed_type: 'purebred', live: 'True' },
  { id: 4, name: 'French Bulldog', breed_group: 'non-sporting', size_category: 'small', breed_type: 'purebred', live: 'True' },
  { id: 5, name: 'Bulldog', breed_group: 'non-sporting', size_category: 'medium', breed_type: 'purebred', live: 'True' },
  { id: 6, name: 'Poodle', breed_group: 'non-sporting', size_category: 'medium', breed_type: 'purebred', live: 'True' },
  { id: 7, name: 'Beagle', breed_group: 'hound', size_category: 'medium', breed_type: 'purebred', live: 'True' },
  { id: 8, name: 'Rottweiler', breed_group: 'working', size_category: 'large', breed_type: 'purebred', live: 'True' },
  { id: 9, name: 'Siberian Husky', breed_group: 'working', size_category: 'large', breed_type: 'purebred', live: 'True' },
  { id: 10, name: 'Dachshund', breed_group: 'hound', size_category: 'small', breed_type: 'purebred', live: 'True' },
  { id: 11, name: 'Boxer', breed_group: 'working', size_category: 'large', breed_type: 'purebred', live: 'True' },
  { id: 12, name: 'Great Dane', breed_group: 'working', size_category: 'giant', breed_type: 'purebred', live: 'True' },
  { id: 13, name: 'Chihuahua', breed_group: 'toy', size_category: 'toy', breed_type: 'purebred', live: 'True' },
  { id: 14, name: 'Shih Tzu', breed_group: 'toy', size_category: 'toy', breed_type: 'purebred', live: 'True' },
  { id: 15, name: 'Border Collie', breed_group: 'herding', size_category: 'medium', breed_type: 'purebred', live: 'True' },
  { id: 16, name: 'Australian Shepherd', breed_group: 'herding', size_category: 'medium', breed_type: 'purebred', live: 'True' },
  { id: 17, name: 'Cocker Spaniel', breed_group: 'sporting', size_category: 'medium', breed_type: 'purebred', live: 'True' },
  { id: 18, name: 'Maltese', breed_group: 'toy', size_category: 'toy', breed_type: 'purebred', live: 'True' },
  { id: 19, name: 'Jack Russell Terrier', breed_group: 'terrier', size_category: 'small', breed_type: 'purebred', live: 'True' },
  { id: 20, name: 'Yorkshire Terrier', breed_group: 'toy', size_category: 'toy', breed_type: 'purebred', live: 'True' },
  { id: 21, name: 'Boston Terrier', breed_group: 'non-sporting', size_category: 'small', breed_type: 'purebred', live: 'True' },
  { id: 22, name: 'Pomeranian', breed_group: 'toy', size_category: 'toy', breed_type: 'purebred', live: 'True' },
  { id: 23, name: 'Cavalier King Charles Spaniel', breed_group: 'toy', size_category: 'toy', breed_type: 'purebred', live: 'True' },
  { id: 24, name: 'Doberman Pinscher', breed_group: 'working', size_category: 'large', breed_type: 'purebred', live: 'True' },
  { id: 25, name: 'Weimaraner', breed_group: 'sporting', size_category: 'large', breed_type: 'purebred', live: 'True' },
  { id: 26, name: 'Brittany', breed_group: 'sporting', size_category: 'medium', breed_type: 'purebred', live: 'True' },
  { id: 27, name: 'Mastiff', breed_group: 'working', size_category: 'giant', breed_type: 'purebred', live: 'True' },
  { id: 28, name: 'Saint Bernard', breed_group: 'working', size_category: 'giant', breed_type: 'purebred', live: 'True' },
  { id: 29, name: 'Newfoundland', breed_group: 'working', size_category: 'giant', breed_type: 'purebred', live: 'True' },
  { id: 30, name: 'Bernese Mountain Dog', breed_group: 'working', size_category: 'large', breed_type: 'purebred', live: 'True' },
  { id: 31, name: 'Akita', breed_group: 'working', size_category: 'large', breed_type: 'purebred', live: 'True' },
  { id: 32, name: 'Shiba Inu', breed_group: 'non-sporting', size_category: 'medium', breed_type: 'purebred', live: 'True' },
  { id: 33, name: 'Basenji', breed_group: 'hound', size_category: 'small', breed_type: 'purebred', live: 'True' },
  { id: 34, name: 'Whippet', breed_group: 'hound', size_category: 'medium', breed_type: 'purebred', live: 'True' },
  { id: 35, name: 'Greyhound', breed_group: 'hound', size_category: 'large', breed_type: 'purebred', live: 'True' },
  { id: 36, name: 'Irish Setter', breed_group: 'sporting', size_category: 'large', breed_type: 'purebred', live: 'True' },
  { id: 37, name: 'English Setter', breed_group: 'sporting', size_category: 'large', breed_type: 'purebred', live: 'True' },
  { id: 38, name: 'Pointer', breed_group: 'sporting', size_category: 'large', breed_type: 'purebred', live: 'True' },
  { id: 39, name: 'Vizsla', breed_group: 'sporting', size_category: 'large', breed_type: 'purebred', live: 'True' },
  { id: 40, name: 'Weimaraner', breed_group: 'sporting', size_category: 'large', breed_type: 'purebred', live: 'True' },
  // Hybrid/Designer breeds
  { id: 41, name: 'Goldendoodle', breed_group: 'mixed', size_category: 'large', breed_type: 'designer', hybrid: true, live: 'True' },
  { id: 42, name: 'Labradoodle', breed_group: 'mixed', size_category: 'large', breed_type: 'designer', hybrid: true, live: 'True' },
  { id: 43, name: 'Cockapoo', breed_group: 'mixed', size_category: 'small', breed_type: 'designer', hybrid: true, live: 'True' },
  { id: 44, name: 'Maltipoo', breed_group: 'mixed', size_category: 'toy', breed_type: 'designer', hybrid: true, live: 'True' },
  { id: 45, name: 'Yorkipoo', breed_group: 'mixed', size_category: 'toy', breed_type: 'designer', hybrid: true, live: 'True' },
  { id: 46, name: 'Puggle', breed_group: 'mixed', size_category: 'small', breed_type: 'designer', hybrid: true, live: 'True' },
  { id: 47, name: 'Schnoodle', breed_group: 'mixed', size_category: 'medium', breed_type: 'designer', hybrid: true, live: 'True' },
  { id: 48, name: 'Bernedoodle', breed_group: 'mixed', size_category: 'large', breed_type: 'designer', hybrid: true, live: 'True' },
  { id: 49, name: 'Aussiedoodle', breed_group: 'mixed', size_category: 'medium', breed_type: 'designer', hybrid: true, live: 'True' },
  { id: 50, name: 'Cavapoo', breed_group: 'mixed', size_category: 'toy', breed_type: 'designer', hybrid: true, live: 'True' }
];

async function checkExistingBreeds() {
  try {
    console.log('Checking existing breeds in database...');
    const result = await dynamodb.send(new ScanCommand({
      TableName: BREEDS_TABLE,
      Select: 'COUNT'
    }));
    console.log(`Current breed count: ${result.Count}`);
    return result.Count;
  } catch (error) {
    console.error('Error checking existing breeds:', error);
    return 0;
  }
}

async function addBreed(breed) {
  try {
    const item = {
      id: breed.id,
      name: breed.name,
      alt_names: [],
      overview_page: false,
      url: `https://homeforpup.com/breeds/${breed.name.toLowerCase().replace(/\s+/g, '-')}`,
      cover_photo_url: `https://placedog.net/500?r&id=${breed.id}`,
      live: breed.live,
      hybrid: breed.hybrid || false,
      slug: breed.name.toLowerCase().replace(/\s+/g, '-'),
      search_terms: [breed.name.toLowerCase()],
      breed_type: breed.breed_type,
      size_category: breed.size_category,
      breed_group: breed.breed_group
    };

    await dynamodb.send(new PutCommand({
      TableName: BREEDS_TABLE,
      Item: item
    }));

    console.log(`Added breed: ${breed.name}`);
    return true;
  } catch (error) {
    console.error(`Error adding breed ${breed.name}:`, error);
    return false;
  }
}

async function populateBreeds() {
  try {
    console.log('Starting breed population...');
    
    const existingCount = await checkExistingBreeds();
    console.log(`Found ${existingCount} existing breeds`);
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const breed of commonBreeds) {
      const success = await addBreed(breed);
      if (success) {
        addedCount++;
      } else {
        skippedCount++;
      }
      
      // Add a small delay to avoid overwhelming the database
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`\nBreed population complete!`);
    console.log(`Added: ${addedCount} breeds`);
    console.log(`Skipped: ${skippedCount} breeds`);
    console.log(`Total breeds in database: ${existingCount + addedCount}`);
    
  } catch (error) {
    console.error('Error populating breeds:', error);
  }
}

// Run the script
populateBreeds();
