const mongoose = require('mongoose');

const activiteSchema = new mongoose.Schema({
  type: {
    type: String,
   enum: ['ajout', 'suppression', 'telechargement', 'emprunt', 'inscription', 'retour'],
    required: true
  },
  message: { type: String, required: true },
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Activite', activiteSchema);