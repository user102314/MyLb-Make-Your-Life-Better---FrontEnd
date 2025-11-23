// src/pages/admin/AdminDashboardLayout.tsx

import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar'; // Chemin à vérifier
import AdminNavbar from '../../components/admin/AdminNavbar'; // Chemin à vérifier

// ----------------------------------------------------------------------
// 🚨 PLACEHOLDER AUTH HOOK POUR LE LAYOUT ADMIN
// ----------------------------------------------------------------------
// NOTE: Dans une application réelle, ce hook serait partagé et ferait un appel API
// pour vérifier le statut d'authentification et le rôle actuel (ex: GET /api/auth/me).
const useAuthContextPlaceholder = () => {
    const navigate = useNavigate();
    // Simulation: utilisateur est connecté avec le rôle ADMIN
    const [userName, setUserName] = useState("Admin John Doe"); 
    const [userRole, setUserRole] = useState<"ADMIN" | "USER" | undefined>("ADMIN"); 
    const [isAuthenticated, setIsAuthenticated] = useState(true); 
    const [loadingAuth, setLoadingAuth] = useState(true); 

    // Simulation de la déconnexion
    const logout = () => {
        setIsAuthenticated(false);
        setUserRole(undefined);
        setUserName(undefined);
        // Rediriger vers la page de connexion
        navigate('/login', { replace: true });
    };

    // Simulation de la vérification de l'authentification et du chargement
    useEffect(() => {
        // Simuler le temps de chargement
        setTimeout(() => {
            setLoadingAuth(false);
            // Dans votre application réelle, vous mettez à jour isAuthenticated et userRole ici.
            // Exemple de test non admin: setUserRole("USER"); setIsAuthenticated(true);
        }, 500);
    }, []); 

    return { userName, isAuthenticated, loadingAuth, logout, userRole };
};
// ----------------------------------------------------------------------


const AdminDashboardLayout: React.FC = () => {
    const { userName, isAuthenticated, loadingAuth, logout, userRole } = useAuthContextPlaceholder(); 
    const navigate = useNavigate();
    const location = useLocation();

    // ----------------------------------------------------------------------
    // 🔑 LOGIQUE DE SÉCURITÉ : VÉRIFICATION DU RÔLE
    // ----------------------------------------------------------------------
    useEffect(() => {
        if (loadingAuth) return;
        
        // 1. NON AUTHENTIFIÉ: Rediriger vers la page de connexion
        if (!isAuthenticated) {
            navigate('/login', { replace: true });
            return;
        }

        // 2. VÉRIFICATION DU RÔLE : Si l'utilisateur est connecté mais N'EST PAS ADMIN
        if (userRole !== "ADMIN") {
            // Rediriger vers le tableau de bord standard ou une page d'accès refusé
            console.warn(`Accès non autorisé pour le rôle: ${userRole}. Redirection vers /dashboard.`);
            navigate('/dashboard', { replace: true });
        }
        
    }, [isAuthenticated, loadingAuth, userRole, navigate]);


    // Étape 1: Afficher le chargement
    if (loadingAuth) {
        return <div className="min-h-screen bg-background flex items-center justify-center text-primary text-2xl">Chargement du Tableau de Bord Admin...</div>;
    }

    // Étape 2: Ne rien rendre si non authentifié ou non autorisé (la redirection est gérée par useEffect)
    if (!isAuthenticated || userRole !== "ADMIN") {
        return null; 
    }
    
    // Étape 3: Afficher le Layout Admin
    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* 1. Navbar Admin (fixe en haut) */}
            <AdminNavbar userName={userName} /> 
            
            {/* 2. Conteneur principal */}
            <div className="flex"> 
                {/* 3. Sidebar Admin (fixe à gauche) */}
                <AdminSidebar userName={userName} onLogout={logout} />
                
                {/* 4. Contenu Principal : ml-64 pour compenser la Sidebar et pt-16 pour compenser la Navbar */}
                <main className="flex-1 ml-64 pt-16 p-6 overflow-y-auto min-h-screen"> 
                    {/* Le contenu spécifique de la route enfant (Gestion des Utilisateurs, etc.) */}
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminDashboardLayout;