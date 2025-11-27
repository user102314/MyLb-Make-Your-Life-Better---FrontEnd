import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  BarChart3, 
  Download, 
  RefreshCw, 
  AlertCircle,
  DollarSign,
  Zap,
  Clock,
  Target,
  Shield,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Brain,
  LineChart,
  CandlestickChart,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PieChart,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from 'lucide-react';

// Composants UI de base
const Button = ({ children, onClick, variant = 'default', disabled = false, className = '' }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-lg font-medium transition-all ${
      variant === 'default' ? 'bg-blue-600 text-white hover:bg-blue-700' :
      variant === 'outline' ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' :
      'bg-gray-100 text-gray-600 hover:bg-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
  >
    {children}
  </button>
);

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: any) => (
  <div className={`p-6 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: any) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }: any) => (
  <p className={`text-sm text-gray-600 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }: any) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default', className = '' }: any) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
    variant === 'default' ? 'bg-gray-100 text-gray-800' :
    variant === 'success' ? 'bg-green-100 text-green-800' :
    variant === 'warning' ? 'bg-yellow-100 text-yellow-800' :
    variant === 'error' ? 'bg-red-100 text-red-800' :
    variant === 'info' ? 'bg-blue-100 text-blue-800' :
    'bg-gray-100 text-gray-800'
  } ${className}`}>
    {children}
  </span>
);

const Input = ({ placeholder, value, onChange, className = '' }: any) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
  />
);

// Interfaces TypeScript
interface TechnicalIndicators {
  currentPrice?: number;
  priceChange5D?: number;
  priceChange30D?: number;
  movingAverages?: {
    sma20?: number;
    sma50?: number;
    ema12?: number;
    ema26?: number;
    priceVsSma20?: number;
    priceVsSma50?: number;
  };
  rsi?: {
    value?: number;
    level?: string;
    signal?: string;
  };
  macd?: {
    macdLine?: number;
    signalLine?: number;
    histogram?: number;
    signal?: string;
  };
  bollingerBands?: {
    upper?: number;
    middle?: number;
    lower?: number;
    position?: string;
    width?: number;
  };
  supportResistance?: {
    support?: number;
    resistance?: number;
    distanceToSupport?: number;
    distanceToResistance?: number;
  };
  trends?: {
    shortTerm?: string;
    mediumTerm?: string;
    longTerm?: string;
  };
  volatility?: {
    value?: number;
    level?: string;
  };
  tradingSignal?: string;
  confidence?: number;
  riskLevel?: string;
}

interface AiAnalysis {
  analysis?: string;
  modelUsed?: string;
  analysisTimestamp?: number;
  aiStatus?: string;
}

interface StockAnalysis {
  stockId: number;
  stockInfo: {
    nom_stock: string;
    symbol_stock?: string;
    id_stock?: number;
    [key: string]: any;
  };
  success: boolean;
  technicalIndicators?: TechnicalIndicators;
  aiAnalysis?: AiAnalysis;
  totalDataPoints?: number;
  analysisStatus: string;
  message?: string;
}

interface ApiResponse {
  success: boolean;
  totalStocks: number;
  analyzedStocks: number;
  stocksAnalysis: StockAnalysis[];
  message: string;
  analysisTimestamp: number;
  cached?: boolean;
  cacheAge?: number;
  responseTime?: number;
}

const CheckTechniqueByAIPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStock, setSelectedStock] = useState<StockAnalysis | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSignal, setFilterSignal] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');

  // Fonctions de formatage SÉCURISÉES
  const formatCurrency = (amount: number | undefined | null): string => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return 'N/A DT';
    }
    return new Intl.NumberFormat('fr-TN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount) + ' DT';
  };

  const formatPercentage = (value: number | undefined | null): string => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'Date non disponible';
    return new Date(timestamp).toLocaleString('fr-FR');
  };

  const formatCacheAge = (age: number | undefined) => {
    if (!age) return '';
    if (age < 1000) return 'À l\'instant';
    if (age < 60000) return `Il y a ${Math.floor(age / 1000)} secondes`;
    return `Il y a ${Math.floor(age / 60000)} minutes`;
  };

  // Fonctions de style
  const getSignalColor = (signal: string | undefined) => {
    switch (signal) {
      case 'ACHAT FORT': return 'bg-green-500 text-white';
      case 'ACHAT FAIBLE': return 'bg-green-100 text-green-800';
      case 'VENTE FORTE': return 'bg-red-500 text-white';
      case 'VENTE FAIBLE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSignalVariant = (signal: string | undefined) => {
    switch (signal) {
      case 'ACHAT FORT': return 'success';
      case 'ACHAT FAIBLE': return 'success';
      case 'VENTE FORTE': return 'error';
      case 'VENTE FAIBLE': return 'error';
      default: return 'default';
    }
  };

  const getSignalIcon = (signal: string | undefined) => {
    switch (signal) {
      case 'ACHAT FORT':
      case 'ACHAT FAIBLE':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'VENTE FORTE':
      case 'VENTE FAIBLE':
        return <ArrowDownRight className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getRiskColor = (risk: string | undefined) => {
    switch (risk) {
      case 'ÉLEVÉ': return 'bg-red-100 text-red-800';
      case 'MOYEN': return 'bg-yellow-100 text-yellow-800';
      case 'FAIBLE': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (confidence: number | undefined) => {
    const stars = Math.round((confidence || 0) / 20);
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < stars ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const BASE_URL = "http://localhost:9090/api/ai-analysis";

  const fetchAllStocksAnalysis = async () => {
    try {
      setError(null);
      setLoading(true);
      
      console.log('🔄 Fetching all stocks analysis from:', `${BASE_URL}/all-stocks`);
      
      const response = await fetch(`${BASE_URL}/all-stocks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      console.log('✅ All stocks data received:', result);
      
      setData(result);
      
      // Sélectionner le premier stock réussi par défaut
      if (result.stocksAnalysis && result.stocksAnalysis.length > 0) {
        const successfulStock = result.stocksAnalysis.find(stock => stock.success) || result.stocksAnalysis[0];
        setSelectedStock(successfulStock);
      }
      
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err instanceof Error ? err.message : 'Erreur de connexion au serveur');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStockAnalysis = async (stockId: number) => {
    try {
      console.log(`🔍 Fetching analysis for stock ${stockId}`);
      
      const response = await fetch(`${BASE_URL}/stock/${stockId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.stockAnalysis) {
        setSelectedStock(result.stockAnalysis);
      }
      
    } catch (err) {
      console.error('❌ Error fetching stock:', err);
    }
  };

  useEffect(() => {
    console.log('🎯 Component mounted - fetching all stocks analysis');
    fetchAllStocksAnalysis();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAllStocksAnalysis();
  };

  const handleStockSelect = (stock: StockAnalysis) => {
    setSelectedStock(stock);
    // Si l'analyse a échoué, on peut essayer de recharger les données
    if (!stock.success) {
      fetchStockAnalysis(stock.stockId);
    }
  };

  const handleExport = () => {
    if (!data) return;
    
    const exportData = {
      ...data,
      exportTimestamp: new Date().toISOString(),
      selectedStock: selectedStock
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analyse-technique-${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtrage et tri des stocks
  const filteredStocks = data?.stocksAnalysis.filter(stock => {
    const matchesSearch = stock.stockInfo.nom_stock.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         stock.stockInfo.symbol_stock?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterSignal === 'ALL' || 
      (stock.success && stock.technicalIndicators?.tradingSignal === filterSignal);
    
    return matchesSearch && matchesFilter;
  }) || [];

  const sortedStocks = [...filteredStocks].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.stockInfo.nom_stock.localeCompare(b.stockInfo.nom_stock);
      case 'signal':
        if (!a.success || !b.success) return 0;
        return (a.technicalIndicators?.tradingSignal || '').localeCompare(b.technicalIndicators?.tradingSignal || '');
      case 'price':
        if (!a.success || !b.success) return 0;
        return (b.technicalIndicators?.currentPrice || 0) - (a.technicalIndicators?.currentPrice || 0);
      case 'confidence':
        if (!a.success || !b.success) return 0;
        return (b.technicalIndicators?.confidence || 0) - (a.technicalIndicators?.confidence || 0);
      default:
        return 0;
    }
  });

  // Statistiques
  const stats = {
    total: data?.totalStocks || 0,
    analyzed: data?.analyzedStocks || 0,
    success: data?.stocksAnalysis.filter(s => s.success).length || 0,
    signals: {
      achatFort: data?.stocksAnalysis.filter(s => s.success && s.technicalIndicators?.tradingSignal === 'ACHAT FORT').length || 0,
      achatFaible: data?.stocksAnalysis.filter(s => s.success && s.technicalIndicators?.tradingSignal === 'ACHAT FAIBLE').length || 0,
      neutre: data?.stocksAnalysis.filter(s => s.success && s.technicalIndicators?.tradingSignal === 'NEUTRE').length || 0,
      venteFaible: data?.stocksAnalysis.filter(s => s.success && s.technicalIndicators?.tradingSignal === 'VENTE FAIBLE').length || 0,
      venteForte: data?.stocksAnalysis.filter(s => s.success && s.technicalIndicators?.tradingSignal === 'VENTE FORTE').length || 0,
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <ErrorAlert error={error} onRetry={handleRefresh} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-800 mb-2">Aucune donnée disponible</h2>
            <p className="text-red-600 mb-4">Impossible de charger les données d'analyse technique</p>
            <Button onClick={handleRefresh}>Réessayer</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Analyse Technique par IA
                </h1>
                <CardDescription>
                  Analyse technique avancée de tous les stocks avec intelligence artificielle Gemini
                </CardDescription>
              </div>
            </div>
            
            {/* Indicateurs de performance */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              {data.cached && (
                <Badge variant="success" className="flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Réponse instantanée
                </Badge>
              )}
              {data.cacheAge && (
                <Badge variant="default" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatCacheAge(data.cacheAge)}
                </Badge>
              )}
              {data.responseTime && (
                <span className="text-gray-500">
                  Temps de réponse: {data.responseTime}ms
                </span>
              )}
              <span className="text-gray-500">
                {stats.analyzed}/{stats.total} stocks analysés
              </span>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </Button>
          </div>
        </div>

        {/* Statistiques globales */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Stocks totaux</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-green-600">{stats.success}</div>
            <div className="text-sm text-gray-600">Analyses réussies</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.signals.achatFort + stats.signals.achatFaible}</div>
            <div className="text-sm text-gray-600">Signaux d'achat</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-red-600">{stats.signals.venteForte + stats.signals.venteFaible}</div>
            <div className="text-sm text-gray-600">Signaux de vente</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-gray-600">{stats.signals.neutre}</div>
            <div className="text-sm text-gray-600">Neutres</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-purple-600">{stats.analyzed - stats.success}</div>
            <div className="text-sm text-gray-600">Échecs</div>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Sidebar - Liste des stocks */}
          <div className="xl:col-span-1 space-y-4">
            {/* Filtres et recherche */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtres
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rechercher un stock
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Nom ou symbole..."
                      value={searchTerm}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Filtre par signal
                  </label>
                  <select 
                    value={filterSignal}
                    onChange={(e) => setFilterSignal(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="ALL">Tous les signaux</option>
                    <option value="ACHAT FORT">Achat Fort</option>
                    <option value="ACHAT FAIBLE">Achat Faible</option>
                    <option value="NEUTRE">Neutre</option>
                    <option value="VENTE FAIBLE">Vente Faible</option>
                    <option value="VENTE FORTE">Vente Forte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Trier par
                  </label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="name">Nom</option>
                    <option value="signal">Signal</option>
                    <option value="price">Prix</option>
                    <option value="confidence">Confiance</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Liste des stocks */}
            <Card className="max-h-[600px] overflow-hidden">
              <CardHeader>
                <CardTitle>Stocks ({sortedStocks.length})</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto">
                  {sortedStocks.map((stockAnalysis) => (
                    <div
                      key={stockAnalysis.stockId}
                      onClick={() => handleStockSelect(stockAnalysis)}
                      className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                        selectedStock?.stockId === stockAnalysis.stockId ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">
                            {stockAnalysis.stockInfo.nom_stock}
                          </div>
                          {stockAnalysis.stockInfo.symbol_stock && (
                            <div className="text-sm text-gray-500">
                              {stockAnalysis.stockInfo.symbol_stock}
                            </div>
                          )}
                        </div>
                        {stockAnalysis.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-1" />
                        )}
                      </div>
                      
                      {stockAnalysis.success && stockAnalysis.technicalIndicators && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Badge variant={getSignalVariant(stockAnalysis.technicalIndicators.tradingSignal)} className="text-xs">
                              {stockAnalysis.technicalIndicators.tradingSignal || 'N/A'}
                            </Badge>
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(stockAnalysis.technicalIndicators.currentPrice)}
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Confiance: {stockAnalysis.technicalIndicators.confidence || 0}%</span>
                            <span>RSI: {stockAnalysis.technicalIndicators.rsi?.value?.toFixed(1) || 'N/A'}</span>
                          </div>
                        </div>
                      )}
                      
                      {!stockAnalysis.success && (
                        <Badge variant="error" className="text-xs">
                          {stockAnalysis.message || 'Erreur d\'analyse'}
                        </Badge>
                      )}
                    </div>
                  ))}
                  
                  {sortedStocks.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>Aucun stock trouvé</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Détails du stock sélectionné */}
          <div className="xl:col-span-3">
            {selectedStock ? (
              <StockDetailView 
                stockAnalysis={selectedStock} 
                onRefresh={() => fetchStockAnalysis(selectedStock.stockId)}
                formatCurrency={formatCurrency}
                formatPercentage={formatPercentage}
                getSignalColor={getSignalColor}
                getSignalIcon={getSignalIcon}
                getRiskColor={getRiskColor}
                renderStars={renderStars}
              />
            ) : (
              <Card className="text-center p-12">
                <CandlestickChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Sélectionnez un stock
                </h3>
                <p className="text-gray-600">
                  Cliquez sur un stock dans la liste pour voir son analyse technique détaillée
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant de détail du stock
interface StockDetailViewProps {
  stockAnalysis: StockAnalysis;
  onRefresh: () => void;
  formatCurrency: (amount: number | undefined | null) => string;
  formatPercentage: (value: number | undefined | null) => string;
  getSignalColor: (signal: string | undefined) => string;
  getSignalIcon: (signal: string | undefined) => JSX.Element;
  getRiskColor: (risk: string | undefined) => string;
  renderStars: (confidence: number | undefined) => JSX.Element;
}

const StockDetailView: React.FC<StockDetailViewProps> = ({ 
  stockAnalysis, 
  onRefresh,
  formatCurrency,
  formatPercentage,
  getSignalColor,
  getSignalIcon,
  getRiskColor,
  renderStars
}) => {
  const { stockInfo, technicalIndicators, aiAnalysis, success } = stockAnalysis;

  if (!success || !technicalIndicators) {
    return (
      <Card>
        <CardHeader className="bg-red-50 border-b border-red-200">
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            Analyse non disponible
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">
              Impossible d'analyser ce stock
            </h3>
            <p className="text-red-600 mb-4">{stockAnalysis.message || 'Données techniques manquantes'}</p>
            <Button onClick={onRefresh} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête du stock */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${getSignalColor(technicalIndicators.tradingSignal)}`}>
                {getSignalIcon(technicalIndicators.tradingSignal)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {stockInfo.nom_stock}
                </h2>
                <div className="text-sm text-gray-600">
                  {stockInfo.symbol_stock && `(${stockInfo.symbol_stock}) • `}
                  Analyse technique complète
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(technicalIndicators.currentPrice)}
                </div>
                <div className="text-sm text-gray-600">Prix actuel</div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center gap-1 justify-center mb-1">
                  {renderStars(technicalIndicators.confidence)}
                </div>
                <div className="text-sm text-gray-600">Confiance</div>
              </div>
              
              <div className="text-center">
                <Badge className={getRiskColor(technicalIndicators.riskLevel)}>
                  {technicalIndicators.riskLevel || 'N/A'}
                </Badge>
                <div className="text-sm text-gray-600">Risque</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicateurs techniques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Prix et tendances */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Prix et Tendances
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(technicalIndicators.currentPrice)}
                </div>
                <div className="text-sm text-gray-600">Prix Actuel</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className={`text-2xl font-bold ${
                  (technicalIndicators.priceChange5D || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatPercentage(technicalIndicators.priceChange5D)}
                </div>
                <div className="text-sm text-gray-600">5 Jours</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900">Tendances</h4>
              <div className="flex gap-2 flex-wrap">
                <Badge className={
                  technicalIndicators.trends?.shortTerm === 'HAUSSIER' ? 'bg-green-100 text-green-800' :
                  technicalIndicators.trends?.shortTerm === 'BAISSIER' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  Court: {technicalIndicators.trends?.shortTerm || 'N/A'}
                </Badge>
                <Badge className={
                  technicalIndicators.trends?.mediumTerm === 'HAUSSIER' ? 'bg-green-100 text-green-800' :
                  technicalIndicators.trends?.mediumTerm === 'BAISSIER' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  Moyen: {technicalIndicators.trends?.mediumTerm || 'N/A'}
                </Badge>
                <Badge className={
                  technicalIndicators.trends?.longTerm === 'HAUSSIER' ? 'bg-green-100 text-green-800' :
                  technicalIndicators.trends?.longTerm === 'BAISSIER' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  Long: {technicalIndicators.trends?.longTerm || 'N/A'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* RSI et Volatilité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Momentum et Volatilité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">RSI</span>
                <Badge className={
                  technicalIndicators.rsi?.level === 'SURACHAT' ? 'bg-red-100 text-red-800' :
                  technicalIndicators.rsi?.level === 'SURVENTE' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {technicalIndicators.rsi?.value?.toFixed(2) || 'N/A'}
                </Badge>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    (technicalIndicators.rsi?.value || 0) > 70 ? 'bg-red-500' :
                    (technicalIndicators.rsi?.value || 0) < 30 ? 'bg-green-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(technicalIndicators.rsi?.value || 0, 100)}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Survente</span>
                <span>Neutre</span>
                <span>Surachat</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Volatilité</span>
                <Badge className={getRiskColor(technicalIndicators.volatility?.level)}>
                  {technicalIndicators.volatility?.value?.toFixed(2) || 'N/A'}%
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                Niveau: {technicalIndicators.volatility?.level || 'N/A'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">MACD</span>
                <Badge className={
                  technicalIndicators.macd?.signal === 'ACHAT' ? 'bg-green-100 text-green-800' :
                  technicalIndicators.macd?.signal === 'VENTE' ? 'bg-red-100 text-red-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {technicalIndicators.macd?.signal || 'N/A'}
                </Badge>
              </div>
              <div className="text-sm text-gray-600">
                Ligne: {technicalIndicators.macd?.macdLine?.toFixed(4) || 'N/A'} | 
                Signal: {technicalIndicators.macd?.signalLine?.toFixed(4) || 'N/A'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Moving Averages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUpIcon className="w-5 h-5" />
              Moving Averages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'SMA 20', value: technicalIndicators.movingAverages?.sma20, diff: technicalIndicators.movingAverages?.priceVsSma20 },
              { name: 'SMA 50', value: technicalIndicators.movingAverages?.sma50, diff: technicalIndicators.movingAverages?.priceVsSma50 },
              { name: 'EMA 12', value: technicalIndicators.movingAverages?.ema12 },
              { name: 'EMA 26', value: technicalIndicators.movingAverages?.ema26 },
            ].map((ma, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-700">{ma.name}</span>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {ma.value ? formatCurrency(ma.value) : 'N/A'}
                  </div>
                  {ma.diff !== undefined && ma.diff !== null && (
                    <div className={`text-xs ${
                      (ma.diff || 0) > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercentage(ma.diff)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Support et Résistance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Support & Résistance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div>
                  <div className="font-semibold text-red-800">Résistance</div>
                  <div className="text-sm text-red-600">
                    Distance: {formatPercentage(technicalIndicators.supportResistance?.distanceToResistance)}
                  </div>
                </div>
                <div className="text-lg font-bold text-red-800">
                  {formatCurrency(technicalIndicators.supportResistance?.resistance)}
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-gray-600">Prix Actuel</div>
                <div className="font-semibold text-blue-800">{formatCurrency(technicalIndicators.currentPrice)}</div>
              </div>

              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                <div>
                  <div className="font-semibold text-green-800">Support</div>
                  <div className="text-sm text-green-600">
                    Distance: {formatPercentage(technicalIndicators.supportResistance?.distanceToSupport)}
                  </div>
                </div>
                <div className="text-lg font-bold text-green-800">
                  {formatCurrency(technicalIndicators.supportResistance?.support)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analyse IA */}
      {aiAnalysis && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Brain className="w-6 h-6" />
                  Analyse par Intelligence Artificielle
                </CardTitle>
                <div className="text-purple-100 text-sm">
                  Recommandations de trading détaillées par Gemini AI
                </div>
              </div>
              <Badge className="bg-white/20 text-white">
                {aiAnalysis.modelUsed || 'N/A'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Analysé le: {aiAnalysis.analysisTimestamp ? new Date(aiAnalysis.analysisTimestamp).toLocaleString('fr-FR') : 'N/A'}</span>
                <Badge variant={aiAnalysis.aiStatus === 'success' ? 'success' : 'warning'}>
                  {aiAnalysis.aiStatus || 'N/A'}
                </Badge>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <div className="prose prose-blue max-w-none">
                  {aiAnalysis.analysis ? aiAnalysis.analysis.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4 text-gray-700 leading-relaxed last:mb-0">
                      {paragraph}
                    </p>
                  )) : (
                    <p className="text-gray-500">Aucune analyse disponible</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Skeleton de chargement
const LoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
            <div>
              <div className="h-8 w-64 bg-gray-300 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 bg-gray-300 rounded animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-300 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm">
              <div className="h-8 bg-gray-300 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Main Content Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Sidebar Skeleton */}
          <div className="xl:col-span-1 space-y-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="h-6 bg-gray-300 rounded animate-pulse mb-4"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="h-6 bg-gray-300 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="xl:col-span-3">
            <div className="bg-white rounded-xl p-6 shadow-sm h-96">
              <div className="h-8 bg-gray-300 rounded animate-pulse mb-4"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant d'erreur
const ErrorAlert: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
      <AlertCircle className="w-16 h-16 text-red-500" />
      <h2 className="text-xl font-semibold text-gray-900">Erreur de chargement</h2>
      <p className="text-gray-600 text-center max-w-md">{error}</p>
      <Button onClick={onRetry} className="flex items-center gap-2">
        <RefreshCw className="w-4 h-4" />
        Réessayer
      </Button>
    </div>
  );
};

export default CheckTechniqueByAIPage;