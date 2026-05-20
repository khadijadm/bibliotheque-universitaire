const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { getEmprunts, ajouterEmprunt, marquerRetourne, modifierEmprunt, supprimerEmprunt } = require('../controllers/empruntController');

router.get('/', protect, adminOnly, getEmprunts);
router.post('/', protect, adminOnly, ajouterEmprunt);
router.put('/:id/retourner', protect, adminOnly, marquerRetourne); // ✅ bouton retourné
router.put('/:id', protect, adminOnly, modifierEmprunt);
router.delete('/:id', protect, adminOnly, supprimerEmprunt);

module.exports = router;