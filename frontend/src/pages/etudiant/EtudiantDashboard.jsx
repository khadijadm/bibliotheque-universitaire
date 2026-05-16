import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function EtudiantDashboard() {
    const { logout, user } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const [ressources] = useState([
        { id: 1, titre: 'Cours Algèbre II', auteur: 'Dr. Alami', discipline: 'Mathématiques' },
        { id: 2, titre: 'Introduction aux bases de données', auteur: 'Pr. Benali', discipline: 'Informatique' },
    ]);

    const filtered = ressources.filter(r => r.titre.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <header className="bg-slate-900 text-white px-8 py-4 flex items-center justify-between shadow-md">
                <h1 className="text-xl font-black text-blue-400 uppercase">FPT Bibliothèque</h1>
                <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white text-sm font-bold px-4 py-2 rounded-lg transition">🚪 Déconnexion</button>
            </header>

            <main className="max-w-5xl w-full mx-auto p-6 md:p-8 flex-1">
                <div className="mb-8">
                    <input type="text" placeholder="🔍 Rechercher un document..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-3 border rounded-xl focus:border-blue-600 outline-none shadow-sm" />
                </div>

                <h2 className="text-lg font-bold text-gray-800 mb-6 uppercase">📚 Documents Disponibles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map(r => (
                        <div key={r.id} className="bg-white rounded-xl border p-6 flex flex-col justify-between hover:shadow transition">
                            <div>
                                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase">{r.discipline}</span>
                                <h3 className="text-lg font-bold text-gray-900 mt-3">{r.titre}</h3>
                                <p className="text-gray-500 text-sm">Auteur: {r.auteur}</p>
                            </div>
                            <button className="mt-4 w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm">📥 Télécharger PDF</button>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}