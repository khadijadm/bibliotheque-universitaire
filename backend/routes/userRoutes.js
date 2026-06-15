const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getUsers, creerUser, modifierUser, supprimerUser } = require('../controllers/userController');

router.get('/mes-telechargements', protect, async (req, res) => {
    try {
        const Resource = require('../models/Resource');
        const resources = await Resource.find({
            'telechargements.utilisateur': req.user.id
        });
        console.log('USER ID:', req.user.id)       
        console.log('FOUND:', resources.length)     
        res.json(resources);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.get('/', protect, adminOnly, getUsers);
router.post('/', protect, adminOnly, creerUser);
router.put('/:id', protect, modifierUser);
router.delete('/:id', protect, adminOnly, supprimerUser);

module.exports = router;