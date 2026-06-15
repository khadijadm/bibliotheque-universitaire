const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOrBibliothecaire } = require('../middleware/authMiddleware');
const {
  getRessourcesPhysiques,
  getRessourcePhysique,
  ajouterRessourcePhysique,
  modifierRessourcePhysique,
  supprimerRessourcePhysique
} = require('../controllers/ressourcePhysiqueController');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get('/', protect, getRessourcesPhysiques);
router.get('/:id', protect, getRessourcePhysique);
router.post('/', protect, adminOrBibliothecaire, upload.single('image'), ajouterRessourcePhysique);
router.put('/:id', protect, adminOrBibliothecaire, upload.single('image'), modifierRessourcePhysique);
router.delete('/:id', protect, adminOrBibliothecaire, supprimerRessourcePhysique);

module.exports = router;