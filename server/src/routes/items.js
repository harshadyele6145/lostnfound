const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const prisma = require('../lib/prisma');

// Submit a claim for a specific item
router.post('/:id/claim', auth, async (req, res) => {
  try {
    const itemId = req.params.id;
    const userId = req.user.id;
    const { proofDetails } = req.body;

    if (!proofDetails || !proofDetails.trim()) {
      return res.status(400).json({ message: 'Proof details are required.' });
    }

    // 1. Check if item exists
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      return res.status(404).json({ message: 'Item not found.' });
    }

    // 2. Prevent user from claiming their own reported item
    if (item.userId === userId) {
      return res.status(400).json({ message: 'You cannot claim an item you reported.' });
    }

    // 3. Check for an existing claim by the same user
    const existingClaim = await prisma.claim.findFirst({
      where: {
        itemId: itemId,
        userId: userId,
      },
    });

    if (existingClaim) {
      return res.status(400).json({ message: 'You have already submitted a claim for this item.' });
    }

    // 4. Create the new claim
    const claim = await prisma.claim.create({
      data: {
        itemId,
        userId,
        proofDetails,
        status: 'PENDING',
      },
    });

    return res.status(201).json({
      message: 'Claim submitted successfully.',
      claim,
    });
  } catch (error) {
    console.error('Claim Error:', error);
    return res.status(500).json({ message: 'Internal server error while processing claim.' });
  }
});

module.exports = router;