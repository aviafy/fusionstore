const fs = require('fs');
const path = require('path');
const Product = require('../models/product');
const NFT = require('../models/nft');
const FreelancerService = require('../models/freelancerService');
const { freelancerServices } = require('../seed/freelancerServiceSeeds');

const DEFAULT_NFT_SEEDS = [
  {
    name: 'Chromatic Pulse #001',
    description: 'A vibrant digital artwork with layered gradients and glowing neon accents. Part of the genesis Digital Collection exploring the interplay of light and color in digital spaces.',
    image: '/images/nfts/nft-1.jpg',
    imageGallery: ['/images/nfts/nft-2.jpg', '/images/nfts/nft-3.jpg'],
    price: 2.5,
    collection: 'Digital Collection',
    rarity: 'Rare',
    contractAddress: '0xA1b2C3d4E5f6789012345678abcDEF0123456789',
    tokenId: '001',
    creator: 'NeonForge',
    attributes: [{ trait: 'Palette', value: 'Vibrant' }, { trait: 'Medium', value: 'Generative' }],
    rating: 4.8,
    numReviews: 42,
    views: 1280,
  },
  {
    name: 'Neon District',
    description: 'A neon composition inspired by cyberpunk skylines and abstract geometry. Glowing circuits and digital rain cascade through a dystopian cityscape.',
    image: '/images/nfts/nft-2.jpg',
    imageGallery: ['/images/nfts/nft-1.jpg', '/images/nfts/nft-5.jpg'],
    price: 1.8,
    collection: 'Digital Collection',
    rarity: 'Epic',
    contractAddress: '0xA1b2C3d4E5f6789012345678abcDEF0123456789',
    tokenId: '002',
    creator: 'CyberArtisan',
    attributes: [{ trait: 'Palette', value: 'Neon' }, { trait: 'Theme', value: 'Cyberpunk' }],
    rating: 4.6,
    numReviews: 38,
    views: 945,
  },
  {
    name: 'Ethereal Convergence',
    description: 'A premium abstract piece with layered particles and motion-inspired forms. Gold and platinum elements weave through a cosmic tapestry of light.',
    image: '/images/nfts/nft-3.jpg',
    imageGallery: ['/images/nfts/nft-1.jpg', '/images/nfts/nft-8.jpg'],
    price: 5.2,
    collection: 'Premium Collection',
    rarity: 'Legendary',
    contractAddress: '0xB2c3D4e5F6a7890123456789AbCdEf0123456789',
    tokenId: '003',
    creator: 'AetherStudio',
    attributes: [{ trait: 'Palette', value: 'Gradient' }, { trait: 'Edition', value: '1 of 1' }],
    rating: 4.9,
    numReviews: 56,
    views: 3450,
  },
  {
    name: 'Enchanted Bloom',
    description: 'A magical artwork filled with glowing bioluminescent flora and mystical patterns. An otherworldly garden frozen in eternal twilight.',
    image: '/images/nfts/nft-4.jpg',
    imageGallery: ['/images/nfts/nft-7.jpg'],
    price: 1.5,
    collection: 'Fantasy Worlds',
    rarity: 'Uncommon',
    contractAddress: '0xC3d4E5f6A7b8901234567890aBcDeF0123456789',
    tokenId: '004',
    creator: 'PixelDruid',
    attributes: [{ trait: 'Palette', value: 'Pastel' }, { trait: 'Theme', value: 'Fantasy' }],
    rating: 4.4,
    numReviews: 28,
    views: 620,
  },
  {
    name: 'Dragon\'s Ascent',
    description: 'A majestic artwork depicting a celestial dragon rising through storm clouds, with intricate scale details and energy trails cascading from its wings.',
    image: '/images/nfts/nft-5.jpg',
    imageGallery: ['/images/nfts/nft-4.jpg', '/images/nfts/nft-6.jpg'],
    price: 3.8,
    collection: 'Mythical Series',
    rarity: 'Epic',
    contractAddress: '0xD4e5F6a7B8c9012345678901AbCdEf0123456789',
    tokenId: '005',
    creator: 'MythWeaver',
    attributes: [{ trait: 'Palette', value: 'Warm' }, { trait: 'Subject', value: 'Mythical Beast' }],
    rating: 4.7,
    numReviews: 45,
    views: 1890,
  },
  {
    name: 'Neural Interface',
    description: 'A futuristic artwork depicting the fusion of human consciousness and machine intelligence. Glowing synaptic connections form a digital neural network.',
    image: '/images/nfts/nft-6.jpg',
    imageGallery: ['/images/nfts/nft-2.jpg', '/images/nfts/nft-8.jpg'],
    price: 2.2,
    collection: 'Cyberpunk',
    rarity: 'Rare',
    contractAddress: '0xE5f6A7b8C9d0123456789012AbCdEf0123456789',
    tokenId: '006',
    creator: 'SynthMind',
    attributes: [{ trait: 'Palette', value: 'Neon' }, { trait: 'Theme', value: 'AI' }],
    rating: 4.5,
    numReviews: 32,
    views: 780,
  },
  {
    name: 'Abyssal Depths',
    description: 'Explore mysterious ocean depths with bioluminescent creatures and ethereal underwater landscapes. Light dances through deep blue waters revealing hidden worlds.',
    image: '/images/nfts/nft-7.jpg',
    imageGallery: ['/images/nfts/nft-4.jpg', '/images/nfts/nft-9.jpg'],
    price: 1.9,
    collection: 'Nature Wonders',
    rarity: 'Uncommon',
    contractAddress: '0xF6a7B8c9D0e1234567890123AbCdEf0123456789',
    tokenId: '007',
    creator: 'OceanicVisions',
    attributes: [{ trait: 'Palette', value: 'Cool Tones' }, { trait: 'Theme', value: 'Ocean' }],
    rating: 4.3,
    numReviews: 25,
    views: 540,
  },
  {
    name: 'Cosmic Spiral',
    description: 'A swirling vortex of interstellar dust and nebula gases representing the flow of time and space. Stars are born and die in this eternal dance of creation.',
    image: '/images/nfts/nft-8.jpg',
    imageGallery: ['/images/nfts/nft-3.jpg', '/images/nfts/nft-10.jpg'],
    price: 2.6,
    collection: 'Scientific Visions',
    rarity: 'Rare',
    contractAddress: '0xa7B8c9D0e1F2345678901234AbCdEf0123456789',
    tokenId: '008',
    creator: 'AstroCanvas',
    attributes: [{ trait: 'Palette', value: 'Gradient' }, { trait: 'Theme', value: 'Space' }],
    rating: 4.6,
    numReviews: 40,
    views: 1100,
  },
  {
    name: 'Aurora Genesis',
    description: 'A captivating digital creation capturing the northern lights in an abstract reimagination. Ribbons of emerald and violet light weave across a polar sky.',
    image: '/images/nfts/nft-9.jpg',
    imageGallery: ['/images/nfts/nft-7.jpg', '/images/nfts/nft-10.jpg'],
    price: 2.1,
    collection: 'Digital Collection',
    rarity: 'Rare',
    contractAddress: '0xb8C9d0E1f2A3456789012345AbCdEf0123456789',
    tokenId: '009',
    creator: 'BorealArt',
    attributes: [{ trait: 'Palette', value: 'Mixed' }, { trait: 'Theme', value: 'Nature' }],
    rating: 4.5,
    numReviews: 35,
    views: 870,
  },
  {
    name: 'Quantum Bloom',
    description: 'An extraordinary piece depicting quantum particles forming organic flower-like structures at the subatomic level. Where physics meets art in a burst of color and form.',
    image: '/images/nfts/nft-10.jpg',
    imageGallery: ['/images/nfts/nft-3.jpg', '/images/nfts/nft-8.jpg'],
    price: 4.5,
    collection: 'Premium Collection',
    rarity: 'Legendary',
    contractAddress: '0xc9D0e1F2a3B4567890123456AbCdEf0123456789',
    tokenId: '010',
    creator: 'QuantumForge',
    attributes: [{ trait: 'Palette', value: 'Vibrant' }, { trait: 'Edition', value: '1 of 1' }],
    rating: 4.9,
    numReviews: 52,
    views: 4200,
  },
];

function loadProductsFromJson() {
  const productsFilePath = path.join(__dirname, '../data/products.json');
  const raw = fs.readFileSync(productsFilePath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];
  return parsed.map(p => ({
    _id: String(p._id || p.id),
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    image: p.image,
    brand: p.brand || '',
    stock: typeof p.stock === 'number' ? p.stock : 0,
    rating: typeof p.rating === 'number' ? p.rating : 0,
    numReviews: typeof p.numReviews === 'number' ? p.numReviews : 0,
    isFeatured: Boolean(p.isFeatured),
    createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
  }));
}

/**
 * Seed empty collections from JSON / static data. Idempotent when data exists.
 */
async function seedDatabase() {
  const summary = { products: null, nfts: null, freelancerServices: null };

  const productCount = await Product.countDocuments();
  if (productCount === 0) {
    const docs = loadProductsFromJson();
    if (docs.length) {
      await Product.insertMany(docs);
      summary.products = { inserted: docs.length };
    } else {
      summary.products = { inserted: 0, note: 'products.json empty or missing' };
    }
  } else {
    summary.products = { skipped: true, count: productCount };
  }

  const nftCount = await NFT.countDocuments();
  if (nftCount === 0) {
    await NFT.insertMany(DEFAULT_NFT_SEEDS);
    summary.nfts = { inserted: DEFAULT_NFT_SEEDS.length };
  } else {
    summary.nfts = { skipped: true, count: nftCount };
  }

  const svcCount = await FreelancerService.countDocuments();
  if (svcCount === 0 && Array.isArray(freelancerServices) && freelancerServices.length) {
    await FreelancerService.insertMany(freelancerServices);
    summary.freelancerServices = { inserted: freelancerServices.length };
  } else {
    summary.freelancerServices = { skipped: svcCount > 0, count: svcCount };
  }

  return summary;
}

module.exports = { seedDatabase, loadProductsFromJson };
