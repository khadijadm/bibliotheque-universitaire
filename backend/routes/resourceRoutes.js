const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, profOrAdmin, adminOnly } = require('../middleware/authMiddleware');
const {
  ajouterResource, getResources,
  getResource, modifierResource, supprimerResource
} = require('../controllers/resourceController');

// Config upload PDF
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', protect, getResources);
router.get('/:id', protect, getResource);
router.post('/', protect, profOrAdmin, upload.single('fichier'), ajouterResource);
router.put('/:id', protect, profOrAdmin, modifierResource);
router.delete('/:id', protect, adminOnly, supprimerResource);

module.exports = router;