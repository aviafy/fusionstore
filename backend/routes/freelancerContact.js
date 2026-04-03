require('dotenv').config();
const express = require('express');
const router = express.Router();
const FreelancerContact = require('../models/freelancerContact');
const FreelancerService = require('../models/freelancerService');
const { requireAuth } = require('../middleware/authMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     FreelancerContact:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the contact
 *         serviceId:
 *           type: string
 *           description: The service id being inquired about
 *         freelancerName:
 *           type: string
 *           description: The name of the freelancer
 *         serviceName:
 *           type: string
 *           description: The name of the service
 *         senderName:
 *           type: string
 *           description: The name of the person sending the inquiry
 *         senderEmail:
 *           type: string
 *           description: The email of the person sending the inquiry
 *         subject:
 *           type: string
 *           description: The subject of the inquiry
 *         message:
 *           type: string
 *           description: The message content
 *         budget:
 *           type: number
 *           description: Optional budget for the project
 *         timeline:
 *           type: string
 *           enum: [ASAP, 1-2 weeks, 2-4 weeks, 1-3 months, Flexible]
 *           description: Project timeline
 *         status:
 *           type: string
 *           enum: [pending, read, replied, closed]
 *           description: Status of the inquiry
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: When the inquiry was created
 */

/**
 * @swagger
 * /api/freelancer-contact:
 *   post:
 *     summary: Submit a contact inquiry to a freelancer
 *     tags: [Freelancer Contact]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - senderName
 *               - senderEmail
 *               - subject
 *               - message
 *             properties:
 *               serviceId:
 *                 type: string
 *                 description: The service id
 *               senderName:
 *                 type: string
 *                 description: Your name
 *               senderEmail:
 *                 type: string
 *                 description: Your email
 *               subject:
 *                 type: string
 *                 description: Inquiry subject
 *               message:
 *                 type: string
 *                 description: Your message
 *               budget:
 *                 type: number
 *                 description: Optional budget
 *               timeline:
 *                 type: string
 *                 enum: [ASAP, 1-2 weeks, 2-4 weeks, 1-3 months, Flexible]
 *                 description: Project timeline
 *     responses:
 *       201:
 *         description: Contact inquiry created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FreelancerContact'
 *       400:
 *         description: Missing required fields
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
/**
 * List current user's freelancer contact inquiries (must be registered before GET /:id).
 */
router.get('/mine', requireAuth, async (req, res) => {
  try {
    const list = await FreelancerContact.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.json(
      list.map(c => ({
        _id: c._id,
        serviceId: c.serviceId,
        freelancerName: c.freelancerName,
        serviceName: c.serviceName,
        senderName: c.senderName,
        senderEmail: c.senderEmail,
        subject: c.subject,
        status: c.status,
        createdAt: c.createdAt,
      })),
    );
  } catch (err) {
    console.error('Error listing contacts:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { serviceId, senderName, senderEmail, subject, message, budget, timeline } = req.body;

    // Validate required fields
    if (!serviceId || !senderName || !senderEmail || !subject || !message) {
      return res.status(400).json({
        message: 'Missing required fields: serviceId, senderName, senderEmail, subject, message',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(senderEmail)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if service exists
    const service = await FreelancerService.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Create contact inquiry
    const contact = new FreelancerContact({
      serviceId,
      freelancerName: service.freelancerName,
      serviceName: service.name,
      senderName,
      senderEmail,
      subject,
      message,
      budget: budget || null,
      timeline: timeline || 'Flexible',
      userId: req.user._id,
    });

    await contact.save();

    res.status(201).json({
      id: contact._id,
      serviceId: contact.serviceId,
      freelancerName: contact.freelancerName,
      serviceName: contact.serviceName,
      senderName: contact.senderName,
      senderEmail: contact.senderEmail,
      subject: contact.subject,
      message: contact.message,
      budget: contact.budget,
      timeline: contact.timeline,
      status: contact.status,
      createdAt: contact.createdAt,
    });
  } catch (err) {
    console.error('Error creating contact inquiry:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * @swagger
 * /api/freelancer-contact/{id}:
 *   get:
 *     summary: Get a contact inquiry by id
 *     tags: [Freelancer Contact]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The contact inquiry id
 *     responses:
 *       200:
 *         description: The contact inquiry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FreelancerContact'
 *       404:
 *         description: Contact inquiry not found
 */
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const contact = await FreelancerContact.findById(req.params.id);
    if (!contact) {
      return res.status(404).json({ message: 'Contact inquiry not found' });
    }
    const ownerId = contact.userId && contact.userId.toString();
    const isOwner = ownerId && ownerId === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden', code: 'FORBIDDEN' });
    }
    res.json(contact);
  } catch (err) {
    console.error('Error fetching contact inquiry:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
