import { NextRequest, NextResponse } from 'next/server';
import { breedsApiClient } from '@homeforpup/shared-dogs';
import { calculateBreedScore, MatchPreferences } from '@homeforpup/shared-dogs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

import { auth } from '@clerk/nextjs/server';
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);
const BREEDERS_TABLE = process.env.BREEDERS_TABLE_NAME || 'homeforpup-breeders';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const preferences: MatchPreferences = {
      activityLevel: body.activityLevel,
      livingSpace: body.livingSpace,
      familySize: body.familySize,
      childrenAges: body.childrenAges || [],
      experienceLevel: body.experienceLevel,
      size: body.size || [],
    };

    // Fetch all breeds
    const breedsData = await breedsApiClient.getBreeds({ limit: 500 });
    const breeds = breedsData.breeds;

    // Score each breed
    const scoredBreeds = breeds.map((breed) => {
      const score = calculateBreedScore(breed, preferences);
      return {
        breed,
        score: score.total,
        breakdown: score.breakdown,
        matchReasons: score.matchReasons,
      };
    });

    // Sort by score descending and take top 10
    scoredBreeds.sort((a, b) => b.score - a.score);
    const topBreeds = scoredBreeds.slice(0, 10);

    // Fetch available puppies for the top breeds
    const topBreedNames = topBreeds.map((b) => b.breed.name);

    const breedersResult = await dynamodb.send(
      new ScanCommand({
        TableName: BREEDERS_TABLE,
        FilterExpression: '#active = :active AND available_puppies > :zero',
        ExpressionAttributeNames: { '#active': 'active' },
        ExpressionAttributeValues: { ':active': 'True', ':zero': 0 },
      })
    );

    const breeders = breedersResult.Items || [];

    // Build puppy list from breeders whose breeds match top recommendations
    const puppies: Array<{
      id: string;
      name: string;
      breed: string;
      gender: string;
      ageWeeks: number;
      price: number;
      location: string;
      breederName: string;
      breederVerified: boolean;
      image: string;
      matchScore: number;
      matchReasons: string[];
    }> = [];

    const maleNames = ['Max', 'Charlie', 'Cooper', 'Buddy', 'Rocky', 'Tucker', 'Jack', 'Bear', 'Duke', 'Zeus'];
    const femaleNames = ['Bella', 'Luna', 'Lucy', 'Daisy', 'Mia', 'Sophie', 'Ruby', 'Lola', 'Zoe', 'Molly'];

    for (const breeder of breeders) {
      const breederBreeds: string[] = breeder.breeds || [];
      const matchingBreeds = breederBreeds.filter((b: string) =>
        topBreedNames.some((name) => name.toLowerCase() === b.toLowerCase())
      );

      if (matchingBreeds.length === 0) continue;

      const puppyCount = Math.min(breeder.available_puppies || 0, 3);
      for (let i = 0; i < puppyCount; i++) {
        const gender = i % 2 === 0 ? 'male' : 'female';
        const breedName = matchingBreeds[i % matchingBreeds.length];
        const matchedBreed = topBreeds.find(
          (b) => b.breed.name.toLowerCase() === breedName.toLowerCase()
        );
        const names = gender === 'male' ? maleNames : femaleNames;

        let basePrice = 2000;
        if (breeder.pricing) {
          const priceMatch = breeder.pricing.match(/\$?(\d+)(?:-\$?(\d+))?/);
          if (priceMatch) {
            const minPrice = parseInt(priceMatch[1]);
            const maxPrice = priceMatch[2] ? parseInt(priceMatch[2]) : minPrice;
            basePrice = Math.floor((minPrice + maxPrice) / 2);
          }
        }

        puppies.push({
          id: `${breeder.id}-puppy-${i + 1}`,
          name: names[(breeder.id * 10 + i) % names.length],
          breed: breedName,
          gender,
          ageWeeks: 8 + ((breeder.id + i) % 12),
          price: basePrice,
          location: `${breeder.city}, ${breeder.state}`,
          breederName: breeder.business_name,
          breederVerified: breeder.verified === 'True',
          image: `https://placedog.net/400/300?random=${breeder.id * 10 + i}`,
          matchScore: matchedBreed?.score || 0,
          matchReasons: matchedBreed?.matchReasons || [],
        });
      }
    }

    // Sort puppies by match score
    puppies.sort((a, b) => b.matchScore - a.matchScore);

    return NextResponse.json({
      breeds: topBreeds.map((b) => ({
        id: b.breed.id,
        name: b.breed.name,
        size: b.breed.size,
        category: b.breed.category,
        image: b.breed.image,
        characteristics: b.breed.characteristics,
        score: b.score,
        breakdown: b.breakdown,
        matchReasons: b.matchReasons,
      })),
      puppies: puppies.slice(0, 20),
      totalBreedsScored: breeds.length,
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      {
        message: 'Error generating recommendations',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
