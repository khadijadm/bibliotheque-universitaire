const express = require('express');
const router = express.Router();
const { sendVerificationCode, register, login } = require('../controllers/authController');

router.post('/send-code', sendVerificationCode);   // Step 1: sendcode
router.post('/register', register);                 // Step 2: verify + creer compte
router.post('/login', login);

module.exports = router;