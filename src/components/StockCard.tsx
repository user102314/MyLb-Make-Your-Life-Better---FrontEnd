// src/components/StockCard.tsx

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Eye } from 'lucide-react';
import { StockData } from '../lib/types';
import { Button } from '@/components/ui/button';

interface StockCardProps {
  stock: StockData;
  onViewDetails?: (stockId: number, stockName: string) => void;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onViewDetails }) => {
  // Valeurs par défaut pour éviter les erreurs
  const price = stock.price ?? 0;
  const change = stock.change ?? 0;
  const stockDisponible = stock.stockDisponible ?? 0;
  const stockReste = stock.stockReste ?? 0;
  
  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  const getTrendIcon = () => {
    if (isPositive) return <TrendingUp className="w-4 h-4" />;
    if (isNegative) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (isPositive) return 'text-green-400';
    if (isNegative) return 'text-red-400';
    return 'text-gray-400';
  };

  const getTrendBgColor = () => {
    if (isPositive) return 'bg-green-900/20 border-green-800';
    if (isNegative) return 'bg-red-900/20 border-red-800';
    return 'bg-gray-900/20 border-gray-800';
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-primary/50 group">
      {/* Header avec symbole et nom */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
            {stock.symbol}
          </h3>
          <p className="text-muted-foreground text-sm mt-1">
            {stock.name}
          </p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full border ${getTrendBgColor()}`}>
          {getTrendIcon()}
          <span className={`text-sm font-semibold ${getTrendColor()}`}>
            {change > 0 ? '+' : ''}{change.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Prix */}
      <div className="mb-4">
        <p className="text-2xl font-bold text-foreground">
          ${price.toFixed(2)}
        </p>
      </div>

      {/* Informations sur le stock */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Stock disponible:</span>
          <span className="font-semibold text-foreground">
            {stockDisponible.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Stock restant:</span>
          <span className="font-semibold text-foreground">
            {stockReste.toLocaleString()}
          </span>
        </div>
        {stock.etat && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">État:</span>
            <span className={`font-semibold ${
              stock.etat === 'ACTIF' ? 'text-green-400' : 
              stock.etat === 'INACTIF' ? 'text-red-400' : 
              'text-yellow-400'
            }`}>
              {stock.etat}
            </span>
          </div>
        )}
      </div>

      {/* Barre de progression (optionnelle) */}
      {stockDisponible > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Disponibilité</span>
            <span>{Math.round((stockReste / stockDisponible) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (stockReste / stockDisponible) * 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Bouton Consulter le stock */}
      <div className="mt-4 pt-4 border-t border-border/50">
        <Button 
          onClick={() => onViewDetails?.(stock.idStock, stock.name)}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold"
          size="sm"
        >
          <Eye className="w-4 h-4 mr-2" />
          Consulter le stock
        </Button>
      </div>
    </div>
  );
};

export default StockCard;