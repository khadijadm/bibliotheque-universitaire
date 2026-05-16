const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  titre: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['livre', 'cours', 'article', 'autre'],
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  discipline: {
    type: String,
    required: true
  },
  fichier: {
    type: String, 
    default: null
  },
  ajoutePar: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  publie: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);