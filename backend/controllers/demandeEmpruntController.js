const DemandeEmprunt = require('../models/DemandeEmprunt');
const RessourcePhysique = require('../models/RessourcePhysique');
const Notification = require('../models/Notification');
const Activite = require('../models/Activite');
const User = require('../models/User');

// Étudiant: faire une demande
exports.faireDemandeEmprunt = async (req, res) => {
    try {
        console.log('ROLE:', req.user.role)
        if (!['etudiant', 'professeur'].includes(req.user.role)) {
        return res.status(403).json({ message: 'Seuls les étudiants et professeurs peuvent faire des demandes d\'emprunt' });
        }

    const { ressource, message } = req.body;

    const ressourcePhysique = await RessourcePhysique.findById(ressource);
    if (!ressourcePhysique) return res.status(404).json({ message: 'Ressource non trouvée' });

    // Vérifier disponibilité
    if (ressourcePhysique.exemplairesDisponibles <= 0) {
        return res.status(400).json({ message: 'Aucun exemplaire disponible actuellement' });
    }

    // Vérifier demande déjà en attente
    const existante = await DemandeEmprunt.findOne({
        etudiant: req.user.id,
        ressource,
        statut: { $in: ['en_attente', 'acceptee'] }
    });
    if (existante) return res.status(400).json({ message: 'Vous avez déjà une demande en cours pour ce livre' });

    const demande = await DemandeEmprunt.create({
      etudiant: req.user.id,
      ressource,
      message
    });

    const populated = await demande.populate([
      { path: 'etudiant', select: 'nom prenom email' },
      { path: 'ressource', select: 'titre auteur image' }
    ]);

    await Activite.create({
      type: 'emprunt',
      message: `Nouvelle demande d'emprunt : "${ressourcePhysique.titre}" par ${populated.etudiant.nom}`,
      utilisateur: req.user.id
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Étudiant: mes demandes
exports.mesDemandes = async (req, res) => {
  try {
    const demandes = await DemandeEmprunt.find({ etudiant: req.user.id })
      .populate('ressource', 'titre auteur image discipline')
      .sort({ createdAt: -1 });
    res.json(demandes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: toutes les demandes
exports.getAllDemandes = async (req, res) => {
    try {
        const demandes = await DemandeEmprunt.find()
            .populate('etudiant', 'nom prenom email filiere role')
            .populate('ressource', 'titre auteur image discipline disponible')
            .sort({ createdAt: -1 });
        res.json(demandes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: accepter demande → notifier étudiant + bibliothécaires
exports.accepterDemande = async (req, res) => {
  try {
    const { dateRetourPrevu } = req.body;
    const demande = await DemandeEmprunt.findById(req.params.id)
        .populate('etudiant', 'nom prenom email role') 
        .populate('ressource', 'titre auteur image disponible');

   const ressourceCheck = await RessourcePhysique.findById(demande.ressource._id);
        if (ressourceCheck.exemplairesDisponibles <= 0) {
        return res.status(400).json({ message: 'Aucun exemplaire disponible' });
    }

    // Vérifier disponibilité avant d'accepter
    if (!demande.ressource.disponible) {
      return res.status(400).json({ message: 'Ce livre est déjà emprunté par quelqu\'un d\'autre' });
    }

    const dateLimite = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24h

    await DemandeEmprunt.findByIdAndUpdate(req.params.id, {
      statut: 'acceptee',
      dateLimiteRecuperation: dateLimite,
      dateRetourPrevu: dateRetourPrevu || null
    });

    // Marquer le livre comme non disponible
    const ressourceDoc = await RessourcePhysique.findById(
    demande.ressource._id
    );

    console.log(
    'AVANT:',
    ressourceDoc.exemplairesDisponibles,
    ressourceDoc.disponible
    );

    const newExemplaires =
    (ressourceDoc.exemplairesDisponibles || 1) - 1;
    await RessourcePhysique.findByIdAndUpdate(demande.ressource._id, {
        exemplairesDisponibles: newExemplaires,
        disponible: newExemplaires > 0,
        empruntePar: newExemplaires === 0 ? demande.etudiant._id : null
    });

    // Notification → étudiant
    const roleLabel = demande.etudiant.role === 'professeur' ? 'Prof.' : 'Étudiant'

    await Notification.create({
        utilisateur: demande.etudiant._id,  // ← etudiant machi bib
        message: `Votre demande pour "${demande.ressource.titre}" a été acceptée. Venez récupérer le livre avant le ${dateLimite.toLocaleDateString('fr-FR')} (dans 24h).`,
        type: 'info'
    });
    // Notification → tous les bibliothécaires
    const bibliothecaires = await User.find({ role: 'bibliothecaire' });
    for (const bib of bibliothecaires) {
        await Notification.create({
            utilisateur: bib._id,
            message: `${roleLabel} ${demande.etudiant.nom} ${demande.etudiant.prenom} viendra récupérer "${demande.ressource.titre}" avant le ${dateLimite.toLocaleDateString('fr-FR')}. Date retour prévu : ${dateRetourPrevu ? new Date(dateRetourPrevu).toLocaleDateString('fr-FR') : 'Non précisée'}.`,
            type: 'info',
            demande: demande._id
        });
    }
    

    res.json({ message: 'Demande acceptée, bibliothécaire notifié' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin: refuser demande
exports.refuserDemande = async (req, res) => {
  try {
    const demande = await DemandeEmprunt.findById(req.params.id)
      .populate('etudiant', 'nom prenom')
      .populate('ressource', 'titre');

    if (!demande) return res.status(404).json({ message: 'Demande non trouvée' });

    await DemandeEmprunt.findByIdAndUpdate(req.params.id, { statut: 'refusee' });

    // Notification → étudiant
    await Notification.create({
      utilisateur: demande.etudiant._id,
      message: `Votre demande pour "${demande.ressource.titre}" a été refusée.`,
      type: 'info'
    });

    res.json({ message: 'Demande refusée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bibliothécaire: confirmer récupération
exports.confirmerRecuperation = async (req, res) => {
  try {
    const demande = await DemandeEmprunt.findById(req.params.id)
      .populate('etudiant', 'nom prenom')
      .populate('ressource', 'titre');

    if (!demande) return res.status(404).json({ message: 'Demande non trouvée' });

    await DemandeEmprunt.findByIdAndUpdate(req.params.id, {
      statut: 'recuperee',
      dateRecuperation: new Date()
    });

    await Activite.create({
      type: 'emprunt',
      message: `"${demande.ressource.titre}" récupéré par ${demande.etudiant.nom} ${demande.etudiant.prenom}`,
      utilisateur: req.user.id
    });

    res.json({ message: 'Récupération confirmée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Bibliothécaire: retour du livre
exports.confirmerRetour = async (req, res) => {
  try {
    const demande = await DemandeEmprunt.findById(req.params.id)
      .populate('etudiant', 'nom prenom')
      .populate('ressource', 'titre');

    if (!demande) return res.status(404).json({ message: 'Demande non trouvée' });

    await DemandeEmprunt.findByIdAndUpdate(req.params.id, {
      dateRetourEffectif: new Date()
    });

    // Remettre le livre disponible
    const ressourceDoc = await RessourcePhysique.findById(demande.ressource._id);
    const newExemplaires = ressourceDoc.exemplairesDisponibles + 1;
    await RessourcePhysique.findByIdAndUpdate(demande.ressource._id, {
        exemplairesDisponibles: newExemplaires,
        disponible: true,
        empruntePar: null
    });

    // Notification → étudiant
    await Notification.create({
      utilisateur: demande.etudiant._id,
      message: `Retour de "${demande.ressource.titre}" enregistré. Merci !`,
      type: 'retour'
    });

    await Activite.create({
      type: 'retour',
      message: `Retour de "${demande.ressource.titre}" par ${demande.etudiant.nom} ${demande.etudiant.prenom}`,
      utilisateur: req.user.id
    });

    res.json({ message: 'Retour confirmé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.supprimerMaDemande = async (req, res) => {
  try {
    const demande = await DemandeEmprunt.findById(req.params.id);
    if (!demande) return res.status(404).json({ message: 'Demande non trouvée' });
    
 
    if (demande.etudiant.toString() !== req.user.id && req.user.role !== 'administrateur')
      return res.status(403).json({ message: 'Non autorisé' });
    
    await DemandeEmprunt.findByIdAndDelete(req.params.id);
    res.json({ message: 'Demande supprimée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};