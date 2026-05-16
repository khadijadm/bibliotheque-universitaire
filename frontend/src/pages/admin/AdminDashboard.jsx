import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export default function AdminDashboard() {
    const { logout, user } = useAuth();
    const [activeTab, setActiveTab] = useState('utilisateurs');
    const [usersList] = useState([
        { id: 1, name: 'Dr. Ahmed Alami', email: 'a.alami@uiz.ac.ma', role: 'professeur' },
        { id: 2, name: 'Khadija Dmissi', email: 'khadija.dmissi@edu.uiz.ac.ma', role: 'etudiant' },
    ]);

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <div className="w-64 bg-slate-900 text-white flex flex-col justify-between shadow-xl">
                <div>
                    <div className="p-6 bg-slate-950 text-center border-b border-slate-800">
                        <h2 className="text-lg font-bold tracking-wider uppercase text-blue-400">FPT Admin</h2>
                        <p className="text-xs text-gray-400 mt-1 truncate">{user?.email}</p>
                    </div>
                    <nav className="mt-6 px-4 space-y-2">
                        <button onClick={() => setActiveTab('utilisateurs')} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'utilisateurs' ? 'bg-blue-700 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'}`}>👥 Gestion Utilisateurs</button>
                        <button onClick={() => setActiveTab('ressources')} className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'ressources' ? 'bg-blue-700 text-white shadow-md' : 'text-gray-300 hover:bg-slate-800'}`}>📚 Validation Ressources</button>
                    </nav>
                </div>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={logout} className="w-full bg-red-600 hover:bg-red-700 text-white py-2.5 px-4 rounded-lg font-bold transition">🚪 Déconnexion</button>
                </div>
            </div>

            <div className="flex-1 flex flex-col overflow-y-auto">
                <header className="bg-white shadow-sm border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-800 uppercase">{activeTab === 'utilisateurs' ? '👥 Comptes Utilisateurs' : '📚 Validation Ressources'}</h1>
                </header>
                <main className="p-8 flex-1">
                    {activeTab === 'utilisateurs' ? (
                        <div className="bg-white rounded-xl shadow border overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-100 text-gray-600 uppercase text-xs font-bold">
                                    <tr><th className="p-4">Nom Complet</th><th className="p-4">Adresse Email</th><th className="p-4">Rôle</th></tr>
                                </thead>
                                <tbody className="divide-y text-sm">
                                    {usersList.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-50">
                                            <td className="p-4 font-medium">{u.name}</td>
                                            <td className="p-4 text-gray-500">{u.email}</td>
                                            <td className="p-4"><span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-bold uppercase">{u.role}</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl p-8 text-center text-gray-500">🔍 Aucune ressource en attente de validation.</div>
                    )}
                </main>
            </div>
        </div>
    );
}