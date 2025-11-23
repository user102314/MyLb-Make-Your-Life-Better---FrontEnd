// src/components/layout/Footer.tsx
import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
    return (
        <footer className="w-full mt-12 py-6 border-t border-border/50 bg-background/80 backdrop-blur-md">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground">
                
                {/* 1. Droits d'auteur */}
                <p className="order-2 md:order-1 mt-4 md:mt-0 text-center md:text-left">
                    &copy; {new Date().getFullYear()} <span className="text-primary font-semibold">MyLB</span>. Tous droits réservés.
                </p>

                {/* 2. Liens rapides */}
                <div className="order-1 md:order-2 flex space-x-6">
                    <Link to="/legal" className="hover:text-primary transition-colors">
                        Mentions Légales
                    </Link>
                    <Link to="/privacy" className="hover:text-primary transition-colors">
                        Politique de Confidentialité
                    </Link>
                    <Link to="/contact" className="hover:text-primary transition-colors">
                        Contact
                    </Link>
                </div>

                {/* 3. Réseaux Sociaux (Optionnel) */}
                <div className="order-3 mt-4 md:mt-0 flex space-x-4">
                    <a href="https://github.com/votre_profil" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                        <Github className="w-5 h-5" />
                    </a>
                    <a href="https://twitter.com/votre_profil" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                        <Twitter className="w-5 h-5" />
                    </a>
                    <a href="https://linkedin.com/in/votre_profil" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                        <Linkedin className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;