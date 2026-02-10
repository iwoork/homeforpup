import { Breed } from './breeds-types';

export interface MatchPreferences {
  activityLevel: 'low' | 'moderate' | 'high';
  livingSpace: 'apartment' | 'house-small' | 'house-medium' | 'house-large';
  familySize: 'single' | 'couple' | 'small-family' | 'large-family';
  childrenAges: string[];
  experienceLevel: 'first-time' | 'some-experience' | 'experienced' | 'very-experienced';
  size: string[];
}

export interface ScoreBreakdown {
  energyMatch: number;
  sizeMatch: number;
  kidFriendliness: number;
  trainability: number;
  spaceRequirements: number;
  groomingNeeds: number;
  socialCompatibility: number;
}

export interface BreedScore {
  total: number;
  breakdown: ScoreBreakdown;
  matchReasons: string[];
}

const ACTIVITY_MAP: Record<string, number> = {
  low: 3,
  moderate: 6,
  high: 9,
};

const EXPERIENCE_MAP: Record<string, number> = {
  'first-time': 2,
  'some-experience': 4,
  'experienced': 7,
  'very-experienced': 9,
};

const SPACE_MAP: Record<string, number> = {
  apartment: 2,
  'house-small': 4,
  'house-medium': 7,
  'house-large': 10,
};

const SIZE_SCORE_MAP: Record<string, string[]> = {
  apartment: ['toy', 'small'],
  'house-small': ['toy', 'small', 'medium'],
  'house-medium': ['small', 'medium', 'large'],
  'house-large': ['small', 'medium', 'large', 'giant'],
};

const BREED_SIZE_CATEGORY: Record<string, string> = {
  Toy: 'toy',
  Small: 'small',
  Medium: 'medium',
  Large: 'large',
  Giant: 'giant',
};

function normalizeBreedSize(size: string): string {
  return BREED_SIZE_CATEGORY[size] || size.toLowerCase();
}

function scoreEnergyMatch(breed: Breed, preferences: MatchPreferences): { score: number; reasons: string[] } {
  const userEnergy = ACTIVITY_MAP[preferences.activityLevel] || 5;
  const breedEnergy = breed.characteristics.energyLevel;
  const diff = Math.abs(userEnergy - breedEnergy);
  const score = Math.max(0, 20 - diff * 3);
  const reasons: string[] = [];

  if (diff <= 1) {
    reasons.push(
      preferences.activityLevel === 'high'
        ? 'Great energy level for active families'
        : preferences.activityLevel === 'low'
          ? 'Calm temperament suits your relaxed lifestyle'
          : 'Well-balanced energy for your moderate lifestyle'
    );
  } else if (breedEnergy > userEnergy + 2) {
    reasons.push('Higher energy than your preference — needs more exercise');
  } else if (breedEnergy < userEnergy - 2) {
    reasons.push('Lower energy — may not keep up with your active lifestyle');
  }

  return { score, reasons };
}

function scoreSizeMatch(breed: Breed, preferences: MatchPreferences): { score: number; reasons: string[] } {
  const breedSize = normalizeBreedSize(breed.size);
  const reasons: string[] = [];

  if (preferences.size.length === 0 || preferences.size.includes('any')) {
    reasons.push(`${breed.size} size works well for your preferences`);
    return { score: 15, reasons };
  }

  if (preferences.size.includes(breedSize)) {
    reasons.push(`Perfect size match — ${breed.size} is exactly what you're looking for`);
    return { score: 15, reasons };
  }

  reasons.push(`${breed.size} size doesn't match your preference`);
  return { score: 3, reasons };
}

function scoreKidFriendliness(breed: Breed, preferences: MatchPreferences): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const hasKids = preferences.childrenAges.length > 0 && !preferences.childrenAges.includes('adults-only');
  const hasYoungKids = preferences.childrenAges.some((a) => ['infants', 'toddlers'].includes(a));

  if (!hasKids) {
    const socialScore = breed.characteristics.friendliness;
    const score = Math.round((socialScore / 10) * 15);
    if (socialScore >= 7) reasons.push('Friendly and sociable companion');
    return { score, reasons };
  }

  const kidScore = breed.characteristics.goodWithKids;
  const gentleness = breed.characteristics.gentle;
  const patience = breed.characteristics.patient;

  let score: number;
  if (hasYoungKids) {
    score = Math.round(((kidScore * 0.4 + gentleness * 0.3 + patience * 0.3) / 10) * 15);
    if (kidScore >= 8 && gentleness >= 7) {
      reasons.push('Excellent with young children — gentle and patient');
    } else if (kidScore < 5) {
      reasons.push('May not be ideal around very young children');
    }
  } else {
    score = Math.round(((kidScore * 0.6 + patience * 0.4) / 10) * 15);
    if (kidScore >= 7) {
      reasons.push('Great with kids of all ages');
    }
  }

  return { score, reasons };
}

function scoreTrainability(breed: Breed, preferences: MatchPreferences): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const experience = EXPERIENCE_MAP[preferences.experienceLevel] || 5;
  const trainability = breed.characteristics.trainability;
  const stubbornness = breed.characteristics.stubborn;
  const independence = breed.characteristics.independent;

  const difficulty = Math.round((10 - trainability + stubbornness + independence) / 3);
  const canHandle = experience >= difficulty;

  let score: number;
  if (canHandle) {
    score = Math.round((trainability / 10) * 15);
    if (trainability >= 8) {
      reasons.push('Highly trainable — eager to learn');
    } else if (trainability >= 5) {
      reasons.push('Trainable with consistent effort');
    }
  } else {
    score = Math.max(3, Math.round(((trainability * 0.5 + experience * 0.5) / 10) * 15));
    reasons.push('May be challenging for your experience level');
  }

  return { score, reasons };
}

function scoreSpaceRequirements(breed: Breed, preferences: MatchPreferences): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const spaceLevel = SPACE_MAP[preferences.livingSpace] || 5;
  const breedSize = normalizeBreedSize(breed.size);
  const exerciseNeeds = breed.characteristics.exerciseNeeds;

  const suitableSizes = SIZE_SCORE_MAP[preferences.livingSpace] || ['small', 'medium', 'large'];
  const sizeOk = suitableSizes.includes(breedSize);

  const spaceNeed = (exerciseNeeds + (breedSize === 'giant' ? 9 : breedSize === 'large' ? 7 : breedSize === 'medium' ? 5 : 3)) / 2;
  const spaceDiff = spaceLevel - spaceNeed;

  let score: number;
  if (sizeOk && spaceDiff >= 0) {
    score = 15;
    reasons.push('Great fit for your living space');
  } else if (sizeOk) {
    score = Math.max(5, 15 + Math.round(spaceDiff * 2));
    reasons.push('Adequate space, but more room would be ideal');
  } else {
    score = Math.max(2, 15 + Math.round(spaceDiff * 3));
    reasons.push('Your living space may be tight for this breed');
  }

  return { score: Math.min(15, score), reasons };
}

function scoreGroomingNeeds(breed: Breed, preferences: MatchPreferences): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const groomingNeeds = breed.characteristics.groomingNeeds;
  const shedding = breed.characteristics.shedding;

  const groomingDemand = (groomingNeeds + shedding) / 2;
  const score = Math.round(((10 - groomingDemand + 5) / 15) * 10);

  if (groomingDemand <= 3) {
    reasons.push('Low maintenance grooming');
  } else if (groomingDemand >= 7) {
    reasons.push('Higher grooming needs than average');
  }

  return { score: Math.min(10, Math.max(2, score)), reasons };
}

function scoreSocialCompatibility(breed: Breed, preferences: MatchPreferences): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  const { goodWithDogs, goodWithStrangers, social, adaptable } = breed.characteristics;
  const isLargeFamily = ['small-family', 'large-family'].includes(preferences.familySize);

  const socialScore = isLargeFamily
    ? (goodWithDogs * 0.2 + goodWithStrangers * 0.3 + social * 0.3 + adaptable * 0.2)
    : (goodWithDogs * 0.3 + social * 0.3 + adaptable * 0.4);

  const score = Math.round((socialScore / 10) * 10);

  if (socialScore >= 7) {
    reasons.push(isLargeFamily ? 'Thrives in busy family environments' : 'Sociable and adaptable companion');
  } else if (socialScore <= 4) {
    reasons.push('Prefers quieter environments with fewer people');
  }

  return { score: Math.min(10, Math.max(1, score)), reasons };
}

export function calculateBreedScore(breed: Breed, preferences: MatchPreferences): BreedScore {
  const energy = scoreEnergyMatch(breed, preferences);
  const size = scoreSizeMatch(breed, preferences);
  const kids = scoreKidFriendliness(breed, preferences);
  const train = scoreTrainability(breed, preferences);
  const space = scoreSpaceRequirements(breed, preferences);
  const groom = scoreGroomingNeeds(breed, preferences);
  const social = scoreSocialCompatibility(breed, preferences);

  const breakdown: ScoreBreakdown = {
    energyMatch: energy.score,
    sizeMatch: size.score,
    kidFriendliness: kids.score,
    trainability: train.score,
    spaceRequirements: space.score,
    groomingNeeds: groom.score,
    socialCompatibility: social.score,
  };

  const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

  const allReasons = [
    ...energy.reasons,
    ...size.reasons,
    ...kids.reasons,
    ...train.reasons,
    ...space.reasons,
    ...groom.reasons,
    ...social.reasons,
  ];

  return { total, breakdown, matchReasons: allReasons };
}

export function getMatchReasons(breed: Breed, preferences: MatchPreferences): string[] {
  const { matchReasons } = calculateBreedScore(breed, preferences);
  return matchReasons;
}
