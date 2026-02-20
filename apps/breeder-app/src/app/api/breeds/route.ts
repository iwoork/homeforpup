import { NextRequest, NextResponse } from 'next/server';
import { breedsApiClient } from '@homeforpup/shared-dogs';

import { auth } from '@clerk/nextjs/server';
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const size = searchParams.get('size');
    const breedType = searchParams.get('breedType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'name';

    const data = await breedsApiClient.getBreeds({
      search: search || undefined,
      category: category || undefined,
      size: size || undefined,
      breedType: breedType || undefined,
      page,
      limit,
      sortBy
    });

    return NextResponse.json(data);
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