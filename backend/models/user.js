const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true
  },
  prenom: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  motDePasse: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['etudiant', 'professeur', 'administrateur', 'bibliothecaire'],
    default: 'etudiant'
  },
  // Étudiant
  filiere: {
    type: String,
    default: ''
  },
  // Professeur
  specialite: {
    type: String,
    default: ''
  },
  grade: {
    type: String,
    default: ''
  },
  estActif: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);