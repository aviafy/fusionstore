const mongoose = require('mongoose');

/** One document per user per product (vote can be updated). */
const productRatingSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

productRatingSchema.index({ productId: 1, userId: 1 }, { unique: true });

const ProductRating = mongoose.models.ProductRating || mongoose.model('ProductRating', productRatingSchema);

module.exports = ProductRating;
