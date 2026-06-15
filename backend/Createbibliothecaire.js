require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

connectDB();
setTimeout(async () => {
  const hash = await bcrypt.hash('biblio123', 10);
  const user = await User.create({
    nom: 'Bibliothecaire',
    prenom: 'Test',
    email: 'bibliothecaire@edu.uiz.ac.ma',
    motDePasse: hash,
    role: 'bibliothecaire',
    estActif: true
  });
  console.log('Bibliothecaire created:', user);
  process.exit();
}, 2000);