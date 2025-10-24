💻 Frontend React/TypeScript - MyLB Application
Ce projet est le composant frontend de l'application MyLB, construit avec React et TypeScript. Il fournit l'interface utilisateur pour l'authentification, la gestion de compte, et le processus de vérification d'identité (KYC).

Ce frontend est conçu pour interagir avec le backend Spring Boot sur http://localhost:9090.

🛠️ Technologies Utilisées
Framework : React (Hooks, TypeScript)

Styling : Tailwind CSS (pour le thème sombre)

Routing : React Router DOM

Icônes : Lucide React

⚙️ Configuration Requise
1. Variables d'Environnement
L'URL de base de l'API est définie dans le code (ex: http://localhost:9090). Pour une meilleure gestion des environnements, il est recommandé d'utiliser un fichier .env.local dans le répertoire racine du projet :

Bash

# .env.local
REACT_APP_API_BASE_URL=http://localhost:9090
Vous devrez ensuite adapter vos appels fetch (ou Axios) pour utiliser cette variable :

TypeScript

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:9090'; 
// ...
const response = await fetch(`${API_BASE_URL}/api/kyc/upload-documents`, { /* ... */ });
2. Port d'Exécution
Le front-end tourne sur le port 8081 pour éviter les conflits avec le backend (port 9090) et correspondre à la configuration CORS du backend.

🚀 Démarrage du Projet
Assurez-vous d'avoir Node.js (avec npm ou yarn) installé.

1. Installation des Dépendances
Ouvrez votre terminal dans le répertoire du projet frontend et exécutez :

Bash

npm install
# ou
yarn install
2. Lancement de l'Application
Démarrez le serveur de développement. L'application devrait s'ouvrir automatiquement sur http://localhost:8081.

Bash

npm start
# ou
yarn start
🔑 Note Cruciale sur l'Authentification (CORS & Session)
Ce projet utilise l'authentification basée sur la session HTTP gérée par le backend Spring Boot.

Pour que l'authentification fonctionne correctement sur un domaine/port différent :

TOUTES les requêtes API qui nécessitent une authentification (après le login) doivent inclure l'option credentials: 'include' :

TypeScript

// Exemple dans src/pages/VerifyEmail.tsx ou login.tsx
const response = await fetch('URL_DE_L_API', {
    method: 'POST',
    body: formData, // ou JSON.stringify(data)
    credentials: 'include', // 🚨 Ceci est indispensable !
});
Si cette option est manquante sur une route, le backend répondra par une erreur 401 Unauthorized.

📂 Structure du Projet (Vue Simplifiée)
Le projet suit une structure React standard :

/src
├── /components         # Composants réutilisables (boutons, en-têtes, etc.)
├── /pages              # Composants qui représentent des pages entières
│   ├── Dashboard.tsx   # Tableau de bord principal
│   ├── Login.tsx       # Page de connexion
│   ├── SignUp.tsx      # Page d'inscription
│   └── VerifyEmail.tsx # Page de soumission KYC et vérification (Thème Sombre)
├── /hooks              # Hooks personnalisés (ex: pour la gestion des données utilisateur)
├── App.tsx             # Configuration du Router
├── index.tsx           # Point d'entrée
└── tailwind.css        # Fichier CSS d'entrée pour Tailwind
Focus sur VerifyEmail.tsx
La page de vérification d'identité (VerifyEmail.tsx) a été simplifiée pour ne contenir que le formulaire KYC (soumission des trois documents).

Elle gère la soumission des fichiers en utilisant FormData (multipart/form-data).

Elle affiche un message de succès après la soumission et met fin au flux du formulaire.

Elle est configurée avec des classes Tailwind CSS sombres pour correspondre au thème de votre application.
