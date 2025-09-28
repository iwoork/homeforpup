import React from 'react';
import { EthicalGuidelines } from '@homeforpup/shared-components';
import StructuredData from '@/components/StructuredData';

export default function EthicalGuidelinesPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Ethical Guidelines for Pet Adoption",
    "description": "Our commitment to responsible pet adoption and ethical breeding practices. Guidelines for adopters and breeders to ensure animal welfare.",
    "url": "https://homeforpup.com/ethical-guidelines",
    "mainEntity": {
      "@type": "Article",
      "headline": "Ethical Guidelines for Pet Adoption",
      "author": {
        "@type": "Organization",
        "name": "HomeForPup"
      },
      "publisher": {
        "@type": "Organization",
        "name": "HomeForPup",
        "logo": {
          "@type": "ImageObject",
          "url": "https://homeforpup.com/logo.png"
        }
      },
      "datePublished": "2024-01-01",
      "dateModified": "2024-01-01",
      "description": "Comprehensive ethical guidelines for responsible pet adoption and breeding practices",
      "articleSection": "Pet Care Guidelines",
      "keywords": [
        "pet adoption",
        "ethical breeding",
        "responsible pet ownership",
        "animal welfare",
        "dog adoption",
        "puppy adoption",
        "breeder guidelines"
      ]
    }
  };

  return (
    <>
      <StructuredData data={structuredData} />
      <div style={{ 
        padding: '2rem 1rem', 
        maxWidth: '1200px', 
        margin: '0 auto',
        minHeight: '80vh'
      }}>
        <EthicalGuidelines />
      </div>
    </>
  );
}
