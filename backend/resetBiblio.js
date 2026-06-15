require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const hash = await bcrypt.hash('biblio123', 10);
  const r = await User.updateOne(
    { email: 'bibliothecaire@edu.uiz.ac.ma' },
    { $set: { motDePasse: hash } }
  );
  console.log(r);
  process.exit();
});