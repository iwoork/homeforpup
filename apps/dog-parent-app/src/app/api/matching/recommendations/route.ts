import { NextRequest, NextResponse } from 'next/server';
import { calculateBreedScore, MatchPreferences } from '@homeforpup/shared-dogs';
import { db, breeders, breedsSimple, eq, and, sql } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

// Normalize size categories
const normalizeSize = (size: string): string => {
  const sizeMap: { [key: string]: string } = {
    'toy': 'Toy', 'small': 'Small', 'medium': 'Medium', 'large': 'Large', 'giant': 'Giant'
  };
  return sizeMap[size.toLowerCase()] || 'Medium';
};

// Normalize breed groups to categories
const normalizeCategory = (group: string): string => {
  const categoryMap: { [key: string]: string } = {
    'sporting': 'Sporting', 'hound': 'Hound', 'working': 'Working',
    'terrier': 'Terrier', 'toy': 'Toy', 'non-sporting': 'Non-Sporting',
    'herding': 'Herding', 'mixed': 'Mixed'
  };
  return categoryMap[group.toLowerCase()] || 'Mixed';
};

const generateCharacteristics = (group: string, _size: string, _type: string) => {
  const baseCharacteristics = {
    energyLevel: 5, trainability: 5, friendliness: 5, groomingNeeds: 5,
    exerciseNeeds: 5, barking: 5, shedding: 5, goodWithKids: 5,
    goodWithDogs: 5, goodWithCats: 5, goodWithStrangers: 5, protective: 5,
    playful: 5, calm: 5, intelligent: 5, independent: 5, affectionate: 5,
    social: 5, confident: 5, gentle: 5, patient: 5, energetic: 5,
    loyal: 5, alert: 5, brave: 5, stubborn: 5, sensitive: 5,
    adaptable: 5, vocal: 5, territorial: 5,
  };
  switch (group.toLowerCase()) {
    case 'sporting': return { ...baseCharacteristics, energyLevel: 8, exerciseNeeds: 8, trainability: 8, friendliness: 7 };
    case 'working': return { ...baseCharacteristics, energyLevel: 7, protective: 8, intelligent: 8, loyal: 9 };
    case 'herding': return { ...baseCharacteristics, energyLevel: 9, intelligent: 9, trainability: 9, alert: 8 };
    case 'hound': return { ...baseCharacteristics, independent: 7, vocal: 7, stubborn: 6, energyLevel: 6 };
    case 'terrier': return { ...baseCharacteristics, energyLevel: 8, stubborn: 7, vocal: 7, brave: 8 };
    case 'toy': return { ...baseCharacteristics, energyLevel: 4, goodWithKids: 6, barking: 7, shedding: 3 };
    default: return baseCharacteristics;
  }
};

const transformBreedItem = (item: any) => {
  const size = normalizeSize(item.sizeCategory || 'medium');
  const category = normalizeCategory(item.breedGroup || 'mixed');
  const breedType = item.breedType || 'purebred';
  const characteristics = generateCharacteristics(item.breedGroup || 'mixed', item.sizeCategory || 'medium', breedType);

  return {
    id: `breed-${item.id}`,
    name: item.name,
    altNames: item.altNames ? [item.altNames] : [],
    category,
    size,
    breedType,
    image: item.coverPhotoUrl || `https://placedog.net/500?r&id=${item.name}`,
    characteristics,
  };
};

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

    // Fetch all live breeds directly from breedsSimple
    const items = await db
      .select()
      .from(breedsSimple)
      .where(eq(breedsSimple.live, 'True'));

    const breeds = items.map(item => transformBreedItem(item));

    // Score each breed
    const scoredBreeds = breeds.map((breed) => {
      const score = calculateBreedScore(breed as any, preferences);
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

    const breedersList = await db.select().from(breeders)
      .where(sql`${breeders.verified} = 'True' AND ${breeders.availablePuppies} > 0`);

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

    for (const breeder of breedersList) {
      const breederBreeds: string[] = (breeder.breeds as string[]) || [];
      const matchingBreeds = breederBreeds.filter((b: string) =>
        topBreedNames.some((name) => name.toLowerCase() === b.toLowerCase())
      );

      if (matchingBreeds.length === 0) continue;

      const puppyCount = Math.min(breeder.availablePuppies || 0, 3);
      for (let i = 0; i < puppyCount; i++) {
        const gender = i % 2 === 0 ? 'male' : 'female';
        const breedName = matchingBreeds[i % matchingBreeds.length];
        const matchedBreed = topBreeds.find(
          (b) => b.breed.name.toLowerCase() === breedName.toLowerCase()
        );
        const names = gender === 'male' ? maleNames : femaleNames;
        const breederId = parseInt(breeder.id) || 0;

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
          name: names[(breederId * 10 + i) % names.length],
          breed: breedName,
          gender,
          ageWeeks: 8 + ((breederId + i) % 12),
          price: basePrice,
          location: `${breeder.city}, ${breeder.state}`,
          breederName: breeder.businessName || breeder.name,
          breederVerified: breeder.verified === 'True',
          image: `https://placedog.net/400/300?random=${breederId * 10 + i}`,
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
