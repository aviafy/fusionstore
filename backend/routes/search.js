const express = require('express');
const Product = require('../models/product');

const router = express.Router();

const formatProduct = doc => {
  const o = doc.toObject ? doc.toObject() : { ...doc };
  const id = o._id != null ? String(o._id) : o.id;
  return {
    ...o,
    _id: id,
    id,
  };
};

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search for products
 */
router.get('/', async (req, res) => {
  try {
    const raw = req.query.q || '';
    const query = String(raw).trim();

    if (!query) {
      const all = await Product.find({}).limit(200).lean();
      return res.json(all.map(formatProduct));
    }

    if (query.length > 120) {
      return res.status(400).json({ error: 'Search query too long', code: 'SEARCH_TOO_LONG' });
    }

    const products = await Product.find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(50)
      .lean();

    if (products.length) {
      return res.json(products.map(formatProduct));
    }

    const lower = query.toLowerCase();
    const regexProducts = await Product.find({
      $or: [
        { name: new RegExp(escapeRegex(lower), 'i') },
        { description: new RegExp(escapeRegex(lower), 'i') },
        { category: new RegExp(escapeRegex(lower), 'i') },
        { brand: new RegExp(escapeRegex(lower), 'i') },
      ],
    })
      .limit(50)
      .lean();

    res.json(regexProducts.map(formatProduct));
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'An error occurred during the search.', code: 'SEARCH_FAILED' });
  }
});

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = router;
