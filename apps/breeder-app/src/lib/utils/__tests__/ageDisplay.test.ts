import { formatAge, formatDetailedAge } from '../ageDisplay';

describe('ageDisplay', () => {
  const mockDate = '2024-01-01';
  
  beforeEach(() => {
    // Mock the current date to be 2024-06-01 for consistent testing
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-01'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('formatAge', () => {
    it('should display months for dogs under 12 months', () => {
      const birthDate = '2024-03-01'; // 3 months old
      expect(formatAge(birthDate)).toBe('3 months');
    });

    it('should display singular month for 1 month old', () => {
      const birthDate = '2024-05-01'; // 1 month old
      expect(formatAge(birthDate)).toBe('1 month');
    });

    it('should display years for dogs 12+ months with less than 6 remaining months', () => {
      const birthDate = '2023-06-01'; // 1 year old
      expect(formatAge(birthDate)).toBe('1 year');
    });

    it('should display years and months for dogs with 6+ remaining months', () => {
      const birthDate = '2023-01-01'; // 1 year, 5 months old
      expect(formatAge(birthDate)).toBe('1 year, 5 months');
    });

    it('should handle plural years correctly', () => {
      const birthDate = '2022-06-01'; // 2 years old
      expect(formatAge(birthDate)).toBe('2 years');
    });

    it('should return "Unknown" for invalid dates', () => {
      expect(formatAge('')).toBe('Unknown');
      expect(formatAge(null as any)).toBe('Unknown');
      expect(formatAge(undefined as any)).toBe('Unknown');
    });
  });

  describe('formatDetailedAge', () => {
    it('should add "old" to the age', () => {
      const birthDate = '2024-03-01'; // 3 months old
      expect(formatDetailedAge(birthDate)).toBe('3 months old');
    });

    it('should handle years correctly', () => {
      const birthDate = '2023-06-01'; // 1 year old
      expect(formatDetailedAge(birthDate)).toBe('1 year old');
    });
  });
});
