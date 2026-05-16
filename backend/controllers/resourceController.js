const Resource = require('../models/Resource');

// Ajouter ressource
exports.ajouterResource = async (req, res) => {
  try {
    const { titre, type, description, discipline } = req.body;
    const fichier = req.file ? req.file.filename : null;

    const resource = await Resource.create({
      titre, type, description, discipline,
      fichier,
      ajoutePar: req.user.id
    });

    res.status(201).json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tous les ressources
exports.getResources = async (req, res) => {
  try {
    const { search, discipline } = req.query;
    let filter = { publie: true };

    if (search) filter.titre = { $regex: search, $options: 'i' };
    if (discipline) filter.discipline = discipline;

    const resources = await Resource.find(filter)
      .populate('ajoutePar', 'nom email role')
      .sort({ createdAt: -1 });

    res.json(resources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Une seule ressource
exports.getResource = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('ajoutePar', 'nom email');
    if (!resource) return res.status(404).json({ message: 'Ressource non trouvée' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Modifier ressource
exports.modifierResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!resource) return res.status(404).json({ message: 'Ressource non trouvée' });
    res.json(resource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer ressource
exports.supprimerResource = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ message: 'Ressource supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};