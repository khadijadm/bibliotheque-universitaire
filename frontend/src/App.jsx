import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProfDashboard from './pages/prof/ProfDashboard';
import EtudiantDashboard from './pages/etudiant/EtudiantDashboard';
import Register from './pages/Register';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;

    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['administrateur']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/professeur" element={
                    <ProtectedRoute allowedRoles={['professeur']}>
                        <ProfDashboard />
                    </ProtectedRoute>
                } />

                <Route path="/etudiant" element={
                    <ProtectedRoute allowedRoles={['etudiant']}>
                        <EtudiantDashboard />
                    </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </Router>
    );
}

export default App;