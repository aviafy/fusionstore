const express = require('express');
const Product = require('../models/product');
const ProductRating = require('../models/productRating');
const { requireAuth } = require('../middleware/authMiddleware');

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

const tokenize = text =>
  (text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

const jaccardSimilarity = (aTokens, bTokens) => {
  if (!aTokens.length || !bTokens.length) return 0;
  const setA = new Set(aTokens);
  const setB = new Set(bTokens);
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection += 1;
  }
  const unionSize = new Set([...setA, ...setB]).size;
  return unionSize === 0 ? 0 : intersection / unionSize;
};

const priceAffinity = (base, candidate) => {
  if (typeof base.price !== 'number' || typeof candidate.price !== 'number') return 0;
  const diff = Math.abs(base.price - candidate.price);
  const maxPrice = Math.max(base.price, candidate.price, 1);
  return 1 - Math.min(diff / maxPrice, 1);
};

const computeSimilarityScore = (base, candidate) => {
  let score = 0;

  if (base.category && candidate.category && base.category === candidate.category) score += 3;
  if (base.brand && candidate.brand && base.brand === candidate.brand) score += 2;

  const nameSim = jaccardSimilarity(tokenize(base.name), tokenize(candidate.name));
  const descSim = jaccardSimilarity(tokenize(base.description), tokenize(candidate.description));

  score += nameSim * 3;
  score += descSim;
  score += priceAffinity(base, candidate) * 2;

  return score;
};

function buildProductListQuery(reqQuery) {
  const {
    category,
    search,
    minPrice,
    maxPrice,
    inStock,
    featured,
    sort = 'featured',
    page = '1',
    limit = '24',
  } = reqQuery;

  const clauses = [];

  if (featured === 'true' || featured === true) {
    clauses.push({ $or: [{ isFeatured: true }, { rating: { $gte: 4.5 } }] });
  }

  if (category && String(category).trim() && String(category).toLowerCase() !== 'all') {
    clauses.push({ category: new RegExp(`^${escapeRegex(String(category).trim())}$`, 'i') });
  }

  if (search && String(search).trim()) {
    const q = String(search).trim();
    if (q.length > 120) {
      throw Object.assign(new Error('Search query too long'), { status: 400, code: 'SEARCH_TOO_LONG' });
    }
    clauses.push({ $text: { $search: q } });
  }

  const priceBounds = {};
  if (minPrice !== undefined && minPrice !== '' && !Number.isNaN(Number(minPrice))) {
    priceBounds.$gte = Number(minPrice);
  }
  if (maxPrice !== undefined && maxPrice !== '' && !Number.isNaN(Number(maxPrice))) {
    priceBounds.$lte = Number(maxPrice);
  }
  if (Object.keys(priceBounds).length) {
    clauses.push({ price: priceBounds });
  }

  if (inStock === 'true' || inStock === true) {
    clauses.push({ stock: { $gt: 0 } });
  }

  let filter = {};
  if (clauses.length === 1) {
    [filter] = clauses;
  } else if (clauses.length > 1) {
    filter = { $and: clauses };
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 24));
  const skip = (pageNum - 1) * limitNum;

  let sortSpec = { isFeatured: -1, rating: -1, createdAt: -1 };
  if (sort === 'price_asc') sortSpec = { price: 1 };
  else if (sort === 'price_desc') sortSpec = { price: -1 };
  else if (sort === 'rating') sortSpec = { rating: -1, numReviews: -1 };
  else if (sort === 'newest') sortSpec = { createdAt: -1 };
  else if (sort === 'featured') sortSpec = { isFeatured: -1, rating: -1, createdAt: -1 };

  return { filter, sortSpec, pageNum, limitNum, skip };
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Returns products with optional filters and pagination
 */
router.get('/', async (req, res) => {
  try {
    let filter;
    let sortSpec;
    let pageNum;
    let limitNum;
    let skip;
    try {
      ({ filter, sortSpec, pageNum, limitNum, skip } = buildProductListQuery(req.query));
    } catch (e) {
      if (e.status === 400) {
        return res.status(400).json({ message: e.message, code: e.code });
      }
      throw e;
    }

    const [total, docs] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter).sort(sortSpec).skip(skip).limit(limitNum).lean(),
    ]);

    const products = docs.map(d => formatProduct(d));
    const totalPages = Math.max(1, Math.ceil(total / limitNum));

    res.json({
      products,
      total,
      page: pageNum,
      totalPages,
      limit: limitNum,
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ message: 'Server error', code: 'PRODUCTS_FETCH_FAILED' });
  }
});

/**
 * @swagger
 * /api/products/categories:
 *   get:
 *     summary: Distinct product categories
 */
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    const formatted = categories
      .filter(Boolean)
      .map(c => String(c))
      .sort((a, b) => a.localeCompare(b));
    res.json({ categories: formatted });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id/similar', async (req, res) => {
  try {
    const prod = await Product.findById(req.params.id).lean();
    if (!prod) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const excludeId = String(prod._id);
    const pool = await Product.find({ _id: { $ne: excludeId } }).lean();

    if (!pool.length) {
      return res.json([formatProduct(prod)]);
    }

    const scored = pool
      .map(candidate => ({ candidate, score: computeSimilarityScore(prod, candidate) }))
      .sort((a, b) => b.score - a.score);

    const results = [];
    const seen = new Set();
    for (const { candidate } of scored) {
      const key = String(candidate._id);
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(candidate);
      if (results.length >= 5) break;
    }

    res.json(results.length ? results.map(formatProduct) : [formatProduct(prod)]);
  } catch (err) {
    console.error('Error fetching similar products:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/recommendations', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Request body must have a non-empty array of ids' });
    }

    const docs = await Product.find({ _id: { $in: ids.map(String) } }).lean();
    if (docs.length === 0) {
      return res.status(400).json({ message: 'No products found for provided ids' });
    }

    const excludeIds = new Set(docs.map(p => String(p._id)));
    const pool = await Product.find({ _id: { $nin: [...excludeIds] } }).lean();

    if (!pool.length) {
      return res.json(docs.map(formatProduct).slice(0, 10));
    }

    const scored = pool
      .map(candidate => {
        let bestScore = 0;
        for (const base of docs) {
          bestScore = Math.max(bestScore, computeSimilarityScore(base, candidate));
        }
        return { candidate, score: bestScore };
      })
      .sort((a, b) => b.score - a.score);

    const results = [];
    const seen = new Set();
    for (const { candidate } of scored) {
      const key = String(candidate._id);
      if (seen.has(key)) continue;
      seen.add(key);
      results.push(candidate);
      if (results.length >= 10) break;
    }

    res.json(results.length ? results.map(formatProduct) : docs.map(formatProduct).slice(0, 10));
  } catch (err) {
    console.error('Error in /recommendations:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(formatProduct(product));
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/category/:category', async (req, res) => {
  try {
    const cat = req.params.category;
    const filtered = await Product.find({
      category: new RegExp(`^${escapeRegex(cat)}$`, 'i'),
    }).lean();
    res.json(filtered.map(formatProduct));
  } catch (err) {
    console.error('Error fetching products by category:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/rating', requireAuth, async (req, res) => {
  try {
    const { rating } = req.body;
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return res.status(400).json({ message: 'Rating must be a number between 1 and 5', code: 'INVALID_RATING' });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const productId = String(product._id);
    await ProductRating.findOneAndUpdate(
      { productId, userId: req.user._id },
      { rating: r },
      { upsert: true, new: true }
    );

    const agg = await ProductRating.aggregate([
      { $match: { productId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const { avg, count } = agg[0] || { avg: r, count: 1 };
    product.rating = Math.round(avg * 100) / 100;
    product.numReviews = count;
    await product.save();

    res.json(formatProduct(product));
  } catch (err) {
    console.error('Error updating product rating:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
