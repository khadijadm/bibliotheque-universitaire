const mongoose = require('mongoose');

const empruntSchema = new mongoose.Schema({
    ressource: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resource',
        required: true
    },
    utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    dateEmprunt: {
        type: Date,
        default: Date.now
    },
    dateRetourPrevu: {
        type: Date,
        required: true
    },
    dateRetourEffectif: {
        type: Date,
        default: null
    },
    statut: {
        type: String,
        enum: ['encours', 'retourne', 'retard'],
        default: 'encours'
    }
}, { timestamps: true });

module.exports = mongoose.model('Emprunt', empruntSchema);