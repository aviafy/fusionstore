const mongoose = require('mongoose');

const TIMELINE_ENUM = ['ASAP', '1-2 weeks', '2-4 weeks', '1-3 months', 'Flexible'];
const STATUS_ENUM = ['pending', 'read', 'replied', 'closed'];

const freelancerContactSchema = new mongoose.Schema(
  {
    serviceId: { type: String, required: true, index: true },
    freelancerName: { type: String, required: true, trim: true },
    serviceName: { type: String, required: true, trim: true },
    senderName: { type: String, required: true, trim: true },
    senderEmail: { type: String, required: true, lowercase: true, trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    budget: { type: Number, default: null },
    timeline: { type: String, enum: TIMELINE_ENUM, default: 'Flexible' },
    status: { type: String, enum: STATUS_ENUM, default: 'pending' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const FreelancerContact =
  mongoose.models.FreelancerContact || mongoose.model('FreelancerContact', freelancerContactSchema);

module.exports = FreelancerContact;
