'use client';

import React, { useState, useEffect } from 'react';
import { Card, Typography } from 'antd';
import { HeartOutlined } from '@ant-design/icons';
import Image from 'next/image';

const { Text } = Typography;

interface DogImage {
  id: string;
  src: string;
  breed: string;
  alt: string;
}

interface DogGalleryProps {
  className?: string;
  style?: React.CSSProperties;
}

const DogGallery: React.FC<DogGalleryProps> = ({ 
  className = '',
  style = {}
}) => {
  const [images, setImages] = useState<DogImage[]>([]);

  // Convert breed name to file name with capitalized name (e.g., "Akita" -> "Akita.jpg", "Border Collie" -> "Border Collie.jpg")
  const convertBreedNameToFileName = (breedName: string): string => {
    return breedName.replace(/\.jpg$/i, '') + '.jpg';
  };

  // Shuffle array using Fisher-Yates algorithm
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Generate breed images from the public/images/breeds folder
  const generateDogImages = (): DogImage[] => {
    const breedNames = [
      'Akita', 'Aussiedoodle', 'Australian Shepherd', 'Basenji',
      'Beagle', 'Bernedoodle', 'Bernese Mountain Dog', 'Border Collie',
      'Boston Terrier', 'Boxer', 'Brittany', 'Bulldog',
      'Cavalier King Charles Spaniel', 'Cavapoo', 'Chihuahua', 'Cockapoo',
      'Cocker Spaniel', 'Dachshund', 'Doberman Pinscher', 'English Setter',
      'French Bulldog', 'German Shepherd', 'Golden Retriever', 'Goldendoodle',
      'Great Dane', 'Greyhound', 'Irish Setter', 'Jack Russell Terrier',
      'Labradoodle', 'Labrador Retriever', 'Maltese', 'Maltipoo',
      'Mastiff', 'Newfoundland', 'Pointer', 'Pomeranian',
      'Poodle', 'Puggle', 'Rottweiler', 'Saint Bernard',
      'Schnoodle', 'Shiba Inu', 'Shih Tzu', 'Siberian Husky',
      'Spanish Mastiff', 'Spanish Water Dog', 'Spinone Italiano', 'Sporty Mix',
      'Springerdoodle', 'Stabyhoun', 'Staffordshire Bull Terrier', 'Standard Schnauzer',
      'Sussex Spaniel', 'Swedish Lapphund', 'Swedish Vallhund', 'Taigan',
      'Tamaskan', 'Teddy Roosevelt Terrier', 'Thai Ridgeback', 'Tibetan Mastiff',
      'Tibetan Spaniel', 'Tibetan Terrier', 'Tornjak', 'Tosa Inu',
      'Toy Australian Shepherd', 'Toy Fox Terrier', 'Toy Shetland Sheepdog', 'Transylvanian Hound',
      'Treeing Feist', 'Vizsla', 'Weimaraner', 'Whippet',
      'Yorkipoo', 'Yorkshire Terrier'
    ];

    return breedNames.map((breedName, index) => {
      const fileName = convertBreedNameToFileName(breedName);
      return {
        id: `dog-${index}`,
        src: `/images/breeds/${fileName}`,
        breed: breedName,
        alt: `${breedName} dog`
      };
    });
  };

  // Load all images on component mount and randomize them
  useEffect(() => {
    const allImages = generateDogImages();
    const shuffledImages = shuffleArray(allImages);
    setImages(shuffledImages);
  }, []);

  const handleImageClick = (image: DogImage) => {
    // You can add modal or navigation logic here
    console.log('Clicked on:', image.breed);
  };

  // Split images into two rows
  const firstRowImages = images.slice(0, Math.ceil(images.length / 2));
  const secondRowImages = images.slice(Math.ceil(images.length / 2));

  return (
    <div className={className} style={style}>
      {/* First Row */}
      <div 
        style={{ 
          display: 'flex',
          gap: '16px',
          padding: '16px 0',
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#d9d9d9 transparent'
        }}
      >
        {firstRowImages.map((image) => (
          <Card
            key={image.id}
            hoverable
            style={{ 
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'transform 0.2s ease-in-out',
              cursor: 'pointer',
              minWidth: '200px',
              flexShrink: 0
            }}
            styles={{ body: { padding: 0 } }}
            onClick={() => handleImageClick(image)}
          >
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="200px"
                style={{ 
                  objectFit: 'cover',
                  borderRadius: '12px 12px 0 0'
                }}
                unoptimized
              />
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out'
              }}>
                <HeartOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
              </div>
            </div>
            <div style={{ padding: '12px', textAlign: 'center' }}>
              <Text strong style={{ fontSize: '14px' }}>
                {image.breed}
              </Text>
            </div>
          </Card>
        ))}
      </div>

      {/* Second Row */}
      <div 
        style={{ 
          display: 'flex',
          gap: '16px',
          padding: '16px 0',
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#d9d9d9 transparent'
        }}
      >
        {secondRowImages.map((image) => (
          <Card
            key={image.id}
            hoverable
            style={{ 
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'transform 0.2s ease-in-out',
              cursor: 'pointer',
              minWidth: '200px',
              flexShrink: 0
            }}
            styles={{ body: { padding: 0 } }}
            onClick={() => handleImageClick(image)}
          >
            <div style={{ position: 'relative', width: '200px', height: '200px' }}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="200px"
                style={{ 
                  objectFit: 'cover',
                  borderRadius: '12px 12px 0 0'
                }}
                unoptimized
              />
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease-in-out'
              }}>
                <HeartOutlined style={{ color: '#ff4d4f', fontSize: '16px' }} />
              </div>
            </div>
            <div style={{ padding: '12px', textAlign: 'center' }}>
              <Text strong style={{ fontSize: '14px' }}>
                {image.breed}
              </Text>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DogGallery;