const mongoose = require('mongoose');

const CATEGORY_ENUM = [
  'Electronics Design',
  'Valuable NFT',
  'Modern Electronics Design',
  'Production Development',
  'General Services',
];

const freelancerServiceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: CATEGORY_ENUM,
      index: true,
    },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    deliveryTime: { type: String, default: '5-7 days' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0, min: 0 },
    freelancerName: { type: String, required: true, trim: true },
    freelancerImage: { type: String, required: true },
    skills: { type: [String], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: {
      virtuals: true,
      transform(_doc, ret) {
        ret.id = ret._id?.toString?.() ?? ret.id;
        return ret;
      },
    },
  }
);

freelancerServiceSchema.virtual('id').get(function getId() {
  return this._id?.toString();
});

freelancerServiceSchema.index({ category: 1, price: 1 });
freelancerServiceSchema.index({ rating: -1 });
freelancerServiceSchema.index({ createdAt: -1 });

const FreelancerService =
  mongoose.models.FreelancerService || mongoose.model('FreelancerService', freelancerServiceSchema);

module.exports = FreelancerService;
module.exports.CATEGORY_ENUM = CATEGORY_ENUM;
