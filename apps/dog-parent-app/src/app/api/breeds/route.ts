import { NextRequest, NextResponse } from 'next/server';
import { db, breedsSimple, eq, and, sql } from '@homeforpup/database';

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

const generatePhysicalTraits = (size: string, group: string): string[] => {
  const traits: string[] = [];
  switch (size.toLowerCase()) {
    case 'toy': traits.push('Compact size', 'Lightweight', 'Portable'); break;
    case 'small': traits.push('Small stature', 'Manageable size', 'Apartment-friendly'); break;
    case 'medium': traits.push('Balanced proportions', 'Versatile size', 'Family-friendly'); break;
    case 'large': traits.push('Substantial build', 'Strong presence', 'Athletic frame'); break;
    case 'giant': traits.push('Impressive size', 'Powerful build', 'Commanding presence'); break;
  }
  switch (group.toLowerCase()) {
    case 'sporting': traits.push('Athletic build', 'Water-resistant coat', 'Webbed feet'); break;
    case 'working': traits.push('Strong build', 'Dense coat', 'Powerful jaws'); break;
    case 'herding': traits.push('Agile build', 'Alert expression', 'Quick reflexes'); break;
    case 'hound': traits.push('Sleek build', 'Long ears', 'Scenting ability'); break;
    case 'terrier': traits.push('Compact build', 'Wire coat', 'Determined expression'); break;
  }
  return traits;
};

const generateTemperament = (group: string, _type: string): string[] => {
  const base = ['Loyal', 'Affectionate', 'Intelligent'];
  switch (group.toLowerCase()) {
    case 'sporting': return [...base, 'Energetic', 'Friendly', 'Trainable'];
    case 'working': return [...base, 'Protective', 'Confident', 'Alert'];
    case 'herding': return [...base, 'Alert', 'Responsive', 'Energetic'];
    case 'hound': return [...base, 'Independent', 'Gentle', 'Calm'];
    case 'terrier': return [...base, 'Spirited', 'Bold', 'Playful'];
    case 'toy': return [...base, 'Gentle', 'Playful', 'Companionable'];
    default: return base;
  }
};

interface BreedItem {
  id: string;
  name: string;
  altNames: string | null;
  breedGroup: string | null;
  sizeCategory: string | null;
  breedType: string | null;
  hybrid: string | null;
  live: string | null;
  coverPhotoUrl: string | null;
  searchTerms: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

const transformBreed = (item: BreedItem) => {
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
    images: item.coverPhotoUrl ? [item.coverPhotoUrl] : undefined,
    overview: `${item.hybrid ? 'A wonderful hybrid' : 'A distinguished'} ${size.toLowerCase()} breed from the ${category} group. ${breedType === 'designer' ? 'This designer breed combines the best traits of its parent breeds.' : 'Known for their unique characteristics and loyal companionship.'}`,
    characteristics,
    physicalTraits: generatePhysicalTraits(item.sizeCategory || 'medium', item.breedGroup || 'mixed'),
    temperament: generateTemperament(item.breedGroup || 'mixed', breedType),
    idealFor: [
      'Dog lovers',
      (item.sizeCategory || '').toLowerCase() === 'toy' || (item.sizeCategory || '').toLowerCase() === 'small' ? 'Apartment living' : 'Active families',
      (item.breedGroup || '').toLowerCase() === 'sporting' || (item.breedGroup || '').toLowerCase() === 'working' ? 'Active owners' : 'Various lifestyles',
      'Responsible owners'
    ],
    exerciseNeeds: characteristics.energyLevel >= 8 ? 'High - 60+ minutes daily' :
                   characteristics.energyLevel >= 6 ? 'Moderate - 30-45 minutes daily' :
                   'Low to Moderate - 30 minutes daily',
    commonHealthIssues: ['General breed health considerations', 'Regular vet checkups recommended'],
    groomingTips: `Regular grooming appropriate for ${item.breedGroup || 'mixed'} breed characteristics.`,
    trainingTips: `Training approach suited for ${category} group temperament and ${breedType} characteristics.`,
    funFacts: [
      `${breedType === 'purebred' ? 'Purebred' : 'Hybrid'} breed with rich history`,
      `Part of the ${category} group`,
      `Size category: ${size}`,
      'Beloved by dog enthusiasts worldwide'
    ],
    breederCount: 0,
  };
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const size = searchParams.get('size');
    const breedType = searchParams.get('breedType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'name';

    // Build conditions
    const conditions: any[] = [eq(breedsSimple.live, 'True')];

    if (category && category !== 'All') {
      const categoryMap: { [key: string]: string } = {
        'Sporting': 'sporting', 'Hound': 'hound', 'Working': 'working',
        'Terrier': 'terrier', 'Toy': 'toy', 'Non-Sporting': 'non-sporting',
        'Herding': 'herding', 'Mixed': 'mixed'
      };
      if (categoryMap[category]) conditions.push(eq(breedsSimple.breedGroup, categoryMap[category]));
    }

    if (size && size !== 'All') {
      const sizeMap: { [key: string]: string } = {
        'Toy': 'toy', 'Small': 'small', 'Medium': 'medium', 'Large': 'large', 'Giant': 'giant'
      };
      if (sizeMap[size]) conditions.push(eq(breedsSimple.sizeCategory, sizeMap[size]));
    }

    if (breedType && breedType !== 'All') {
      conditions.push(eq(breedsSimple.breedType, breedType.toLowerCase()));
    }

    if (search) {
      conditions.push(
        sql`(${breedsSimple.name} ILIKE ${'%' + search.toLowerCase() + '%'} OR ${breedsSimple.altNames} ILIKE ${'%' + search.toLowerCase() + '%'} OR ${breedsSimple.searchTerms} ILIKE ${'%' + search.toLowerCase() + '%'})`
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const items = await db.select().from(breedsSimple).where(whereClause);

    // Transform all breeds
    const allTransformedBreeds = items.map(item => transformBreed(item));

    // Apply sorting
    const sortedBreeds = [...allTransformedBreeds];
    switch (sortBy) {
      case 'name':
        sortedBreeds.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'category':
        sortedBreeds.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)); break;
      case 'size': {
        const sizeOrder = ['Toy', 'Small', 'Medium', 'Large', 'Giant'];
        sortedBreeds.sort((a, b) => sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size) || a.name.localeCompare(b.name));
        break;
      }
      case 'breedType':
        sortedBreeds.sort((a, b) => a.breedType.localeCompare(b.breedType) || a.name.localeCompare(b.name)); break;
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBreeds = sortedBreeds.slice(startIndex, endIndex);
    const totalCount = sortedBreeds.length;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      breeds: paginatedBreeds,
      count: paginatedBreeds.length,
      total: totalCount,
      page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      totalPages,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalCount),
      filters: {
        availableCategories: [...new Set(allTransformedBreeds.map(b => b.category))].sort(),
        availableSizes: [...new Set(allTransformedBreeds.map(b => b.size))].sort(),
        availableBreedTypes: [...new Set(allTransformedBreeds.map(b => b.breedType))].sort(),
        totalBreeders: allTransformedBreeds.reduce((sum, breed) => sum + (breed.breederCount || 0), 0)
      }
    });
  } catch (error) {
    console.error('Error fetching breeds:', error);
    return NextResponse.json(
      {
        message: 'Error fetching breeds',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
