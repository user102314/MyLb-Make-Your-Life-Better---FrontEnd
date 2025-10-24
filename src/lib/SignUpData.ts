// src/lib/types.ts (ou dans le fichier de votre composant d'inscription)

// Les champs texte doivent correspondre au DTO SignUpRequest du Backend
export interface SignUpData {
    firstName: string;
    lastName: string;
    birthDate: string; // Laisser en string 'YYYY-MM-DD' pour les inputs HTML
    email: string;
    password: string;
}

// L'image est gérée séparément