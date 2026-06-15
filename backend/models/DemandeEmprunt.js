const mongoose = require('mongoose');

const demandeEmpruntSchema = new mongoose.Schema({
  etudiant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ressource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RessourcePhysique',
    required: true
  },
  statut: {
    type: String,
    enum: ['en_attente', 'acceptee', 'refusee', 'recuperee'],
    default: 'en_attente'
  },
  // Date limite pour récupérer le livre (24h après acceptation)
  dateLimiteRecuperation: {
    type: Date,
    default: null
  },
  dateRecuperation: {
    type: Date,
    default: null
  },
  dateRetourPrevu: {
    type: Date,
    default: null
  },
  dateRetourEffectif: {
    type: Date,
    default: null
  },
  message: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('DemandeEmprunt', demandeEmpruntSchema);