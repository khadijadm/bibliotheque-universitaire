const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Notification = require('../models/Notification');

// Get notifications for logged-in user
router.get('/', protect, async (req, res) => {
    try {
        const notifs = await Notification.find({ utilisateur: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);
        res.json(notifs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Marquer lue
router.put('/:id', protect, async (req, res) => {
    try {
        await Notification.findByIdAndUpdate(req.params.id, { estLue: true });
        res.json({ message: 'Notification marquée comme lue' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;