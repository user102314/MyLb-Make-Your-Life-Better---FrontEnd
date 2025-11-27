import React, { useState, useEffect } from 'react';
import { 
  Building, 
  Search, 
  Filter, 
  Eye, 
  Download,
  RefreshCw,
  User,
  Mail,
  Calendar,
  MapPin,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Clock
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

interface Company {
  companyId: number;
  companyName: string;
  ownerName: string;
  ownerEmail: string;
  ownerId: number;
  status: string;
  createdAt?: string;
  address?: string;
  phone?: string;
}

const AllCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const BASE_URL = "http://localhost:9090";

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    filterCompanies();
  }, [companies, searchTerm, statusFilter]);

  const fetchCompanies = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await fetch(`${BASE_URL}/api/admin/companies/stats`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Erreur: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setCompanies(data.companies);
      } else {
        throw new Error(data.error || 'Erreur lors de la récupération des entreprises');
      }

    } catch (err) {
      console.error('💥 Erreur companies:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion au serveur';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterCompanies = () => {
    let filtered = companies;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(company => 
        company.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.address?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'all') {
      filtered = filtered.filter(company => company.status === statusFilter);
    }

    setFilteredCompanies(filtered);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCompanies();
  };

  const exportCompanies = () => {
    const data = filteredCompanies;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `entreprises-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'actif':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Actif</Badge>;
      case 'inactive':
      case 'inactif':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Inactif</Badge>;
      case 'pending':
      case 'en attente':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">En Attente</Badge>;
      case 'suspended':
      case 'suspendu':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Suspendu</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return <CompaniesLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building className="w-8 h-8 text-purple-400" />
              <h1 className="text-3xl font-bold text-white">
                Toutes les Entreprises
              </h1>
            </div>
            <p className="text-gray-400">
              Gestion et consultation de toutes les entreprises enregistrées
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2 border-purple-600 text-purple-400 hover:bg-purple-600/20"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-700">
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {/* Filtres et Contrôles */}
        <Card className="mb-6 bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full">
                <div className="flex-1 relative max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher une entreprise, propriétaire..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-purple-500"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-white">
                    <Filter className="w-4 h-4 mr-2 text-purple-400" />
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="all">Tous les statuts</SelectItem>
                    <SelectItem value="active">Actif</SelectItem>
                    <SelectItem value="inactive">Inactif</SelectItem>
                    <SelectItem value="pending">En Attente</SelectItem>
                    <SelectItem value="suspended">Suspendu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3">
                <div className="flex bg-gray-700 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className={`flex items-center gap-2 ${
                      viewMode === 'grid' 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-600'
                    }`}
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
                    className={`flex items-center gap-2 ${
                      viewMode === 'table' 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-300 hover:text-white hover:bg-gray-600'
                    }`}
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
                  onClick={exportCompanies}
                  variant="outline"
                  className="flex items-center gap-2 border-purple-600 text-purple-400 hover:bg-purple-600/20"
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
            title="Total Entreprises"
            value={companies.length.toString()}
            icon={<Building className="w-6 h-6" />}
            color="purple"
          />
          <StatCard
            title="Actives"
            value={companies.filter(c => c.status === 'active').length.toString()}
            icon={<CheckCircle className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="En Attente"
            value={companies.filter(c => c.status === 'pending').length.toString()}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Inactives"
            value={companies.filter(c => c.status === 'inactive').length.toString()}
            icon={<XCircle className="w-6 h-6" />}
            color="red"
          />
        </div>

        {/* Contenu */}
        {viewMode === 'grid' ? (
          <GridView companies={filteredCompanies} getStatusBadge={getStatusBadge} />
        ) : (
          <TableView companies={filteredCompanies} getStatusBadge={getStatusBadge} />
        )}

        {filteredCompanies.length === 0 && !loading && (
          <div className="text-center py-12">
            <Building className="w-16 h-16 mx-auto mb-4 text-purple-500/30" />
            <h3 className="text-lg font-semibold text-white mb-2">Aucune entreprise trouvée</h3>
            <p className="text-gray-400">
              {searchTerm || statusFilter !== 'all' 
                ? "Aucune entreprise ne correspond à vos critères de recherche." 
                : "Aucune entreprise n'est enregistrée pour le moment."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Composant Vue Grille
const GridView: React.FC<{ companies: Company[]; getStatusBadge: (status: string) => React.ReactNode }> = 
  ({ companies, getStatusBadge }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {companies.map((company) => (
      <Card key={company.companyId} className="bg-gray-800 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2 text-white">
                <Building className="w-5 h-5 text-purple-400" />
                {company.companyName}
              </CardTitle>
              <CardDescription className="mt-1 text-gray-400">
                ID: {company.companyId}
              </CardDescription>
            </div>
            {getStatusBadge(company.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-purple-400" />
            <span className="font-medium text-white">{company.ownerName}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Mail className="w-4 h-4 text-purple-400" />
            <span className="text-gray-400">{company.ownerEmail}</span>
          </div>
          {company.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span className="text-gray-400">{company.address}</span>
            </div>
          )}
          {company.createdAt && (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="text-gray-400">
                Créée le {new Date(company.createdAt).toLocaleDateString('fr-FR')}
              </span>
            </div>
          )}
          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" className="flex items-center gap-2 border-purple-600 text-purple-400 hover:bg-purple-600/20">
              <Eye className="w-4 h-4" />
              Voir détails
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-purple-400 hover:bg-purple-600/20">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                <DropdownMenuItem className="hover:bg-gray-700">Modifier</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-700">Changer statut</DropdownMenuItem>
                <DropdownMenuItem className="text-red-400 hover:bg-red-600/20">Supprimer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Composant Vue Tableau
const TableView: React.FC<{ companies: Company[]; getStatusBadge: (status: string) => React.ReactNode }> = 
  ({ companies, getStatusBadge }) => (
  <Card className="bg-gray-800 border-gray-700">
    <CardContent className="p-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-700/50 hover:bg-gray-700/50">
            <TableHead className="text-purple-400 font-semibold">Entreprise</TableHead>
            <TableHead className="text-purple-400 font-semibold">Propriétaire</TableHead>
            <TableHead className="text-purple-400 font-semibold">Email</TableHead>
            <TableHead className="text-purple-400 font-semibold">Statut</TableHead>
            <TableHead className="text-purple-400 font-semibold">Date création</TableHead>
            <TableHead className="text-right text-purple-400 font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => (
            <TableRow key={company.companyId} className="bg-gray-800 border-gray-700 hover:bg-gray-700/50">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Building className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <div className="font-medium text-white">{company.companyName}</div>
                    <div className="text-sm text-gray-400">ID: {company.companyId}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium text-white">{company.ownerName}</div>
                <div className="text-sm text-gray-400">ID: {company.ownerId}</div>
              </TableCell>
              <TableCell className="text-gray-400">{company.ownerEmail}</TableCell>
              <TableCell>{getStatusBadge(company.status)}</TableCell>
              <TableCell>
                {company.createdAt ? (
                  <span className="text-gray-400">
                    {new Date(company.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                ) : (
                  <span className="text-gray-500">N/A</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2 border-purple-600 text-purple-400 hover:bg-purple-600/20">
                    <Eye className="w-4 h-4" />
                    Détails
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-purple-400 hover:bg-purple-600/20">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-gray-700 text-white">
                      <DropdownMenuItem className="hover:bg-gray-700">Modifier</DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-gray-700">Changer statut</DropdownMenuItem>
                      <DropdownMenuItem className="text-red-400 hover:bg-red-600/20">Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

// Composant Carte de Statistique
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = 
  ({ title, value, icon, color }) => {
  const colorClasses = {
    purple: 'bg-purple-500/20 text-purple-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    red: 'bg-red-500/20 text-red-400'
  };

  return (
    <Card className="bg-gray-800 border-gray-700 hover:border-purple-500/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
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
const CompaniesLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-12 w-1/3 bg-gray-700" />
        <Skeleton className="h-10 w-24 bg-gray-700" />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg bg-gray-700" />
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg bg-gray-700" />
        ))}
      </div>
    </div>
  </div>
);

export default AllCompaniesPage;