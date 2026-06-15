const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const User = require('./models/User');
  const hash = await bcrypt.hash('khadija123', 10);
  const result = await User.updateOne(
    { email: 'khadija.dmissi.83@edu.uiz.ac.ma' },
    { $set: { motDePasse: hash } }
  );
  console.log('Done:', result);
  process.exit();
});