const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Tous les users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-motDePasse');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer user (admin seulement)
exports.creerUser = async (req, res) => {
  try {
    const { nom, email, motDePasse, role } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(motDePasse, salt);
    const user = await User.create({ nom, email, motDePasse: hash, role });
    res.status(201).json({ id: user._id, nom: user.nom, email: user.email, role: user.role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Modifier user
exports.modifierUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).select('-motDePasse');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer user
exports.supprimerUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Utilisateur supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};