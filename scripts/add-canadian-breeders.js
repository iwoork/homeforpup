#!/usr/bin/env node

/**
 * Add Canadian Breeders
 * 
 * This script adds sample Canadian breeders to the database to provide
 * a good mix of Canadian and US breeders for testing the country filter.
 */

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
});

const dynamodb = DynamoDBDocumentClient.from(client);

// Table name
const BREEDERS_TABLE = process.env.BREEDERS_TABLE_NAME || process.env.BREEDERS_TABLE || 'homeforpup-breeders';

// Canadian breeders data
const canadianBreeders = [
  {
    id: 2001,
    name: "Maple Leaf Golden Retrievers",
    business_name: "Maple Leaf Golden Retrievers",
    location: "Toronto, ON, Canada",
    country: "Canada",
    state: "ON",
    city: "Toronto",
    zip_code: "M5H 2N2",
    latitude: 43.6532,
    longitude: -79.3832,
    phone: "+1-416-555-0101",
    email: "info@mapleleafgoldens.ca",
    website: "https://mapleleafgoldens.ca",
    experience: 15,
    breeds: ["Golden Retriever", "Labrador Retriever"],
    breed_ids: [1, 2],
    rating: 4.8,
    review_count: 127,
    verified: "True",
    profile_image: "https://picsum.photos/200/200?random=2001",
    cover_image: "https://picsum.photos/800/300?random=2001",
    about: "Family-owned kennel specializing in health-tested Golden Retrievers and Labradors. Located in the heart of Toronto with over 15 years of breeding experience.",
    certifications: ["CKC Registered", "OFA Certified", "Health Tested"],
    health_testing: ["Hip Dysplasia", "Elbow Dysplasia", "Eye Clearance", "Heart Clearance"],
    specialties: ["Family Dogs", "Therapy Dogs", "Show Dogs"],
    current_litters: 2,
    available_puppies: 8,
    pricing: "$2,500 - $3,500",
    shipping: true,
    pickup_available: true,
    established_year: 2008,
    business_hours: "Mon-Fri 9AM-6PM, Sat 10AM-4PM",
    appointment_required: true,
    social_media: {
      facebook: "https://facebook.com/mapleleafgoldens",
      instagram: "https://instagram.com/mapleleafgoldens"
    },
    tags: ["family-friendly", "health-tested", "show-quality"],
    response_rate: 0.95,
    avg_response_time: "2 hours",
    last_updated: new Date().toISOString(),
    active: "True"
  },
  {
    id: 2002,
    name: "Rocky Mountain Bernese",
    business_name: "Rocky Mountain Bernese Mountain Dogs",
    location: "Calgary, AB, Canada",
    country: "Canada",
    state: "AB",
    city: "Calgary",
    zip_code: "T2P 1J9",
    latitude: 51.0447,
    longitude: -114.0719,
    phone: "+1-403-555-0202",
    email: "contact@rockymountainbernese.ca",
    website: "https://rockymountainbernese.ca",
    experience: 12,
    breeds: ["Bernese Mountain Dog", "Greater Swiss Mountain Dog"],
    breed_ids: [3, 4],
    rating: 4.9,
    review_count: 89,
    verified: "True",
    profile_image: "https://picsum.photos/200/200?random=2002",
    cover_image: "https://picsum.photos/800/300?random=2002",
    about: "Premier breeder of Bernese Mountain Dogs in Western Canada. Focus on temperament, health, and conformation. All dogs are health tested and CKC registered.",
    certifications: ["CKC Registered", "OFA Certified", "CHIC Certified"],
    health_testing: ["Hip Dysplasia", "Elbow Dysplasia", "Eye Clearance", "Von Willebrand Disease"],
    specialties: ["Working Dogs", "Family Companions", "Show Dogs"],
    current_litters: 1,
    available_puppies: 5,
    pricing: "$3,000 - $4,000",
    shipping: true,
    pickup_available: true,
    established_year: 2011,
    business_hours: "Mon-Fri 8AM-5PM, Sat 9AM-3PM",
    appointment_required: true,
    social_media: {
      facebook: "https://facebook.com/rockymountainbernese",
      instagram: "https://instagram.com/rockymountainbernese"
    },
    tags: ["working-dogs", "health-tested", "mountain-dogs"],
    response_rate: 0.98,
    avg_response_time: "1 hour",
    last_updated: new Date().toISOString(),
    active: "True"
  },
  {
    id: 2003,
    name: "Pacific Coast Poodles",
    business_name: "Pacific Coast Standard Poodles",
    location: "Vancouver, BC, Canada",
    country: "Canada",
    state: "BC",
    city: "Vancouver",
    zip_code: "V6B 1A1",
    latitude: 49.2827,
    longitude: -123.1207,
    phone: "+1-604-555-0303",
    email: "info@pacificcoastpoodles.ca",
    website: "https://pacificcoastpoodles.ca",
    experience: 20,
    breeds: ["Standard Poodle", "Miniature Poodle"],
    breed_ids: [5, 6],
    rating: 4.7,
    review_count: 156,
    verified: "True",
    profile_image: "https://picsum.photos/200/200?random=2003",
    cover_image: "https://picsum.photos/800/300?random=2003",
    about: "Award-winning poodle breeder with over 20 years of experience. Specializing in intelligent, athletic, and hypoallergenic poodles for families and competitors.",
    certifications: ["CKC Registered", "OFA Certified", "AKC DNA Tested"],
    health_testing: ["Hip Dysplasia", "Elbow Dysplasia", "Eye Clearance", "SA Clearance"],
    specialties: ["Hypoallergenic", "Intelligence", "Athletic", "Show Dogs"],
    current_litters: 3,
    available_puppies: 12,
    pricing: "$2,800 - $3,800",
    shipping: true,
    pickup_available: true,
    established_year: 2003,
    business_hours: "Mon-Fri 9AM-6PM, Sat-Sun 10AM-4PM",
    appointment_required: false,
    social_media: {
      facebook: "https://facebook.com/pacificcoastpoodles",
      instagram: "https://instagram.com/pacificcoastpoodles"
    },
    tags: ["hypoallergenic", "intelligent", "athletic", "show-quality"],
    response_rate: 0.92,
    avg_response_time: "3 hours",
    last_updated: new Date().toISOString(),
    active: "True"
  },
  {
    id: 2004,
    name: "Prairie Border Collies",
    business_name: "Prairie Border Collie Ranch",
    location: "Winnipeg, MB, Canada",
    country: "Canada",
    state: "MB",
    city: "Winnipeg",
    zip_code: "R3C 1A5",
    latitude: 49.8951,
    longitude: -97.1384,
    phone: "+1-204-555-0404",
    email: "ranch@prairiebordercollies.ca",
    website: "https://prairiebordercollies.ca",
    experience: 18,
    breeds: ["Border Collie", "Australian Shepherd"],
    breed_ids: [7, 8],
    rating: 4.9,
    review_count: 203,
    verified: "True",
    profile_image: "https://picsum.photos/200/200?random=2004",
    cover_image: "https://picsum.photos/800/300?random=2004",
    about: "Working ranch specializing in high-drive Border Collies and Australian Shepherds. Perfect for herding, agility, and active families.",
    certifications: ["CKC Registered", "Working Dog Certified", "Health Tested"],
    health_testing: ["Hip Dysplasia", "Elbow Dysplasia", "Eye Clearance", "MDR1 Test"],
    specialties: ["Working Dogs", "Herding", "Agility", "High Drive"],
    current_litters: 2,
    available_puppies: 7,
    pricing: "$2,200 - $3,200",
    shipping: true,
    pickup_available: true,
    established_year: 2005,
    business_hours: "Mon-Fri 7AM-6PM, Sat 8AM-4PM",
    appointment_required: true,
    social_media: {
      facebook: "https://facebook.com/prairiebordercollies",
      instagram: "https://instagram.com/prairiebordercollies"
    },
    tags: ["working-dogs", "herding", "agility", "high-drive"],
    response_rate: 0.96,
    avg_response_time: "2 hours",
    last_updated: new Date().toISOString(),
    active: "True"
  },
  {
    id: 2005,
    name: "Atlantic Labradors",
    business_name: "Atlantic Coast Labrador Retrievers",
    location: "Halifax, NS, Canada",
    country: "Canada",
    state: "NS",
    city: "Halifax",
    zip_code: "B3H 2Y1",
    latitude: 44.6488,
    longitude: -63.5752,
    phone: "+1-902-555-0505",
    email: "info@atlanticlabradors.ca",
    website: "https://atlanticlabradors.ca",
    experience: 14,
    breeds: ["Labrador Retriever", "Chesapeake Bay Retriever"],
    breed_ids: [2, 9],
    rating: 4.6,
    review_count: 94,
    verified: "True",
    profile_image: "https://picsum.photos/200/200?random=2005",
    cover_image: "https://picsum.photos/800/300?random=2005",
    about: "Maritime breeder specializing in water-loving retrievers. Perfect for hunting, water sports, and active families on the coast.",
    certifications: ["CKC Registered", "Hunting Certified", "Health Tested"],
    health_testing: ["Hip Dysplasia", "Elbow Dysplasia", "Eye Clearance", "Exercise Induced Collapse"],
    specialties: ["Hunting Dogs", "Water Dogs", "Family Companions", "Retrievers"],
    current_litters: 1,
    available_puppies: 4,
    pricing: "$2,400 - $3,400",
    shipping: true,
    pickup_available: true,
    established_year: 2009,
    business_hours: "Mon-Fri 8AM-5PM, Sat 9AM-3PM",
    appointment_required: true,
    social_media: {
      facebook: "https://facebook.com/atlanticlabradors",
      instagram: "https://instagram.com/atlanticlabradors"
    },
    tags: ["hunting-dogs", "water-dogs", "retrievers", "maritime"],
    response_rate: 0.94,
    avg_response_time: "4 hours",
    last_updated: new Date().toISOString(),
    active: "True"
  }
];

// Function to add a single breeder
async function addBreeder(breeder) {
  const params = {
    TableName: BREEDERS_TABLE,
    Item: breeder
  };
  
  try {
    await dynamodb.send(new PutCommand(params));
    return { success: true };
  } catch (error) {
    console.error(`❌ Error adding breeder ${breeder.business_name}:`, error);
    return { success: false, error: error.message };
  }
}

// Main function
async function addCanadianBreeders() {
  console.log('🇨🇦 Adding Canadian breeders to the database...\n');
  
  try {
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < canadianBreeders.length; i++) {
      const breeder = canadianBreeders[i];
      const progress = `[${i + 1}/${canadianBreeders.length}]`;
      
      console.log(`${progress} Adding ${breeder.business_name} (${breeder.city}, ${breeder.state})...`);
      
      const result = await addBreeder(breeder);
      
      if (result.success) {
        successCount++;
        console.log(`   ✅ Added successfully`);
      } else {
        errorCount++;
        console.log(`   ❌ Failed: ${result.error}`);
      }
      
      // Add small delay to avoid throttling
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    console.log('\n📊 Addition Summary:');
    console.log(`   ✅ Successfully added: ${successCount}`);
    console.log(`   ❌ Failed additions: ${errorCount}`);
    
    if (errorCount > 0) {
      console.log('\n⚠️  Some additions failed. You may want to run the script again.');
    } else {
      console.log('\n🎉 All Canadian breeders added successfully!');
    }
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the addition
addCanadianBreeders().catch(console.error);
