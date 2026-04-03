const NFT = require('../models/nft');

// Base URL for local images - change to your server URL in production
const BASE_URL = process.env.BASE_URL || 'http://localhost:5050';
const IMAGE_PATH = `${BASE_URL}/images`;

const nftData = [
  {
    name: 'Digital Art #1',
    description: 'A stunning digital artwork with vibrant colors and ethereal patterns.',
    image: `${IMAGE_PATH}/image.png`,
    imageGallery: [],
    price: 2.5,
    collection: 'Digital Collection',
    rarity: 'Rare',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: '001',
    creator: 'Creator_001',
    attributes: [
      { trait: 'Color Palette', value: 'Vibrant' },
      { trait: 'Complexity', value: 'High' },
      { trait: 'Type', value: 'Digital Art' },
    ],
    rating: 4.8,
    numReviews: 42,
  },
  {
    name: 'Digital Art #2',
    description: 'Mesmerizing artwork captured in digital form with flowing patterns.',
    image: `${IMAGE_PATH}/image (1).png`,
    imageGallery: [],
    price: 1.8,
    collection: 'Digital Collection',
    rarity: 'Epic',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: '002',
    creator: 'Creator_002',
    attributes: [
      { trait: 'Color Palette', value: 'Cool Tones' },
      { trait: 'Complexity', value: 'Medium' },
      { trait: 'Type', value: 'Digital Art' },
    ],
    rating: 4.6,
    numReviews: 38,
  },
  {
    name: 'Digital Art #3',
    description: 'An abstract representation with particles and waves in motion.',
    image: `${IMAGE_PATH}/image (2).png`,
    imageGallery: [],
    price: 3.2,
    collection: 'Abstract Series',
    rarity: 'Legendary',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: '003',
    creator: 'Creator_003',
    attributes: [
      { trait: 'Color Palette', value: 'Neon' },
      { trait: 'Complexity', value: 'Very High' },
      { trait: 'Type', value: 'Abstract' },
    ],
    rating: 4.9,
    numReviews: 56,
  },
  {
    name: 'Digital Art #4',
    description: 'A magical artwork filled with glowing elements and mystical patterns.',
    image: `${IMAGE_PATH}/image (3).png`,
    imageGallery: [],
    price: 1.5,
    collection: 'Fantasy Worlds',
    rarity: 'Uncommon',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: '004',
    creator: 'Creator_004',
    attributes: [
      { trait: 'Color Palette', value: 'Pastel' },
      { trait: 'Complexity', value: 'Medium' },
      { trait: 'Type', value: 'Fantasy' },
    ],
    rating: 4.4,
    numReviews: 28,
  },
  {
    name: 'Digital Art #5',
    description: 'A majestic artwork with intricate details and flowing elements.',
    image: `${IMAGE_PATH}/image (4).png`,
    imageGallery: [],
    price: 2.8,
    collection: 'Mythical Series',
    rarity: 'Epic',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: '005',
    creator: 'Creator_005',
    attributes: [
      { trait: 'Color Palette', value: 'Warm' },
      { trait: 'Complexity', value: 'High' },
      { trait: 'Type', value: 'Mythical' },
    ],
    rating: 4.7,
    numReviews: 45,
  },
  {
    name: 'Digital Art #6',
    description: 'A futuristic artwork with cybernetic enhancements and neon aesthetics.',
    image: `${IMAGE_PATH}/image (5).png`,
    imageGallery: [],
    price: 2.2,
    collection: 'Cyberpunk',
    rarity: 'Rare',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: '006',
    creator: 'Creator_006',
    attributes: [
      { trait: 'Color Palette', value: 'Neon' },
      { trait: 'Complexity', value: 'High' },
      { trait: 'Type', value: 'Cyberpunk' },
    ],
    rating: 4.5,
    numReviews: 32,
  },
  {
    name: 'Digital Art #7',
    description: 'Explore mysterious depths with bioluminescent and ethereal elements.',
    image: `${IMAGE_PATH}/image (6).png`,
    imageGallery: [],
    price: 1.9,
    collection: 'Nature Wonders',
    rarity: 'Uncommon',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: '007',
    creator: 'Creator_007',
    attributes: [
      { trait: 'Color Palette', value: 'Cool Tones' },
      { trait: 'Complexity', value: 'Medium' },
      { trait: 'Type', value: 'Nature' },
    ],
    rating: 4.3,
    numReviews: 25,
  },
  {
    name: 'Digital Art #8',
    description: 'A swirling vortex representing the flow of time and space.',
    image: `${IMAGE_PATH}/image (7).png`,
    imageGallery: [],
    price: 2.6,
    collection: 'Scientific Visions',
    rarity: 'Rare',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: '008',
    creator: 'Creator_008',
    attributes: [
      { trait: 'Color Palette', value: 'Gradient' },
      { trait: 'Complexity', value: 'Very High' },
      { trait: 'Type', value: 'Science' },
    ],
    rating: 4.6,
    numReviews: 40,
  },
  {
    name: 'Digital Art #9',
    description: 'A captivating digital creation with unique visual elements.',
    image: `${IMAGE_PATH}/image (8).png`,
    imageGallery: [],
    price: 2.1,
    collection: 'Digital Collection',
    rarity: 'Rare',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: '009',
    creator: 'Creator_009',
    attributes: [
      { trait: 'Color Palette', value: 'Mixed' },
      { trait: 'Complexity', value: 'High' },
      { trait: 'Type', value: 'Digital Art' },
    ],
    rating: 4.5,
    numReviews: 35,
  },
  {
    name: 'Digital Art #10',
    description: 'An extraordinary piece showcasing advanced digital artistry.',
    image: `${IMAGE_PATH}/image (9).png`,
    imageGallery: [],
    price: 3.0,
    collection: 'Premium Collection',
    rarity: 'Legendary',
    contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
    tokenId: '010',
    creator: 'Creator_010',
    attributes: [
      { trait: 'Color Palette', value: 'Vibrant' },
      { trait: 'Complexity', value: 'Very High' },
      { trait: 'Type', value: 'Premium' },
    ],
    rating: 4.9,
    numReviews: 52,
  },
];

async function seedNFTs() {
  try {
    // Load NFTs from data source
    const nfts = [];
    
    await NFT.deleteMany({});
    console.log('Cleared existing NFTs');

    const createdNFTs = await NFT.insertMany(nftData);
    console.log(`Successfully seeded ${createdNFTs.length} NFTs`);
  } catch (error) {
    console.error('Error seeding NFTs:', error);
    process.exit(1);
  }
}

seedNFTs();
