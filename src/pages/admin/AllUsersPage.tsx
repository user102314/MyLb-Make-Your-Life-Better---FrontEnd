import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Download,
  RefreshCw,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  UserCheck,
  FileText,
  MoreHorizontal,
  Building,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface User {
  clientId: number;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  isFullyVerified: boolean;
  hasIdentityDocuments: boolean;
  companiesCount: number;
  verificationStatus: {
    emailVerified: boolean;
    kycSubmitted: boolean;
    kycValidated: boolean;
    faceRecognition: boolean;
  };
  createdAt?: string;
  role?: string;
  phoneNumber?: string;
}

const AllUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const BASE_URL = "http://localhost:9090";

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, verificationFilter, roleFilter]);

  const fetchUsers = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch(`${BASE_URL}/api/admin/statistics/users/verification-stats`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        throw new Error(data.error || 'Erreur lors de la récupération des utilisateurs');
      }

    } catch (err) {
      console.error('💥 Erreur users:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion au serveur';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par vérification
    if (verificationFilter !== 'all') {
      switch (verificationFilter) {
        case 'fully-verified':
          filtered = filtered.filter(user => user.isFullyVerified);
          break;
        case 'email-verified':
          filtered = filtered.filter(user => user.isVerified);
          break;
        case 'documents-submitted':
          filtered = filtered.filter(user => user.hasIdentityDocuments);
          break;
        case 'pending':
          filtered = filtered.filter(user => !user.isFullyVerified && user.hasIdentityDocuments);
          break;
        case 'not-started':
          filtered = filtered.filter(user => !user.hasIdentityDocuments);
          break;
      }
    }

    // Filtre par rôle
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const exportUsers = () => {
    const data = filteredUsers;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utilisateurs-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getVerificationBadge = (user: User) => {
    if (user.isFullyVerified) {
      return <Badge className="bg-green-500/20 text-green-700 border-green-200/50">
        <CheckCircle className="w-3 h-3 mr-1" />
        Complètement Vérifié
      </Badge>;
    } else if (user.hasIdentityDocuments) {
      return <Badge className="bg-yellow-500/20 text-yellow-700 border-yellow-200/50">
        <FileText className="w-3 h-3 mr-1" />
        En Attente
      </Badge>;
    } else {
      return <Badge variant="outline" className="text-gray-500">
        <XCircle className="w-3 h-3 mr-1" />
        Non Soumis
      </Badge>;
    }
  };

  const getVerificationSteps = (user: User) => {
    const steps = [
      { name: 'Email', completed: user.verificationStatus.emailVerified },
      { name: 'KYC Soumis', completed: user.verificationStatus.kycSubmitted },
      { name: 'KYC Validé', completed: user.verificationStatus.kycValidated },
      { name: 'Reconnaissance', completed: user.verificationStatus.faceRecognition },
    ];
    return steps;
  };

  const getRoleBadge = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return <Badge className="bg-purple-500/20 text-purple-700 border-purple-200/50">Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-blue-500/20 text-blue-700 border-blue-200/50">Modérateur</Badge>;
      default:
        return <Badge variant="outline">Utilisateur</Badge>;
    }
  };

  if (loading) {
    return <UsersLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Tous les Utilisateurs
              </h1>
            </div>
            <p className="text-gray-600">
              Gestion et consultation de tous les utilisateurs enregistrés
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filtres et Contrôles */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                <div className="flex-1 relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                  <SelectTrigger className="w-[200px]">
                    <UserCheck className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Statut vérification" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="fully-verified">Complètement vérifiés</SelectItem>
                    <SelectItem value="email-verified">Email vérifié</SelectItem>
                    <SelectItem value="documents-submitted">Documents soumis</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="not-started">Non commencé</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[150px]">
                    <Shield className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les rôles</SelectItem>
                    <SelectItem value="USER">Utilisateur</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="MODERATOR">Modérateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="flex items-center gap-2"
                  >
                    <div className="grid grid-cols-2 gap-1 w-4 h-4">
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                      <div className="bg-current rounded-sm"></div>
                    </div>
                    Grille
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="flex items-center gap-2"
                  >
                    <div className="flex flex-col gap-0.5 w-4 h-4">
                      <div className="bg-current rounded-sm h-1"></div>
                      <div className="bg-current rounded-sm h-1"></div>
                      <div className="bg-current rounded-sm h-1"></div>
                    </div>
                    Tableau
                  </Button>
                </div>

                <Button
                  onClick={exportUsers}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Exporter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Utilisateurs"
            value={users.length.toString()}
            icon={<Users className="w-6 h-6" />}
            color="blue"
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
            color="yellow"
          />
          <StatCard
            title="Non Soumis"
            value={users.filter(u => !u.hasIdentityDocuments).length.toString()}
            icon={<XCircle className="w-6 h-6" />}
            color="red"
          />
        </div>

        {/* Contenu */}
        {viewMode === 'grid' ? (
          <GridView 
            users={filteredUsers} 
            getVerificationBadge={getVerificationBadge}
            getVerificationSteps={getVerificationSteps}
            getRoleBadge={getRoleBadge}
          />
        ) : (
          <TableView 
            users={filteredUsers} 
            getVerificationBadge={getVerificationBadge}
            getRoleBadge={getRoleBadge}
          />
        )}

        {filteredUsers.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun utilisateur trouvé</h3>
            <p className="text-gray-600">
              {searchTerm || verificationFilter !== 'all' || roleFilter !== 'all'
                ? "Aucun utilisateur ne correspond à vos critères de recherche." 
                : "Aucun utilisateur n'est enregistré pour le moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant Vue Grille
const GridView: React.FC<{ 
  users: User[]; 
  getVerificationBadge: (user: User) => React.ReactNode;
  getVerificationSteps: (user: User) => any[];
  getRoleBadge: (role?: string) => React.ReactNode;
}> = ({ users, getVerificationBadge, getVerificationSteps, getRoleBadge }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {users.map((user) => {
      const steps = getVerificationSteps(user);
      const completedSteps = steps.filter(step => step.completed).length;
      
      return (
        <Card key={user.clientId} className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  {user.firstName} {user.lastName}
                </CardTitle>
                <CardDescription className="mt-1">
                  ID: {user.clientId}
                </CardDescription>
              </div>
              <div className="flex flex-col gap-2 items-end">
                {getVerificationBadge(user)}
                {getRoleBadge(user.role)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{user.email}</span>
            </div>
            
            {user.phoneNumber && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">{user.phoneNumber}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Building className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">{user.companiesCount} entreprise(s)</span>
            </div>

            {user.createdAt && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">
                  Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            )}

            {/* Barre de progression de vérification */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Vérification: {completedSteps}/4 étapes</span>
                <span>{Math.round((completedSteps / 4) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${(completedSteps / 4) * 100}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-4 gap-1 text-xs">
                {steps.map((step, index) => (
                  <div key={index} className={`text-center ${step.completed ? 'text-green-600' : 'text-gray-400'}`}>
                    {step.completed ? '✓' : '○'}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between pt-2">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Voir détails
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Modifier</DropdownMenuItem>
                  <DropdownMenuItem>Changer rôle</DropdownMenuItem>
                  <DropdownMenuItem>Vérifier manuellement</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">Désactiver</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
      );
    })}
  </div>
);

// Composant Vue Tableau
const TableView: React.FC<{ 
  users: User[]; 
  getVerificationBadge: (user: User) => React.ReactNode;
  getRoleBadge: (role?: string) => React.ReactNode;
}> = ({ users, getVerificationBadge, getRoleBadge }) => (
  <Card>
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Utilisateur</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Vérification</TableHead>
            <TableHead>Entreprises</TableHead>
            <TableHead>Date inscription</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => {
            const completedSteps = Object.values(user.verificationStatus).filter(Boolean).length;
            
            return (
              <TableRow key={user.clientId}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">ID: {user.clientId}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-gray-600">{user.email}</TableCell>
                <TableCell>{getRoleBadge(user.role)}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    {getVerificationBadge(user)}
                    <div className="text-xs text-gray-500">
                      {completedSteps}/4 étapes
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span>{user.companiesCount}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {user.createdAt ? (
                    new Date(user.createdAt).toLocaleDateString('fr-FR')
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Détails
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Modifier</DropdownMenuItem>
                        <DropdownMenuItem>Changer rôle</DropdownMenuItem>
                        <DropdownMenuItem>Vérifier manuellement</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">Désactiver</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

// Composant Carte de Statistique
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = 
  ({ title, value, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Composant Skeleton de chargement
const UsersLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-12 w-1/3" />
        <Skeleton className="h-10 w-24" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export default AllUsersPage;