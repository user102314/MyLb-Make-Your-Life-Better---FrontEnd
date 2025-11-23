// src/pages/company/BeginCompanyStock.tsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building, Gavel, FileText, CheckCircle, XCircle, ArrowRight, BookOpen, User } from 'lucide-react';

// NOTE: Si vous utilisez des composants Card (Shadcn/UI), vous pouvez les décommenter ici
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BeginCompanyStock: React.FC = () => {
    const [isAccepted, setIsAccepted] = useState(false);

    const handleAcceptance = () => {
        setIsAccepted(true);
    };
    
    // --- Données Statiques de la Page ---

    const policies = [
        "Politique Anti-Blanchiment d'Argent (AML).",
        "Conformité au KYC (Know Your Customer) des fondateurs et bénéficiaires.",
        "Réglementation des marchés financiers (Directive MiFID II).",
        "Politique de protection des données (RGPD/GDPR)."
    ];

    const requiredConditions = [
        { title: "Statut Légal", details: "L'entreprise doit être enregistrée dans un pays reconnu par MyLB (UE, UK, Canada, etc.).", passed: false },
        { title: "Capital Minimum", details: "Un capital social minimum de 10 000€ ou équivalent est requis pour les sociétés par actions.", passed: false }, // Exemple d'une condition non remplie au départ
        { title: "Activité Légitime", details: "L'activité de l'entreprise ne doit pas figurer sur notre liste d'exclusions (armes, jeux illégaux, etc.).", passed: false },
        { title: "Compte Bancaire Professionnel", details: "L'entreprise doit posséder un compte bancaire actif dans son pays d'enregistrement.", passed: false },
    ];
    
    const requiredDocuments = [
        { name: "Certificat d'enregistrement / K-bis", icon: FileText },
        { name: "Statuts de la Société (signés)", icon: BookOpen },
        { name: "Pièce d'identité des Dirigeants (KYC)", icon: User },
        { name: "Preuve d'adresse du siège social", icon: FileText },
    ];
    
    // --- Rendu ---
    
    return (
        <div className="w-full max-w-5xl mx-auto pt-6 pb-12">
            
            {/* HEADER */}
            <header className="mb-10 p-6 bg-card rounded-xl shadow-2xl border-l-4 border-primary">
                <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                    <Building className="w-7 h-7 text-primary" /> Lancement de l'IPO (Offre Publique Initiale)
                </h1>
                <p className="text-xl text-muted-foreground">
                    Conditions Préalables pour l'introduction en bourse de votre société.
                </p>
            </header>

            {/* SECTION 1: POLITIQUES & RÉGLEMENTATION */}
            <div className="bg-card p-8 rounded-xl shadow-lg border border-border mb-8">
                <h2 className="text-2xl font-semibold mb-6 text-primary flex items-center gap-2">
                    <Gavel className="w-5 h-5" /> Nos Politiques et Conformité
                </h2>
                <p className="text-muted-foreground mb-4">
                    La cotation de votre société sur MyLB est soumise à des normes de conformité strictes pour assurer la sécurité de tous les acteurs du marché.
                </p>
                <ul className="space-y-3">
                    {policies.map((policy, index) => (
                        <li key={index} className="flex items-center text-foreground/80">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                            {policy}
                        </li>
                    ))}
                </ul>
            </div>

            {/* SECTION 2: CONDITIONS NÉCESSAIRES (Étape par Étape) */}
            <div className="bg-card p-8 rounded-xl shadow-lg border border-border mb-8">
                <h2 className="text-2xl font-semibold mb-6 text-primary flex items-center gap-2">
                    <BookOpen className="w-5 h-5" /> Conditions Requises de la Société
                </h2>
                <div className="space-y-4">
                    {requiredConditions.map((condition, index) => (
                        <div key={index} className={`p-4 rounded-lg border ${condition.passed ? 'border-green-600 bg-green-900/10' : 'border-red-600 bg-red-900/10'}`}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {condition.passed 
                                        ? <CheckCircle className="w-5 h-5 text-green-500" />
                                        : <XCircle className="w-5 h-5 text-red-500" />}
                                    <span className={`text-lg font-bold ${condition.passed ? 'text-green-300' : 'text-red-300'}`}>
                                        Étape {index + 1}: {condition.title}
                                    </span>
                                </div>
                                <span className={`text-sm font-semibold ${condition.passed ? 'text-green-500' : 'text-red-500'}`}>
                                    {condition.passed ? 'COMPLÉTÉE' : 'EN ATTENTE'}
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 ml-8">{condition.details}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* SECTION 3: DOCUMENTS NÉCESSAIRES */}
            <div className="bg-card p-8 rounded-xl shadow-lg border border-border mb-10">
                <h2 className="text-2xl font-semibold mb-6 text-primary flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Documents Nécessaires
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {requiredDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center p-3 bg-muted/30 rounded-lg text-foreground">
                            <doc.icon className="w-5 h-5 text-primary mr-3" />
                            <span className="font-medium text-sm">{doc.name}</span>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* SECTION 4: BOUTONS D'ACCEPTATION / SUIVANT */}
            <div className="p-6 bg-card rounded-xl shadow-2xl border border-border flex flex-col md:flex-row justify-between items-center gap-4">
                
                {/* Bouton d'Acceptation */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleAcceptance}
                        disabled={isAccepted}
                        className={`py-3 px-6 rounded-lg font-bold transition-colors duration-300 flex items-center gap-2
                            ${isAccepted
                                ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                                : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md'
                            }`
                        }
                    >
                        {isAccepted ? (
                            <>
                                <CheckCircle className="w-5 h-5" /> Conditions Acceptées
                            </>
                        ) : (
                            "J'accepte toutes les Politiques"
                        )}
                    </button>
                    {isAccepted && <span className="text-sm text-green-500">Prêt à continuer.</span>}
                </div>

                {/* Bouton Suivant (Vert) */}
                <Link 
                    to={isAccepted ? "/dashboard/CreateCompany" : "#"} // Redirection vers l'étape suivante
                    className={`py-3 px-8 rounded-lg font-bold transition-all duration-300 flex items-center gap-3 w-full md:w-auto justify-center
                        ${isAccepted
                            ? 'bg-green-600 text-white shadow-lg hover:bg-green-700'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`
                    }
                    onClick={(e) => { !isAccepted && e.preventDefault(); }}
                >
                    Étape Suivante 
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>

        </div>
    );
};

export default BeginCompanyStock;