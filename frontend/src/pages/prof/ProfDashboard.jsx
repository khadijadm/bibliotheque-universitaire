import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function ProfDashboard() {
    const { logout, user } = useAuth();
    const [titre, setTitre] = useState('');
    const [discipline, setDiscipline] = useState('Informatique');
    const [description, setDescription] = useState('');

    const handleUpload = (e) => {
        e.preventDefault();
        alert(`Document "${titre}" ajouté avec succès (En attente de validation)`);
        setTitre('');
        setDescription('');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between shadow-md">
                <h1 className="text-xl font-black text-blue-400 uppercase">FPT Espace Professeur</h1>
                <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition">🚪 Déconnexion</button>
            </header>

            <main className="max-w-3xl w-full mx-auto p-6 md:p-8 flex-1">
                <div className="bg-white p-8 rounded-2xl shadow-md border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 uppercase border-b pb-3">📤 Partager une nouvelle ressource</h2>
                    <form onSubmit={handleUpload} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2">Titre du document</label>
                            <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} required className="w-full px-4 py-2 border rounded-xl focus:border-blue-600 outline-none" placeholder="Ex: Cours Algèbre Lineaire" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2">Discipline</label>
                            <select value={discipline} onChange={(e) => setDiscipline(e.target.value)} className="w-full px-4 py-2 border rounded-xl focus:border-blue-600 outline-none">
                                <option value="Informatique">Informatique</option>
                                <option value="Mathématiques">Mathématiques</option>
                                <option value="Physique">Physique</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2">Description</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-4 py-2 border rounded-xl focus:border-blue-600 outline-none h-24" placeholder="Description du contenu..."></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-600 mb-2">Fichier (PDF, Document)</label>
                            <input type="file" accept=".pdf" required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow">🚀 Publier la ressource</button>
                    </form>
                </div>
            </main>
        </div>
    );
}