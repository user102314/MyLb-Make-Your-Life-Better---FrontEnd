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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900/20 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="bg-gray-800/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-purple-500/20 backdrop-blur-sm border border-purple-500/30">
                <BarChart3 className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Tableau de Bord Admin
                </h1>
                <p className="text-purple-300">
                  Statistiques et gestion des utilisateurs et entreprises
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Select value={timeRange} onValueChange={(value: 'today' | 'week' | 'month' | 'all') => setTimeRange(value)}>
              <SelectTrigger className="bg-gray-800/80 backdrop-blur-sm border-purple-500/30 w-[140px] text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30">
                <SelectItem value="today" className="text-white hover:bg-purple-500/20">Aujourd'hui</SelectItem>
                <SelectItem value="week" className="text-white hover:bg-purple-500/20">Cette semaine</SelectItem>
                <SelectItem value="month" className="text-white hover:bg-purple-500/20">Ce mois</SelectItem>
                <SelectItem value="all" className="text-white hover:bg-purple-500/20">Tout le temps</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400 text-white transition-all duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="bg-red-900/50 backdrop-blur-sm border-red-700/50 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-300">{error}</AlertDescription>
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
              color="purple"
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
              color="purple"
            />
          </div>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-gray-800/80 backdrop-blur-sm border border-purple-500/30 p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:border-purple-500 data-[state=active]:text-purple-400 text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:border-purple-500 data-[state=active]:text-purple-400 text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Utilisateurs ({userStats.length})
            </TabsTrigger>
            <TabsTrigger 
              value="companies" 
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:border-purple-500 data-[state=active]:text-purple-400 text-white"
            >
              <Building className="w-4 h-4 mr-2" />
              Entreprises ({companyStats.length})
            </TabsTrigger>
          </TabsList>

          {/* Vue d'ensemble */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Statistiques de Vérification */}
              <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30">
                <CardHeader className="border-b border-purple-500/30">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <UserCheck className="w-5 h-5 text-purple-400" />
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
                        color="purple"
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
                        color="purple"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Dernières Activités */}
              <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30">
                <CardHeader className="border-b border-purple-500/30">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
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
            <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30">
              <CardHeader className="border-b border-purple-500/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Users className="w-5 h-5 text-purple-400" />
                      Gestion des Utilisateurs ({userStats.length})
                    </CardTitle>
                    <CardDescription className="text-purple-300">
                      Liste complète des utilisateurs et leur statut de vérification
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => exportData('users')}
                    variant="outline"
                    className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400 text-white"
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
                    <div className="text-center py-12 text-purple-300 bg-gray-800/50 backdrop-blur-sm rounded-2xl">
                      <Users className="w-16 h-16 mx-auto mb-4 text-purple-400" />
                      <p className="text-lg">Aucun utilisateur trouvé</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vue Entreprises */}
          <TabsContent value="companies">
            <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30">
              <CardHeader className="border-b border-purple-500/30">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Building className="w-5 h-5 text-purple-400" />
                      Gestion des Entreprises ({companyStats.length})
                    </CardTitle>
                    <CardDescription className="text-purple-300">
                      Liste des entreprises créées par les utilisateurs
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => exportData('companies')}
                    variant="outline"
                    className="flex items-center gap-2 bg-gray-800/80 backdrop-blur-sm border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400 text-white"
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
                    <div className="text-center py-12 text-purple-300 bg-gray-800/50 backdrop-blur-sm rounded-2xl">
                      <Building className="w-16 h-16 mx-auto mb-4 text-purple-400" />
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

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  change: number;
  icon: React.ReactNode; 
  color: string;
}> = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    green: 'bg-green-500/20 text-green-400 border-green-500/30',
  };

  return (
    <Card className={`bg-gray-800/90 backdrop-blur-xl border ${colorClasses[color]} hover:scale-105 transition-all duration-200 shadow-lg`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-300">{title}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {change !== 0 && (
              <div className={`flex items-center gap-1 mt-1 text-sm ${
                change > 0 ? 'text-green-400' : 'text-red-400'
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
    purple: 'bg-purple-500',
    green: 'bg-green-500',
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-white">{title}</span>
        <span className="text-sm text-purple-300">{completed}/{total}</span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${colorClasses[color]} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <div className="flex justify-between text-xs text-purple-300">
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
    user: <Users className="w-4 h-4 text-purple-400" />,
    company: <Building className="w-4 h-4 text-purple-400" />,
    verification: <CheckCircle className="w-4 h-4 text-green-400" />
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-700/50 backdrop-blur-sm border border-purple-500/20">
      <div className="p-2 rounded-lg bg-purple-500/10">
        {icons[type]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-white">{action}</p>
        <p className="text-sm text-purple-300">{name}</p>
      </div>
      <span className="text-xs text-purple-400">{time}</span>
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
    up: <TrendingUp className="w-4 h-4 text-green-400" />,
    down: <TrendingUp className="w-4 h-4 text-red-400 rotate-180" />,
    stable: <div className="w-4 h-4 bg-purple-400 rounded-full" />
  };

  return (
    <Card className="bg-gray-800/90 backdrop-blur-sm border-purple-500/30 hover:scale-105 transition-all duration-200">
      <CardContent className="p-4 text-center">
        <div className="flex justify-center mb-2">
          {trendIcons[trend]}
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-purple-300 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
};

const UserStatsCard: React.FC<{ user: UserStats }> = ({ user }) => {
  const completedSteps = Object.values(user.verificationStatus).filter(Boolean).length;
  
  return (
    <Card className="bg-gray-800/90 backdrop-blur-sm border-purple-500/30 hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">
                {user.firstName} {user.lastName}
              </h3>
              {user.isFullyVerified ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Vérifié
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                  En Attente
                </Badge>
              )}
              <Badge variant="outline" className={user.isVerified ? "bg-purple-500/20 text-purple-400 border-purple-500/30" : "bg-red-500/10 text-red-400 border-red-500/30"}>
                {user.isVerified ? "Email Vérifié" : "Email Non Vérifié"}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-purple-400" />
                <span>{user.companiesCount} entreprise(s)</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                <span>Étapes: {completedSteps}/4</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800/80 backdrop-blur-sm border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400 text-white"
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
    <Card className="bg-gray-800/90 backdrop-blur-sm border-purple-500/30 hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white">
                {company.companyName}
              </h3>
              <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30">
                {company.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-300">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-400" />
                <span>Propriétaire: {company.ownerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-purple-400" />
                <span>{company.ownerEmail}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-800/80 backdrop-blur-sm border-purple-500/30 hover:bg-purple-500/20 hover:border-purple-400 text-white"
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
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900/20 p-6">
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-12 w-1/3 bg-gray-800/90 rounded-2xl" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32 bg-gray-800/90 rounded-xl" />
          <Skeleton className="h-10 w-24 bg-gray-800/90 rounded-xl" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl bg-gray-800/90" />
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-80 rounded-2xl bg-gray-800/90" />
        <Skeleton className="h-80 rounded-2xl bg-gray-800/90" />
      </div>
    </div>
  </div>
);

export default AdminDashboard;