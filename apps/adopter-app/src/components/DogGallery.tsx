'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Image, Typography } from 'antd';
import { HeartOutlined } from '@ant-design/icons';

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
  const firstRowRef = useRef<HTMLDivElement>(null);
  const secondRowRef = useRef<HTMLDivElement>(null);

  // Generate breed images from the public/breeds folder
  const generateDogImages = (): DogImage[] => {
    const breedImages = [
      'Akita.jpg', 'Aussiedoodle.jpg', 'Australian Shepherd.jpg', 'Basenji.jpg',
      'Beagle.jpg', 'Bernedoodle.jpg', 'Bernese Mountain Dog.jpg', 'Border Collie.jpg',
      'Boston Terrier.jpg', 'Boxer.jpg', 'Brittany.jpg', 'Bulldog.jpg',
      'Cavalier King Charles Spaniel.jpg', 'Cavapoo.jpg', 'Chihuahua.jpg', 'Cockapoo.jpg',
      'Cocker Spaniel.jpg', 'Dachshund.jpg', 'Doberman Pinscher.jpg', 'English Setter.jpg',
      'French Bulldog.jpg', 'German Shepherd.jpg', 'Golden Retriever.jpg', 'Goldendoodle.jpg',
      'Great Dane.jpg', 'Greyhound.jpg', 'Irish Setter.jpg', 'Jack Russell Terrier.jpg',
      'Labradoodle.jpg', 'Labrador Retriever.jpg', 'Maltese.jpg', 'Maltipoo.jpg',
      'Mastiff.jpg', 'Newfoundland.jpg', 'Pointer.jpg', 'Pomeranian.jpg',
      'Poodle.jpg', 'Puggle.jpg', 'Rottweiler.jpg', 'Saint Bernard.jpg',
      'Schnoodle.jpg', 'Shiba Inu.jpg', 'Shih Tzu.jpg', 'Siberian Husky.jpg',
      'Spanish Mastiff.jpg', 'Spanish Water Dog.jpg', 'Spinone Italiano.jpg', 'Sporty Mix.jpg',
      'Springerdoodle.jpg', 'Stabyhoun.jpg', 'Staffordshire Bull Terrier.jpg', 'Standard Schnauzer.jpg',
      'Sussex Spaniel.jpg', 'Swedish Lapphund.jpg', 'Swedish Vallhund.jpg', 'Taigan.jpg',
      'Tamaskan.jpg', 'Teddy Roosevelt Terrier.jpg', 'Thai Ridgeback.jpg', 'Tibetan Mastiff.jpg',
      'Tibetan Spaniel.jpg', 'Tibetan Terrier.jpg', 'Tornjak.jpg', 'Tosa Inu.jpg',
      'Toy Australian Shepherd.jpg', 'Toy Fox Terrier.jpg', 'Toy Shetland Sheepdog.jpg', 'Transylvanian Hound.jpg',
      'Treeing Feist.jpg', 'Vizsla.jpg', 'Weimaraner.jpg', 'Whippet.jpg',
      'Yorkipoo.jpg', 'Yorkshire Terrier.jpg'
    ];

    return breedImages.map((imageName, index) => {
      const breedName = imageName.replace('.jpg', '');
      return {
        id: `dog-${index}`,
        src: `/breeds/${imageName}`,
        breed: breedName,
        alt: `${breedName} dog`
      };
    });
  };

  // Load all images on component mount
  useEffect(() => {
    const allImages = generateDogImages();
    setImages(allImages);
  }, []);

  // Auto-scroll animation
  useEffect(() => {
    const scrollSpeed = 0.5; // pixels per frame (adjust for speed)
    let animationId: number;

    const animateScroll = () => {
      if (firstRowRef.current && secondRowRef.current) {
        // First row scrolls left
        firstRowRef.current.scrollLeft -= scrollSpeed;
        
        // Second row scrolls right
        secondRowRef.current.scrollLeft += scrollSpeed;

        // Reset scroll position when reaching the end
        if (firstRowRef.current.scrollLeft <= 0) {
          firstRowRef.current.scrollLeft = firstRowRef.current.scrollWidth - firstRowRef.current.clientWidth;
        }
        
        if (secondRowRef.current.scrollLeft >= secondRowRef.current.scrollWidth - secondRowRef.current.clientWidth) {
          secondRowRef.current.scrollLeft = 0;
        }
      }
      
      animationId = requestAnimationFrame(animateScroll);
    };

    // Start animation after a short delay
    const startAnimation = setTimeout(() => {
      animateScroll();
    }, 1000);

    return () => {
      clearTimeout(startAnimation);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [images]);

  const handleImageClick = (image: DogImage) => {
    // You can add modal or navigation logic here
    console.log('Clicked on:', image.breed);
  };

  // Split images into two rows
  const firstRowImages = images.slice(0, Math.ceil(images.length / 2));
  const secondRowImages = images.slice(Math.ceil(images.length / 2));

  return (
    <div className={className} style={style}>
      {/* First Row - Scrolls Left */}
      <div 
        ref={firstRowRef}
        style={{ 
          display: 'flex',
          gap: '16px',
          padding: '16px 0',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' }
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
            bodyStyle={{ padding: 0 }}
            onClick={() => handleImageClick(image)}
          >
            <div style={{ position: 'relative' }}>
              <Image
                src={image.src}
                alt={image.alt}
                style={{ 
                  width: '200px', 
                  height: '200px', 
                  objectFit: 'cover',
                  borderRadius: '12px 12px 0 0'
                }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
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
            <div style={{ padding: '12px' }}>
              <Text strong style={{ fontSize: '14px' }}>
                {image.breed}
              </Text>
            </div>
          </Card>
        ))}
      </div>

      {/* Second Row - Scrolls Right */}
      <div 
        ref={secondRowRef}
        style={{ 
          display: 'flex',
          gap: '16px',
          padding: '16px 0',
          overflowX: 'hidden',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitScrollbar: { display: 'none' }
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
            bodyStyle={{ padding: 0 }}
            onClick={() => handleImageClick(image)}
          >
            <div style={{ position: 'relative' }}>
              <Image
                src={image.src}
                alt={image.alt}
                style={{ 
                  width: '200px', 
                  height: '200px', 
                  objectFit: 'cover',
                  borderRadius: '12px 12px 0 0'
                }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
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
            <div style={{ padding: '12px' }}>
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
