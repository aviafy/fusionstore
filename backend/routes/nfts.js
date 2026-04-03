const express = require('express');
const { body, validationResult } = require('express-validator');
const NFT = require('../models/nft');
const { RARITIES } = require('../models/nft');
const { requireAdmin } = require('../middleware/adminMiddleware');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

const nftBodyValidators = [
  body('name').trim().isLength({ min: 1, max: 200 }),
  body('description').trim().isLength({ min: 1, max: 5000 }),
  body('image').trim().isLength({ min: 1, max: 2048 }),
  body('price').isFloat({ min: 0 }),
  body('collection').trim().isLength({ min: 1, max: 200 }),
  body('contractAddress').matches(/^0x[a-fA-F0-9]{40}$/),
  body('tokenId').trim().isLength({ min: 1, max: 64 }),
  body('creator').trim().isLength({ min: 1, max: 120 }),
  body('rarity').optional().isIn(RARITIES),
  body('imageGallery').optional().isArray({ max: 20 }),
];

function handleValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ message: 'Validation failed', errors: errors.array(), code: 'VALIDATION' });
    return false;
  }
  return true;
}

router.get('/', async (req, res) => {
  try {
    const { collection, rarity, sort } = req.query;
    const filter = {};
    if (collection) filter.collection = String(collection);
    if (rarity) filter.rarity = String(rarity);

    let sortSpec = { createdAt: -1 };
    if (sort === 'price') sortSpec = { price: 1 };
    else if (sort === 'rating') sortSpec = { rating: -1 };
    else if (sort === 'views') sortSpec = { views: -1 };
    else if (sort === 'newest') sortSpec = { createdAt: -1 };

    const nfts = await NFT.find(filter).sort(sortSpec).lean();
    res.json(nfts);
  } catch (error) {
    console.error('Error fetching NFTs:', error);
    res.status(500).json({ message: 'Error fetching NFTs', code: 'NFT_LIST_FAILED' });
  }
});

router.get('/collection/:collection', async (req, res) => {
  try {
    const nfts = await NFT.find({ collection: req.params.collection }).lean();
    res.json(nfts);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ message: 'Error fetching collection', code: 'NFT_COLLECTION_FAILED' });
  }
});

router.get('/:id/similar', async (req, res) => {
  try {
    const nft = await NFT.findById(req.params.id).lean();
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    const similar = await NFT.find({
      collection: nft.collection,
      _id: { $ne: nft._id },
    })
      .limit(5)
      .lean();

    res.json(similar);
  } catch (error) {
    console.error('Error fetching similar NFTs:', error);
    res.status(500).json({ message: 'Error fetching similar NFTs', code: 'NFT_SIMILAR_FAILED' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const nft = await NFT.findById(req.params.id);
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }

    nft.views = (nft.views || 0) + 1;
    await nft.save();

    res.json(nft.toObject());
  } catch (error) {
    console.error('Error fetching NFT:', error);
    res.status(500).json({ message: 'Error fetching NFT', code: 'NFT_GET_FAILED' });
  }
});

router.post('/', requireAuth, requireAdmin, nftBodyValidators, async (req, res) => {
  try {
    if (!handleValidation(req, res)) return;
    const allowed = [
      'name',
      'description',
      'image',
      'imageGallery',
      'price',
      'collection',
      'rarity',
      'contractAddress',
      'tokenId',
      'creator',
      'owner',
      'attributes',
      'rating',
      'numReviews',
      'views',
    ];
    const payload = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }
    const nft = await NFT.create(payload);
    res.status(201).json(nft.toObject());
  } catch (error) {
    console.error('Error creating NFT:', error);
    res.status(400).json({ message: 'Error creating NFT', code: 'NFT_CREATE_FAILED' });
  }
});

router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const allowed = [
      'name',
      'description',
      'image',
      'imageGallery',
      'price',
      'collection',
      'rarity',
      'contractAddress',
      'tokenId',
      'creator',
      'owner',
      'attributes',
    ];
    const payload = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) payload[key] = req.body[key];
    }
    if (payload.price !== undefined) {
      const p = Number(payload.price);
      if (!Number.isFinite(p) || p < 0) {
        return res.status(400).json({ message: 'Invalid price', code: 'VALIDATION' });
      }
    }
    const nft = await NFT.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }
    res.json(nft.toObject());
  } catch (error) {
    console.error('Error updating NFT:', error);
    res.status(400).json({ message: 'Error updating NFT', code: 'NFT_UPDATE_FAILED' });
  }
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const nft = await NFT.findByIdAndDelete(req.params.id);
    if (!nft) {
      return res.status(404).json({ message: 'NFT not found' });
    }
    res.json({ message: 'NFT deleted successfully' });
  } catch (error) {
    console.error('Error deleting NFT:', error);
    res.status(500).json({ message: 'Error deleting NFT', code: 'NFT_DELETE_FAILED' });
  }
});

module.exports = router;
