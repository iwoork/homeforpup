import dayjs from 'dayjs';

/**
 * Formats age display to show months for younger dogs and years for older dogs
 * @param birthDate - The birth date of the dog
 * @returns Formatted age string (e.g., "8 months", "2 years", "1 year")
 */
export function formatAge(birthDate: string | Date): string {
  if (!birthDate) return 'Unknown';
  
  const birth = dayjs(birthDate);
  const now = dayjs();
  
  // Calculate age in months
  const ageInMonths = now.diff(birth, 'month');
  
  // If less than 12 months, show in months
  if (ageInMonths < 12) {
    return `${ageInMonths} ${ageInMonths === 1 ? 'month' : 'months'}`;
  }
  
  // If 12 months or more, show in years
  const ageInYears = now.diff(birth, 'year');
  const remainingMonths = now.diff(birth, 'month') % 12;
  
  // If it's exactly a year or less than 18 months, show just years
  if (remainingMonths < 6) {
    return `${ageInYears} ${ageInYears === 1 ? 'year' : 'years'}`;
  }
  
  // If it's more than 18 months, show years and months
  return `${ageInYears} years, ${remainingMonths} months`;
}

/**
 * Gets a more detailed age description for display in descriptions
 * @param birthDate - The birth date of the dog
 * @returns Detailed age string (e.g., "8 months old", "2 years old")
 */
export function formatDetailedAge(birthDate: string | Date): string {
  const age = formatAge(birthDate);
  return `${age} old`;
}
