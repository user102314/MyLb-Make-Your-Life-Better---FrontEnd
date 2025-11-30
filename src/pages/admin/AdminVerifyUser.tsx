import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye,
  Edit,
  Shield,
  Mail,
  UserCheck,
  FileText,
  Camera,
  Download,
  RefreshCw,
  AlertCircle,
  ChevronUp,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface User {
  clientId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isVerified: boolean;
  usagePurpose?: string;
  cinNumber?: string;
  phoneNumber?: string;
  age?: number;
  hasIdentityDocuments: boolean;
  isFullyVerified: boolean;
}

interface UserCompleteDetails {
  clientId: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  role: string;
  isVerified: boolean;
  usagePurpose?: string;
  cinNumber?: string;
  phoneNumber?: string;
  age?: number;
  identityId?: number;
  photocinRecto?: number[];
  photocinVerso?: number[];
  photocompletSelfie?: number[];
  identityStatus: 'PENDING' | 'VALIDATED' | 'REJECTED';
  identityUploadDate?: string;
  verificationId?: number;
  emailVerified: boolean;
  kycSubmitted: boolean;
  kycValidated: boolean;
  faceRecognition: boolean;
  fullyVerified: boolean;
}

const AdminVerifyUser: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserCompleteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'details'>('list');
  const [imagePreview, setImagePreview] = useState<{ type: string; data: number[] } | null>(null);

  const BASE_URL = "http://localhost:9090";

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrage des utilisateurs
  useEffect(() => {
    let filtered = users;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.cinNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut de vérification
    if (filterVerified === 'verified') {
      filtered = filtered.filter(user => user.isFullyVerified);
    } else if (filterVerified === 'unverified') {
      filtered = filtered.filter(user => !user.isFullyVerified);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterVerified]);

  const fetchUsers = async () => {
    try {
      setError(null);
      setLoading(true);
      console.log('🔄 Début de la récupération des utilisateurs...');
      
      const response = await fetch(`${BASE_URL}/api/admin/users/complete-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      console.log('📡 Réponse reçue:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur détaillée:', errorText);
        throw new Error(`Erreur ${response.status}: ${response.statusText}. Détails: ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Données reçues:', result);
      
      if (result.success) {
        setUsers(result.users);
        console.log(`📊 ${result.users.length} utilisateurs chargés`);
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des utilisateurs');
      }
    } catch (err) {
      console.error('💥 Erreur complète:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion au serveur';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchUserCompleteDetails = async (userId: number) => {
    try {
      console.log(`🔄 Chargement des détails pour l'utilisateur ${userId}...`);
      
      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}/complete-details`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${response.statusText}. Détails: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setSelectedUser(result.user);
        setViewMode('details');
        console.log('✅ Détails utilisateur chargés');
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération des détails');
      }
    } catch (err) {
      console.error('💥 Erreur détails:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
    }
  };

  const updateUserRole = async (userId: number, newRole: string) => {
    try {
      console.log(`🔄 Mise à jour du rôle pour ${userId} -> ${newRole}`);
      
      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${response.statusText}. Détails: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.clientId === userId ? { ...user, role: newRole } : user
          )
        );
        
        if (selectedUser && selectedUser.clientId === userId) {
          setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
        }
        
        console.log('✅ Rôle mis à jour avec succès');
        return true;
      } else {
        throw new Error(result.message || 'Erreur lors de la mise à jour du rôle');
      }
    } catch (err) {
      console.error('💥 Erreur mise à jour rôle:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      return false;
    }
  };

  const updateUserVerification = async (userId: number, isVerified: boolean) => {
    try {
      console.log(`🔄 Mise à jour vérification pour ${userId} -> ${isVerified}`);
      
      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}/verification`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isVerified }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${response.statusText}. Détails: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setUsers(prevUsers => 
          prevUsers.map(user => 
            user.clientId === userId ? { ...user, isVerified } : user
          )
        );
        
        if (selectedUser && selectedUser.clientId === userId) {
          setSelectedUser(prev => prev ? { ...prev, isVerified } : null);
        }
        
        console.log('✅ Vérification mise à jour avec succès');
        return true;
      } else {
        throw new Error(result.message || 'Erreur lors de la mise à jour de la vérification');
      }
    } catch (err) {
      console.error('💥 Erreur mise à jour vérification:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      return false;
    }
  };

  const updateIdentityStatus = async (userId: number, status: string) => {
    try {
      console.log(`🔄 Mise à jour statut identité pour ${userId} -> ${status}`);
      
      const response = await fetch(`${BASE_URL}/api/admin/users/${userId}/identity-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur ${response.status}: ${response.statusText}. Détails: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        if (selectedUser && selectedUser.clientId === userId) {
          setSelectedUser(prev => prev ? { 
            ...prev, 
            identityStatus: status as 'PENDING' | 'VALIDATED' | 'REJECTED' 
          } : null);
        }
        
        console.log('✅ Statut identité mis à jour avec succès');
        return true;
      } else {
        throw new Error(result.message || 'Erreur lors de la mise à jour du statut');
      }
    } catch (err) {
      console.error('💥 Erreur mise à jour statut:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion';
      setError(errorMessage);
      return false;
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setError(null);
    fetchUsers();
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedUser(null);
    setImagePreview(null);
  };

  const handleImagePreview = (type: string, data: number[]) => {
    setImagePreview({ type, data });
  };

  const closeImagePreview = () => {
    setImagePreview(null);
  };

  const getVerificationBadge = (user: User) => {
    if (user.isFullyVerified) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-400 flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        Complètement Vérifié
      </Badge>;
    } else if (user.hasIdentityDocuments) {
      return <Badge className="bg-purple-500/20 text-purple-400 border-purple-400">
        En Attente
      </Badge>;
    } else {
      return <Badge className="bg-red-500/20 text-red-400 border-red-400">
        Non Soumis
      </Badge>;
    }
  };

  const getIdentityStatusBadge = (status: string) => {
    switch (status) {
      case 'VALIDATED':
        return <Badge className="bg-green-500/20 text-green-400 border-green-400">Validé</Badge>;
      case 'PENDING':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-400">En Attente</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-500/20 text-red-400 border-red-400">Rejeté</Badge>;
      default:
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-400">Inconnu</Badge>;
    }
  };

  // Test de connexion simple
  const testConnection = async () => {
    try {
      console.log('🧪 Test de connexion...');
      const response = await fetch(`${BASE_URL}/api/admin/users`, {
        credentials: 'include'
      });
      console.log('Test connexion:', response.status);
    } catch (err) {
      console.error('Test connexion échoué:', err);
    }
  };

  // Exécuter le test au chargement
  useEffect(() => {
    testConnection();
  }, []);

  if (loading) {
    return <UsersLoadingSkeleton />;
  }

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <ErrorAlert error={error} onRetry={handleRefresh} />
          <div className="mt-4 text-center">
            <Button onClick={testConnection} variant="outline" className="bg-gray-800 border-purple-500 text-white hover:bg-purple-500/10">
              Tester la connexion
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="bg-gray-800 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800">
                <UserCheck className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Vérification des Utilisateurs
                </h1>
                <p className="text-gray-400">
                  Gestion et validation des comptes utilisateurs et documents d'identité
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2 bg-gray-800 border-purple-500 text-white hover:bg-purple-500/10 hover:border-purple-400 transition-all duration-200"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
              ) : (
                <RefreshCw className="w-4 h-4 text-purple-400" />
              )}
              Actualiser
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-500/10 border-red-400 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Vue Liste */}
        {viewMode === 'list' && (
          <div className="space-y-6">
            {/* Filtres et Recherche */}
            <Card className="bg-gray-800 border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                    <Input
                      placeholder="Rechercher par nom, email ou CIN..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700 border-purple-500/20 text-white focus:border-purple-500 placeholder:text-gray-400"
                    />
                  </div>
                  
                  <Select value={filterVerified} onValueChange={(value: 'all' | 'verified' | 'unverified') => setFilterVerified(value)}>
                    <SelectTrigger className="w-[180px] bg-gray-700 border-purple-500/20 text-white focus:border-purple-500">
                      <Filter className="w-4 h-4 mr-2 text-purple-400" />
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-purple-500/20 text-white">
                      <SelectItem value="all">Tous les utilisateurs</SelectItem>
                      <SelectItem value="verified">Vérifiés complets</SelectItem>
                      <SelectItem value="unverified">Non vérifiés</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Statistiques */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title="Total Utilisateurs"
                value={users.length.toString()}
                icon={<Users className="w-6 h-6" />}
                color="purple"
              />
              <StatCard
                title="Complètement Vérifiés"
                value={users.filter(u => u.isFullyVerified).length.toString()}
                icon={<CheckCircle className="w-6 h-6" />}
                color="green"
              />
              <StatCard
                title="En Attente"
                value={users.filter(u => u.hasIdentityDocuments && !u.isFullyVerified).length.toString()}
                icon={<FileText className="w-6 h-6" />}
                color="purple"
              />
              <StatCard
                title="Non Soumis"
                value={users.filter(u => !u.hasIdentityDocuments).length.toString()}
                icon={<XCircle className="w-6 h-6" />}
                color="red"
              />
            </div>

            {/* Liste des Utilisateurs */}
            <Card className="bg-gray-800 border-purple-500/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="w-6 h-6 text-purple-400" />
                  Liste des Utilisateurs ({filteredUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.map((user) => (
                    <UserCard
                      key={user.clientId}
                      user={user}
                      onViewDetails={() => fetchUserCompleteDetails(user.clientId)}
                      getVerificationBadge={getVerificationBadge}
                    />
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8 text-gray-400 bg-purple-500/10 rounded-xl border border-purple-500/20">
                      <Users className="w-16 h-16 mx-auto mb-4 text-purple-400/40" />
                      <p>Aucun utilisateur trouvé</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Vue Détails */}
        {viewMode === 'details' && selectedUser && (
          <UserDetailsView
            user={selectedUser}
            onBack={handleBackToList}
            onImagePreview={handleImagePreview}
            onUpdateRole={updateUserRole}
            onUpdateVerification={updateUserVerification}
            onUpdateIdentityStatus={updateIdentityStatus}
            getIdentityStatusBadge={getIdentityStatusBadge}
          />
        )}

        {/* Preview d'Image */}
        {imagePreview && (
          <ImagePreviewModal
            imageData={imagePreview}
            onClose={closeImagePreview}
          />
        )}
      </div>
    </div>
  );
};

const UserCard: React.FC<{
  user: User;
  onViewDetails: () => void;
  getVerificationBadge: (user: User) => React.ReactNode;
}> = ({ user, onViewDetails, getVerificationBadge }) => {
  return (
    <Card className="bg-gray-800 border-purple-500/20 hover:border-purple-500 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">
                {user.firstName} {user.lastName}
              </h3>
              {getVerificationBadge(user)}
              <Badge className={user.isVerified ? "bg-green-500/20 text-green-400 border-green-400" : "bg-purple-500/20 text-purple-400 border-purple-400"}>
                {user.isVerified ? "Vérifié" : "Non Vérifié"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Rôle: {user.role}</span>
              </div>
              {user.cinNumber && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  <span>CIN: {user.cinNumber}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={onViewDetails}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200"
            >
              <Eye className="w-4 h-4" />
              Voir Détails
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant Vue Détails
const UserDetailsView: React.FC<{
  user: UserCompleteDetails;
  onBack: () => void;
  onImagePreview: (type: string, data: number[]) => void;
  onUpdateRole: (userId: number, role: string) => Promise<boolean>;
  onUpdateVerification: (userId: number, isVerified: boolean) => Promise<boolean>;
  onUpdateIdentityStatus: (userId: number, status: string) => Promise<boolean>;
  getIdentityStatusBadge: (status: string) => React.ReactNode;
}> = ({ user, onBack, onImagePreview, onUpdateRole, onUpdateVerification, onUpdateIdentityStatus, getIdentityStatusBadge }) => {
  const [updating, setUpdating] = useState(false);

  const handleRoleChange = async (newRole: string) => {
    setUpdating(true);
    const success = await onUpdateRole(user.clientId, newRole);
    setUpdating(false);
    
    if (success) {
      // Optionnel: Afficher un message de succès
    }
  };

  const handleVerificationChange = async (isVerified: boolean) => {
    setUpdating(true);
    const success = await onUpdateVerification(user.clientId, isVerified);
    setUpdating(false);
    
    if (success) {
      // Optionnel: Afficher un message de succès
    }
  };

  const handleIdentityStatusChange = async (status: string) => {
    setUpdating(true);
    const success = await onUpdateIdentityStatus(user.clientId, status);
    setUpdating(false);
    
    if (success) {
      // Optionnel: Afficher un message de succès
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Détails */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="outline"
            className="flex items-center gap-2 bg-gray-800 border-purple-500 text-white hover:bg-purple-500/10 hover:border-purple-400"
          >
            <ChevronUp className="w-4 h-4 text-purple-400" />
            Retour à la liste
          </Button>
          <h2 className="text-2xl font-bold text-white">
            Détails de {user.firstName} {user.lastName}
          </h2>
        </div>
        
        <div className="flex gap-2">
          {getIdentityStatusBadge(user.identityStatus)}
          <Badge className={user.isVerified ? "bg-green-500/20 text-green-400 border-green-400" : "bg-purple-500/20 text-purple-400 border-purple-400"}>
            {user.isVerified ? "Compte Vérifié" : "Compte Non Vérifié"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations Personnelles */}
        <Card className="lg:col-span-2 bg-gray-800 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <UserCheck className="w-5 h-5 text-purple-400" />
              Informations Personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoField label="Nom Complet" value={`${user.firstName} ${user.lastName}`} />
              <InfoField label="Email" value={user.email} />
              <InfoField label="Date de Naissance" value={user.birthDate ? new Date(user.birthDate).toLocaleDateString('fr-FR') : 'Non renseignée'} />
              <InfoField label="Âge" value={user.age?.toString() || 'Non renseigné'} />
              <InfoField label="CIN" value={user.cinNumber || 'Non renseigné'} />
              <InfoField label="Téléphone" value={user.phoneNumber || 'Non renseigné'} />
              <InfoField label="Usage Prévu" value={user.usagePurpose || 'Non renseigné'} />
            </div>
          </CardContent>
        </Card>

        {/* Actions Administrateur */}
        <Card className="bg-gray-800 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-purple-400" />
              Actions Administrateur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Rôle Utilisateur</label>
              <Select value={user.role} onValueChange={handleRoleChange} disabled={updating}>
                <SelectTrigger className="bg-gray-700 border-purple-500/20 text-white focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-purple-500/20 text-white">
                  <SelectItem value="CIVIL">CIVIL</SelectItem>
                  <SelectItem value="INVESTOR">INVESTOR</SelectItem>
                  <SelectItem value="OWNER">OWNER</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Statut du Compte</label>
              <Select 
                value={user.isVerified ? "verified" : "unverified"} 
                onValueChange={(value) => handleVerificationChange(value === "verified")}
                disabled={updating}
              >
                <SelectTrigger className="bg-gray-700 border-purple-500/20 text-white focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-purple-500/20 text-white">
                  <SelectItem value="verified">Vérifié</SelectItem>
                  <SelectItem value="unverified">Non Vérifié</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Statut des Documents</label>
              <Select 
                value={user.identityStatus} 
                onValueChange={handleIdentityStatusChange}
                disabled={updating}
              >
                <SelectTrigger className="bg-gray-700 border-purple-500/20 text-white focus:border-purple-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-purple-500/20 text-white">
                  <SelectItem value="PENDING">En Attente</SelectItem>
                  <SelectItem value="VALIDATED">Validé</SelectItem>
                  <SelectItem value="REJECTED">Rejeté</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Documents d'Identité */}
        <Card className="lg:col-span-3 bg-gray-800 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <FileText className="w-5 h-5 text-purple-400" />
              Documents d'Identité
            </CardTitle>
            <CardDescription className="text-gray-400">
              Documents soumis par l'utilisateur pour vérification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DocumentCard
                title="CIN Recto"
                hasDocument={!!user.photocinRecto}
                onPreview={() => user.photocinRecto && onImagePreview('CIN Recto', user.photocinRecto)}
              />
              <DocumentCard
                title="CIN Verso"
                hasDocument={!!user.photocinVerso}
                onPreview={() => user.photocinVerso && onImagePreview('CIN Verso', user.photocinVerso)}
              />
              <DocumentCard
                title="Selfie avec CIN"
                hasDocument={!!user.photocompletSelfie}
                onPreview={() => user.photocompletSelfie && onImagePreview('Selfie avec CIN', user.photocompletSelfie)}
              />
            </div>
          </CardContent>
        </Card>

        {/* État de Vérification */}
        <Card className="lg:col-span-3 bg-gray-800 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <CheckCircle className="w-5 h-5 text-purple-400" />
              État de Vérification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <VerificationStep
                step={1}
                title="Vérification Email"
                completed={user.emailVerified}
              />
              <VerificationStep
                step={2}
                title="Soumission KYC"
                completed={user.kycSubmitted}
              />
              <VerificationStep
                step={3}
                title="Validation KYC"
                completed={user.kycValidated}
              />
              <VerificationStep
                step={4}
                title="Reconnaissance Faciale"
                completed={user.faceRecognition}
              />
            </div>
            
            <div className="mt-6 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Statut Global:</span>
                <Badge className={user.fullyVerified ? "bg-green-500/20 text-green-400 border-green-400" : "bg-purple-500/20 text-purple-400 border-purple-400"}>
                  {user.fullyVerified ? "COMPLÈTEMENT VÉRIFIÉ" : "EN COURS DE VÉRIFICATION"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Composants supplémentaires...
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = 
  ({ title, value, icon, color }) => {
  const colorClasses = {
    purple: 'bg-gradient-to-r from-purple-600 to-purple-800 text-white',
    green: 'bg-gradient-to-r from-green-600 to-green-800 text-white',
    red: 'bg-gradient-to-r from-red-600 to-red-800 text-white'
  };

  return (
    <Card className="bg-gray-800 border-purple-500/20 hover:border-purple-500 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const InfoField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <label className="text-sm font-medium text-gray-400">{label}</label>
    <p className="text-white">{value}</p>
  </div>
);

const DocumentCard: React.FC<{ 
  title: string; 
  hasDocument: boolean; 
  onPreview: () => void;
}> = ({ title, hasDocument, onPreview }) => (
  <Card className={`${hasDocument ? "border-green-400" : "border-purple-500/20"} bg-gray-700`}>
    <CardContent className="p-4 text-center">
      <FileText className={`w-8 h-8 mx-auto mb-2 ${hasDocument ? 'text-green-400' : 'text-purple-400'}`} />
      <p className="font-medium text-sm mb-2 text-white">{title}</p>
      {hasDocument ? (
        <Button onClick={onPreview} className="w-full bg-purple-600 hover:bg-purple-700 text-white">
          <Eye className="w-4 h-4 mr-2" />
          Voir le document
        </Button>
      ) : (
        <Badge className="bg-purple-500/20 text-purple-400 border-purple-400">
          Non soumis
        </Badge>
      )}
    </CardContent>
  </Card>
);

const VerificationStep: React.FC<{ step: number; title: string; completed: boolean }> = 
  ({ step, title, completed }) => (
  <div className="flex items-center gap-3 p-3 border border-purple-500/20 rounded-lg bg-gray-700">
    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
      completed ? 'bg-green-500/20 text-green-400 border border-green-400' : 'bg-purple-500/20 text-purple-400 border border-purple-400'
    }`}>
      {completed ? <CheckCircle className="w-5 h-5" /> : step}
    </div>
    <div>
      <p className="font-medium text-sm text-white">{title}</p>
      <p className="text-xs text-gray-400">{completed ? 'Complétée' : 'En attente'}</p>
    </div>
  </div>
);

const ImagePreviewModal: React.FC<{ 
  imageData: { type: string; data: number[] }; 
  onClose: () => void;
}> = ({ imageData, onClose }) => {
  const base64String = btoa(
    new Uint8Array(imageData.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-4xl max-h-full overflow-auto border border-purple-500/20">
        <div className="flex items-center justify-between p-4 border-b border-purple-500/20">
          <h3 className="text-lg font-semibold text-white">{imageData.type}</h3>
          <Button onClick={onClose} variant="ghost" size="sm" className="hover:bg-purple-500/10 text-white">
            <XCircle className="w-5 h-5 text-purple-400" />
          </Button>
        </div>
        <div className="p-4">
          <img 
            src={`data:image/jpeg;base64,${base64String}`}
            alt={imageData.type}
            className="max-w-full h-auto rounded"
          />
        </div>
      </div>
    </div>
  );
};

const UsersLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-900 p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-12 w-1/3 bg-gray-800 rounded-2xl" />
        <Skeleton className="h-10 w-24 bg-gray-800 rounded-xl" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl bg-gray-800" />
        ))}
      </div>
      
      <Skeleton className="h-96 rounded-xl bg-gray-800" />
    </div>
  </div>
);

const ErrorAlert: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center min-h-96 space-y-4 bg-gray-800 rounded-2xl border border-purple-500/20 p-8">
    <AlertCircle className="w-16 h-16 text-purple-400" />
    <h2 className="text-xl font-semibold text-white">Erreur de chargement</h2>
    <p className="text-gray-400 text-center max-w-md">{error}</p>
    <Button onClick={onRetry} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white">
      <RefreshCw className="w-4 h-4" />
      Réessayer
    </Button>
  </div>
);

export default AdminVerifyUser;