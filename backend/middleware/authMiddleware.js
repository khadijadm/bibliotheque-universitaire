const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Non autorisé' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalide' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user.role !== 'administrateur') {
    return res.status(403).json({ message: 'Accès réservé à l\'administrateur' });
  }
  next();
};

exports.profOrAdmin = (req, res, next) => {
  if (!['professeur', 'administrateur'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }
  next();
};

exports.bibliothécaireOnly = (req, res, next) => {
  if (req.user.role !== 'bibliothecaire') {
    return res.status(403).json({ message: 'Accès réservé au bibliothécaire' });
  }
  next();
};

exports.adminOrBibliothecaire = (req, res, next) => {
  if (!['administrateur', 'bibliothecaire'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Accès non autorisé' });
  }
  next();
};