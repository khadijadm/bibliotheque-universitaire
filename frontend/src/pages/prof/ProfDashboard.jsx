import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/axios'
import {
  Home, BookOpen, Plus, Download, User, Search,
  Bell, LogOut, Eye, FileText, GraduationCap,
  Trash2, Upload, ChevronLeft, ChevronRight,
  Package, Clock, ImageIcon
} from 'lucide-react'

const DISCIPLINES_PHYSIQUES = [
  'Mathématiques et Informatique',
  'Sciences & Techniques',
  'Sciences Économiques et Gestion',
  'Sciences Humaines et Sociales',
  'Physique - Chimie',
]

const ProfesseurDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('accueil')
  const [ressources, setRessources] = useState([])
  const [mesRessources, setMesRessources] = useState([])
  const [notifications, setNotifications] = useState([])
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('tous')
  const [showNotifs, setShowNotifs] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [newRessource, setNewRessource] = useState({ titre: '', description: '', type: 'support cours', discipline: '' })
  const [file, setFile] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditProfil, setShowEditProfil] = useState(false)
  const [editData, setEditData] = useState({})
  const [filterDiscipline, setFilterDiscipline] = useState('Toutes')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedCategoryPhysique, setSelectedCategoryPhysique] = useState(null)
  const [ressourcesPhysiques, setRessourcesPhysiques] = useState([])
  const [mesDemandes, setMesDemandes] = useState([])
  const [successMsg, setSuccessMsg] = useState('')
  const [searchPhysique, setSearchPhysique] = useState('')
  const [searchDemandes, setSearchDemandes] = useState('')
  const [searchMesRessources, setSearchMesRessources] = useState('')

  const nouveautes = [...ressources].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)
  const filtresActifs = search || filterDiscipline !== 'Toutes' || filterType !== 'tous'

  useEffect(() => {
    fetchRessources()
    fetchRessourcesPhysiques()
    fetchMesDemandes()
    fetchNotifications()
  }, [])

  const fetchRessources = async () => {
    try {
      const res = await api.get('/resources')
      setRessources(res.data)
      setMesRessources(res.data.filter(r =>
        r.ajoutePar?._id === user?.id ||
        r.ajoutePar === user?.id ||
        r.auteur === `${user?.nom} ${user?.prenom}`
      ))
    } catch (err) { console.error(err) }
  }

  const fetchRessourcesPhysiques = async () => {
    try {
      const res = await api.get('/ressources-physiques')
      setRessourcesPhysiques(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchMesDemandes = async () => {
    try {
      const res = await api.get('/demandes/mes-demandes')
      setMesDemandes(res.data)
    } catch (err) { console.error(err) }
  }

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data)
    } catch (err) { console.error(err) }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  const handleTelecharger = async (id) => {
    try {
      const res = await api.get(`/resources/download/${id}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'fichier.pdf')
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) { console.error(err) }
  }

  const handleEmprunter = async (r) => {
    try {
      await api.post('/demandes', { ressource: r._id, message: '' })
      await fetchMesDemandes()
      setSuccessMsg('✅ Demande envoyée avec succès !')
      setTimeout(() => setSuccessMsg(''), 3000)
    } catch (err) {
      setSuccessMsg('❌ ' + (err.response?.data?.message || 'Erreur lors de la demande'))
      setTimeout(() => setSuccessMsg(''), 3000)
    }
  }

  const handleAjouter = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('titre', newRessource.titre)
      formData.append('type', newRessource.type)
      formData.append('discipline', newRessource.discipline)
      formData.append('description', newRessource.description)
      formData.append('auteur', `${user?.nom} ${user?.prenom}`)
      if (file) formData.append('fichier', file)
      await api.post('/resources', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      setSuccess('Ressource ajoutée avec succès')
      fetchRessources()
      setShowAddModal(false)
      setNewRessource({ titre: '', type: 'support cours', discipline: '', description: '' })
      setFile(null)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSupprimer = async (id) => {
    if (!window.confirm('Supprimer cette ressource ?')) return
    await api.delete(`/resources/${id}`)
    fetchRessources()
  }

  const marquerLue = async (id) => {
    try { await api.put(`/notifications/${id}`); fetchNotifications() }
    catch (err) { console.error(err) }
  }

  const ressourcesFiltrees = ressources.filter(r => {
    const matchSearch = r.titre?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'tous' || r.type?.toLowerCase() === filterType.toLowerCase()
    const matchDiscipline = filterDiscipline === 'Toutes' || r.discipline?.toLowerCase().includes(filterDiscipline.toLowerCase())
    return matchSearch && matchType && matchDiscipline
  })

  const nonLues = notifications.filter(n => !n.estLue).length

  const typeColors = {
    'support cours': 'bg-blue-100 text-blue-700',
    'support de cours': 'bg-blue-100 text-blue-700',
    'article scientifique': 'bg-green-100 text-green-700',
    'livre': 'bg-orange-100 text-orange-700'
  }
  const typeIcons = {
    'support cours': <BookOpen size={14}/>,
    'support de cours': <BookOpen size={14}/>,
    'article scientifique': <FileText size={14}/>,
    'livre': <GraduationCap size={14}/>
  }
  const statutColors = {
    'en_attente': 'bg-yellow-100 text-yellow-700',
    'acceptee': 'bg-green-100 text-green-700',
    'refusee': 'bg-red-100 text-red-700',
    'recuperee': 'bg-blue-100 text-blue-700',
  }
  const statutLabels = {
    'en_attente': 'En attente',
    'acceptee': 'Acceptée',
    'refusee': 'Refusée',
    'recuperee': 'Récupérée',
  }

  const RessourceCard = ({ r, showActions = false }) => (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between h-full min-h-[260px]">
      <div className="flex items-start justify-between mb-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${typeColors[r.type] || 'bg-gray-100 text-gray-600'}`}>
          {typeIcons[r.type]} {r.type}
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1"><Download size={11}/> {r.nbTelechargements || 0}</span>
      </div>
      <h3 className="font-bold text-slate-800 mb-2 text-sm leading-snug line-clamp-2 min-h-[48px]">{r.titre}</h3>
      <p className="text-xs text-indigo-500 font-medium mb-1">{r.discipline || '—'}</p>
      {r.auteur && <p className="text-xs text-slate-400 mb-2">{r.auteur}</p>}
      <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed min-h-[40px]">{r.description || 'Aucune description'}</p>
      <div className="flex gap-2">
        <button onClick={() => handleTelecharger(r._id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition">
          <Download size={13}/> Télécharger
        </button>
        <button onClick={() => window.open(`http://localhost:5000/uploads/${r.fichier}`, '_blank')}
          className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition">
          <Eye size={14}/>
        </button>
        {showActions && (
          <button onClick={() => handleSupprimer(r._id)}
            className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition">
            <Trash2 size={14}/>
          </button>
        )}
      </div>
    </div>
  )

  const RessourcePhysiqueCard = ({ r }) => (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 flex flex-col h-full">
      <div className="w-full h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
        {r.image ? (
          <img src={`http://localhost:5000/uploads/${r.image}`} alt={r.titre} className="w-full h-full object-cover"/>
        ) : (
          <div className="flex flex-col items-center text-slate-300">
            <ImageIcon size={36}/>
            <p className="text-xs mt-1">Pas d'image</p>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-1">{r.titre}</h3>
        {r.auteur && <p className="text-xs text-slate-400 mb-2">{r.auteur}</p>}
        <div className="mt-auto pt-3">
          <button onClick={() => handleEmprunter(r)}
            className="w-full py-2 rounded-xl text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition flex items-center justify-center gap-1.5">
            <Package size={13}/> Emprunter
          </button>
        </div>
      </div>
    </div>
  )

  const SectionRessources = ({ title, items }) => {
    const sliderRef = useRef(null)
    const scrollLeft = () => sliderRef.current.scrollBy({ left: -700, behavior: 'smooth' })
    const scrollRight = () => sliderRef.current.scrollBy({ left: 700, behavior: 'smooth' })
    return items.length > 0 && (
      <div className="mb-10 group relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={() => setSelectedCategory(title)} className="text-base text-indigo-600 hover:underline">Voir plus</button>
        </div>
        <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <ChevronLeft className="text-white" size={26}/>
        </button>
        <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <ChevronRight className="text-white" size={26}/>
        </button>
        <div ref={sliderRef} className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide items-stretch">
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
              <button onClick={() => setSelectedCategory(null)} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition font-bold">✕</button>
            </div>
            <div className="p-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {ressources.filter(r => selectedCategory === 'Nouveautés' ? true : r.discipline?.toLowerCase().includes(selectedCategory.toLowerCase()))
                .map(r => <RessourceCard key={r._id} r={r}/>)}
            </div>
          </div>
        )}
      </div>
    )
  }

  const SectionPhysique = ({ title, items }) => {
    const sliderRef = useRef(null)
    const scrollLeft = () => sliderRef.current.scrollBy({ left: -700, behavior: 'smooth' })
    const scrollRight = () => sliderRef.current.scrollBy({ left: 700, behavior: 'smooth' })
    return items.length > 0 && (
      <div className="mb-10 group relative">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <button onClick={() => setSelectedCategoryPhysique(title)} className="text-base text-indigo-600 hover:underline">Voir plus</button>
        </div>
        <button onClick={scrollLeft} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <ChevronLeft className="text-white" size={26}/>
        </button>
        <button onClick={scrollRight} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-black/40 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
          <ChevronRight className="text-white" size={26}/>
        </button>
        <div ref={sliderRef} className="flex gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide items-stretch">
          {items.map(r => (
            <div key={r._id} className="min-w-[220px] max-w-[220px] flex-shrink-0 snap-start">
              <RessourcePhysiqueCard r={r}/>
            </div>
          ))}
        </div>
        {selectedCategoryPhysique && (
          <div className="fixed inset-0 bg-slate-50 z-50 overflow-y-auto">
            <div className="sticky top-0 z-20 bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center shadow-sm">
              <h2 className="text-2xl font-bold text-slate-800">{selectedCategoryPhysique}</h2>
              <button onClick={() => setSelectedCategoryPhysique(null)} className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-200 transition font-bold">✕</button>
            </div>
            <div className="p-8 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
              {ressourcesPhysiques.filter(r => r.discipline?.toLowerCase().includes(selectedCategoryPhysique.toLowerCase()))
                .map(r => <RessourcePhysiqueCard key={r._id} r={r}/>)}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#f5f5f5] font-sans">

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
            { id: 'accueil', label: 'Accueil', icon: <Home size={17}/> },
            { id: 'physiques', label: 'Ressources physiques', icon: <Package size={17}/> },
            { id: 'demandes', label: 'Mes demandes', icon: <Clock size={17}/> },
            { id: 'mesressources', label: 'Mes ressources', icon: <Upload size={17}/> },
            { id: 'profil', label: 'Profil', icon: <User size={17}/> },
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
              <p className="text-indigo-300 text-xs">{user?.specialite || 'Professeur'}</p>
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
        <header className="relative z-50 h-16 bg-white/80 backdrop-blur border-b border-indigo-100 flex items-center justify-between px-8 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16}/>
            <input
              value={
                activeTab === 'physiques' ? searchPhysique :
                activeTab === 'demandes' ? searchDemandes :
                activeTab === 'mesressources' ? searchMesRessources :
                search
              }
              onChange={e => {
                if (activeTab === 'physiques') setSearchPhysique(e.target.value)
                else if (activeTab === 'demandes') setSearchDemandes(e.target.value)
                else if (activeTab === 'mesressources') setSearchMesRessources(e.target.value)
                else setSearch(e.target.value)
              }}
              placeholder={
                activeTab === 'physiques' ? "Rechercher un livre physique..." :
                activeTab === 'demandes' ? "Rechercher une demande..." :
                activeTab === 'mesressources' ? "Rechercher une ressource..." :
                "Rechercher..."
              }
              className="pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-72"
            />
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 bg-slate-100 rounded-xl cursor-pointer hover:bg-slate-200 transition">
                <Bell size={18} className="text-[#09315b]"/>
                {nonLues > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"/>}
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
            <div className="w-9 h-9 bg-slate-700 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              {user?.nom?.[0]}{user?.prenom?.[0]}
            </div>
          </div>
        </header>

        <section className="flex-1 overflow-y-auto p-8">

          {/* TOAST */}
          {successMsg && (
            <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-sm font-semibold ${
              successMsg.includes('❌') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {successMsg}
            </div>
          )}

          {/* ACCUEIL */}
          {activeTab === 'accueil' && (
            <div>
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <div className="flex gap-2 flex-wrap">
                  {[
                    { val: 'tous', label: 'Tous' },
                    { val: 'livre', label: 'Livre' },
                    { val: 'support cours', label: 'Support de cours' },
                    { val: 'article scientifique', label: 'Article scientifique' },
                  ].map(t => (
                    <button key={t.val} onClick={() => setFilterType(t.val)}
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        filterType === t.val ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-300'
                      }`}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <div className="w-px h-6 bg-slate-200"/>
                <select value={filterDiscipline} onChange={e => setFilterDiscipline(e.target.value)}
                  className="pl-3 pr-8 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600 focus:outline-none cursor-pointer">
                  <option value="Toutes">Toutes</option>
                  <option value="Mathématiques - Informatique">Mathématiques - Informatique</option>
                  <option value="Sciences et Techniques">Sciences et Techniques</option>
                  <option value="Sciences Economiques et Gestion">Sciences Economiques et Gestion</option>
                  <option value="Sciences Humaines et Sociales">Sciences Humaines et Sociales</option>
                  <option value="Physique - Chimie">Physique - Chimie</option>
                </select>
                {filtresActifs && (
                  <button onClick={() => { setFilterType('tous'); setFilterDiscipline('Toutes'); setSearch('') }}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold text-red-400 border border-red-200 hover:bg-red-50 transition">
                    ✕ Réinitialiser
                  </button>
                )}
              </div>
              {!filtresActifs ? (
                <>
                  <SectionRessources title="Nouveautés" items={nouveautes}/>
                  <SectionRessources title="Mathématiques - Informatique" items={ressources.filter(r => r.discipline?.toLowerCase().includes('mathématiques - informatique'))}/>
                  <SectionRessources title="Sciences et Techniques" items={ressources.filter(r => r.discipline?.toLowerCase().includes('sciences et techniques'))}/>
                  <SectionRessources title="Sciences Humaines et Sociales" items={ressources.filter(r => r.discipline?.toLowerCase().includes('sciences humaines et sociales'))}/>
                  <SectionRessources title="Sciences Economiques et Gestion" items={ressources.filter(r => r.discipline?.toLowerCase().includes('sciences economiques et gestion'))}/>
                  <SectionRessources title="Physique - Chimie" items={ressources.filter(r => r.discipline?.toLowerCase().includes('physique - chimie'))}/>
                </>
              ) : (
                <div>
                  <h2 className="text-base font-bold text-slate-800 mb-4">
                    Résultats <span className="ml-2 text-sm font-normal text-slate-400">({ressourcesFiltrees.length} ressource{ressourcesFiltrees.length > 1 ? 's' : ''})</span>
                  </h2>
                  {ressourcesFiltrees.length === 0 ? (
                    <div className="text-center py-16 text-slate-400">
                      <BookOpen size={48} className="mx-auto mb-3 opacity-20"/>
                      <p className="font-medium">Aucune ressource trouvée</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                      {ressourcesFiltrees.map(r => <RessourceCard key={r._id} r={r}/>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* LIVRES PHYSIQUES */}
          {activeTab === 'physiques' && (
            <div>
              {searchPhysique ? (
                <div>
                  <h2 className="text-xl font-bold text-slate-800 mb-4">
                    Résultats <span className="ml-2 text-sm font-normal text-slate-400">
                      ({ressourcesPhysiques.filter(r =>
                        r.titre?.toLowerCase().includes(searchPhysique.toLowerCase()) ||
                        r.auteur?.toLowerCase().includes(searchPhysique.toLowerCase())
                      ).length} livre{ressourcesPhysiques.filter(r =>
                        r.titre?.toLowerCase().includes(searchPhysique.toLowerCase()) ||
                        r.auteur?.toLowerCase().includes(searchPhysique.toLowerCase())
                      ).length > 1 ? 's' : ''})
                    </span>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
                    {ressourcesPhysiques
                      .filter(r =>
                        r.titre?.toLowerCase().includes(searchPhysique.toLowerCase()) ||
                        r.auteur?.toLowerCase().includes(searchPhysique.toLowerCase())
                      )
                      .map(r => <RessourcePhysiqueCard key={r._id} r={r}/>)
                    }
                  </div>
                  {ressourcesPhysiques.filter(r =>
                    r.titre?.toLowerCase().includes(searchPhysique.toLowerCase()) ||
                    r.auteur?.toLowerCase().includes(searchPhysique.toLowerCase())
                  ).length === 0 && (
                    <div className="text-center py-16 text-slate-400">
                      <Package size={48} className="mx-auto mb-3 opacity-20"/>
                      <p className="font-medium">Aucun livre trouvé</p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {DISCIPLINES_PHYSIQUES.map(disc => (
                    <SectionPhysique key={disc} title={disc}
                      items={ressourcesPhysiques.filter(r => r.discipline?.toLowerCase().includes(disc.toLowerCase()))}/>
                  ))}
                  {ressourcesPhysiques.length === 0 && (
                    <div className="text-center py-16 text-slate-400">
                      <Package size={48} className="mx-auto mb-3 opacity-20"/>
                      <p className="font-medium">Aucun livre physique disponible</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* MES DEMANDES */}
          {activeTab === 'demandes' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Mes demandes</h2>
                <p className="text-sm text-slate-400 mt-1">{mesDemandes.length} demande(s)</p>
              </div>
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Livre', 'Auteur', 'Date demande', 'Statut'].map(h => (
                        <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {mesDemandes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-16 text-slate-400">
                          <Clock size={40} className="mx-auto mb-3 opacity-20"/>
                          <p className="font-medium">Aucune demande en cours</p>
                        </td>
                      </tr>
                    ) : mesDemandes
                        .filter(d =>
                          d.ressource?.titre?.toLowerCase().includes(searchDemandes.toLowerCase()) ||
                          d.ressource?.auteur?.toLowerCase().includes(searchDemandes.toLowerCase())
                        )
                        .map(d => (
                          <tr key={d._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                {d.ressource?.image ? (
                                  <img src={`http://localhost:5000/uploads/${d.ressource.image}`}
                                    className="w-8 h-11 object-cover rounded-lg" alt=""/>
                                ) : (
                                  <div className="w-8 h-11 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <ImageIcon size={12} className="text-slate-300"/>
                                  </div>
                                )}
                                <p className="font-semibold text-sm text-slate-800">{d.ressource?.titre}</p>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-500">{d.ressource?.auteur || '—'}</td>
                            <td className="px-5 py-4 text-sm text-slate-500">{new Date(d.createdAt).toLocaleDateString('fr-FR')}</td>
                            <td className="px-5 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statutColors[d.statut] || 'bg-gray-100 text-gray-600'}`}>
                                {statutLabels[d.statut] || d.statut}
                              </span>
                            </td>
                          </tr>
                        ))
                    }
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MES RESSOURCES */}
          {activeTab === 'mesressources' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800">Mes Ressources</h2>
                  <p className="text-sm text-slate-400 mt-1">{mesRessources.length} ressources publiées</p>
                </div>
                <button onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition flex items-center gap-2">
                  <Plus size={16}/> Ajouter une ressource
                </button>
              </div>
              {mesRessources.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <Upload size={48} className="mx-auto mb-3 opacity-20"/>
                  <p className="font-medium">Vous n'avez pas encore publié de ressource</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {['Titre', 'Type', 'Discipline', 'Téléchargements', 'Actions'].map(h => (
                          <th key={h} className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {mesRessources
                        .filter(r =>
                          r.titre?.toLowerCase().includes(searchMesRessources.toLowerCase()) ||
                          r.discipline?.toLowerCase().includes(searchMesRessources.toLowerCase())
                        )
                        .map(r => (
                          <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                                  r.type === 'livre' ? 'bg-orange-100 text-orange-600' :
                                  r.type === 'support cours' ? 'bg-blue-100 text-blue-600' :
                                  'bg-green-100 text-green-600'
                                }`}>{r.titre?.slice(0,2).toUpperCase()}</div>
                                <p className="font-semibold text-sm text-slate-800">{r.titre}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${typeColors[r.type] || 'bg-gray-100 text-gray-600'}`}>
                                {r.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">{r.discipline || '—'}</td>
                            <td className="px-6 py-4 text-sm font-bold text-indigo-600">
                              <span className="flex items-center gap-1"><Download size={13}/> {r.nbTelechargements || 0}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button onClick={() => window.open(`http://localhost:5000/uploads/${r.fichier}`, '_blank')}
                                  className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition">
                                  <Eye size={14}/>
                                </button>
                                <button onClick={() => handleSupprimer(r._id)}
                                  className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 transition">
                                  Supprimer
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      }
                      {mesRessources.filter(r =>
                        r.titre?.toLowerCase().includes(searchMesRessources.toLowerCase()) ||
                        r.discipline?.toLowerCase().includes(searchMesRessources.toLowerCase())
                      ).length === 0 && searchMesRessources && (
                        <tr>
                          <td colSpan={5} className="text-center py-16 text-slate-400">
                            <BookOpen size={40} className="mx-auto mb-3 opacity-20"/>
                            <p className="font-medium">Aucune ressource trouvée</p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {/* MODAL AJOUTER */}
              {showAddModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-gray-800">Ajouter une ressource</h3>
                      <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
                    </div>
                    {success && (
                      <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-xl mb-4 text-sm font-medium">{success}</div>
                    )}
                    <form onSubmit={handleAjouter} className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Titre</label>
                        <input value={newRessource.titre} onChange={e => setNewRessource({...newRessource, titre: e.target.value})}
                          required placeholder="Titre de la ressource"
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50"/>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Type</label>
                          <select value={newRessource.type} onChange={e => setNewRessource({...newRessource, type: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50">
                            <option value="support cours">Support de cours</option>
                            <option value="livre">Livre</option>
                            <option value="article scientifique">Article scientifique</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Discipline</label>
                          <select value={newRessource.discipline} onChange={e => setNewRessource({...newRessource, discipline: e.target.value})}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50">
                            <option value="">-- Choisir --</option>
                            <option value="Mathématiques - Informatique">Mathématiques - Informatique</option>
                            <option value="Sciences et Techniques">Sciences et Techniques</option>
                            <option value="Sciences Economiques et Gestion">Sciences Economiques et Gestion</option>
                            <option value="Sciences Humaines et Sociales">Sciences Humaines et Sociales</option>
                            <option value="Physique - Chimie">Physique - Chimie</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description</label>
                        <textarea value={newRessource.description} onChange={e => setNewRessource({...newRessource, description: e.target.value})}
                          rows={3} placeholder="Description..."
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50 resize-none"/>
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Fichier PDF</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-300 transition">
                          <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} className="hidden" id="fileProf"/>
                          <label htmlFor="fileProf" className="cursor-pointer">
                            <Upload size={24} className="mx-auto mb-1 text-slate-300"/>
                            {file ? <p className="text-sm font-semibold text-indigo-600">{file.name}</p>
                              : <p className="text-sm text-slate-400">Cliquez pour sélectionner un PDF</p>}
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-2">
                        <button type="button" onClick={() => setShowAddModal(false)}
                          className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">Annuler</button>
                        <button type="submit" disabled={loading}
                          className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50">
                          {loading ? 'Ajout...' : 'Ajouter'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PROFIL */}
          {activeTab === 'profil' && (
            <div className="max-w-5xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800">Mon Profil</h1>
                <p className="text-slate-400 mt-1 text-sm">Gérez vos informations personnelles</p>
              </div>
              <div className="bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-xl">
                <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900 relative">
                  <button onClick={() => {
                    setEditData({ nom: user?.nom || '', prenom: user?.prenom || '', email: user?.email || '', specialite: user?.specialite || '', grade: user?.grade || '' })
                    setShowEditProfil(true)
                  }} className="absolute top-6 right-6 px-5 py-2.5 bg-white/20 backdrop-blur-xl border border-white/20 text-white rounded-2xl text-sm font-semibold hover:bg-white/30 transition">
                    Modifier
                  </button>
                </div>
                <div className="px-10 pb-10 relative">
                  <div className="w-28 h-28 rounded-[28px] bg-white shadow-2xl absolute -top-14 border-[6px] border-white flex items-center justify-center">
                    <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white text-4xl font-black">
                      {user?.nom?.[0]}{user?.prenom?.[0]}
                    </div>
                  </div>
                  <div className="pt-20">
                    <h2 className="text-3xl font-black text-slate-800">{user?.nom} {user?.prenom}</h2>
                    <span className="inline-block mt-3 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">Professeur</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
                    {[
                      { label: 'Adresse Email', value: user?.email },
                      { label: 'Nom', value: user?.nom },
                      { label: 'Prénom', value: user?.prenom },
                      { label: 'Spécialité', value: user?.specialite },
                      { label: 'Grade', value: user?.grade },
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:shadow-md transition">
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">{item.label}</p>
                        <h3 className="text-slate-800 font-bold text-base">{item.value || 'Non renseigné'}</h3>
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
                      <button onClick={() => setShowEditProfil(false)} className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-slate-500 font-bold">✕</button>
                    </div>
                    <div className="space-y-5">
                      {[
                        { label: 'Nom', key: 'nom' },
                        { label: 'Prénom', key: 'prenom' },
                        { label: 'Email', key: 'email', type: 'email' },
                        { label: 'Spécialité', key: 'specialite' },
                        { label: 'Grade', key: 'grade' },
                      ].map(field => (
                        <div key={field.key}>
                          <label className="text-sm font-bold text-slate-600 block mb-2">{field.label}</label>
                          <input type={field.type || 'text'} value={editData[field.key] || ''}
                            onChange={e => setEditData({...editData, [field.key]: e.target.value})}
                            className="w-full h-12 px-4 rounded-2xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3 mt-8">
                      <button onClick={() => setShowEditProfil(false)}
                        className="flex-1 h-12 rounded-2xl border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition">Annuler</button>
                      <button onClick={async () => {
                        try { await api.put(`/users/${user._id}`, editData); setShowEditProfil(false) }
                        catch (err) { console.error(err) }
                      }} className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 text-white font-bold hover:opacity-90 transition">
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

export default ProfesseurDashboard