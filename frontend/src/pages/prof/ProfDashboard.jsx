import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/axios'
import {
  Home, BookOpen, Plus, Download, User, Search,
  Bell, LogOut, Eye, FileText, GraduationCap,
  Trash2, Upload
} from 'lucide-react'

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
  const [newRessource, setNewRessource] = useState({
    titre: '', description: '', type: 'support cours', discipline: ''
  })
  const [file, setFile] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditProfil, setShowEditProfil] = useState(false)
  const [editData, setEditData] = useState({})

  useEffect(() => {
    fetchRessources()
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
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSupprimer = async (id) => {
    if (!window.confirm('Supprimer cette ressource ?')) return
    await api.delete(`/resources/${id}`)
    fetchRessources()
  }

  const ressourcesFiltrees = ressources.filter(r => {
    const matchSearch = r.titre?.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'tous' || r.type === filterType
    return matchSearch && matchType
  })

  const nonLues = notifications.filter(n => !n.estLue).length

  const typeColors = {
    'support cours': 'bg-blue-100 text-blue-700',
    'article scientifique': 'bg-green-100 text-green-700',
    'livre': 'bg-orange-100 text-orange-700'
  }

  const typeIcons = {
    'support cours': <BookOpen size={14}/>,
    'article scientifique': <FileText size={14}/>,
    'livre': <GraduationCap size={14}/>
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  const RessourceCard = ({ r, showActions = false }) => (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between h-full min-h-[260px]">
      <div className="flex items-start justify-between mb-3">
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${typeColors[r.type] || 'bg-gray-100 text-gray-600'}`}>
          {typeIcons[r.type]} {r.type}
        </div>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Download size={11}/> {r.nbTelechargements || 0}
        </span>
      </div>
      <h3 className="font-bold text-slate-800 mb-2 text-sm leading-snug line-clamp-2 min-h-[48px]">{r.titre}</h3>
      <p className="text-xs text-indigo-500 font-medium mb-1">{r.discipline || '—'}</p>
      {r.auteur && (
        <p className="text-xs text-slate-400 mb-2">{r.auteur}</p>
       )}
      <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed min-h-[40px]">{r.description || 'Aucune description'}</p>
      <div className="flex gap-2">
        <button onClick={() => handleTelecharger(r._id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition">
          <Download size={13}/> Télécharger
        </button>
        <button 
            onClick={() => {
            const url = `http://localhost:5000/uploads/${r.fichier}`
            window.open(url, '_blank')
            }}
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
            { id: 'ressources', label: 'Ressources', icon: <BookOpen size={17}/> },
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-72"/>
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
                    <p className="text-center text-slate-400 py-6 text-sm">Aucune notification</p>
                  </div>
                </div>
              )}
            </div>
            <div className="w-9 h-9 bg-slate-700 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              {user?.nom?.[0]}{user?.prenom?.[0]}
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <section className="flex-1 overflow-y-auto p-8">

          {/* ACCUEIL */}
          {activeTab === 'accueil' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-gray-700 to-gray-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                <h2 className="text-3xl font-black mb-1">{greeting}, {user?.nom}!</h2>
                <p className="text-indigo-200 text-sm mb-2">{user?.specialite || 'Bienvenue sur votre espace'} — Bibliothèque FPT</p>
                <p className="text-xs text-slate-300">
                  {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Total ressources', val: ressources.length, color: 'from-blue-500 to-blue-600', icon: <BookOpen size={20}/> },
                  { label: 'Mes ressources', val: mesRessources.length, color: 'from-red-500 to-red-600', icon: <Upload size={20}/> },
                  { label: 'Total téléchargements', val: mesRessources.reduce((acc, r) => acc + (r.nbTelechargements || 0), 0), color: 'from-purple-500 to-purple-600', icon: <Download size={20}/> },
                ].map((s, i) => (
                  <div key={i} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                    <div className={`w-12 h-12 bg-gradient-to-br ${s.color} rounded-2xl flex items-center justify-center text-white mb-3`}>
                      {s.icon}
                    </div>
                    <p className="text-3xl font-black text-slate-800">{s.val}</p>
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/60">
                  <h3 className="font-bold text-gray-700">Dernières ressources</h3>
                </div>
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {ressources.slice(0, 3).map(r => <RessourceCard key={r._id} r={r}/>)}
                  {ressources.length === 0 && <p className="text-slate-400 text-sm col-span-3 text-center py-6">Aucune ressource</p>}
                </div>
              </div>
            </div>
          )}

          {/* RESSOURCES */}
          {activeTab === 'ressources' && (
            <div>
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                {['tous', 'support cours', 'article scientifique', 'livre'].map(type => (
                  <button key={type} onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                      filterType === type ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 hover:bg-indigo-50 border border-slate-200'
                    }`}>
                    {type === 'tous' ? 'Tous' : type === 'support cours' ? 'Support de cours' : type === 'article scientifique' ? 'Article scientifique' : 'Livre'}
                  </button>
                ))}
              </div>
              {ressourcesFiltrees.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <BookOpen size={48} className="mx-auto mb-3 opacity-20"/>
                  <p>Aucune ressource trouvée</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {ressourcesFiltrees.map(r => <RessourceCard key={r._id} r={r}/>)}
                </div>
              )}
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
                {mesRessources.map(r => (
                    <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold ${
                                    r.type === 'livre' ? 'bg-blue-100 text-blue-600' :
                                    r.type === 'support cours' ? 'bg-green-100 text-green-600' :
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
                                r.type === 'support cours' ? 'bg-green-100 text-green-700' :
                                'bg-purple-100 text-purple-700'
                            }`}>{r.type}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{r.discipline || '—'}</td>
                        <td className="px-6 py-4 text-sm font-bold text-indigo-600 flex items-center gap-1">
                            <Download size={13}/> {r.nbTelechargements || 0}
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
                ))}
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
                          rows={3} placeholder="Description de la ressource..."
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50 resize-none"/>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Fichier PDF</label>
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-300 transition">
                          <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} className="hidden" id="fileProf"/>
                          <label htmlFor="fileProf" className="cursor-pointer">
                            <Upload size={24} className="mx-auto mb-1 text-slate-300"/>
                            {file ? (
                              <p className="text-sm font-semibold text-indigo-600">{file.name}</p>
                            ) : (
                              <p className="text-sm text-slate-400">Cliquez pour sélectionner un PDF</p>
                            )}
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-3 mt-2">
                        <button type="button" onClick={() => setShowAddModal(false)}
                          className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                          Annuler
                        </button>
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

                  <div className="pt-20">
                    <h2 className="text-3xl font-black text-slate-800">{user?.nom} {user?.prenom}</h2>
                    <span className="inline-block mt-3 px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-sm font-bold">Professeur</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
                    {[
                      { label: 'Adresse Email', value: user?.email || 'Non renseigné' },
                      { label: 'Nom', value: user?.nom || 'Non renseigné' },
                      { label: 'Prénom', value: user?.prenom || 'Non renseigné' },
                      { label: 'Spécialité', value: user?.specialite || 'Non renseigné' },
                      { label: 'Grade', value: user?.grade || 'Non renseigné' },
                    ].map((item, index) => (
                      <div key={index} className="bg-slate-50 border border-slate-100 rounded-2xl p-5 hover:shadow-md transition">
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">{item.label}</p>
                        <h3 className="text-slate-800 font-bold text-base break-words">{item.value}</h3>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MODAL EDIT */}
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

export default ProfesseurDashboard