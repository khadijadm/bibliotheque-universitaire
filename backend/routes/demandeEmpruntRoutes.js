const express = require('express');
const router = express.Router();
const { protect, adminOnly, bibliothécaireOnly, adminOrBibliothecaire } = require('../middleware/authMiddleware');
const {
  faireDemandeEmprunt,
  mesDemandes,
  getAllDemandes,
  accepterDemande,
  refuserDemande,
  confirmerRecuperation,
  confirmerRetour,
   supprimerMaDemande 
} = require('../controllers/demandeEmpruntController');

// Étudiant
router.post('/', protect, faireDemandeEmprunt);               // faire une demande
router.get('/mes-demandes', protect, mesDemandes);             // voir ses demandes
router.delete('/:id', protect, supprimerMaDemande);
// Admin
router.get('/', protect, adminOnly, getAllDemandes);                        // toutes les demandes
router.put('/:id/accepter', protect, adminOnly, accepterDemande);           // accepter
router.put('/:id/refuser', protect, adminOnly, refuserDemande);             // refuser

// Bibliothécaire
router.put('/:id/recuperer', protect, adminOrBibliothecaire, confirmerRecuperation);  // confirmer récupération
router.put('/:id/retour', protect, adminOrBibliothecaire, confirmerRetour);           // confirmer retour

module.exports = router;