import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../../services/axios'
import {
  BookOpen, Bell, User, LogOut, Plus, Trash2,
  Search, CheckCircle, RotateCcw, Package, Upload, ImageIcon, Pencil
} from 'lucide-react'

const DISCIPLINES = [
  'Mathématiques et Informatique',
  'Sciences & Techniques',
  'Sciences Économiques et Gestion',
  'Sciences Humaines et Sociales',
  'Physique - Chimie',
]

const BibliothecaireDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('ressources')
  const [ressources, setRessources] = useState([])
  const [notifications, setNotifications] = useState([])
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [confirmModal, setConfirmModal] = useState({ show: false, message: '', onConfirm: null })
  // ✅ mzadna nombreExemplaires hna
  const [newRessource, setNewRessource] = useState({ titre: '', auteur: '', discipline: '', nombreExemplaires: 1 })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  // ✅ modal modifier
  const [showEditModal, setShowEditModal] = useState(false)
  const [editRessource, setEditRessource] = useState(null)
  const [editImageFile, setEditImageFile] = useState(null)
  const [editImagePreview, setEditImagePreview] = useState(null)

  const fetchRessources = async () => {
    try {
      const res = await api.get('/ressources-physiques')
      setRessources(res.data)
    } catch (err) { 
        console.error(err)
        alert(err.response?.data?.message || 'Erreur: ' + err.message)
        }
  }

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications')
      setNotifications(res.data)
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    fetchRessources()
    fetchNotifications()
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleAjouter = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('titre', newRessource.titre)
      formData.append('auteur', newRessource.auteur)
      formData.append('discipline', newRessource.discipline)
      // ✅ mzadna nombreExemplaires f formData
      formData.append('nombreExemplaires', newRessource.nombreExemplaires)
      if (imageFile) formData.append('image', imageFile)

      await api.post('/ressources-physiques', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setShowAddModal(false)
      // ✅ reset m3a nombreExemplaires
      setNewRessource({ titre: '', auteur: '', discipline: '', nombreExemplaires: 1 })
      setImageFile(null)
      setImagePreview(null)
      fetchRessources()
    } catch (err) { console.error(err) }
  }

  const handleSupprimer = (id) => {
    setConfirmModal({
      show: true,
      message: 'Voulez-vous vraiment supprimer cette ressource ?',
      onConfirm: async () => {
        await api.delete(`/ressources-physiques/${id}`)
        setConfirmModal({ show: false })
        fetchRessources()
      }
    })
  }

  const handleOpenEdit = (r) => {
    setEditRessource({ ...r, nombreExemplaires: r.nombreExemplaires ?? 1 })
    setEditImageFile(null)
    setEditImagePreview(r.image ? `http://localhost:5000/uploads/${r.image}` : null)
    setShowEditModal(true)
  }

  const handleEditImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setEditImageFile(file)
    setEditImagePreview(URL.createObjectURL(file))
  }

  const handleModifier = async (e) => {
    e.preventDefault()
    try {
      const formData = new FormData()
      formData.append('titre', editRessource.titre)
      formData.append('auteur', editRessource.auteur)
      formData.append('discipline', editRessource.discipline)
      formData.append('nombreExemplaires', editRessource.nombreExemplaires)
      if (editImageFile) formData.append('image', editImageFile)

      await api.put(`/ressources-physiques/${editRessource._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setShowEditModal(false)
      setEditRessource(null)
      setEditImageFile(null)
      setEditImagePreview(null)
      fetchRessources()
    } catch (err) { console.error(err) }
  }

  const handleConfirmerRecuperation = async (demandeId, notifId) => {
    try {
      await api.put(`/demandes/${demandeId}/recuperer`)
      await api.put(`/notifications/${notifId}`)
      fetchNotifications()
      fetchRessources()
    } catch (err) { console.error(err) }
  }

  const handleConfirmerRetour = async (demandeId, notifId) => {
    try {
      await api.put(`/demandes/${demandeId}/retour`)
      await api.put(`/notifications/${notifId}`)
      fetchNotifications()
      fetchRessources()
    } catch (err) { console.error(err) }
  }

  const handleSupprimerNotif = async (notifId) => {
    try {
      await api.delete(`/notifications/${notifId}`)
      fetchNotifications()
    } catch (err) { console.error(err) }
  }

  const nonLues = notifications.filter(n => !n.estLue).length
  const ressourcesFiltrees = ressources.filter(r =>
    r.titre?.toLowerCase().includes(search.toLowerCase()) ||
    r.auteur?.toLowerCase().includes(search.toLowerCase())
  )

  const navItems = [
    { id: 'ressources', label: 'Ressources physiques', icon: <Package size={17} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={17} /> },
    { id: 'profil', label: 'Profil', icon: <User size={17} /> },
  ]

  return (
    <div className="flex h-screen bg-[#f5f5f5] font-sans">

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 flex flex-col border-r border-slate-800">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="w-9 h-9 bg-gray-600 rounded-xl flex items-center justify-center">
            <BookOpen size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">Bibliothèque</p>
            <p className="text-indigo-300 text-xs">FPT Taroudant</p>
          </div>
        </div>

        <nav className="flex-1 px-4 pt-4 space-y-2">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-white/10 text-white border-l-4 border-blue-400 shadow-lg'
                  : 'text-slate-300 hover:bg-white/10 hover:translate-x-1'
              }`}>
              {item.icon}
              {item.label}
              {item.id === 'notifications' && nonLues > 0 && (
                <span className="ml-auto w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center font-bold">
                  {nonLues}
                </span>
              )}
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
              <p className="text-indigo-300 text-xs">Bibliothécaire</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-300 hover:bg-red-500/10 transition text-sm font-medium">
            <LogOut size={15} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col min-w-0">

        {/* TOPBAR */}
        <header className="h-16 bg-white/70 backdrop-blur border-b border-indigo-100 flex items-center justify-between px-8 shadow-sm">
          {activeTab === 'ressources' && (
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher une ressource..."
                className="pl-10 pr-4 py-2 bg-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-72" />
            </div>
          )}
          {activeTab !== 'ressources' && <div />}
          <div className="w-9 h-9 bg-slate-700 rounded-xl flex items-center justify-center text-white font-bold text-sm">
            {user?.nom?.[0]}{user?.prenom?.[0]}
          </div>
        </header>

        {/* CONTENT */}
        <section className="flex-1 overflow-y-auto p-8">

          {/* RESSOURCES PHYSIQUES */}
          {activeTab === 'ressources' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Ressources Physiques</h2>
                  <p className="text-sm text-slate-400 mt-1">{ressources.length} ressources enregistrées</p>
                </div>
                <button onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition flex items-center gap-2">
                  <Plus size={16} /> Ajouter
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Couverture', 'Titre', 'Auteur', 'Discipline', 'Exemplaires', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ressourcesFiltrees.map(r => (
                      <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50 transition">
                        <td className="px-5 py-4">
                          {r.image ? (
                            <img src={`http://localhost:5000/uploads/${r.image}`} alt={r.titre}
                              className="w-10 h-14 object-cover rounded-lg shadow-sm" />
                          ) : (
                            <div className="w-10 h-14 rounded-lg bg-slate-100 flex items-center justify-center">
                              <ImageIcon size={16} className="text-slate-300" />
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-semibold text-sm text-slate-800">{r.titre}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-500">{r.auteur || '—'}</td>
                        <td className="px-5 py-4">
                          {r.discipline ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">{r.discipline}</span>
                          ) : '—'}
                        </td>
                        {/* ✅ colonne nombreExemplaires f table */}
                        <td className="px-5 py-4">
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                            {r.nombreExemplaires ?? '—'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex gap-2">
                            <button onClick={() => handleOpenEdit(r)}
                              className="px-3 py-1.5 bg-blue-50 text-blue-500 rounded-lg text-xs font-semibold hover:bg-blue-100 transition flex items-center gap-1">
                              <Pencil size={12} /> Modifier
                            </button>
                            <button onClick={() => handleSupprimer(r._id)}
                              className="px-3 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-100 transition">
                              Supprimer
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {ressourcesFiltrees.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400">Aucune ressource trouvée</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeTab === 'notifications' && (
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Notifications</h2>
                <p className="text-sm text-slate-400 mt-1">{nonLues} non lues</p>
              </div>
              <div className="space-y-4">
                {notifications.length === 0 && (
                  <div className="text-center py-16 text-slate-400">
                    <Bell size={48} className="mx-auto mb-3 opacity-20" />
                    <p>Aucune notification</p>
                  </div>
                )}
                {notifications.map(n => (
                  <div key={n._id} className={`bg-white rounded-2xl border p-5 shadow-sm transition ${
                    !n.estLue ? 'border-blue-200 bg-blue-50/30' : 'border-slate-100'
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${!n.estLue ? 'bg-blue-500' : 'bg-slate-300'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-700">{n.message}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {n.demande && !n.estLue && (
                          <>
                            <button onClick={() => handleConfirmerRecuperation(n.demande, n._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition">
                              <CheckCircle size={13} /> Récupéré
                            </button>
                            <button onClick={() => handleConfirmerRetour(n.demande, n._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:bg-orange-600 transition">
                              <RotateCcw size={13} /> Retourné
                            </button>
                          </>
                        )}
                        <button onClick={() => handleSupprimerNotif(n._id)}
                          className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROFIL */}
          {activeTab === 'profil' && (
            <div className="max-w-2xl mx-auto">
              <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-800">Mon Profil</h1>
                <p className="text-slate-400 mt-1 text-sm">Vos informations personnelles</p>
              </div>
              <div className="bg-white rounded-[32px] overflow-hidden border border-slate-200 shadow-xl">
                <div className="h-32 bg-gradient-to-r from-slate-800 to-slate-900" />
                <div className="px-10 pb-10 relative">
                  <div className="w-28 h-28 rounded-[28px] bg-white shadow-2xl absolute -top-14 border-[6px] border-white flex items-center justify-center">
                    <div className="w-full h-full rounded-[22px] bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-white text-4xl font-black">
                      {user?.nom?.[0]}{user?.prenom?.[0]}
                    </div>
                  </div>
                  <div className="pt-20">
                    <h2 className="text-3xl font-black text-slate-800">{user?.nom} {user?.prenom}</h2>
                    <span className="inline-block mt-3 px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-bold">Bibliothécaire</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
                    {[
                      { label: 'Nom', value: user?.nom },
                      { label: 'Prénom', value: user?.prenom },
                      { label: 'Email', value: user?.email },
                    ].map((item, i) => (
                      <div key={i} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                        <p className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-2">{item.label}</p>
                        <p className="text-slate-800 font-bold text-base">{item.value || 'Non renseigné'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL AJOUT */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Ajouter une ressource physique</h3>
                  <button onClick={() => { setShowAddModal(false); setImageFile(null); setImagePreview(null) }}
                    className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
                </div>
                <form onSubmit={handleAjouter} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Titre *</label>
                    <input type="text" placeholder="Titre du livre" required
                      value={newRessource.titre}
                      onChange={e => setNewRessource({ ...newRessource, titre: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Auteur</label>
                    <input type="text" placeholder="Nom de l'auteur"
                      value={newRessource.auteur}
                      onChange={e => setNewRessource({ ...newRessource, auteur: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Discipline</label>
                    <select value={newRessource.discipline}
                      onChange={e => setNewRessource({ ...newRessource, discipline: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50">
                      <option value="">-- Choisir une discipline --</option>
                      {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>

                  {/* ✅ INPUT NOMBRE EXEMPLAIRES */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nombre d'exemplaires *</label>
                    <input
                      type="number"
                      min={1}
                      placeholder="Ex: 3"
                      required
                      value={newRessource.nombreExemplaires}
                      onChange={e => setNewRessource({ ...newRessource, nombreExemplaires: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                      Image de couverture <span className="text-slate-300 normal-case font-normal">(optionnel)</span>
                    </label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-300 transition">
                      <input type="file" accept="image/*" onChange={handleImageChange}
                        className="hidden" id="imageUpload" />
                      <label htmlFor="imageUpload" className="cursor-pointer">
                        {imagePreview ? (
                          <div className="flex items-center justify-center gap-3">
                            <img src={imagePreview} alt="preview"
                              className="w-16 h-20 object-cover rounded-lg shadow-sm" />
                            <div className="text-left">
                              <p className="text-sm font-semibold text-indigo-600">{imageFile?.name}</p>
                              <p className="text-xs text-slate-400 mt-0.5">Cliquer pour changer</p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Upload size={24} className="mx-auto mb-1 text-slate-300" />
                            <p className="text-sm text-slate-400">Cliquez pour ajouter une image</p>
                            <p className="text-xs text-slate-300 mt-0.5">JPG, PNG, WEBP</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button type="button" onClick={() => { setShowAddModal(false); setImageFile(null); setImagePreview(null) }}
                      className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                      Annuler
                    </button>
                    <button type="submit"
                      className="flex-1 px-4 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition">
                      Ajouter
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* MODAL MODIFIER */}
          {showEditModal && editRessource && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Modifier la ressource</h3>
                  <button onClick={() => { setShowEditModal(false); setEditImageFile(null); setEditImagePreview(null) }}
                    className="text-slate-400 hover:text-slate-600 text-xl font-bold">✕</button>
                </div>
                <form onSubmit={handleModifier} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Titre *</label>
                    <input type="text" required
                      value={editRessource.titre}
                      onChange={e => setEditRessource({ ...editRessource, titre: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Auteur</label>
                    <input type="text"
                      value={editRessource.auteur}
                      onChange={e => setEditRessource({ ...editRessource, auteur: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Discipline</label>
                    <select value={editRessource.discipline}
                      onChange={e => setEditRessource({ ...editRessource, discipline: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50">
                      <option value="">-- Choisir une discipline --</option>
                      {DISCIPLINES.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Nombre d'exemplaires *</label>
                    <input type="number" min={1} required
                      value={editRessource.nombreExemplaires}
                      onChange={e => setEditRessource({ ...editRessource, nombreExemplaires: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none bg-slate-50" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                      Image de couverture <span className="text-slate-300 normal-case font-normal">(optionnel)</span>
                    </label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-300 transition">
                      <input type="file" accept="image/*" onChange={handleEditImageChange}
                        className="hidden" id="editImageUpload" />
                      <label htmlFor="editImageUpload" className="cursor-pointer">
                        {editImagePreview ? (
                          <div className="flex items-center justify-center gap-3">
                            <img src={editImagePreview} alt="preview"
                              className="w-16 h-20 object-cover rounded-lg shadow-sm" />
                            <div className="text-left">
                              <p className="text-xs text-slate-400 mt-0.5">Cliquer pour changer</p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <Upload size={24} className="mx-auto mb-1 text-slate-300" />
                            <p className="text-sm text-slate-400">Cliquez pour changer l'image</p>
                          </div>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-2">
                    <button type="button" onClick={() => { setShowEditModal(false); setEditImageFile(null); setEditImagePreview(null) }}
                      className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition">
                      Annuler
                    </button>
                    <button type="submit"
                      className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
                      Enregistrer
                    </button>
                  </div>
                </form>
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

        </section>
      </main>
    </div>
  )
}

export default BibliothecaireDashboard