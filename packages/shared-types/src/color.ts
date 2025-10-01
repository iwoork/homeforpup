// Dog Color Types
export interface DogColor {
  id: string;
  name: string;
  description?: string;
  hexCode?: string;
  category: 'solid' | 'pattern' | 'multi-color';
  commonBreeds?: string[];
}

export const DOG_COLORS: DogColor[] = [
  // Solid Colors
  { id: 'black', name: 'Black', hexCode: '#000000', category: 'solid' },
  { id: 'white', name: 'White', hexCode: '#FFFFFF', category: 'solid' },
  { id: 'brown', name: 'Brown', hexCode: '#8B4513', category: 'solid' },
  { id: 'chocolate', name: 'Chocolate', hexCode: '#7B3F00', category: 'solid' },
  { id: 'liver', name: 'Liver', hexCode: '#654321', category: 'solid' },
  { id: 'red', name: 'Red', hexCode: '#A0522D', category: 'solid' },
  { id: 'golden', name: 'Golden', hexCode: '#DAA520', category: 'solid' },
  { id: 'cream', name: 'Cream', hexCode: '#FFFACD', category: 'solid' },
  { id: 'tan', name: 'Tan', hexCode: '#D2B48C', category: 'solid' },
  { id: 'fawn', name: 'Fawn', hexCode: '#E5AA70', category: 'solid' },
  { id: 'apricot', name: 'Apricot', hexCode: '#FBCEB1', category: 'solid' },
  { id: 'silver', name: 'Silver', hexCode: '#C0C0C0', category: 'solid' },
  { id: 'gray', name: 'Gray', hexCode: '#808080', category: 'solid' },
  { id: 'blue', name: 'Blue', hexCode: '#6495ED', category: 'solid' },
  { id: 'blue-gray', name: 'Blue Gray', hexCode: '#5F9EA0', category: 'solid' },
  { id: 'isabella', name: 'Isabella', hexCode: '#DABDAB', category: 'solid' },
  { id: 'champagne', name: 'Champagne', hexCode: '#F7E7CE', category: 'solid' },
  
  // Patterns
  { id: 'brindle', name: 'Brindle', category: 'pattern', description: 'Streaked or striped pattern' },
  { id: 'merle', name: 'Merle', category: 'pattern', description: 'Mottled patches of color' },
  { id: 'blue-merle', name: 'Blue Merle', category: 'pattern', description: 'Blue gray mottled pattern' },
  { id: 'red-merle', name: 'Red Merle', category: 'pattern', description: 'Red mottled pattern' },
  { id: 'sable', name: 'Sable', category: 'pattern', description: 'Black-tipped hairs on lighter base' },
  { id: 'harlequin', name: 'Harlequin', category: 'pattern', description: 'Patched or piebald pattern' },
  { id: 'ticked', name: 'Ticked', category: 'pattern', description: 'Small flecks of color' },
  { id: 'roan', name: 'Roan', category: 'pattern', description: 'Mixed white and colored hairs' },
  { id: 'piebald', name: 'Piebald', category: 'pattern', description: 'Large patches of two colors' },
  { id: 'parti-color', name: 'Parti-Color', category: 'pattern', description: 'Two or more colors in patches' },
  
  // Multi-Color Combinations
  { id: 'black-white', name: 'Black and White', category: 'multi-color' },
  { id: 'black-tan', name: 'Black and Tan', category: 'multi-color' },
  { id: 'brown-white', name: 'Brown and White', category: 'multi-color' },
  { id: 'tricolor', name: 'Tricolor', category: 'multi-color', description: 'Three distinct colors' },
  { id: 'black-tan-white', name: 'Black, Tan and White', category: 'multi-color' },
  { id: 'red-white', name: 'Red and White', category: 'multi-color' },
  { id: 'blue-tan', name: 'Blue and Tan', category: 'multi-color' },
  { id: 'liver-white', name: 'Liver and White', category: 'multi-color' },
  { id: 'lemon-white', name: 'Lemon and White', category: 'multi-color' },
  { id: 'orange-white', name: 'Orange and White', category: 'multi-color' },
  
  // Markings/Special
  { id: 'saddled', name: 'Saddled', category: 'pattern', description: 'Saddle-shaped marking on back' },
  { id: 'masked', name: 'Masked', category: 'pattern', description: 'Dark facial mask' },
  { id: 'tuxedo', name: 'Tuxedo', category: 'pattern', description: 'White chest and paws with colored body' },
];

export type DogColorCategory = 'solid' | 'pattern' | 'multi-color';

