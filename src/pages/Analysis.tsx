import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  Download, 
  RefreshCw, 
  AlertCircle,
  DollarSign,
  Users,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Brain,
  Zap,
  Clock,
  Database,
  LineChart,
  Target,
  AlertTriangle,
  TrendingDown,
  Star,
  Shield,
  Lightbulb,
  ChartBar
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

// Interfaces pour l'analyse technique des stocks
interface StockInfo {
  id_stock: number;
  nom_stock: string;
  symbol_stock: string;
  prix_actuel?: number;
}

interface TechnicalIndicators {
  currentPrice: number;
  priceChange5D: number;
  priceChange30D: number;
  tradingSignal: string;
  confidence: number;
  riskLevel: string;
  rsi: {
    value: number;
    level: string;
    signal: string;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    priceVsSma20: number;
    priceVsSma50: number;
  };
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
    signal: string;
  };
  bollingerBands: {
    position: string;
    width: number;
  };
  trends: {
    shortTerm: string;
    mediumTerm: string;
    longTerm: string;
  };
  volatility: {
    value: number;
    level: string;
  };
  supportResistance: {
    support: number;
    resistance: number;
    distanceToSupport: number;
    distanceToResistance: number;
  };
}

interface AiAnalysis {
  analysis: string;
  modelUsed: string;
  analysisTimestamp: number;
  aiStatus: string;
  aiProcessingTime?: number;
}

interface StockAnalysis {
  stockId: number;
  stockInfo: StockInfo;
  success: boolean;
  technicalIndicators: TechnicalIndicators;
  aiAnalysis?: AiAnalysis;
  analysisStatus: string;
  totalDataPoints: number;
  message?: string;
}

interface TechnicalAnalysisResponse {
  success: boolean;
  totalStocks: number;
  analyzedStocks: number;
  stocksAnalysis: StockAnalysis[];
  analysisTimestamp: number;
  responseTime: number;
  message: string;
  cached?: boolean;
  cacheAge?: number;
}

// Cache global
let technicalAnalysisCache: TechnicalAnalysisResponse | null = null;
let lastTechnicalAnalysisUpdate: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fonctions utilitaires
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND'
  }).format(amount);
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString('fr-FR');
};

const formatCacheAge = (age: number): string => {
  if (age < 1000) return 'À l\'instant';
  if (age < 60000) return `Il y a ${Math.floor(age / 1000)} secondes`;
  return `Il y a ${Math.floor(age / 60000)} minutes`;
};

const getSignalColor = (signal: string): string => {
  switch (signal) {
    case 'ACHAT FORT': return 'text-green-600 bg-green-100 border-green-200';
    case 'ACHAT FAIBLE': return 'text-green-500 bg-green-50 border-green-100';
    case 'VENTE FORTE': return 'text-red-600 bg-red-100 border-red-200';
    case 'VENTE FAIBLE': return 'text-red-500 bg-red-50 border-red-100';
    default: return 'text-gray-600 bg-gray-100 border-gray-200';
  }
};

const getSignalIcon = (signal: string): React.ReactNode => {
  switch (signal) {
    case 'ACHAT FORT': return <TrendingUp className="w-4 h-4" />;
    case 'ACHAT FAIBLE': return <TrendingUp className="w-4 h-4" />;
    case 'VENTE FORTE': return <TrendingDown className="w-4 h-4" />;
    case 'VENTE FAIBLE': return <TrendingDown className="w-4 h-4" />;
    default: return <Activity className="w-4 h-4" />;
  }
};

const getRiskColor = (risk: string): string => {
  switch (risk) {
    case 'ÉLEVÉ': return 'text-red-600 bg-red-100';
    case 'MOYEN': return 'text-yellow-600 bg-yellow-100';
    case 'FAIBLE': return 'text-green-600 bg-green-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

const getRSIColor = (rsi: number): string => {
  if (rsi > 70) return 'text-red-600';
  if (rsi < 30) return 'text-green-600';
  return 'text-gray-600';
};

const getTrendColor = (trend: string): string => {
  switch (trend) {
    case 'HAUSSIER': return 'text-green-600';
    case 'BAISSIER': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

// Composant de check (remplacement)
const CheckCircle2: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TechnicalAnalysisPage: React.FC = () => {
  const [technicalData, setTechnicalData] = useState<TechnicalAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockAnalysis | null>(null);

  const TECHNICAL_ANALYSIS_URL = "http://localhost:9090";

  // Chargement initial des données
  useEffect(() => {
    const preloadData = async () => {
      if (technicalAnalysisCache && (Date.now() - lastTechnicalAnalysisUpdate) < CACHE_DURATION) {
        console.log('💨 Utilisation du cache technique pré-chargé');
        setTechnicalData(technicalAnalysisCache);
        setLoading(false);
        return;
      }
      await fetchTechnicalAnalysis(false);
    };

    preloadData();
  }, []);

  const fetchTechnicalAnalysis = async (forceRefresh: boolean = false) => {
    try {
      setError(null);
      setLoading(true);
      
      if (!forceRefresh && technicalAnalysisCache && (Date.now() - lastTechnicalAnalysisUpdate) < CACHE_DURATION) {
        console.log('💨 Analyse technique depuis le cache');
        setTechnicalData(technicalAnalysisCache);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await fetch(`${TECHNICAL_ANALYSIS_URL}/api/technical-analysis/all-stocks`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const result: TechnicalAnalysisResponse = await response.json();
      
      if (result.success) {
        setTechnicalData(result);
        technicalAnalysisCache = result;
        lastTechnicalAnalysisUpdate = Date.now();
      } else {
        throw new Error(result.message || 'Erreur lors de la récupération de l\'analyse technique');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de connexion au serveur';
      setError(errorMessage);
      console.error('Erreur analyse technique:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTechnicalAnalysis(true);
  };

  const handleQuickRefresh = () => {
    setRefreshing(true);
    fetchTechnicalAnalysis(false);
  };

  const handleExport = () => {
    if (!technicalData) return;
    
    const exportData = {
      ...technicalData,
      exportTimestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analyse-technique-stocks-${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <TechnicalAnalysisSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
        <div className="max-w-7xl mx-auto">
          <ErrorAlert error={error} onRetry={handleQuickRefresh} />
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
              <LineChart className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">
                Analyse Technique des Stocks
              </h1>
            </div>
            <p className="text-gray-600">
              Analyse technique avancée avec indicateurs et intelligence artificielle
            </p>
            
            {/* Indicateurs de performance */}
            {technicalData && (
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                {technicalData.cached && (
                  <Badge variant="secondary" className="bg-green-100 text-green-700 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Réponse instantanée
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {technicalData.cacheAge ? formatCacheAge(technicalData.cacheAge) : 'Actualisé maintenant'}
                </Badge>
                <span className="text-gray-500">
                  Temps de réponse: {technicalData.responseTime}ms
                </span>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleExport}
              disabled={!technicalData}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exporter
            </Button>
            <Button
              onClick={handleQuickRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Recharger
            </Button>
          </div>
        </div>

        {/* Statistiques Globales */}
        {technicalData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Stocks Totaux"
              value={technicalData.totalStocks.toString()}
              subtitle="Stocks analysables"
              icon={<ChartBar className="w-6 h-6" />}
              trend="neutral"
            />
            <StatCard
              title="Stocks Analysés"
              value={technicalData.analyzedStocks.toString()}
              subtitle="Analyse complète"
              icon={<CheckCircle2 className="w-6 h-6" />}
              trend="neutral"
            />
            <StatCard
              title="Signaux Achat"
              value={technicalData.stocksAnalysis.filter(s => 
                s.technicalIndicators.tradingSignal.includes('ACHAT')
              ).length.toString()}
              subtitle="Opportunités d'achat"
              icon={<TrendingUp className="w-6 h-6" />}
              trend="up"
            />
            <StatCard
              title="Performance"
              value={`${technicalData.responseTime}ms`}
              subtitle="Temps de traitement"
              icon={<Zap className="w-6 h-6" />}
              trend="neutral"
            />
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Liste des Stocks */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Analyse des Stocks ({technicalData?.analyzedStocks || 0})
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Liste complète des analyses techniques
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[600px] overflow-y-auto">
                  {technicalData?.stocksAnalysis.map((analysis) => (
                    <StockAnalysisRow 
                      key={analysis.stockId} 
                      analysis={analysis} 
                      isSelected={selectedStock?.stockId === analysis.stockId}
                      onSelect={() => setSelectedStock(analysis)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Détails du Stock Sélectionné */}
          <div className="xl:col-span-1">
            {selectedStock ? (
              <StockDetailCard analysis={selectedStock} />
            ) : (
              <Card className="h-full">
                <CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
                  <Target className="w-16 h-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sélectionnez un Stock
                  </h3>
                  <p className="text-gray-600">
                    Cliquez sur un stock dans la liste pour voir son analyse détaillée
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Analyse IA Globale */}
        {technicalData && (
          <Card className="mt-6">
            <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6" />
                Synthèse de l'Analyse Technique
              </CardTitle>
              <CardDescription className="text-green-100">
                Vue d'ensemble du marché basée sur l'analyse technique
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {technicalData.stocksAnalysis.filter(s => 
                      s.technicalIndicators.tradingSignal === 'ACHAT FORT'
                    ).length}
                  </div>
                  <div className="text-sm text-gray-600">Achats Forts Recommandés</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {technicalData.stocksAnalysis.filter(s => 
                      s.technicalIndicators.tradingSignal === 'VENTE FORTE'
                    ).length}
                  </div>
                  <div className="text-sm text-gray-600">Ventes Fortes Recommandées</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {technicalData.stocksAnalysis.filter(s => 
                      s.technicalIndicators.tradingSignal === 'NEUTRE'
                    ).length}
                  </div>
                  <div className="text-sm text-gray-600">Signaux Neutres</div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-5 h-5 text-yellow-600" />
                  <span className="font-semibold text-gray-900">Conseils de Trading</span>
                </div>
                <ul className="text-sm text-gray-700 space-y-2">
                  <li>• Privilégiez les stocks avec signal <strong>ACHAT FORT</strong> et RSI &lt; 30</li>
                  <li>• Surveillez les supports techniques pour placer les stop-loss</li>
                  <li>• Diversifiez entre tendances court et long terme</li>
                  <li>• Tenez compte des niveaux de volatilité dans votre gestion de risque</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Composant de ligne d'analyse de stock
const StockAnalysisRow: React.FC<{ 
  analysis: StockAnalysis; 
  isSelected: boolean;
  onSelect: () => void;
}> = ({ analysis, isSelected, onSelect }) => {
  const indicators = analysis.technicalIndicators;

  return (
    <div 
      className={`border-b border-gray-200 p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
        isSelected ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-semibold text-gray-900">{analysis.stockInfo.nom_stock}</h4>
            <Badge variant="outline" className="text-xs">
              {analysis.stockInfo.symbol_stock}
            </Badge>
            <Badge className={`flex items-center gap-1 ${getSignalColor(indicators.tradingSignal)}`}>
              {getSignalIcon(indicators.tradingSignal)}
              {indicators.tradingSignal}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <span className="font-semibold">{formatCurrency(indicators.currentPrice)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" />
              <span className={`font-semibold ${getRSIColor(indicators.rsi.value)}`}>
                RSI: {indicators.rsi.value.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-400" />
              <span className={`font-semibold ${getTrendColor(indicators.trends.shortTerm)}`}>
                {indicators.trends.shortTerm}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" />
              <Badge variant="outline" className={getRiskColor(indicators.riskLevel)}>
                {indicators.riskLevel}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-600">
            Confiance: <span className="font-semibold">{indicators.confidence.toFixed(0)}%</span>
          </div>
          {analysis.aiAnalysis && (
            <Badge variant="secondary" className="mt-1 bg-purple-100 text-purple-700 text-xs">
              IA
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

// Composant de détail du stock
const StockDetailCard: React.FC<{ analysis: StockAnalysis }> = ({ analysis }) => {
  const indicators = analysis.technicalIndicators;

  return (
    <Card className="h-full">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-lg">
        <CardTitle className="flex items-center gap-2">
          {analysis.stockInfo.nom_stock}
        </CardTitle>
        <CardDescription className="text-blue-100">
          {analysis.stockInfo.symbol_stock} • {formatCurrency(indicators.currentPrice)}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Signal Principal */}
        <div className="text-center">
          <Badge className={`text-lg py-2 px-4 ${getSignalColor(indicators.tradingSignal)}`}>
            {getSignalIcon(indicators.tradingSignal)}
            {indicators.tradingSignal}
          </Badge>
          <div className="mt-2 text-sm text-gray-600">
            Confiance: {indicators.confidence.toFixed(0)}%
          </div>
          <Progress value={indicators.confidence} className="mt-2" />
        </div>

        {/* Indicateurs Clés */}
        <div className="grid grid-cols-2 gap-4">
          <IndicatorCard 
            title="RSI" 
            value={indicators.rsi.value.toFixed(1)} 
            status={indicators.rsi.level}
            color={getRSIColor(indicators.rsi.value)}
          />
          <IndicatorCard 
            title="Tendance" 
            value={indicators.trends.shortTerm} 
            status="Court terme"
            color={getTrendColor(indicators.trends.shortTerm)}
          />
          <IndicatorCard 
            title="Volatilité" 
            value={`${indicators.volatility.value.toFixed(1)}%`} 
            status={indicators.volatility.level}
            color="text-gray-600"
          />
          <IndicatorCard 
            title="Risque" 
            value={indicators.riskLevel} 
            status="Niveau"
            color={getRiskColor(indicators.riskLevel).replace('bg-', 'text-').split(' ')[0]}
          />
        </div>

        {/* Moving Averages */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Moving Averages</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span>SMA20:</span>
              <span className="font-semibold">{formatCurrency(indicators.movingAverages.sma20)}</span>
            </div>
            <div className="flex justify-between">
              <span>Écart:</span>
              <span className={`font-semibold ${
                indicators.movingAverages.priceVsSma20 > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {indicators.movingAverages.priceVsSma20 > 0 ? '+' : ''}{indicators.movingAverages.priceVsSma20.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>SMA50:</span>
              <span className="font-semibold">{formatCurrency(indicators.movingAverages.sma50)}</span>
            </div>
            <div className="flex justify-between">
              <span>Écart:</span>
              <span className={`font-semibold ${
                indicators.movingAverages.priceVsSma50 > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {indicators.movingAverages.priceVsSma50 > 0 ? '+' : ''}{indicators.movingAverages.priceVsSma50.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Support et Résistance */}
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">Support & Résistance</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Support:</span>
              <span className="font-semibold text-green-600">{formatCurrency(indicators.supportResistance.support)}</span>
            </div>
            <div className="flex justify-between">
              <span>Résistance:</span>
              <span className="font-semibold text-red-600">{formatCurrency(indicators.supportResistance.resistance)}</span>
            </div>
          </div>
        </div>

        {/* Analyse IA */}
        {analysis.aiAnalysis && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-purple-600" />
              <span className="font-semibold text-gray-900">Analyse IA</span>
            </div>
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
              {analysis.aiAnalysis.analysis.split('\n').slice(0, 3).map((line, index) => (
                <p key={index} className="mb-1">{line}</p>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Composant d'indicateur
const IndicatorCard: React.FC<{
  title: string;
  value: string;
  status: string;
  color: string;
}> = ({ title, value, status, color }) => (
  <div className="text-center p-3 bg-gray-50 rounded-lg">
    <div className="text-xs text-gray-600 mb-1">{title}</div>
    <div className={`text-lg font-semibold mb-1 ${color}`}>{value}</div>
    <div className="text-xs text-gray-500">{status}</div>
  </div>
);

// Composant de carte de statistique
const StatCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
}> = ({ title, value, subtitle, icon, trend }) => {
  const trendColors = {
    up: 'text-green-600 bg-green-100',
    down: 'text-red-600 bg-red-100',
    neutral: 'text-blue-600 bg-blue-100'
  };

  return (
    <Card className="bg-white shadow-md border border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          </div>
          <div className={`p-3 rounded-full ${trendColors[trend]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Skeleton de chargement
const TechnicalAnalysisSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-12 w-1/3" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Skeleton key={`stat-skeleton-${index}`} className="h-32 rounded-lg" />
          ))}
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-lg xl:col-span-2" />
          <Skeleton className="h-96 rounded-lg" />
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

export default TechnicalAnalysisPage;