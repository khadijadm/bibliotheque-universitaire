import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/axios';

function Login() {
    const [formData, setFormData] = useState({ email: '', motDePasse: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(''); 
        try {
            const res = await api.post('/auth/login', formData);
            login(res.data);
            if (res.data.role === 'admin') navigate('/admin');
            else if (res.data.role === 'professeur') navigate('/professeur');
            else navigate('/etudiant');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f4f8', margin: 0, padding: 0 }}>
            
            {/* HEADER COMPLET AVEC LOGO CENTRÉ */}
            <div style={{ backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', padding: '20px 0', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <img 
                        src="/logo1.jpg.jpeg" 
                        alt="Logo Faculté Polydisciplinaire Taroudant" 
                        style={{ height: '70px', width: 'auto', objectFit: 'contain' }} 
                    />
                    <h1 style={{ margin: '15px 0 0 0', fontSize: '22px', color: '#0d4a8a', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: '800' }}>
                        Bibliothèque Numérique
                    </h1>
                    <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '14px', fontStyle: 'italic' }}>
                        Plateforme de gestion des ressources pédagogiques
                    </p>
                </div>
            </div>

            {/* FORM CONTAINER */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)', width: '100%', maxWidth: '400px', padding: '35px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                    {error && (
                        <div style={{ backgroundColor: '#fef2f2', borderLeft: '4px solid #ef4444', color: '#991b1b', padding: '12px', borderRadius: '4px', marginBottom: '20px', fontSize: '14px', display: 'flex', alignItems: 'center' }}>
                            <span style={{ marginRight: '8px' }}>❌</span>{error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '25px' }}>
                            <label htmlFor="email" style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'left' }}>Adresse Email</label>
                            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', color: '#334155', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} placeholder="nom@edu.uiz.ac.ma" />
                        </div>
                        <div style={{ marginBottom: '30px' }}>
                            <label htmlFor="motDePasse" style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'left' }}>Mot de passe</label>
                            <input type="password" id="motDePasse" name="motDePasse" value={formData.motDePasse} onChange={handleChange} required style={{ width: '100%', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', color: '#334155', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} placeholder="••••••••" />
                        </div>
                        <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '8px', border: 'none', color: '#ffffff', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', background: loading ? '#94a3b8' : 'linear-gradient(135deg, #1a6bb5, #0d4a8a)', boxShadow: '0 4px 12px rgba(13, 74, 138, 0.2)' }}>
                            {loading ? 'Connexion en cours...' : 'Se Connecter'}
                        </button>
                    </form>
                </div>
            </div>

            {/* FOOTER */}
            <div style={{ backgroundColor: '#1e293b', color: '#ffffff', padding: '25px', textAlign: 'center', fontSize: '13px' }}>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Faculté Polydisciplinaire - Taroudant</p>
                <p style={{ margin: 0, color: '#94a3b8' }}>📍 B.P : 271, 83 000 Taroudant | 📞 05 28 55 10 10</p>
            </div>
        </div>
    );
}

export default Login;