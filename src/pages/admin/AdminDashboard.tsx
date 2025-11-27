import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Building, 
  CheckCircle, 
  XCircle, 
  FileText,
  TrendingUp,
  Shield,
  Mail,
  UserCheck,
  AlertCircle,
  RefreshCw,
  Download,
  Eye,
  BarChart3,
  PieChart,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DashboardStats {
  totalUsers: number;
  totalCompanies: number;
  verifiedUsers: number;
  pendingVerification: number;
  fullyVerifiedUsers: number;
  userGrowth: number;
  companyGrowth: number;
  verificationStats: {
    emailVerified: number;
    kycSubmitted: number;
    kycValidated: number;
    faceRecognition: number;
  };
}

interface UserStats {
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
}

interface CompanyStats {
  companyId: number;
  companyName: string;
  ownerName: string;
  ownerEmail: string;
  ownerId: number;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('month');

  const BASE_URL = "http://localhost:9090";

  useEffect(() => {
    fetchDashboardData();
  }, [timeRange]);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      setLoading(true);
      
      // Fetch all data in parallel
      const [statsResponse, usersResponse, companiesResponse] = await Promise.all([
        fetch(`${BASE_URL}/api/admin/dashboard/stats?range=${timeRange}`, {
          credentials: 'include'
        }),
        fetch(`${BASE_URL}/api/admin/statistics/users/verification-stats`, {
          credentials: 'include'
        }),
        fetch(`${BASE_URL}/api/admin/companies/stats`, {
          credentials: 'include'
        })
      ]);

      if (!statsResponse.ok) throw new Error(`Erreur stats: ${statsResponse.status}`);
      if (!usersResponse.ok) throw new Error(`Erreur users: ${usersResponse.status}`);
      if (!companiesResponse.ok) throw new Error(`Erreur companies: ${companiesResponse.status}`);

      const [statsData, usersData, companiesData] = await Promise.all([
        statsResponse.json(),
        usersResponse.json(),
        companiesResponse.json()
      ]);

      if (statsData.success) setStats(statsData.stats);
      else throw new Error(statsData.error || 'Erreur dans les données stats');
      
      if (usersData.success) setUserStats(usersData.users);
      else throw new Error(usersData.error || 'Erreur dans les données utilisateurs');
      
      if (companiesData.success) setCompanyStats(companiesData.companies);
      else throw new Error(companiesData.error || 'Erreur dans les données entreprises');

    } catch (err) {
      console.error('💥 Erreur dashboard:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion au serveur';
      setError(errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const exportData = (type: 'users' | 'companies') => {
    const data = type === 'users' ? userStats : companyStats;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <DashboardLoadingSkeleton />;
  }

  return (
    <div className="min-h-screen admin-gradient p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="glass-card p-6 rounded-2xl backdrop-blur-xl border border-white/20 shadow-primary/20">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-purple-500/20 backdrop-blur-sm">
                <BarChart3 className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Tableau de Bord Admin
                </h1>
                <p className="text-gray-600">
                  Statistiques et gestion des utilisateurs et entreprises
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={(value: 'today' | 'week' | 'month' | 'all') => setTimeRange(value)}>
              <SelectTrigger className="glass-input border-white/30 w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-white/20 backdrop-blur-xl">
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
                <SelectItem value="all">Tout le temps</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="glass"
              className="flex items-center gap-2 neumorph-outset hover:shadow-lg transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="glass-card border-red-200/50 backdrop-blur-sm mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistiques Principales */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Utilisateurs Totaux"
              value={stats.totalUsers.toString()}
              change={stats.userGrowth}
              icon={<Users className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Entreprises"
              value={stats.totalCompanies.toString()}
              change={stats.companyGrowth}
              icon={<Building className="w-6 h-6" />}
              color="purple"
            />
            <StatCard
              title="Complètement Vérifiés"
              value={stats.fullyVerifiedUsers.toString()}
              change={0}
              icon={<CheckCircle className="w-6 h-6" />}
              color="green"
            />
            <StatCard
              title="En Attente"
              value={stats.pendingVerification.toString()}
              change={0}
              icon={<FileText className="w-6 h-6" />}
              color="yellow"
            />
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass-card backdrop-blur-sm border border-white/20 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:glass-card data-[state=active]:border-white/30">
              <BarChart3 className="w-4 h-4 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:glass-card data-[state=active]:border-white/30">
              <Users className="w-4 h-4 mr-2" />
              Utilisateurs ({userStats.length})
            </TabsTrigger>
            <TabsTrigger value="companies" className="data-[state=active]:glass-card data-[state=active]:border-white/30">
              <Building className="w-4 h-4 mr-2" />
              Entreprises ({companyStats.length})
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Statistiques de Vérification */}
              <Card className="glass-card border-white/20 backdrop-blur-xl">
                <CardHeader className="glass-header border-b border-white/20">
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-600" />
                    Progression de Vérification
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {stats && (
                    <div className="space-y-4">
                      <VerificationProgress
                        title="Email Vérifié"
                        completed={stats.verificationStats.emailVerified}
                        total={stats.totalUsers}
                        color="blue"
                      />
                      <VerificationProgress
                        title="KYC Soumis"
                        completed={stats.verificationStats.kycSubmitted}
                        total={stats.totalUsers}
                        color="purple"
                      />
                      <VerificationProgress
                        title="KYC Validé"
                        completed={stats.verificationStats.kycValidated}
                        total={stats.totalUsers}
                        color="green"
                      />
                      <VerificationProgress
                        title="Reconnaissance Faciale"
                        completed={stats.verificationStats.faceRecognition}
                        total={stats.totalUsers}
                        color="orange"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dernières Activités */}
              <Card className="glass-card border-white/20 backdrop-blur-xl">
                <CardHeader className="glass-header border-b border-white/20">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Activité Récente
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {userStats.slice(0, 5).map((user, index) => (
                      <ActivityItem
                        key={user.clientId}
                        type="user"
                        action="Nouvel utilisateur inscrit"
                        name={`${user.firstName} ${user.lastName}`}
                        time={user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'Date inconnue'}
                      />
                    ))}
                    {companyStats.slice(0, 3).map((company, index) => (
                      <ActivityItem
                        key={company.companyId}
                        type="company"
                        action="Nouvelle entreprise créée"
                        name={company.companyName}
                        time="Récemment"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Statistiques Rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <QuickStat
                title="Taux de Vérification"
                value={`${stats ? Math.round((stats.fullyVerifiedUsers / stats.totalUsers) * 100) : 0}%`}
                description="Utilisateurs complètement vérifiés"
                trend="up"
              />
              <QuickStat
                title="Entreprises/Utilisateur"
                value={(stats && stats.totalUsers > 0 ? (stats.totalCompanies / stats.totalUsers).toFixed(1) : '0')}
                description="Moyenne par utilisateur"
                trend="stable"
              />
              <QuickStat
                title="Taux de Croissance"
                value={`${stats ? Math.max(stats.userGrowth, stats.companyGrowth) : 0}%`}
                description="Croissance mensuelle"
                trend="up"
              />
            </div>
          </TabsContent>

          {/* Vue Utilisateurs */}
          <TabsContent value="users">
            <Card className="glass-card border-white/20 backdrop-blur-xl">
              <CardHeader className="glass-header border-b border-white/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      Gestion des Utilisateurs ({userStats.length})
                    </CardTitle>
                    <CardDescription>
                      Liste complète des utilisateurs et leur statut de vérification
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => exportData('users')}
                    variant="glass"
                    className="flex items-center gap-2 neumorph-outset hover:shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Exporter
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {userStats.map((user) => (
                    <UserStatsCard key={user.clientId} user={user} />
                  ))}
                  
                  {userStats.length === 0 && (
                    <div className="text-center py-12 text-gray-500 glass-card rounded-2xl backdrop-blur-sm">
                      <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">Aucun utilisateur trouvé</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vue Entreprises */}
          <TabsContent value="companies">
            <Card className="glass-card border-white/20 backdrop-blur-xl">
              <CardHeader className="glass-header border-b border-white/20">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5 text-purple-600" />
                      Gestion des Entreprises ({companyStats.length})
                    </CardTitle>
                    <CardDescription>
                      Liste des entreprises créées par les utilisateurs
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => exportData('companies')}
                    variant="glass"
                    className="flex items-center gap-2 neumorph-outset hover:shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Exporter
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {companyStats.map((company) => (
                    <CompanyStatsCard key={company.companyId} company={company} />
                  ))}
                  
                  {companyStats.length === 0 && (
                    <div className="text-center py-12 text-gray-500 glass-card rounded-2xl backdrop-blur-sm">
                      <Building className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg">Aucune entreprise trouvée</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Composants supplémentaires...

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  change: number;
  icon: React.ReactNode; 
  color: string;
}> = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/20 text-blue-600 border-blue-200/50',
    purple: 'bg-purple-500/20 text-purple-600 border-purple-200/50',
    green: 'bg-green-500/20 text-green-600 border-green-200/50',
    yellow: 'bg-yellow-500/20 text-yellow-600 border-yellow-200/50',
    orange: 'bg-orange-500/20 text-orange-600 border-orange-200/50'
  };

  return (
    <Card className={`glass-card backdrop-blur-xl border ${colorClasses[color]} hover:scale-105 transition-all duration-200`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {change !== 0 && (
              <div className={`flex items-center gap-1 mt-1 text-sm ${
                change > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                <TrendingUp className={`w-3 h-3 ${change < 0 ? 'rotate-180' : ''}`} />
                <span>{Math.abs(change)}%</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl backdrop-blur-sm ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const VerificationProgress: React.FC<{
  title: string;
  completed: number;
  total: number;
  color: string;
}> = ({ title, completed, total, color }) => {
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const colorClasses = {
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500'
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{title}</span>
        <span className="text-sm text-gray-500">{completed}/{total}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${colorClasses[color]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>Progression</span>
        <span>{Math.round(percentage)}%</span>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{
  type: 'user' | 'company' | 'verification';
  action: string;
  name: string;
  time: string;
}> = ({ type, action, name, time }) => {
  const icons = {
    user: <Users className="w-4 h-4 text-blue-500" />,
    company: <Building className="w-4 h-4 text-purple-500" />,
    verification: <CheckCircle className="w-4 h-4 text-green-500" />
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-white/50 backdrop-blur-sm border border-white/30">
      <div className="p-2 rounded-lg bg-gray-100">
        {icons[type]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{action}</p>
        <p className="text-sm text-gray-500">{name}</p>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  );
};

const QuickStat: React.FC<{
  title: string;
  value: string;
  description: string;
  trend: 'up' | 'down' | 'stable';
}> = ({ title, value, description, trend }) => {
  const trendIcons = {
    up: <TrendingUp className="w-4 h-4 text-green-500" />,
    down: <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />,
    stable: <div className="w-4 h-4 bg-gray-300 rounded-full" />
  };

  return (
    <Card className="glass-card border-white/20 backdrop-blur-sm hover:scale-105 transition-all duration-200">
      <CardContent className="p-4 text-center">
        <div className="flex justify-center mb-2">
          {trendIcons[trend]}
        </div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-700">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

const UserStatsCard: React.FC<{ user: UserStats }> = ({ user }) => {
  const completedSteps = Object.values(user.verificationStatus).filter(Boolean).length;
  
  return (
    <Card className="glass-card border-white/20 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </h3>
              {user.isFullyVerified ? (
                <Badge className="glass-card bg-green-500/20 text-green-700 border-green-200/50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Vérifié
                </Badge>
              ) : (
                <Badge variant="outline" className="neumorph-inset text-yellow-600">
                  En Attente
                </Badge>
              )}
              <Badge variant={user.isVerified ? "glass" : "outline"} 
                     className={user.isVerified ? "bg-blue-500/20 text-blue-700 border-blue-200/50" : "neumorph-inset"}>
                {user.isVerified ? "Email Vérifié" : "Email Non Vérifié"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-500" />
                <span>{user.companiesCount} entreprise(s)</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-500" />
                <span>Étapes: {completedSteps}/4</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="glass"
              size="sm"
              className="neumorph-outset hover:shadow-lg"
            >
              <Eye className="w-4 h-4" />
              Détails
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CompanyStatsCard: React.FC<{ company: CompanyStats }> = ({ company }) => {
  return (
    <Card className="glass-card border-white/20 backdrop-blur-sm hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-gray-900">
                {company.companyName}
              </h3>
              <Badge variant="outline" className="neumorph-inset text-blue-600">
                {company.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-500" />
                <span>Propriétaire: {company.ownerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{company.ownerEmail}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="glass"
              size="sm"
              className="neumorph-outset hover:shadow-lg"
            >
              <Eye className="w-4 h-4" />
              Voir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const DashboardLoadingSkeleton: React.FC = () => (
  <div className="min-h-screen admin-gradient p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-12 w-1/3 glass-card rounded-2xl" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 glass-card rounded-xl" />
          <Skeleton className="h-10 w-24 glass-card rounded-xl" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl glass-card" />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-2xl glass-card" />
        <Skeleton className="h-80 rounded-2xl glass-card" />
      </div>
    </div>
  </div>
);

export default AdminDashboard;