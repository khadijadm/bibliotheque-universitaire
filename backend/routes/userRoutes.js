const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getUsers, creerUser, modifierUser, supprimerUser } = require('../controllers/userController');

router.get('/', protect, adminOnly, getUsers);
router.post('/', protect, adminOnly, creerUser);
router.put('/:id', protect, adminOnly, modifierUser);
router.delete('/:id', protect, adminOnly, supprimerUser);

module.exports = router;