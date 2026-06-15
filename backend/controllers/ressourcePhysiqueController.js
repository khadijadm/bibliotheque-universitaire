const RessourcePhysique = require('../models/RessourcePhysique');
const Activite = require('../models/Activite');

exports.getRessourcesPhysiques = async (req, res) => {
  try {
    const { search, discipline } = req.query;
    let filter = {};
    if (search) filter.titre = { $regex: search, $options: 'i' };
    if (discipline) filter.discipline = discipline;
    const ressources = await RessourcePhysique.find(filter).sort({ createdAt: -1 });
    res.json(ressources);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRessourcePhysique = async (req, res) => {
  try {
    const ressource = await RessourcePhysique.findById(req.params.id);
    if (!ressource) return res.status(404).json({ message: 'Ressource non trouvée' });
    res.json(ressource);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.ajouterRessourcePhysique = async (req, res) => {
    try {
        const { titre, auteur, discipline, nombreExemplaires } = req.body;
        const image = req.file ? req.file.filename : null;

        const ressource = await RessourcePhysique.create({
            titre, auteur, discipline, image,
            nombreExemplaires: nombreExemplaires || 1,
            exemplairesDisponibles: nombreExemplaires || 1
        });

        await Activite.create({
        type: 'ajout',
        message: `Nouvelle ressource physique ajoutée : "${titre}"`,
        utilisateur: req.user.id
        });

        res.status(201).json(ressource);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.modifierRessourcePhysique = async (req, res) => {
  try {
    const updateData = { ...req.body }
    if (req.file) updateData.image = req.file.filename

    await RessourcePhysique.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }
    )
  
    const ressource = await RessourcePhysique.findById(req.params.id)
    if (!ressource) return res.status(404).json({ message: 'Ressource non trouvée' })
    res.json(ressource)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}
exports.supprimerRessourcePhysique = async (req, res) => {
  try {
    const ressource = await RessourcePhysique.findById(req.params.id);
    await RessourcePhysique.findByIdAndDelete(req.params.id);
    await Activite.create({
      type: 'suppression',
      message: `Ressource physique supprimée : "${ressource?.titre || ''}"`,
      utilisateur: req.user.id
    });
    res.json({ message: 'Ressource supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};