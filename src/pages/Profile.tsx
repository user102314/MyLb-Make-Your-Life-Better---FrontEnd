import { useState, useEffect, useRef, ChangeEvent, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { User, Loader2, CheckCircle, ArrowLeft, Mail, Phone, Calendar, Shield } from "lucide-react";

interface SelfDetail {
  usagePurpose: string | null;
  cinNumber: string | null;
  phoneNumber: string | null;
}

interface ClientData {
  clientId: number;
  firstName: string;
  lastName: string;
  birthDate: string; 
  role: string;
  isVerified: boolean;
  email: string;
  profileImage: null; 
  selfDetail: SelfDetail;
}

interface ApiResponse {
    client: ClientData;
    profileImageBase64: string | null;
}

const API_BASE_URL = "http://localhost:9090/api/client"; 

const Profile = () => {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/me`, {
          method: 'GET',
          credentials: 'include', 
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.status === 401) {
          setError("Session expirée ou non connecté. Veuillez vous reconnecter.");
          return;
        }

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des données du profil.");
        }

        const apiResponse: ApiResponse = await response.json();
        const data: ClientData = apiResponse.client;
        const base64Image: string | null = apiResponse.profileImageBase64;

        if (base64Image) {
            setProfilePicPreview(`data:image/jpeg;base64,${base64Image}`);
        } else {
            setProfilePicPreview(null);
        }
        
        setClientData(data); 
        
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Impossible de joindre le serveur ou de charger le profil.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []); 
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };
  
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    alert("Fonction de changement d'image désactivée en lecture seule.");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[80vh]"> 
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  if (error || !clientData) {
    return (
      <div className="flex flex-col items-center justify-center text-center w-full h-full min-h-[80vh] p-8">
        <div className="glass-effect rounded-2xl p-12 max-w-md">
          <h1 className="text-2xl font-bold text-destructive mb-4">Erreur de chargement</h1>
          <p className="text-muted-foreground mb-6">{error || "Aucune donnée client disponible."}</p>
          <Link to="/login">
            <Button variant="outline" className="w-full">
              Se reconnecter
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const { firstName, lastName, birthDate, role, isVerified, email, selfDetail } = clientData;
  const phone = selfDetail?.phoneNumber || 'N/A';
  const cinNumber = selfDetail?.cinNumber || 'N/A';
  const usagePurpose = selfDetail?.usagePurpose || 'N/A';

  return (
     <div className="min-h-full w-full h-full p-6">
      <div className="max-w-7xl w-full h-full">
        {/* Header avec animation */}
        <header className="mb-6 glass-effect rounded-2xl p-5 border border-primary/20 transition-smooth hover:border-primary/40">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                Profil Utilisateur
              </h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Informations du compte en mode lecture seule.
              </p>
            </div>
            <Link to="/dashboard">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Retour
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Carte Photo de profil et infos principales */}
          <div className="lg:col-span-1">
            <div className="glass-effect rounded-2xl p-5 border border-border">
              <div className="flex flex-col items-center space-y-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                  disabled 
                />
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-glow rounded-full blur opacity-75 group-hover:opacity-100 transition-smooth"></div>
                  <div className="relative w-32 h-32 rounded-full bg-muted border-4 border-primary/50 flex items-center justify-center overflow-hidden">
                    {profilePicPreview ? (
                      <img src={profilePicPreview} alt="Profil" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-16 h-16 text-primary" />
                    )}
                  </div>
                </div>
                
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {firstName} {lastName}
                  </h2>
                  <div className="flex items-center justify-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium">
                      {role}
                    </span>
                    {isVerified && (
                      <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Vérifié
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Info Cards */}
                <div className="w-full space-y-3 mt-6">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <Mail className="w-5 h-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm font-medium truncate">{email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <Phone className="w-5 h-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Téléphone</p>
                      <p className="text-sm font-medium">{phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">Date de naissance</p>
                      <p className="text-sm font-medium">{new Date(birthDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                    <Shield className="w-5 h-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">N° CIN</p>
                      <p className="text-sm font-medium">{cinNumber}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire détaillé */}
          <div className="lg:col-span-2">
            <div className="glass-effect rounded-2xl p-6 border border-border">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-primary to-primary-glow rounded-full"></div>
                Informations détaillées
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Identité */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Identité</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Nom</Label>
                      <Input 
                        value={lastName} 
                        disabled 
                        className="bg-muted/50 border-border focus:border-primary transition-smooth"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Prénom</Label>
                      <Input 
                        value={firstName} 
                        disabled 
                        className="bg-muted/50 border-border focus:border-primary transition-smooth"
                      />
                    </div>
                  </div>
                </div>

                {/* Informations personnelles */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Informations personnelles</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Date de naissance</Label>
                      <Input 
                        type="date" 
                        value={birthDate} 
                        disabled 
                        className="bg-muted/50 border-border focus:border-primary transition-smooth"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">N° CIN</Label>
                      <Input 
                        value={cinNumber} 
                        disabled 
                        className="bg-muted/50 border-border focus:border-primary transition-smooth"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Email</Label>
                      <Input 
                        type="email" 
                        value={email} 
                        disabled 
                        className="bg-muted/50 border-border focus:border-primary transition-smooth"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Téléphone</Label>
                      <Input 
                        type="tel" 
                        value={phone} 
                        disabled 
                        className="bg-muted/50 border-border focus:border-primary transition-smooth"
                      />
                    </div>
                  </div>
                </div>

                {/* Compte */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Compte</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Rôle</Label>
                      <Input 
                        value={role} 
                        disabled 
                        className="bg-muted/50 border-border focus:border-primary transition-smooth"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium flex items-center gap-2">
                        Statut
                        {isVerified && <CheckCircle className="w-4 h-4 text-green-400" />}
                      </Label>
                      <Input 
                        value={isVerified ? "Vérifié" : "Non Vérifié"} 
                        disabled 
                        className="bg-muted/50 border-border focus:border-primary transition-smooth"
                      />
                    </div>
                  </div>
                </div>

                {/* Objectif */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Objectif</h4>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Objectif d'utilisation</Label>
                    <Input 
                      value={usagePurpose} 
                      disabled 
                      className="bg-muted/50 border-border focus:border-primary transition-smooth"
                    />
                  </div>
                </div>
                
                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full py-6 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-smooth text-lg font-semibold"
                    disabled
                    title="Formulaire en mode lecture seule"
                  >
                    Enregistrer les modifications (Désactivé)
                  </Button>
                  <p className="text-center text-sm mt-4 text-muted-foreground">
                    Ce formulaire est en mode lecture seule
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
