const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, profOrAdmin, adminOnly } = require('../middleware/authMiddleware');
const {
  ajouterResource, getResources,
  getResource, modifierResource, supprimerResource
} = require('../controllers/resourceController');
const Activite = require('../models/Activite');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// download resource file
router.get('/download/:id', protect, async (req, res) => {
  try {
    console.log('DOWNLOAD ID:', req.params.id)
    const Resource = require('../models/Resource');
    const resource = await Resource.findById(req.params.id);
    console.log('RESOURCE:', resource?.titre)
    if (!resource || !resource.fichier) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    console.log('BEFORE:', resource.telechargements)
    resource.nbTelechargements += 1;
    resource.telechargements.push({ utilisateur: req.user.id });
    await resource.save();
    await Activite.create({
      type: 'telechargement',
      message: `Téléchargement de "${resource.titre}"`,
      utilisateur: req.user.id
    });
    const filePath = path.join(__dirname, '..', 'uploads', resource.fichier);
    res.download(filePath);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, getResources);
router.get('/:id', protect, getResource);
router.post('/', protect, profOrAdmin, upload.single('fichier'), ajouterResource);
router.put('/:id', protect, profOrAdmin, modifierResource);
router.delete('/:id', protect, adminOnly, supprimerResource);

module.exports = router;