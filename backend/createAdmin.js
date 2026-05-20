require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

connectDB();
setTimeout(async () => {
  const hash = await bcrypt.hash('admin123', 10);
  const user = await User.create({
    nom: 'Admin',
    email: 'admin@edu.uiz.ac.ma',
    motDePasse: hash,
    role: 'administrateur'
  });
  console.log('User created:', user);
  process.exit();
}, 2000);