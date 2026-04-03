const mongoose = require('mongoose');

const RARITIES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];

const attributeSchema = new mongoose.Schema(
  {
    trait: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const nftSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    imageGallery: { type: [String], default: [] },
    price: { type: Number, required: true, min: 0 },
    collection: { type: String, required: true, trim: true, index: true },
    rarity: { type: String, enum: RARITIES, default: 'Common', index: true },
    contractAddress: { type: String, required: true },
    tokenId: { type: String, required: true },
    creator: { type: String, required: true },
    owner: { type: String, default: null },
    attributes: { type: [attributeSchema], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, suppressReservedKeysWarning: true }
);

nftSchema.index({ createdAt: -1 });
nftSchema.index({ price: 1 });
nftSchema.index({ rating: -1 });
nftSchema.index({ views: -1 });

const NFT = mongoose.models.NFT || mongoose.model('NFT', nftSchema);

module.exports = NFT;
module.exports.RARITIES = RARITIES;
