// src/pages/StockListMarket.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, TrendingUp, AlertTriangle, Building2, BarChart3, RefreshCw, Search, Filter, Eye, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// URLs des APIs
const SPRING_API_BASE_URL = "http://localhost:9090/api/stocks";
const ADMIN_API_BASE_URL = "http://localhost:9090/api/admin/companies";
const API_AUTH_CHECK_URL = "http://localhost:9090/api/client/name";

interface Stock {
  idStock: number;
  nomStock: string;
  prixStock: number;
  etat: string;
  stockDisponible: number;
  stockRestant: number;
  idComponey: number;
  ownerId: number;
  dateCreation: string;
}

interface CompanyDetails {
  companyId: number;
  companyName: string;
  status: string;
  dateInscri: string;
  // Données financières seulement
  actifTotal: number;
  actifImmobilise: number;
  actifCirculant: number;
  passifTotal: number;
  capitauxPropres: number;
  dettes: number;
  produitsTotal: number;
  chargesTotal: number;
  resultatNet: number;
  chiffreAffaires: number;
  fluxOperationnels: number;
  fluxInvestissement: number;
  fluxFinancement: number;
  variationNetteTresorerie: number;
  rapportEtatFinancier: number[];
}

const StockList: React.FC = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [companies, setCompanies] = useState<CompanyDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDetails | null>(null);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);

  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('NAME_ASC');

  // Vérification de l'authentification
  const checkAuthentication = async () => {
    try {
      const authResponse = await fetch(API_AUTH_CHECK_URL, { 
        credentials: 'include' 
      });
      
      if (authResponse.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      
      if (authResponse.ok) {
        const name = await authResponse.text();
        setUserName(name);
      }
      
      fetchAllData();
      
    } catch (err) {
      console.error('Authentication error:', err);
      setError('Erreur d\'authentification');
    }
  };

  // Charger toutes les données
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Récupérer les stocks depuis Spring Boot
      const stocksResponse = await fetch(SPRING_API_BASE_URL, {
        credentials: 'include'
      });
      
      if (!stocksResponse.ok) {
        throw new Error(`Erreur stocks: ${stocksResponse.status}`);
      }

      const stocksData = await stocksResponse.json();
      setStocks(stocksData);
      
      // Récupérer les companies depuis l'API admin
      const companiesResponse = await fetch(ADMIN_API_BASE_URL, {
        credentials: 'include'
      });
      
      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        setCompanies(companiesData);
      }

    } catch (err) {
      const errorMessage = err instanceof Error 
        ? `Erreur de chargement: ${err.message}` 
        : 'Erreur de chargement des données';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial
  useEffect(() => {
    checkAuthentication();
  }, []);

  // Obtenir les détails d'une company
  const getCompanyDetails = (companyId: number): CompanyDetails | undefined => {
    return companies.find(company => company.companyId === companyId);
  };

  // Afficher les détails de la company
  const handleViewCompanyDetails = (stock: Stock) => {
    const companyDetails = getCompanyDetails(stock.idComponey);
    if (companyDetails) {
      setSelectedCompany(companyDetails);
      setCompanyDialogOpen(true);
    }
  };

  // Formater le prix
  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) return '0.00';
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  // Formater les grands nombres
  const formatFinancialNumber = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) return '0';
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  };

  // Filtrer et trier les stocks
  const getFilteredStocks = () => {
    let filtered = [...stocks];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(stock =>
        stock.nomStock.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtre par statut
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(stock => stock.etat === statusFilter);
    }

    // Tri
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'NAME_ASC':
          return a.nomStock.localeCompare(b.nomStock);
        case 'NAME_DESC':
          return b.nomStock.localeCompare(a.nomStock);
        case 'PRICE_ASC':
          return (a.prixStock || 0) - (b.prixStock || 0);
        case 'PRICE_DESC':
          return (b.prixStock || 0) - (a.prixStock || 0);
        case 'VOLUME_ASC':
          return (a.stockDisponible || 0) - (b.stockDisponible || 0);
        case 'VOLUME_DESC':
          return (b.stockDisponible || 0) - (a.stockDisponible || 0);
        default:
          return a.nomStock.localeCompare(b.nomStock);
      }
    });

    return filtered;
  };

  // Calculer les statistiques globales
  const calculateGlobalStats = () => {
    const totalStocks = stocks.length;
    const activeStocks = stocks.filter(s => s.etat === 'ACTIVE').length;
    const totalValue = stocks.reduce((sum, stock) => sum + (stock.prixStock || 0), 0);
    const avgPrice = totalStocks > 0 ? totalValue / totalStocks : 0;

    return {
      totalStocks,
      activeStocks,
      totalValue,
      avgPrice
    };
  };

  const globalStats = calculateGlobalStats();
  const filteredStocks = getFilteredStocks();

  // Affichage des états de chargement/erreur
  const renderContentState = (message: string, isError: boolean = false) => (
    <div className="flex justify-center items-center py-20 text-xl font-semibold">
      {isError ? (
        <div className="bg-red-900/20 text-red-400 border border-red-800 p-6 rounded-xl flex items-center gap-3 shadow-lg">
          <AlertTriangle className="w-6 h-6" />
          {message}
          <Button 
            onClick={fetchAllData}
            className="ml-4 bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-4 rounded"
          >
            Réessayer
          </Button>
        </div>
      ) : (
        <div className="text-primary flex items-center gap-3">
          <Loader2 className="w-6 h-6 animate-spin" />
          {message}
        </div>
      )}
    </div>
  );

  if (loading && stocks.length === 0) {
    return renderContentState("Chargement du marché...");
  }

  if (error && stocks.length === 0) {
    return renderContentState(error, true);
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <header className="mb-8 p-6 rounded-2xl bg-card border border-border/50 shadow-xl 
                        shadow-[0_0_30px_rgba(20,184,166,0.1)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-4xl font-extrabold text-foreground">
                Marché des Stocks
              </h1>
              <p className="text-muted-foreground mt-1 text-base">
                Stocks disponibles avec analyse financière des entreprises
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-lg font-bold text-cyan-400 border border-cyan-500/50 rounded-full px-4 py-1 bg-cyan-900/20">
              {stocks.length} Stocks
            </span>
            {userName && (
              <p className="text-sm text-muted-foreground mt-1">
                Connecté en tant que {userName}
              </p>
            )}
          </div>
        </div>

        {/* Filtres et actions */}
        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-4 items-center">
            {/* Recherche */}
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Rechercher un stock..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>

            {/* Filtre statut */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-background border-border">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les statuts</SelectItem>
                <SelectItem value="ACTIVE">Actif</SelectItem>
                <SelectItem value="INACTIVE">Inactif</SelectItem>
                <SelectItem value="SUSPENDED">Suspendu</SelectItem>
              </SelectContent>
            </Select>

            {/* Tri */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-background border-border">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NAME_ASC">Nom (A-Z)</SelectItem>
                <SelectItem value="NAME_DESC">Nom (Z-A)</SelectItem>
                <SelectItem value="PRICE_ASC">Prix (Croissant)</SelectItem>
                <SelectItem value="PRICE_DESC">Prix (Décroissant)</SelectItem>
                <SelectItem value="VOLUME_ASC">Volume (Croissant)</SelectItem>
                <SelectItem value="VOLUME_DESC">Volume (Décroissant)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={fetchAllData}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Actualiser
            </Button>
          </div>
        </div>
      </header>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{globalStats.totalStocks}</div>
            <div className="text-sm text-muted-foreground">Total Stocks</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-400">{globalStats.activeStocks}</div>
            <div className="text-sm text-muted-foreground">Stocks Actifs</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-foreground">{formatPrice(globalStats.avgPrice)} €</div>
            <div className="text-sm text-muted-foreground">Prix Moyen</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-400">{companies.length}</div>
            <div className="text-sm text-muted-foreground">Entreprises</div>
          </CardContent>
        </Card>
      </div>

      {/* Grille des stocks */}
      {filteredStocks.length === 0 ? (
        <Card className="bg-card border-border/50">
          <CardContent className="text-center py-12">
            <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Aucun stock trouvé</h3>
            <p className="text-muted-foreground">
              Aucun stock ne correspond à vos critères de recherche
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStocks.map((stock) => {
            const company = getCompanyDetails(stock.idComponey);

            return (
              <Card 
                key={stock.idStock} 
                className="bg-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-foreground text-lg">
                        {stock.nomStock}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-1">
                        {company?.companyName || `Company #${stock.idComponey}`}
                      </CardDescription>
                    </div>
                    <Badge variant={
                      stock.etat === 'ACTIVE' ? 'default' :
                      stock.etat === 'INACTIVE' ? 'secondary' : 'destructive'
                    }>
                      {stock.etat === 'ACTIVE' ? 'Actif' :
                       stock.etat === 'INACTIVE' ? 'Inactif' : 'Suspendu'}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Prix */}
                  <div className="text-center">
                    <div className="text-2xl font-bold text-foreground">
                      {formatPrice(stock.prixStock)} €
                    </div>
                    <div className="text-sm text-muted-foreground">
                      par action
                    </div>
                  </div>

                  {/* Informations stock */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="font-bold text-foreground">
                        {stock.stockDisponible}
                      </div>
                      <div className="text-muted-foreground text-xs">Disponible</div>
                    </div>
                    <div className="text-center p-2 bg-muted/50 rounded-lg">
                      <div className="font-bold text-foreground">
                        {stock.stockRestant}
                      </div>
                      <div className="text-muted-foreground text-xs">Restant</div>
                    </div>
                  </div>

                  {/* Indicateur entreprise */}
                  {company && (
                    <div className="text-center text-sm text-green-400 flex items-center justify-center gap-1">
                      <Building2 className="w-3 h-3" />
                      Données financières disponibles
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="flex gap-2 w-full">
                    <Button 
                      variant="outline" 
                      className="flex-1 border-border text-foreground hover:bg-muted"
                      onClick={() => handleViewCompanyDetails(stock)}
                      disabled={!company}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Analyse
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog des détails financiers de l'entreprise */}
      <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-6 h-6" />
              Analyse Financière - {selectedCompany?.companyName}
            </DialogTitle>
            <DialogDescription>
              Données financières détaillées de l'entreprise
            </DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <div className="space-y-6">
              {/* Bilan */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Bilan Financier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Actifs</h4>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Actif Total</span>
                        <span className="font-bold">{formatFinancialNumber(selectedCompany.actifTotal)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Actif Immobilisé</span>
                        <span className="font-bold">{formatFinancialNumber(selectedCompany.actifImmobilise)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Actif Circulant</span>
                        <span className="font-bold">{formatFinancialNumber(selectedCompany.actifCirculant)} €</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Passifs</h4>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Passif Total</span>
                        <span className="font-bold">{formatFinancialNumber(selectedCompany.passifTotal)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Capitaux Propres</span>
                        <span className="font-bold text-green-400">{formatFinancialNumber(selectedCompany.capitauxPropres)} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dettes</span>
                        <span className="font-bold text-red-400">{formatFinancialNumber(selectedCompany.dettes)} €</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Compte de résultat */}
              <Card>
                <CardHeader>
                  <CardTitle>Compte de Résultat</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Chiffre d'Affaires</span>
                      <span className="font-bold text-green-400">{formatFinancialNumber(selectedCompany.chiffreAffaires)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produits Totaux</span>
                      <span className="font-bold text-green-400">{formatFinancialNumber(selectedCompany.produitsTotal)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Charges Totales</span>
                      <span className="font-bold text-red-400">{formatFinancialNumber(selectedCompany.chargesTotal)} €</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground font-semibold">Résultat Net</span>
                      <span className={`font-bold ${selectedCompany.resultatNet >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatFinancialNumber(selectedCompany.resultatNet)} €
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flux de trésorerie */}
              <Card>
                <CardHeader>
                  <CardTitle>Flux de Trésorerie</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Flux Opérationnels</span>
                      <span className={`font-bold ${selectedCompany.fluxOperationnels >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatFinancialNumber(selectedCompany.fluxOperationnels)} €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Flux d'Investissement</span>
                      <span className={`font-bold ${selectedCompany.fluxInvestissement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatFinancialNumber(selectedCompany.fluxInvestissement)} €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Flux de Financement</span>
                      <span className={`font-bold ${selectedCompany.fluxFinancement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatFinancialNumber(selectedCompany.fluxFinancement)} €
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground font-semibold">Variation Nette Trésorerie</span>
                      <span className={`font-bold ${selectedCompany.variationNetteTresorerie >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatFinancialNumber(selectedCompany.variationNetteTresorerie)} €
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Rapport financier disponible */}
              {selectedCompany.rapportEtatFinancier && selectedCompany.rapportEtatFinancier.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Rapport Financier</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <BarChart3 className="w-8 h-8 mx-auto mb-2 text-green-400" />
                      <p className="text-green-600 dark:text-green-400 font-semibold">
                        Rapport financier disponible
                      </p>
                      <p className="text-sm text-green-500 dark:text-green-300 mt-1">
                        Document PDF téléchargeable
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StockList;