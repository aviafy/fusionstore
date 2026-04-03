require('dotenv').config();
const express = require('express');
const router = express.Router();
const FreelancerService = require('../models/freelancerService');
const FreelancerRating = require('../models/freelancerRating');
const { requireAuth } = require('../middleware/authMiddleware');

const normalizeService = service => ({
  id: service._id,
  name: service.name,
  description: service.description,
  category: service.category,
  price: service.price,
  image: service.image,
  deliveryTime: service.deliveryTime,
  rating: service.rating,
  numReviews: service.numReviews,
  freelancerName: service.freelancerName,
  freelancerImage: service.freelancerImage,
  skills: service.skills,
  createdAt: service.createdAt,
});

/**
 * @swagger
 * components:
 *   schemas:
 *     FreelancerService:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the service
 *         name:
 *           type: string
 *           description: The name of the service
 *         description:
 *           type: string
 *           description: The description of the service
 *         category:
 *           type: string
 *           enum: [Electronics Design, Valuable NFT, Modern Electronics Design, Production Development, General Services]
 *           description: The category of the service
 *         price:
 *           type: number
 *           description: The price of the service
 *         image:
 *           type: string
 *           description: The image URL of the service
 *         deliveryTime:
 *           type: string
 *           description: The estimated delivery time
 *         rating:
 *           type: number
 *           description: The rating of the service
 *         numReviews:
 *           type: number
 *           description: The number of reviews
 *         freelancerName:
 *           type: string
 *           description: The name of the freelancer
 *         freelancerImage:
 *           type: string
 *           description: The profile image of the freelancer
 *         skills:
 *           type: array
 *           items:
 *             type: string
 *           description: List of skills
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time the service was created
 */

/**
 * @swagger
 * /api/freelancer-services:
 *   get:
 *     summary: Returns the list of all freelancer services
 *     tags: [Freelancer Services]
 *     responses:
 *       200:
 *         description: The list of freelancer services
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FreelancerService'
 */
router.get('/', async (req, res) => {
  try {
    const services = await FreelancerService.find();
    const formattedServices = services.map(service => ({
      ...service.toObject(),
      id: service._id,
    }));
    res.json(formattedServices);
  } catch (err) {
    console.error('Error fetching freelancer services:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/freelancer-services/{id}:
 *   get:
 *     summary: Get a freelancer service by id
 *     tags: [Freelancer Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The service id
 *     responses:
 *       200:
 *         description: The freelancer service
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FreelancerService'
 *       404:
 *         description: Service not found
 */
router.get('/:id', async (req, res) => {
  try {
    const service = await FreelancerService.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(normalizeService(service));
  } catch (err) {
    console.error('Error fetching freelancer service:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/freelancer-services/category/{category}:
 *   get:
 *     summary: Get freelancer services by category
 *     tags: [Freelancer Services]
 *     parameters:
 *       - in: path
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: The service category
 *     responses:
 *       200:
 *         description: The services by category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FreelancerService'
 */
router.get('/category/:category', async (req, res) => {
  try {
    const services = await FreelancerService.find({ category: req.params.category });
    res.json(services.map(normalizeService));
  } catch (err) {
    console.error('Error fetching services by category:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/freelancer-services/{id}/rating:
 *   put:
 *     summary: Update the service rating
 *     tags: [Freelancer Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The service id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 description: The new rating for the service
 *     responses:
 *       200:
 *         description: The updated service
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FreelancerService'
 *       404:
 *         description: Service not found
 */
router.put('/:id/rating', requireAuth, async (req, res) => {
  try {
    const { rating } = req.body;
    const r = Number(rating);
    if (!Number.isFinite(r) || r < 1 || r > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5', code: 'INVALID_RATING' });
    }

    const service = await FreelancerService.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    const serviceId = String(service._id);
    await FreelancerRating.findOneAndUpdate(
      { serviceId, userId: req.user._id },
      { rating: r },
      { upsert: true, new: true }
    );

    const agg = await FreelancerRating.aggregate([
      { $match: { serviceId } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const { avg, count } = agg[0] || { avg: r, count: 1 };
    service.rating = Math.round(avg * 100) / 100;
    service.numReviews = count;

    await service.save();
    res.json(normalizeService(service));
  } catch (err) {
    console.error('Error updating service rating:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
