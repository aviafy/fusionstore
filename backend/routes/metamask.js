const express = require('express');
const { ethers } = require('ethers');
const router = express.Router();

/**
 * @swagger
 * /api/metamask/transactions/{address}:
 *   get:
 *     summary: Get transaction history for a wallet address
 *     tags: [MetaMask]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Ethereum wallet address
 *     responses:
 *       200:
 *         description: Transaction history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   hash:
 *                     type: string
 *                   from:
 *                     type: string
 *                   to:
 *                     type: string
 *                   amount:
 *                     type: string
 *                   status:
 *                     type: string
 *       400:
 *         description: Invalid address
 *       500:
 *         description: Server error
 */
router.get('/transactions/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validate Ethereum address format
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    // Mock transaction history
    // In production, you would query Etherscan API or a blockchain indexer
    const mockTransactions = [
      {
        hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        from: address,
        to: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        amount: '0.5',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        hash: '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd',
        from: address,
        to: '0x1234567890abcdef1234567890abcdef12345678',
        amount: '1.0',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
      },
    ];

    res.json(mockTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

/**
 * @swagger
 * /api/metamask/verify-signature:
 *   post:
 *     summary: Verify a signed message
 *     tags: [MetaMask]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *               signature:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Signature verification result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 address:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/verify-signature', async (req, res) => {
  try {
    const { message, signature, address } = req.body;

    if (!message || !signature || !address) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!ethers.isAddress(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    const recoveredAddress = ethers.verifyMessage(message, signature);
    const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();

    res.json({
      valid: isValid,
      address: address,
      message: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
    });
  } catch (error) {
    console.error('Error verifying signature:', error);
    res.status(500).json({ error: 'Failed to verify signature' });
  }
});

/**
 * @swagger
 * /api/metamask/balance/{address}:
 *   get:
 *     summary: Get wallet balance (requires external API)
 *     tags: [MetaMask]
 *     parameters:
 *       - in: path
 *         name: address
 *         required: true
 *         schema:
 *           type: string
 *         description: Ethereum wallet address
 *     responses:
 *       200:
 *         description: Wallet balance
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 address:
 *                   type: string
 *                 balance:
 *                   type: string
 *                 unit:
 *                   type: string
 *       400:
 *         description: Invalid address
 *       500:
 *         description: Server error
 */
router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;

    // Validate Ethereum address format
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }

    // In production, query Etherscan API or use ethers.js provider
    // For now, return mock data
    const mockBalance = {
      address: address,
      balance: '2.5',
      unit: 'ETH',
    };

    res.json(mockBalance);
  } catch (error) {
    console.error('Error fetching balance:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

/**
 * @swagger
 * /api/metamask/health:
 *   get:
 *     summary: Check MetaMask API health
 *     tags: [MetaMask]
 *     responses:
 *       200:
 *         description: API is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'MetaMask API is running',
  });
});

module.exports = router;
