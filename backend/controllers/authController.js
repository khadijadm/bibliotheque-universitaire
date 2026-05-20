const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.BREVO_SMTP_HOST,
    port: process.env.BREVO_SMTP_PORT,
    auth: {
        user: process.env.BREVO_SMTP_USER,
        pass: process.env.BREVO_SMTP_PASS
    }
});

const verificationCodes = {};

exports.sendVerificationCode = async (req, res) => {
    try {
        const { nom, prenom, email, motDePasse, role, filiere } = req.body;

        const existUser = await User.findOne({ email });
        if (existUser) return res.status(400).json({ message: 'Email déjà utilisé' });

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        verificationCodes[email] = { code, nom, prenom, motDePasse, role, filiere, expiresAt: Date.now() + 10 * 60 * 1000 };

        await transporter.sendMail({
            from: '"Bibliothèque FPT" <khadijadmissi@gmail.com>',
            to: email,
            subject: 'Code de vérification - Bibliothèque FPT',
            html: `
                <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:30px;background:#f8fafc;border-radius:12px;">
                    <h2 style="color:#0d4a8a;text-align:center;">Bibliothèque Numérique</h2>
                    <p style="color:#64748b;text-align:center;font-size:13px;">Faculté Polydisciplinaire - Taroudant</p>
                    <div style="background:white;border-radius:10px;padding:25px;text-align:center;">
                        <p style="color:#334155;">Bonjour <strong>${prenom} ${nom}</strong>,</p>
                        <p style="color:#64748b;">Votre code de vérification est :</p>
                        <div style="background:#0d4a8a;color:white;font-size:36px;font-weight:bold;letter-spacing:10px;padding:20px;border-radius:10px;margin:20px auto;">${code}</div>
                        <p style="color:#94a3b8;font-size:13px;">Ce code expire dans <strong>10 minutes</strong>.</p>
                    </div>
                </div>
            `
        });

        res.json({ message: 'Code envoyé avec succès' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.register = async (req, res) => {
    try {
        const { email, code, motDePasse } = req.body;
        const data = verificationCodes[email];

        if (!data) return res.status(400).json({ message: 'Aucun code envoyé pour cet email' });
        if (Date.now() > data.expiresAt) {
            delete verificationCodes[email];
            return res.status(400).json({ message: 'Code expiré, veuillez recommencer' });
        }
        if (data.code !== code) return res.status(400).json({ message: 'Code incorrect' });

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(motDePasse, salt);
        const user = await User.create({
            nom: data.nom,
            prenom: data.prenom,
            email,
            motDePasse: hash,
            role: data.role,
            filiere: data.filiere
        });
        delete verificationCodes[email];

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user._id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        console.log('LOGIN BODY:', req.body)
        const { email, motDePasse } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

        const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
        if (!isMatch) return res.status(400).json({ message: 'Email ou mot de passe incorrect' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.json({ token, user: { id: user._id, nom: user.nom, prenom: user.prenom, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};