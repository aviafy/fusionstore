const express = require('express');
const Order = require('../models/order');

const router = express.Router();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * @swagger
 * /api/orders/track:
 *   post:
 *     summary: Get the current status of an order
 *     tags:
 *       - Orders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderNumber
 *               - email
 *             properties:
 *               orderNumber:
 *                 type: string
 *                 example: FE-A1B2C3D4E5F6
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Order status payload
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderNumber:
 *                   type: string
 *                 currentStatus:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                     label:
 *                       type: string
 *                     description:
 *                       type: string
 *                     enteredAt:
 *                       type: string
 *                       format: date-time
 *                 statusHistory:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderStatus'
 *                 statusFlow:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/OrderStatus'
 *       404:
 *         description: Order not found
 *       400:
 *         description: Validation error
 */

router.post('/track', async (req, res) => {
  try {
    const { orderNumber, email } = req.body || {};

    if (!orderNumber || !email) {
      return res.status(400).json({ error: 'Order number and email are required.' });
    }

    const normalizedOrderNumber = String(orderNumber).trim().toUpperCase();
    const normalizedEmail = String(email).trim().toLowerCase();

    if (!/^FE-[A-F0-9]{12}$/i.test(normalizedOrderNumber)) {
      return res.status(400).json({ error: 'Invalid order number format.' });
    }

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    const order = await Order.findOne({ orderNumber: normalizedOrderNumber, email: normalizedEmail });

    if (!order) {
      return res.status(404).json({ error: 'Order not found. Double-check your email and order number.' });
    }

    order.ensureInitialStatus();

    let advanced = false;
    if (order.paymentStatus === 'paid' && order.statusIndex === 0) {
      advanced = order.appendStatus('PAYMENT_VERIFIED');
    }

    if (order.paymentStatus === 'paid' && order.statusIndex < Order.STATUS_FLOW.length - 1) {
      const shouldAdvance = order.statusHistory.length > 1 ? Math.random() < 0.75 : Math.random() < 0.35;
      if (shouldAdvance) {
        advanced = order.advanceStatus();
      }
    }

    if (advanced) {
      order.markModified('statusHistory');
    }

    await order.save();

    const responsePayload = {
      orderNumber: order.orderNumber,
      email: order.email,
      currentStatus: order.statusHistory[order.statusHistory.length - 1],
      statusHistory: order.statusHistory,
      statusFlow: Order.STATUS_FLOW,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentInfo?.method || null,
      subtotal: order.subtotal,
      shippingCost: order.shippingCost,
      total: order.total,
      currency: order.currency,
      items: order.items,
      estimatedDelivery: order.estimatedDelivery,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    res.json(responsePayload);
  } catch (error) {
    console.error('Error tracking order:', error);
    res.status(500).json({ error: 'Unable to fetch order status right now.' });
  }
});

module.exports = router;
