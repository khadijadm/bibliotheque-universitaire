import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/axios'
import {
    LayoutDashboard,
    Users,
    UserCheck,
    BookOpen,
    FolderOpen,
    Search,
    LogOut,
    Bell,
    Download,
    Trash2,
} from 'lucide-react'
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts'

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']

const AdminDashboard = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('dashboard')
    const [stats, setStats] = useState({ livres: 0, utilisateurs: 0, emprunts: 0, retards: 0 })
    const [users, setUsers] = useState([])
    const [ressources, setRessources] = useState([])
    const [activites, setActivites] = useState([])
    const [notifications, _setNotifications] = useState([])
    const [selectedDiscipline, setSelectedDiscipline] = useState('all')
    const [emprunts, setEmprunts] = useState([])
    const [search, setSearch] = useState('')
    const [chartData, setChartData] = useState([])

    const [showAddModal, setShowAddModal] = useState(false)
    const [newRessource, setNewRessource] = useState({ titre: '', type: 'livre', discipline: '', auteur: '' })
    const [showNotifs, setShowNotifs] = useState(false)
    const [fichier, setFichier] = useState(null)
    const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null })
    const [showAddEmpruntModal, setShowAddEmpruntModal] = useState(false)
    const [newEmprunt, setNewEmprunt] = useState({ ressource: '', utilisateur: '', dateEmprunt: '', dateRetourPrevu: '' })
    const [selectedStatut, setSelectedStatut] = useState('all')
    const [searchEmprunt, setSearchEmprunt] = useState('')
    const [selectedUserName, setSelectedUserName] = useState('')

    const buildChartData = (empruntsData) => {
        const currentYear = new Date().getFullYear()
        const counts = Array(12).fill(0).map((_, i) => ({ mois: MONTHS[i], emprunts: 0, retards: 0 }))
        empruntsData.forEach(e => {
            const d = new Date(e.dateEmprunt)
            if (d.getFullYear() === currentYear) {
                counts[d.getMonth()].emprunts += 1
                if (e.statut === 'retard') counts[d.getMonth()].retards += 1
            }
        })
        setChartData(counts)
    }

    const fetchAll = async () => {
        try {
            const resourcesRes = await api.get('/resources')
            setRessources(resourcesRes.data)
            setStats(prev => ({ ...prev, livres: resourcesRes.data.length }))
        } catch (err) { console.error('resources:', err.response?.status) }

        try {
            const usersRes = await api.get('/users')
            setUsers(usersRes.data)
            setStats(prev => ({ ...prev, utilisateurs: usersRes.data.length }))
        } catch (err) { console.error('users:', err.response?.status) }

        try {
            const empruntsRes = await api.get('/emprunts')
            setEmprunts(empruntsRes.data)
            const retards = empruntsRes.data.filter(e => e.statut === 'retard').length
            setStats(prev => ({ ...prev, emprunts: empruntsRes.data.length, retards }))
            buildChartData(empruntsRes.data)
        } catch (err) { console.error('emprunts:', err.response?.status) }

        try {
            const activitesRes = await api.get('/activites')
            setActivites(activitesRes.data)
        } catch (err) { console.error('activites:', err.response?.status) }
    }

    useEffect(() => { fetchAll() }, [])

    const nonLues = notifications.filter(n => !n.estLue).length
    const handleLogout = () => { logout(); navigate('/login') }

    const handleDeleteUser = async (id) => {
        setConfirmModal({
            show: true,
            message: 'Voulez-vous vraiment supprimer cet utilisateur ?',
            onConfirm: async () => {
                await api.delete(`/users/${id}`)
                setConfirmModal({ show: false })
                fetchAll()
            }
        })
    }

    const handleActivateUser = async (id, estActif) => {
        await api.put(`/users/${id}`, { estActif: !estActif })
        fetchAll()
    }

    const handleDeleteRessource = async (id) => {
        setConfirmModal({
            show: true,
            message: 'Voulez-vous vraiment supprimer cette ressource ?',
            onConfirm: async () => {
                await api.delete(`/resources/${id}`)
                setConfirmModal({ show: false })
                fetchAll()
            }
        })
    }

    const handleAddRessource = async () => {
        try {
            const formData = new FormData()
            formData.append('titre', newRessource.titre)
            formData.append('type', newRessource.type)
            formData.append('discipline', newRessource.discipline)
            formData.append('auteur', newRessource.auteur)
            if (fichier) formData.append('fichier', fichier)
            await api.post('/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
            setShowAddModal(false)
            setNewRessource({ titre: '', type: 'livre', discipline: '', auteur: '' })
            setFichier(null)
            fetchAll()
        } catch (err) { console.error(err) }
    }

    const filteredUsers = users.filter(u => u.nom?.toLowerCase().includes(searchEmprunt.toLowerCase()))

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
        { id: 'users', label: 'Utilisateurs', icon: <Users size={18} /> },
        { id: 'emprunts', label: 'Emprunts', icon: <UserCheck size={18} /> },
        { id: 'ressources', label: 'Ressources', icon: <BookOpen size={18} /> },
    ]

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

    return (
        <div className="flex h-screen bg-[#f5f5f5] font-sans">

            {/* SIDEBAR */}
            <aside className="w-64 bg-slate-900 flex flex-col border-r border-slate-800">
                <div className="p-5 flex items-center gap-3 border-b border-slate-800">
                    <div className="w-9 h-9 bg-gray-600 rounded-xl flex items-center justify-center">
                        <BookOpen size={18} className="text-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">Bibliotheque</p>
                        <p className="text-indigo-300 text-xs">FPT Taroudant</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 pt-4 space-y-2">
                    {navItems.map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${activeTab === item.id
                                ? 'bg-white/10 text-white border-l-4 border-blue-400 shadow-lg'
                                : 'text-slate-300 hover:bg-white/10 hover:translate-x-1'
                                }`}>
                            {item.icon} {item.label}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-8 h-8 bg-gray-600 rounded-xl flex items-center justify-center text-white font-bold text-xs">
                            {user?.nom?.[0]}
                        </div>
                        <div>
                            <p className="text-white text-xs font-bold truncate w-28">{user?.nom} {user?.prenom}</p>
                            <p className="text-indigo-300 text-xs">Administrateur</p>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-300 hover:bg-red-500/10 transition text-sm font-medium">
                        <LogOut size={15} /> Deconnexion
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 flex flex-col min-w-0">

                {/* TOPBAR */}
                <header className="relative z-40 h-16 bg-white/70 backdrop-blur border-b border-indigo-100 flex items-center justify-end px-8 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button onClick={() => setShowNotifs(!showNotifs)}
                                className="relative p-2 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition">
                                <Bell size={18} className="text-[#09315b]" />
                                {nonLues > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-3 h-3 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                                        {nonLues}
                                    </span>
                                )}
                            </button>
                            {showNotifs && (
                                <div className="absolute right-0 top-full mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50">
                                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800">Notifications</h3>
                                        <span className="text-xs text-slate-400">{nonLues} non lues</span>
                                    </div>
                                    <div className="max-h-72 overflow-y-auto">
                                        <p className="text-center text-slate-400 py-6 text-sm">Aucune notification</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="w-9 h-9 bg-slate-700 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-[#09315b]/30">
                            {user?.nom?.[0]}{user?.prenom?.[0]}
                        </div>
                    </div>
                </header>

                {/* CONTENT */}
                <section className="flex-1 overflow-y-auto p-8">

                    {/* DASHBOARD */}
                    {activeTab === 'dashboard' && (
                        <div className="space-y-6">

                            {/* BANNER */}
                            <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl">
                                <div className="absolute right-0 top-0 w-[500px] h-[500px] opacity-10">
                                    <div className="w-[800px] h-full bg-white rounded-full -translate-y-16 translate-x-16"></div>
                                </div>
                                <h2 className="text-3xl font-black mb-1">{greeting}, {user?.nom}!</h2>
                                <p className="text-indigo-200 text-sm">Bienvenue sur votre espace d'administration — Bibliotheque FPT</p>
                                <p className="text-xs text-slate-300 mt-2">
                                    {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>

                            {/* STATS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Livres', val: stats.livres, color: 'from-blue-500 to-blue-600', icon: <BookOpen size={20} /> },
                                    { label: 'Utilisateurs', val: stats.utilisateurs, color: 'from-purple-500 to-purple-600', icon: <Users size={20} /> },
                                    { label: 'Livres Empruntes', val: stats.emprunts, color: 'from-orange-500 to-orange-600', icon: <FolderOpen size={20} /> },
                                    { label: 'Retards en cours', val: stats.retards, color: 'from-red-500 to-red-600', icon: <Bell size={20} /> },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center text-white mb-3 shadow-lg`}>
                                            {s.icon}
                                        </div>
                                        <p className="text-3xl font-black text-slate-800">{s.val}</p>
                                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* CHART + ACTIVITES */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                                {/* GRAPHIQUE EMPRUNTS PAR MOIS */}
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60 flex justify-between items-center">
                                        <div>
                                            <h3 className="font-bold text-gray-700">Emprunts par mois</h3>
                                            <p className="text-xs text-slate-400 mt-0.5">Année {new Date().getFullYear()}</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>Emprunts</span>
                                            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-400 inline-block"></span>Retards</span>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <ResponsiveContainer width="100%" height={240}>
                                            <BarChart data={chartData} barSize={14} barGap={4}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                                <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: '12px' }}
                                                    cursor={{ fill: '#f8fafc' }}
                                                />
                                                <Bar dataKey="emprunts" name="Emprunts" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                                <Bar dataKey="retards" name="Retards" fill="#f87171" radius={[6, 6, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                {/* ACTIVITES RECENTES */}
                                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                                    <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60">
                                        <h3 className="font-bold text-gray-700">Activites Recentes</h3>
                                    </div>
                                    <div className="p-5 space-y-3">
                                        {activites.length === 0 ? (
                                            <p className="text-center text-slate-400 py-6 text-sm">Aucune activite recente</p>
                                        ) : activites.slice(0, 5).map((a, i) => (
                                            <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/70 hover:bg-white transition">
                                                <span className={`w-3 h-3 mt-1 rounded-full shrink-0 ${a.type === 'ajout' ? 'bg-green-500' :
                                                    a.type === 'suppression' ? 'bg-red-500' :
                                                    a.type === 'telechargement' ? 'bg-blue-500' :
                                                    a.type === 'emprunt' ? 'bg-orange-500' : 'bg-purple-500'
                                                    }`} />
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">{a.message}</p>
                                                    <p className="text-xs mt-1 text-slate-400">{new Date(a.createdAt).toLocaleDateString('fr-FR')}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* DERNIERES RESSOURCES */}
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60">
                                    <h3 className="font-bold text-gray-700">Dernieres ressources</h3>
                                </div>
                                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {ressources.slice(0, 4).map(r => (
                                        <div key={r._id} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50/70 hover:bg-white hover:shadow-md transition-all duration-300">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-bold ${r.type === 'support de cours' ? 'bg-blue-100 text-blue-600' :
                                                    r.type === 'livre' ? 'bg-green-100 text-green-600' :
                                                    'bg-orange-100 text-orange-600'
                                                    }`}>
                                                    {r.type?.slice(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-sm text-slate-700">{r.titre}</p>
                                                    <p className="text-xs text-slate-400">{r.discipline || '—'}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                                                <Download size={14} /> {r.nbTelechargements || 0}
                                            </div>
                                        </div>
                                    ))}
                                    {ressources.length === 0 && (
                                        <p className="text-center text-slate-400 py-6 text-sm col-span-2">Aucune ressource publiee</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* USERS */}
                    {activeTab === 'users' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Utilisateurs</h2>
                            </div>
                            <div className="relative w-80 mb-6">
                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input type="text" placeholder="Rechercher un utilisateur..." value={searchEmprunt} onChange={(e) => setSearchEmprunt(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 bg-white shadow-sm text-sm focus:outline-none focus:ring-4 focus:ring-blue-100" />
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs sticky top-0 z-10">
                                            <tr>
                                                <th className="text-left px-6 py-4">Membre</th>
                                                <th className="text-left px-6 py-4">Email</th>
                                                <th className="text-left px-6 py-4">Role</th>
                                                <th className="text-left px-6 py-4">Statut</th>
                                                <th className="text-right px-6 py-4">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {filteredUsers.map((u) => (
                                                <tr key={u._id} className="hover:bg-slate-50 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${u.role === 'administrateur' ? 'bg-purple-500' :
                                                                u.role === 'professeur' ? 'bg-blue-500' : 'bg-emerald-500'
                                                                }`}>
                                                                {u.nom?.[0]}
                                                            </div>
                                                            <div>
                                                                <p className="font-semibold text-slate-800">{u.nom}</p>
                                                                <p className="text-xs text-slate-400">{u.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-slate-500">{u.email}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${u.role === 'administrateur' ? 'bg-purple-100 text-purple-700' :
                                                            u.role === 'professeur' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-emerald-100 text-emerald-700'
                                                            }`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <button onClick={() => handleActivateUser(u._id, u.estActif)}
                                                                className={`relative w-11 h-6 flex items-center rounded-full transition ${u.estActif ? 'bg-green-500' : 'bg-slate-300'}`}>
                                                                <span className={`w-5 h-5 bg-white rounded-full shadow transform transition ${u.estActif ? 'translate-x-5' : 'translate-x-1'}`} />
                                                            </button>
                                                            <span className={`text-xs font-semibold ${u.estActif ? 'text-green-600' : 'text-slate-400'}`}>
                                                                {u.estActif ? 'Actif' : 'Inactif'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button onClick={() => handleDeleteUser(u._id)}
                                                            className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 transition">
                                                            Supprimer
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RESSOURCES */}
                    {activeTab === 'ressources' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-gray-700">Collection de Livres</h2>
                                <button onClick={() => setShowAddModal(true)}
                                    className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition">
                                    + Ajouter un livre
                                </button>
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <input type="text" placeholder="Rechercher..." onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50" />
                                <select value={selectedDiscipline} onChange={(e) => setSelectedDiscipline(e.target.value)}
                                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white font-semibold focus:outline-none">
                                    <option value="all">Toutes les disciplines</option>
                                    <option value="Mathématiques - Informatique">Mathématiques - Informatique</option>
                                    <option value="Sciences et techniques">Sciences et techniques</option>
                                    <option value="Sciences Humaines et Sociales">Sciences Humaines et Sociales</option>
                                    <option value="Sciences Economiques et Gestion">Sciences Economiques et Gestion</option>
                                    <option value="Physique - Chimie">Physique - Chimie</option>
                                </select>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            {['Titre', 'Type', 'Discipline', 'Auteur', 'Telechargements', 'Actions'].map(h => (
                                                <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ressources.filter(r =>
                                            (selectedDiscipline === 'all' || r.discipline === selectedDiscipline) &&
                                            (!search || r.titre?.toLowerCase().includes(search.toLowerCase()) || r.auteur?.toLowerCase().includes(search.toLowerCase()))
                                        ).map(r => (
                                            <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${['bg-blue-100 text-blue-600', 'bg-purple-100 text-purple-600', 'bg-orange-100 text-orange-600', 'bg-teal-100 text-teal-600', 'bg-pink-100 text-pink-600', 'bg-indigo-100 text-indigo-600'][r.titre?.charCodeAt(0) % 6]}`}>
                                                            {r.titre?.slice(0, 2).toUpperCase()}
                                                        </div>
                                                        <p className="font-semibold text-sm text-slate-800">{r.titre}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.type === 'livre' ? 'bg-blue-100 text-blue-700' :
                                                        r.type === 'support cours' ? 'bg-green-100 text-green-700' :
                                                        'bg-purple-100 text-purple-700'
                                                        }`}>{r.type}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{r.discipline || '—'}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{r.auteur || '—'}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-blue-600">{r.nbTelechargements || 0}</td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => handleDeleteRessource(r._id)}
                                                        className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 transition">
                                                        Supprimer
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {ressources.length === 0 && (
                                            <tr><td colSpan={6} className="text-center py-8 text-slate-400">Aucune ressource publiee</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* EMPRUNTS */}
                    {activeTab === 'emprunts' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Gestion des Emprunts</h2>
                                    <p className="text-sm text-slate-400 mt-1">{emprunts.length} emprunts enregistres</p>
                                </div>
                                <button onClick={() => setShowAddEmpruntModal(true)}
                                    className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition">
                                    + Ajouter un emprunt
                                </button>
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <input type="text" placeholder="Rechercher un livre ou membre..." onChange={(e) => setSearch(e.target.value)}
                                    className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-white" />
                                <select value={selectedStatut} onChange={(e) => setSelectedStatut(e.target.value)}
                                    className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white font-semibold focus:outline-none">
                                    <option value="all">Tous les statuts</option>
                                    <option value="encours">En cours</option>
                                    <option value="retard">En retard</option>
                                    <option value="retourne">Retournes</option>
                                </select>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            {['Ressource', 'Utilisateur', 'Date Emprunt', 'Retour Prevu', 'Retour Effectif', 'Statut', 'Actions'].map(h => (
                                                <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {emprunts.filter(e =>
                                            (selectedStatut === 'all' || e.statut === selectedStatut) &&
                                            (!search || e.ressource?.titre?.toLowerCase().includes(search.toLowerCase()) || e.utilisateur?.nom?.toLowerCase().includes(search.toLowerCase()))
                                        ).map(e => (
                                            <tr key={e._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                                                <td className="px-6 py-4">
                                                    <p className="font-semibold text-sm text-slate-800">{e.ressource?.titre}</p>
                                                    <p className="text-xs text-slate-400">{e.ressource?.type}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-semibold text-slate-800">{e.utilisateur?.nom}</p>
                                                    <p className="text-xs text-slate-400">{e.utilisateur?.email}</p>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{new Date(e.dateEmprunt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{new Date(e.dateRetourPrevu).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{e.dateRetourEffectif ? new Date(e.dateRetourEffectif).toLocaleDateString() : '—'}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${e.statut === 'encours' ? 'bg-green-100 text-green-700' :
                                                        e.statut === 'retard' ? 'bg-red-100 text-red-700' :
                                                        'bg-gray-100 text-gray-600'
                                                        }`}>{e.statut}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => setConfirmModal({
                                                        show: true,
                                                        message: 'Voulez-vous vraiment supprimer cet emprunt ?',
                                                        onConfirm: async () => {
                                                            await api.delete(`/emprunts/${e._id}`)
                                                            setConfirmModal({ show: false })
                                                            fetchAll()
                                                        }
                                                    })}
                                                        className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 transition">
                                                        Supprimer
                                                    </button>
                                                        {e.statut !== 'retourne' && (
                                                            <button onClick={async () => {
                                                                await api.put(`/emprunts/${e._id}/retourner`)
                                                                fetchAll()
                                                                }}
                                                                className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg text-xs font-semibold hover:bg-green-100 transition">
                                                                Retourné ✓
                                                            </button>
                                                        )}
                                                </td>
                                            </tr>
                                        ))}
                                        {emprunts.length === 0 && (
                                            <tr><td colSpan={6} className="text-center py-8 text-slate-400">Aucun emprunt trouve</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* MODAL AJOUT RESSOURCE */}
                    {showAddModal && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Ajouter une ressource</h3>
                                    <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { label: 'Titre', key: 'titre', placeholder: 'Titre de la ressource' },
                                        { label: 'Auteur', key: 'auteur', placeholder: "Nom de l'auteur" },
                                        { label: 'Description', key: 'description', placeholder: 'Description de la ressource' }
                                    ].map(field => (
                                        <div key={field.key}>
                                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">{field.label}</label>
                                            <input type="text" placeholder={field.placeholder} value={newRessource[field.key]}
                                                onChange={(e) => setNewRessource({ ...newRessource, [field.key]: e.target.value })}
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50" />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Discipline</label>
                                        <select value={newRessource.discipline} onChange={(e) => setNewRessource({ ...newRessource, discipline: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50">
                                            <option value="">-- Choisir une discipline --</option>
                                            <option value="Mathématiques - Informatique">Mathématiques - Informatique</option>
                                            <option value="Sciences et techniques">Sciences et techniques</option>
                                            <option value="Sciences Humaines et Sociales">Sciences Humaines et Sociales</option>
                                            <option value="Sciences Economiques et Gestion">Sciences Economiques et Gestion</option>
                                            <option value="Physique - Chimie">Physique - Chimie</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Type</label>
                                        <select value={newRessource.type} onChange={(e) => setNewRessource({ ...newRessource, type: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50">
                                            <option value="livre">Livre</option>
                                            <option value="support cours">Support de Cours</option>
                                            <option value="article scientifique">Article Scientifique</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Fichier PDF</label>
                                        <input type="file" accept=".pdf" onChange={(e) => setFichier(e.target.files[0])}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50" />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setShowAddModal(false)}
                                        className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                                        Annuler
                                    </button>
                                    <button onClick={handleAddRessource}
                                        className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition">
                                        Ajouter
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODAL CONFIRMATION */}
                    {confirmModal.show && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center">
                                <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Trash2 size={24} className="text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmation</h3>
                                <p className="text-sm text-slate-500 mb-6">{confirmModal.message}</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setConfirmModal({ show: false })}
                                        className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                                        Annuler
                                    </button>
                                    <button onClick={confirmModal.onConfirm}
                                        className="flex-1 px-4 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition">
                                        Supprimer
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MODAL AJOUT EMPRUNT */}
                    {showAddEmpruntModal && (
                        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-800">Ajouter un emprunt</h3>
                                    <button onClick={() => setShowAddEmpruntModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">×</button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Ressource</label>
                                        <select value={newEmprunt.ressource} onChange={(e) => setNewEmprunt(prev => ({ ...prev, ressource: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50">
                                            <option value="">Choisir une ressource</option>
                                            {ressources.map(r => (
                                                <option key={r._id} value={r._id}>{r.titre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Utilisateur</label>
                                        <input type="text" placeholder="Rechercher par nom..."
                                            value={selectedUserName || searchEmprunt}
                                            onChange={(e) => {
                                                setSearchEmprunt(e.target.value)
                                                setSelectedUserName('')
                                                setNewEmprunt(prev => ({ ...prev, utilisateur: '' }))
                                            }}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50 mb-2" />
                                        {searchEmprunt && !newEmprunt.utilisateur && (
                                            <div className="border border-slate-200 rounded-xl bg-white shadow-sm max-h-40 overflow-y-auto">
                                                {users.filter(u => u.nom?.toLowerCase().includes(searchEmprunt.toLowerCase())).map(u => (
                                                    <div key={u._id}
                                                        onClick={() => {
                                                            setNewEmprunt(prev => ({ ...prev, utilisateur: u._id }))
                                                            setSelectedUserName(u.nom)
                                                            setSearchEmprunt('')
                                                        }}
                                                        className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 border-b border-slate-50 last:border-0">
                                                        {u.nom} — <span className="text-xs text-slate-400">{u.role}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                        {newEmprunt.utilisateur && (
                                            <p className="text-xs text-green-600 font-semibold mt-1">✓ {selectedUserName} selectionne</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date Emprunt</label>
                                        <input type="date" value={newEmprunt.dateEmprunt}
                                            onChange={(e) => setNewEmprunt(prev => ({ ...prev, dateEmprunt: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Date Retour Prevu</label>
                                        <input type="date" value={newEmprunt.dateRetourPrevu}
                                            onChange={(e) => setNewEmprunt(prev => ({ ...prev, dateRetourPrevu: e.target.value }))}
                                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50" />
                                    </div>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => { setShowAddEmpruntModal(false); setSearchEmprunt('') }}
                                        className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                                        Annuler
                                    </button>
                                    <button onClick={async () => {
                                        if (!newEmprunt.ressource || !newEmprunt.utilisateur || !newEmprunt.dateRetourPrevu) {
                                            alert('Veuillez remplir tous les champs')
                                            return
                                        }
                                        try {
                                            await api.post('/emprunts', newEmprunt)
                                            setShowAddEmpruntModal(false)
                                            setNewEmprunt({ ressource: '', utilisateur: '', dateEmprunt: '', dateRetourPrevu: '' })
                                            setSearchEmprunt('')
                                            fetchAll()
                                        } catch (err) { console.error(err) }
                                    }}
                                        className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition">
                                        Ajouter
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                </section>
            </main>
        </div>
    )
}

export default AdminDashboard