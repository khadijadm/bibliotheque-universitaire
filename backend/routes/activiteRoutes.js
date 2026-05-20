const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const Activite = require('../models/Activite');

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const activites = await Activite.find()
      .populate('utilisateur', 'nom prenom')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(activites);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;