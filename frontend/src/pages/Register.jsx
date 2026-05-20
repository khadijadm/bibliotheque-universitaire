import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/axios';

const DISCIPLINES = [
  'Mathématiques et Informatique',
  'Sciences & Techniques',
  'Sciences Économiques et Gestion',
  'Sciences Humaines et Sociales',
  'Physique - Chimie',
];

const SPECIALITES = [
  'Mathématiques et Informatique',
  'Sciences & Techniques',
  'Sciences Économiques et Gestion',
  'Sciences Humaines et Sociales',
  'Physique - Chimie'
];

const GRADES = [
  'Professeur assistant',
  'Professeur habilité',
  'Professeur de l\'enseignement supérieur',
  'Maître de conférences',
  'Professeur agrégé',
  'Professeur émérite',
];

function Register() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    motDePasse: '',
    confirmMotDePasse: '',
    role: 'etudiant',
    filiere: '',
    specialite: '',
    grade: '',
  });
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'role' ? { filiere: '', specialite: '', grade: '' } : {}),
    }));
  };

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.role === 'etudiant' && !formData.filiere) {
      setError('Veuillez choisir votre discipline');
      return;
    }
    if (formData.role === 'professeur' && !formData.specialite) {
      setError('Veuillez choisir votre spécialité');
      return;
    }
    if (formData.role === 'professeur' && !formData.grade) {
      setError('Veuillez choisir votre grade');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/send-code', formData);
      setSuccess(`Code envoyé à ${formData.email}`);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur envoi code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    if (formData.motDePasse !== formData.confirmMotDePasse) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }
    try {
      await api.post('/auth/register', { email: formData.email, code, motDePasse: formData.motDePasse });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Code incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans">

      {/* HEADER */}
      <div className="bg-white shadow-sm py-5 flex flex-col items-center">
        <img src="/logo1.jpg.jpeg" alt="Logo" className="h-16 mx-auto" />
        <h1 className="text-[#0d4a8a] text-xl font-extrabold uppercase tracking-wide mt-3 mb-1">
          Bibliothèque Numérique
        </h1>
        <p className="text-slate-400 text-sm italic">
          Plateforme de gestion des ressources pédagogiques
        </p>
      </div>

      {/* FORM */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-8 border border-slate-200">

          {/* STEP INDICATOR */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2].map(n => (
              <div key={n} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300
                  ${step >= n ? 'bg-[#0d4a8a] text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {n}
                </div>
                {n === 1 && (
                  <div className={`w-10 h-0.5 transition-colors duration-300 ${step === 2 ? 'bg-[#0d4a8a]' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>

          <h2 className="text-center text-[#0d4a8a] text-xl font-bold mb-1">
            {step === 1 ? 'Créer un compte' : 'Vérification Email'}
          </h2>
          <p className="text-center text-slate-400 text-sm mb-5">
            {step === 1 ? 'Remplissez le formulaire ci-dessous' : `Code envoyé à ${formData.email}`}
          </p>

          {/* ALERTS */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border-l-4 border-green-500 text-green-800 px-4 py-3 rounded mb-4 text-sm">
              {success}
            </div>
          )}

          {/* STEP 1 */}
          {step === 1 && (
            <form onSubmit={handleSendCode}>
              {/* Nom & Prénom */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Nom</label>
                  <input
                    type="text" name="nom" value={formData.nom}
                    onChange={handleChange} required
                    placeholder="Nom"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d4a8a]/30 focus:border-[#0d4a8a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Prénom</label>
                  <input
                    type="text" name="prenom" value={formData.prenom}
                    onChange={handleChange} required
                    placeholder="Prénom"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d4a8a]/30 focus:border-[#0d4a8a]"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Adresse Email</label>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} required
                  placeholder="nom@edu.uiz.ac.ma"
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d4a8a]/30 focus:border-[#0d4a8a]"
                />
              </div>

              {/* Rôle */}
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Rôle</label>
                <select
                  name="role" value={formData.role} onChange={handleChange}
                  className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d4a8a]/30 focus:border-[#0d4a8a]"
                >
                  <option value="etudiant">Étudiant</option>
                  <option value="professeur">Professeur</option>
                </select>
              </div>

              {/* Discipline (étudiant seulement) */}
              {formData.role === 'etudiant' && (
                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Discipline</label>
                  <select
                    name="filiere" value={formData.filiere} onChange={handleChange} required
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d4a8a]/30 focus:border-[#0d4a8a]"
                  >
                    <option value="">-- Choisir une discipline --</option>
                    {DISCIPLINES.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Spécialité + Grade (professeur seulement) */}
              {formData.role === 'professeur' && (
                <>
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Spécialité</label>
                    <select
                      name="specialite" value={formData.specialite} onChange={handleChange} required
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d4a8a]/30 focus:border-[#0d4a8a]"
                    >
                      <option value="">-- Choisir une spécialité --</option>
                      {SPECIALITES.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Grade</label>
                    <select
                      name="grade" value={formData.grade} onChange={handleChange} required
                      className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d4a8a]/30 focus:border-[#0d4a8a]"
                    >
                      <option value="">-- Choisir un grade --</option>
                      {GRADES.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit" disabled={loading}
                className={`w-full py-3 rounded-lg text-white text-sm font-bold mt-1 transition-opacity
                  ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#1a6bb5] to-[#0d4a8a] hover:opacity-90 cursor-pointer'}`}
              >
                {loading ? 'Envoi du code...' : 'Envoyer le code de vérification →'}
              </button>
            </form>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <form onSubmit={handleVerify}>
              <div className="mb-6">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Code de vérification</label>
                <input
                  type="text" value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required maxLength={6}
                  placeholder="000000"
                  className="w-full px-3 py-4 border border-slate-300 rounded-lg bg-slate-50 text-3xl font-bold text-center tracking-[10px] focus:outline-none focus:ring-2 focus:ring-[#0d4a8a]/30 focus:border-[#0d4a8a]"
                />
                <p className="text-xs text-slate-400 mt-2 text-center">
                  Entrez le code à 6 chiffres — valable 10 minutes
                </p>
              </div>

              {/* Mot de passe */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mot de passe</label>
                  <input
                    type="password" name="motDePasse" value={formData.motDePasse}
                    onChange={handleChange} required
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d4a8a]/30 focus:border-[#0d4a8a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Confirmer</label>
                  <input
                    type="password" name="confirmMotDePasse" value={formData.confirmMotDePasse}
                    onChange={handleChange} required
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0d4a8a]/30 focus:border-[#0d4a8a]"
                  />
                </div>
              </div>

              <button
                type="submit" disabled={loading}
                className={`w-full py-3 rounded-lg text-white text-sm font-bold transition-opacity
                  ${loading ? 'bg-slate-400 cursor-not-allowed' : 'bg-gradient-to-r from-[#1a6bb5] to-[#0d4a8a] hover:opacity-90 cursor-pointer'}`}
              >
                {loading ? 'Vérification...' : 'Vérifier et créer le compte ✓'}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setError(''); setSuccess(''); setCode(''); }}
                className="w-full py-3 mt-2 rounded-lg border border-slate-300 text-slate-500 text-sm font-bold bg-white hover:bg-slate-50 cursor-pointer"
              >
                ← Modifier les informations
              </button>

              <p className="text-center mt-4 text-sm text-slate-400">
                Pas reçu?{' '}
                <span onClick={handleSendCode} className="text-[#1a6bb5] font-bold cursor-pointer hover:underline">
                  Renvoyer
                </span>
              </p>
            </form>
          )}

          <p className="text-center mt-5 text-sm text-slate-500">
            Déjà un compte?{' '}
            <span onClick={() => navigate('/login')} className="text-[#1a6bb5] font-bold cursor-pointer hover:underline">
              Se connecter
            </span>
          </p>
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

export default Register;