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
            if (res.data.user.role === 'administrateur') navigate('/admin');
            else if (res.data.user.role === 'professeur') navigate('/professeur');
            else if (res.data.user.role === 'bibliothecaire') navigate('/bibliothecaire');
            else navigate('/etudiant');
        } catch (err) {
            setError(err.response?.data?.message || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#f0f4f8] font-sans">

            {/* HEADER */}
            <div className="bg-white shadow-sm py-5 text-center">
                <div className="flex flex-col items-center gap-2">
                    <img src="/logo1.jpg.jpeg" alt="Logo FPT" className="h-16 object-contain" />
                    <h1 className="text-xl font-extrabold text-[#0d4a8a] uppercase tracking-wide mt-2">
                        Bibliothèque Numérique
                    </h1>
                    <p className="text-sm text-slate-500 italic">
                        Plateforme de gestion des ressources pédagogiques
                    </p>
                </div>
            </div>

            {/* FORM */}
            <div className="flex-1 flex items-center justify-center px-4 py-10">
                <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-9 border border-slate-200">

                    <h2 className="text-2xl font-bold text-[#0d4a8a] text-center mb-1">Connexion</h2>
                    <p className="text-sm text-slate-400 text-center mb-7">Accédez à votre espace personnel</p>

                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                Adresse Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="nom@edu.uiz.ac.ma"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d4a8a]/30 focus:border-[#0d4a8a] transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                Mot de passe
                            </label>
                            <input
                                type="password"
                                name="motDePasse"
                                value={formData.motDePasse}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0d4a8a]/30 focus:border-[#0d4a8a] transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 rounded-xl text-white font-bold text-base bg-gradient-to-r from-[#1a6bb5] to-[#0d4a8a] hover:opacity-90 transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Connexion en cours...' : 'Se Connecter'}
                        </button>

                        <p className="text-center text-sm text-slate-500 pt-1">
                            Pas de compte?{' '}
                            <span
                                onClick={() => navigate('/register')}
                                className="text-[#1a6bb5] font-bold cursor-pointer hover:underline"
                            >
                                Créer un compte
                            </span>
                        </p>
                    </form>
                </div>
            </div>

            
             {/* FOOTER */}
            <div className="bg-gray-800 text-white py-8 px-8 w-full mt-auto">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <h3 className="font-bold text-lg mb-2">Faculté Polydisciplinaire - Taroudant</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            La faculté polydisciplinaire de Taroudant (FPT), ouverte en 2010,
                            constitue l'un des jalons universitaires du grand Sud marocain
                        </p>
                    </div>
                    <div className="md:text-right space-y-1">
                        <p className="text-gray-300 text-sm">📍 B.P : 271, 83 000 Taroudant</p>
                        <p className="text-gray-300 text-sm">📞 05 28 55 10 10</p>
                        <p className="text-gray-300 text-sm">✉️ sitefpt@gmail.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;