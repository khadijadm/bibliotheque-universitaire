import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/axios'
import {
  Home, Download, User, Search, Bell, LogOut,
  Eye, BookOpen, FileText, GraduationCap,
  ChevronLeft, ChevronRight
} from 'lucide-react'

const EtudiantDashboard = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('accueil')
    const [ressources, setRessources] = useState([])
    const [notifications, setNotifications] = useState([])
    const [search, setSearch] = useState('')
    const [filterDiscipline, setFilterDiscipline] = useState('Toutes')
    const [filterType, setFilterType] = useState('tous')
    const [showNotifs, setShowNotifs] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState(null)
    const [showEditProfil, setShowEditProfil] = useState(false)
    const [editData, setEditData] = useState({})
    const [mesTelechargements, setMesTelechargements] = useState([])

    const disciplines = ['Toutes', ...new Set(ressources.map(r => r.discipline).filter(Boolean))]

    const hour = new Date().getHours()
    const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

    useEffect(() => {
        fetchRessources()
        fetchNotifications()
        fetchMesTelechargements()
    }, [])

    const fetchRessources = async () => {
        try {
            const res = await api.get('/resources')
            setRessources(res.data)
        } catch (err) { console.error(err) }
    }

    const fetchMesTelechargements = async () => {
        try {
            const telRes = await api.get('/users/mes-telechargements')
            setMesTelechargements(telRes.data)
        } catch (err) { console.error(err) }
    }

    const fetchNotifications = async () => {}

    const handleLogout = () => { logout(); navigate('/login') }

    const handleTelecharger = async (id) => {
        try {
            const res = await api.get(`/resources/download/${id}`, { responseType: 'blob' })
            const blob = new Blob([res.data])
            if (blob.size === 0) { alert('fichier non trouvable'); return }
            const url = window.URL.createObjectURL(new Blob([res.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'file.pdf')
            document.body.appendChild(link)
            link.click()
            link.remove()
            await fetchMesTelechargements()
            await fetchRessources()
        } catch (err) { console.error(err) }
    }

    const marquerLue = async (id) => {
        try {
            await api.put(`/notifications/${id}`)
            fetchNotifications()
        } catch (err) { console.error(err) }
    }

    const ressourcesFiltrees = ressources.filter(r => {
        const matchSearch = r.titre?.toLowerCase().includes(search.toLowerCase()) ||
            r.description?.toLowerCase().includes(search.toLowerCase())
        const matchType = filterType === 'tous' ||
            r.type?.toLowerCase().trim() === filterType.toLowerCase().trim()
        const matchDiscipline = filterDiscipline === 'Toutes' ||
            r.discipline?.toLowerCase().includes(filterDiscipline.toLowerCase())
        return matchSearch && matchType && matchDiscipline
    })

    const nouveautes = [...ressources]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3)

    const nonLues = notifications.filter(n => !n.estLue).length

    const typeColors = {
        'livre': 'bg-blue-100 text-blue-700',
        'support de cours': 'bg-green-100 text-green-700',
        'article scientifique': 'bg-purple-100 text-purple-700',
    }

    const typeIcons = {
        'livre': <BookOpen size={11}/>,
        'support de cours': <FileText size={11}/>,
        'article scientifique': <GraduationCap size={11}/>,
    }

    const RessourceCard = ({ r }) => (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] flex h-full flex-col">
            <div className="flex items-start justify-between mb-3">
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${typeColors[r.type] || 'bg-gray-100 text-gray-600'}`}>
                    {typeIcons[r.type]} {r.type}
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Download size={11}/> {r.nbTelechargements}
                </span>
            </div>
            <h3 className="font-bold text-slate-800 mb-2 text-sm leading-tight line-clamp-2">{r.titre}</h3>
            <p className="text-xs text-indigo-500 font-medium mb-2">{r.discipline || '—'}</p>
            <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed flex-1">
                {r.description || 'Aucune description disponible'}
            </p>
            <div className="flex gap-2 mt-auto">
                <button
                    onClick={() => handleTelecharger(r._id)}
                    className="flex-1 flex items-center justify-center gap-1.5 h-10 bg-gradient-to-r from-indigo-600 to-violet-500 text-white rounded-xl text-xs font-semibold hover:scale-[1.02] active:scale-95 transition-all duration-300">
                    <Download size={13}/> Télécharger
                </button>
                <button className="w-10 h-10 flex items-center justify-center bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 hover:text-slate-700 transition-all duration-300">
                    <Eye size={14}/>
                </button>
            </div>
        </div>
    )

    const SectionRessources = ({ title, items }) => {
        const sliderRef = useRef(null)
        const scrollLeft = () => sliderRef.current.scrollBy({ left: -700, behavior: 'smooth' })
        const scrollRight = () => sliderRef.current.scrollBy({ left: 700, behavior: 'smooth' })

        return (
            items.length > 0 && (
                <div className="mb-10 group relative">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-slate-800">{title}</h2>
                        <button onClick={() => setSelectedCategory(title)}
                            className="text-base text-indigo-600 hover:underline transition">
                            Voir plus
                        </button>
                    </div>

                    <button onClick={scrollLeft}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <ChevronLeft className="text-white" size={26}/>
                    </button>

                    <button onClick={scrollRight}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                        <ChevronRight className="text-white" size={26}/>
                    </button>

                    <div ref={sliderRef}
                        className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide items-stretch">
                        {items.map(r => (
                            <div key={r._id} className="min-w-[300px] max-w-[300px] flex-shrink-0 snap-start">
                                <RessourceCard r={r}/>
                            </div>
                        ))}
                    </div>

                    {selectedCategory && (
                        <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto">
                            <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center shadow-sm">
                                <h2 className="text-2xl font-bold text-slate-800">{selectedCategory}</h2>
                                <button onClick={() => setSelectedCategory(null)}
                                    className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition font-bold text-lg">
                                    ✕
                                </button>
                            </div>
                            <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {ressources
                                    .filter(r => selectedCategory === 'Nouveautés'
                                        ? true
                                        : r.discipline?.toLowerCase().includes(selectedCategory.toLowerCase()))
                                    .map(r => <RessourceCard key={r._id} r={r}/>)
                                }
                            </div>
                        </div>
                    )}
                </div>
            )
        )
    }

    const filtresActifs = search || filterDiscipline !== 'Toutes' || filterType !== 'tous'

    return (
        <div className="flex h-screen bg-slate-50 font-sans">

            {/* SIDEBAR */}
            <aside className="w-64 bg-slate-900 flex flex-col border-r border-slate-800">
                <div className="p-5 flex items-center gap-3 border-b border-slate-800">
                    <div className="w-9 h-9 bg-gray-600 rounded-xl flex items-center justify-center">
                        <BookOpen size={18} className="text-white"/>
                    </div>
                    <div>
                        <p className="text-white font-bold text-sm">Bibliothèque</p>
                        <p className="text-indigo-300 text-xs">FPT Taroudant</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 pt-4 space-y-2">
                    {[
                        { id: 'accueil', label: 'Accueil', icon: <Home size={18}/> },
                        { id: 'telechargements', label: 'Téléchargements', icon: <Download size={18}/> },
                        { id: 'profil', label: 'Profil', icon: <User size={18}/> },
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                                activeTab === item.id
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
                            {user?.nom?.[0]}{user?.prenom?.[0]}
                        </div>
                        <div>
                            <p className="text-white text-xs font-bold truncate w-28">{user?.nom} {user?.prenom}</p>
                            <p className="text-indigo-300 text-xs">Étudiant</p>
                        </div>
                    </div>
                    <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-300 hover:bg-red-500/10 transition text-sm font-medium">
                        <LogOut size={15}/> Déconnexion
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 flex flex-col overflow-hidden">

                {/* TOPBAR */}
                <header className="h-16 bg-white/70 backdrop-blur-xl border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Rechercher..."
                            className="pl-10 pr-4 h-11 bg-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-80 transition-all"/>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <button onClick={() => setShowNotifs(!showNotifs)}
                                className="relative p-2 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition">
                                <Bell size={18} className="text-[#09315b]"/>
                                {nonLues > 0 && (
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full">{nonLues}</span>
                                )}
                            </button>
                            {showNotifs && (
                                <div className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50">
                                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                        <h3 className="font-bold text-slate-800">Notifications</h3>
                                        <span className="text-xs text-slate-400">{nonLues} non lues</span>
                                    </div>
                                    <div className="max-h-72 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <p className="text-center text-slate-400 py-6 text-sm">Aucune notification</p>
                                        ) : notifications.map(n => (
                                            <div key={n._id} onClick={() => marquerLue(n._id)}
                                                className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition ${!n.estLue ? 'bg-indigo-50/50' : ''}`}>
                                                <div className="flex items-start gap-2">
                                                    {!n.estLue && <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 shrink-0"/>}
                                                    <div>
                                                        <p className="text-sm text-slate-800">{n.message}</p>
                                                        <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString('fr-FR')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
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

                    {activeTab === 'accueil' && (
                        <div>

                         
                            {/* BARRE DE SALUTATION   */}
                            
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

                                
                           

                            
                            {/* FILTRES */}
                         
                            <div className="flex items-center gap-3 mb-6 flex-wrap">
                                <div className="flex gap-2 flex-wrap">
                                    {[
                                        { val: 'tous', label: 'Tous' },
                                        { val: 'livre', label: 'Livre' },
                                        { val: 'support de cours', label: 'Support de cours' },
                                        { val: 'article scientifique', label: 'Article scientifique' },
                                    ].map(t => (
                                        <button key={t.val} onClick={() => setFilterType(t.val)}
                                            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                                                filterType === t.val
                                                    ? 'bg-indigo-600 text-white shadow-md'
                                                    : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300'
                                            }`}>
                                            {t.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="w-px h-6 bg-slate-200"/>

                                <div className="relative">
                                    <select value={filterDiscipline} onChange={e => setFilterDiscipline(e.target.value)}
                                        className="appearance-none pl-3 pr-8 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition cursor-pointer">
                                        {disciplines.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                    <svg className="absolute right-2.5 top-2 w-3 h-3 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                                    </svg>
                                </div>

                                {filtresActifs && (
                                    <button onClick={() => { setFilterType('tous'); setFilterDiscipline('Toutes'); setSearch('') }}
                                        className="px-3 py-1.5 rounded-full text-xs font-semibold text-red-400 border border-red-200 hover:bg-red-50 transition">
                                        ✕ Réinitialiser
                                    </button>
                                )}
                            </div>

                            {/* SECTIONS OU RESULTATS */}
                            {!filtresActifs ? (
                                <>
                                    <SectionRessources title="Nouveautés" items={nouveautes}/>
                                    <SectionRessources title="Mathématiques - Informatique" items={ressources.filter(r => r.discipline?.toLowerCase().includes('mathématiques - informatique'))}/>
                                    <SectionRessources title="Sciences et techniques" items={ressources.filter(r => r.discipline?.toLowerCase().includes('sciences et techniques'))}/>
                                    <SectionRessources title="Sciences Humaines et Sociales" items={ressources.filter(r => r.discipline?.toLowerCase().includes('sciences humaines et sociales'))}/>
                                    <SectionRessources title="Sciences Economiques et Gestion" items={ressources.filter(r => r.discipline?.toLowerCase().includes('sciences economiques et gestion'))}/>
                                    <SectionRessources title="Physique - Chimie" items={ressources.filter(r => r.discipline?.toLowerCase().includes('physique - chimie'))}/>
                                </>
                            ) : (
                                <div>
                                    <h2 className="text-base font-bold text-slate-800 mb-4">
                                        Résultats
                                        <span className="ml-2 text-sm font-normal text-slate-400">
                                            ({ressourcesFiltrees.length} ressource{ressourcesFiltrees.length > 1 ? 's' : ''})
                                        </span>
                                    </h2>
                                    {ressourcesFiltrees.length === 0 ? (
                                        <div className="text-center py-16 text-slate-400">
                                            <BookOpen size={48} className="mx-auto mb-3 opacity-20"/>
                                            <p className="font-medium">Aucune ressource trouvée</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                                            {ressourcesFiltrees.map(r => (
                                                <RessourceCard key={r._id} r={r}/>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'telechargements' && (
                        <div>
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold text-slate-800">Téléchargements</h2>
                                <p className="text-sm text-slate-400 mt-1">{mesTelechargements.length} ressource(s) téléchargée(s)</p>
                            </div>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-100">
                                            {['Titre', 'Type', 'Discipline', 'Téléchargements', 'Action'].map(h => (
                                                <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mesTelechargements.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center py-16 text-slate-400">
                                                    <Download size={40} className="mx-auto mb-3 opacity-20"/>
                                                    <p className="font-medium">Aucun téléchargement</p>
                                                    <button onClick={() => setActiveTab('accueil')}
                                                        className="mt-4 px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition">
                                                        Explorer les ressources
                                                    </button>
                                                </td>
                                            </tr>
                                        ) : mesTelechargements.map(r => (
                                            <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                                                            r.type === 'livre' ? 'bg-blue-100 text-blue-600' :
                                                            r.type === 'support de cours' ? 'bg-green-100 text-green-600' :
                                                            'bg-purple-100 text-purple-600'
                                                        }`}>
                                                            {r.titre?.slice(0,2).toUpperCase()}
                                                        </div>
                                                        <p className="font-semibold text-sm text-slate-800">{r.titre}</p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                        r.type === 'livre' ? 'bg-blue-100 text-blue-700' :
                                                        r.type === 'support de cours' ? 'bg-green-100 text-green-700' :
                                                        'bg-purple-100 text-purple-700'
                                                    }`}>{r.type}</span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500">{r.discipline || '—'}</td>
                                                <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                                                    <span className="flex items-center gap-1">
                                                        <Download size={13}/> {r.nbTelechargements || 0}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button onClick={() => handleTelecharger(r._id)}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition flex items-center gap-1.5">
                                                        <Download size={13}/> Télécharger
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'profil' && (
                        <div className="max-w-5xl mx-auto">
                            <div className="mb-8">
                                <h1 className="text-3xl font-black text-slate-800">Mon Profil</h1>
                                <p className="text-slate-400 mt-1 text-sm">Gérez vos informations personnelles</p>
                            </div>

                            <div className="bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-xl">
                                <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 to-fuchsia-500 relative">
                                    <button
                                        onClick={() => {
                                            setEditData({
                                                nom: user?.nom || '',
                                                prenom: user?.prenom || '',
                                                email: user?.email || '',
                                                codeMassar: user?.codeMassar || '',
                                                filiere: user?.filiere || '',
                                                niveau: user?.niveau || ''
                                            })
                                            setShowEditProfil(true)
                                        }}
                                        className="absolute top-6 right-6 px-5 py-2.5 bg-white/20 backdrop-blur-xl border border-white/20 text-white rounded-2xl text-sm font-semibold hover:bg-white/30 transition">
                                        Modifier
                                    </button>
                                </div>

                                <div className="px-10 pb-10 relative">
                                    <div className="w-28 h-28 rounded-[28px] bg-white shadow-2xl absolute -top-14 border-[6px] border-white flex items-center justify-center">
                                        <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white text-4xl font-black">
                                            {user?.nom?.[0]}{user?.prenom?.[0]}
                                        </div>
                                    </div>

                                    <div className="pt-20 flex items-center justify-between flex-wrap gap-4">
                                        <div>
                                            <h2 className="text-3xl font-black text-slate-800">{user?.nom} {user?.prenom}</h2>
                                            <div className="flex items-center gap-3 mt-3">
                                                <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">Étudiant</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
                                        {[
                                            { label: 'CNE / Code Massar', value: user?.codeMassar || 'Non renseigné' },
                                            { label: 'Adresse Email', value: user?.email || 'Non renseigné' },
                                            { label: 'Nom', value: user?.nom || 'Non renseigné' },
                                            { label: 'Prénom', value: user?.prenom || 'Non renseigné' },
                                            { label: 'Filière', value: user?.filiere || 'Non renseigné' },
                                            { label: 'Niveau', value: user?.niveau || 'Non renseigné' },
                                        ].map((item, index) => (
                                            <div key={index} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:shadow-md transition">
                                                <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">{item.label}</p>
                                                <h3 className="text-slate-800 font-bold text-base break-words">{item.value}</h3>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {showEditProfil && (
                                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                                    <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
                                        <div className="flex justify-between items-center mb-6">
                                            <h3 className="text-2xl font-black text-slate-800">Modifier le profil</h3>
                                            <button onClick={() => setShowEditProfil(false)}
                                                className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-500 font-bold">✕</button>
                                        </div>

                                        <div className="space-y-5">
                                            {[
                                                { label: 'Nom', key: 'nom', type: 'text' },
                                                { label: 'Prénom', key: 'prenom', type: 'text' },
                                                { label: 'Email', key: 'email', type: 'email' },
                                                { label: 'Code Massar', key: 'codeMassar', type: 'text' },
                                                { label: 'Filière', key: 'filiere', type: 'text' },
                                                { label: 'Niveau', key: 'niveau', type: 'text' },
                                            ].map(field => (
                                                <div key={field.key}>
                                                    <label className="text-sm font-bold text-slate-600 block mb-2">{field.label}</label>
                                                    <input type={field.type} value={editData[field.key] || ''}
                                                        onChange={e => setEditData({ ...editData, [field.key]: e.target.value })}
                                                        className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-3 mt-8">
                                            <button onClick={() => setShowEditProfil(false)}
                                                className="flex-1 h-12 rounded-2xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition">
                                                Annuler
                                            </button>
                                            <button onClick={async () => {
                                                try {
                                                    await api.put(`/users/${user._id}`, editData)
                                                    setShowEditProfil(false)
                                                } catch (err) { console.error(err) }
                                            }}
                                                className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold hover:opacity-90 transition">
                                                Enregistrer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                </section>
            </main>
        </div>
    )
}

export default EtudiantDashboard