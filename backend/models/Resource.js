const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['livre', 'support cours', 'article scientifique'],
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    discipline: {
        type: String,
        required:''
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
    },
    
    auteur: {
    type: String,
    default: ''
    },
    nbTelechargements: {
    type: Number,
    default: 0
    },
    telechargements: [{
    utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
    }],
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);