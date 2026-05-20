const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();


const { updateRetards } = require('./controllers/empruntController');

const app = express();
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.options(/.*/, cors())
app.use(express.json());

// Routes 
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/emprunts', require('./routes/empruntRoutes')); 
app.use('/api/activites', require('./routes/activiteRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/notifications', require('./routes/notificationRoutes'));

app.get('/', (req, res) => {
  res.send('API Bibliothèque Universitaire');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur le port ${PORT}`);

  // Call after server starts, with safe check
  if (typeof updateRetards === 'function') {
    updateRetards();
  } else {
    console.warn('updateRetards not exported of empruntController');
  }
});

process.on('unhandledRejection', (err) => {
    console.error('UNHANDLED:', err.message)
})