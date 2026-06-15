const mongoose = require('mongoose');

const ressourcePhysiqueSchema = new mongoose.Schema({
  titre: { type: String, required: true, trim: true },
  auteur: { type: String, default: '' },
  discipline: { type: String, default: '' },
  image: { type: String, default: null },
  disponible: { type: Boolean, default: true },
  nombreExemplaires: { type: Number, default: 1 },
  exemplairesDisponibles: { type: Number, default: 1 },
  empruntePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('RessourcePhysique', ressourcePhysiqueSchema);