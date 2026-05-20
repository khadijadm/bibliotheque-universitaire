const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['retard', 'retour', 'info'],
    default: 'info'
  },
  estLue: { type: Boolean, default: false },
  emprunt: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Emprunt',
    default: null
  }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);