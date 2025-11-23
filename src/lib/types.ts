// src/lib/types.ts
export interface StockData {
  idStock: number;
  symbol: string;
  name: string;
  price: number;
  change: number;
  stockDisponible: number;
  stockReste: number;
  etat: string;
  companyId: number;
}