import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Fond Sophistiqué */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="MyLB Institutional Platform" 
          className="w-full h-full object-cover opacity-10"
        />
        {/* Overlay de prestige */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95"></div>
        
        {/* Pattern géométrique subtil */}
        <div className="absolute inset-0 opacity-[0.02]">
          <div className="absolute inset-0 bg-[linear-gradient(45deg,_transparent_25%,_rgba(255,255,255,0.05)_50%,_transparent_75%)] bg-[length:50px_50px]"></div>
        </div>
      </div>

      {/* Effets de lumière professionnels */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/3 rounded-full blur-2xl"></div>

      {/* Contenu Principal Élitiste */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center py-24">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Badge de Prestige */}
          <div className="inline-flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-full px-6 py-3 backdrop-blur-sm">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-slate-300 tracking-wider uppercase">
              Plateforme Institutionnelle MyLB Capital
            </span>
          </div>
          
          {/* Titre Institutionnel */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-light tracking-tight leading-tight">
              <span className="text-white font-normal">Gestion de Patrimoine</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent font-light">
                & Investissement Privé
              </span>
            </h1>
          </div>

          {/* Sous-titre Élitiste */}
          <div className="max-w-4xl mx-auto">
            <p className="text-xl sm:text-2xl text-slate-300 leading-relaxed font-light">
              Accédez à une <span className="text-white font-medium">sélection exclusive</span> d'opportunités d'investissement 
              soigneusement structurées pour les investisseurs avertis et les portefeuilles institutionnels.
            </p>
          </div>

          {/* Proposition de Valeur Structurée */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto py-8">
            <div className="text-center p-6 border-l border-slate-700/50">
              <div className="w-12 h-12 mx-auto mb-4 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Due Diligence Rigoureuse</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Analyse approfondie de chaque opportunité avec standards institutionnels
              </p>
            </div>
            
            <div className="text-center p-6 border-l border-slate-700/50">
              <div className="w-12 h-12 mx-auto mb-4 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Performance Mesurée</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Stratégies d'investissement axées sur la création de valeur à long terme
              </p>
            </div>
            
            <div className="text-center p-6 border-l border-slate-700/50">
              <div className="w-12 h-12 mx-auto mb-4 bg-cyan-500/10 rounded-lg flex items-center justify-center border border-cyan-500/20">
                <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-white font-semibold mb-2">Sécurité Institutionnelle</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Infrastructure sécurisée conforme aux normes bancaires internationales
              </p>
            </div>
          </div>

          {/* Boutons d'Action Prestigieux */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link to="/accreditation">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold px-12 py-6 rounded-lg border border-blue-500/30 shadow-2xl shadow-blue-500/20 transition-all duration-300 hover:shadow-blue-500/30 hover:scale-[1.02]"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Procédure d'Accréditation
              </Button>
            </Link>
            
            <Link to="/rendez-vous">
              <Button 
                size="lg" 
                variant="outline"
                className="border-2 border-slate-600 text-slate-300 hover:bg-slate-800/50 hover:text-white hover:border-slate-500 font-semibold px-12 py-6 rounded-lg backdrop-blur-sm transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Rencontre Conseil
              </Button>
            </Link>
          </div>

          {/* Indicateurs de Performance Institutionnels */}
          <div className="pt-16 max-w-6xl mx-auto border-t border-slate-700/50">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">€250M+</div>
                <div className="text-sm text-slate-400 uppercase tracking-wider font-medium">Assets Under Management</div>
                <div className="text-xs text-slate-500 mt-2">Capital institutionnel géré</div>
              </div>
              
              <div className="text-center p-6">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">15.2%</div>
                <div className="text-sm text-slate-400 uppercase tracking-wider font-medium">IRR Annualisé</div>
                <div className="text-xs text-slate-500 mt-2">Performance nette de frais</div>
              </div>
              
              <div className="text-center p-6">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">45+</div>
                <div className="text-sm text-slate-400 uppercase tracking-wider font-medium">Transactions</div>
                <div className="text-xs text-slate-500 mt-2">Opérations réalisées</div>
              </div>
              
              <div className="text-center p-6">
                <div className="text-3xl lg:text-4xl font-bold text-white mb-2">98%</div>
                <div className="text-sm text-slate-400 uppercase tracking-wider font-medium">Taux de Succès</div>
                <div className="text-xs text-slate-500 mt-2">Objectifs d'investissement atteints</div>
              </div>
            </div>
            
            {/* Avertissement Réglementaire */}
            <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
              <p className="text-xs text-slate-400 text-center">
                <strong className="text-slate-300">Avertissement Réglementaire :</strong> Les performances passées ne préjugent pas des performances futures. 
                L'investissement comporte des risques de perte en capital. Réservé aux investisseurs qualifiés. 
                MyLB Capital est une marque de MyLB SAS, société réglementée par l'ACPR.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator Élitiste */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center gap-2">
          <span className="text-xs text-slate-500 uppercase tracking-wider">Explorez</span>
          <div className="w-px h-12 bg-gradient-to-b from-slate-500 to-transparent"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;