const mongoose = require('mongoose');

const freelancerRatingSchema = new mongoose.Schema(
  {
    serviceId: { type: String, required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
  },
  { timestamps: true }
);

freelancerRatingSchema.index({ serviceId: 1, userId: 1 }, { unique: true });

const FreelancerRating =
  mongoose.models.FreelancerRating || mongoose.model('FreelancerRating', freelancerRatingSchema);

module.exports = FreelancerRating;
