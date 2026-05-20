const Emprunt = require('../models/Emprunt');
const Activite = require('../models/Activite');
const Notification = require('../models/Notification');
const cron = require('node-cron');


cron.schedule('0 0 * * *', async () => {
    try {
        const today = new Date();
        const empruntsRetard = await Emprunt.find({
            statut: 'encours',
            dateRetourPrevu: { $lt: today }
        }).populate('utilisateur', 'nom');

        for (const emprunt of empruntsRetard) {
            await Emprunt.findByIdAndUpdate(emprunt._id, { statut: 'retard' });
            // Notification l utilisateur
            await Notification.create({
                utilisateur: emprunt.utilisateur._id,
                message: `Rappel : vous devez retourner le livre emprunté le ${new Date(emprunt.dateEmprunt).toLocaleDateString('fr-FR')}`,
                type: 'retard',
                emprunt: emprunt._id
            });
        }
        console.log(`Retards mis à jour: ${empruntsRetard.length}`);
    } catch (err) {
        console.error('Cron error:', err);
    }
});

// Tous les emprunts
exports.getEmprunts = async (req, res) => {
    try {
        // Update retards automatiquement
        const today = new Date();
        const empruntsRetard = await Emprunt.find({
            statut: 'encours',
            dateRetourPrevu: { $lt: today }
        });

        for (const emprunt of empruntsRetard) {
            await Emprunt.findByIdAndUpdate(emprunt._id, { statut: 'retard' });
            await Notification.create({
                utilisateur: emprunt.utilisateur,
                message: `Rappel : vous devez retourner votre livre emprunté`,
                type: 'retard',
                emprunt: emprunt._id
            });
        }

        const emprunts = await Emprunt.find()
            .populate('ressource', 'titre type discipline')
            .populate('utilisateur', 'nom email role')
            .sort({ createdAt: -1 });
        res.json(emprunts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Ajouter emprunt
exports.ajouterEmprunt = async (req, res) => {
    try {
        const { ressource, utilisateur, dateRetourPrevu, dateEmprunt } = req.body;
        const emprunt = await Emprunt.create({
            ressource,
            utilisateur,
            dateEmprunt: dateEmprunt || Date.now(),
            dateRetourPrevu
        });
        const populated = await emprunt.populate([
            { path: 'ressource', select: 'titre type' },
            { path: 'utilisateur', select: 'nom email' }
        ]);

        await Activite.create({
            type: 'emprunt',
            message: `Nouvel emprunt : "${populated.ressource?.titre}" par ${populated.utilisateur?.nom}`,
            utilisateur: req.user.id
        });

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Marquer comme retourné
exports.marquerRetourne = async (req, res) => {
    try {
        const emprunt = await Emprunt.findByIdAndUpdate(
            req.params.id,
            {
                statut: 'retourne',
                dateRetourEffectif: new Date()
            },
            { new: true }
        ).populate('ressource', 'titre').populate('utilisateur', 'nom');

        if (!emprunt) return res.status(404).json({ message: 'Emprunt non trouvé' });

        // Activite
        await Activite.create({
            type: 'retour',
            message: `Retour du livre "${emprunt.ressource?.titre}" par ${emprunt.utilisateur?.nom}`,
            utilisateur: req.user.id
        });

        // Notification l utilisateur
        await Notification.create({
            utilisateur: emprunt.utilisateur._id,
            message: `Merci ! Votre retour du livre "${emprunt.ressource?.titre}" a été enregistré.`,
            type: 'retour',
            emprunt: emprunt._id
        });

        res.json(emprunt);
    } catch (error) {
        console.error('RETOUR ERROR FULL:', error)  // full error machi ghi message
        res.status(500).json({ message: error.message });
    }
};

// Modifier statut emprunt
exports.modifierEmprunt = async (req, res) => {
    try {
        const emprunt = await Emprunt.findByIdAndUpdate(
            req.params.id, req.body, { new: true }
        );
        if (!emprunt) return res.status(404).json({ message: 'Emprunt non trouve' });
        res.json(emprunt);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Supprimer emprunt
exports.supprimerEmprunt = async (req, res) => {
    try {
        await Emprunt.findByIdAndDelete(req.params.id);
        await Activite.create({
            type: 'suppression',
            message: `Emprunt supprimé`,
            utilisateur: req.user.id
        });
        res.json({ message: 'Emprunt supprime' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};