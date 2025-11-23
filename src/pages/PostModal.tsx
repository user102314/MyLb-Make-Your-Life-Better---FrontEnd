import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Send, Edit, Plus, Loader2, X } from 'lucide-react';

// --- Configuration des APIs ---
const API_POSTS_URL = "http://localhost:9090/api/posts";

// --- Types de Props ---
interface UserPost {
    idPost: number;
    clientId: number;
    nomUser: string;
    contenu: string;
    date: string; 
    photoPost: string | null; 
}

interface PostModalProps {
    clientId: number | null;
    nomUser: string;
    onPostCreated: () => void; // Fonction de rafraîchissement après succès
    isEditMode?: boolean; 
    editingPost?: UserPost | null; 
    onClose?: () => void; 
}

const PostModal: React.FC<PostModalProps> = ({ 
    clientId, 
    nomUser, 
    onPostCreated, 
    isEditMode = false, 
    editingPost = null,
    onClose 
}) => {
    const [isOpen, setIsOpen] = useState(isEditMode); 
    
    const [contenu, setContenu] = useState(editingPost?.contenu || '');
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditMode && editingPost) {
            setContenu(editingPost.contenu || '');
        }
    }, [isEditMode, editingPost]);
    
    const handleClose = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            resetForm(); // Réinitialiser après fermeture
            if (isEditMode && onClose) {
                onClose();
            }
        }
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setPhotoFile(e.target.files[0]);
        } else {
            setPhotoFile(null);
        }
    };
    
    const resetForm = () => {
        setContenu(isEditMode && editingPost ? editingPost.contenu : ''); // Conserver le contenu en mode édition
        setPhotoFile(null);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (clientId === null) {
            setError("Erreur d'authentification. L'ID utilisateur est manquant.");
            return;
        }

        if (contenu.trim() === '' && photoFile === null && !isEditMode) {
            setError("Veuillez saisir du contenu ou ajouter une photo.");
            return;
        }
        
        setLoading(true);

        const formData = new FormData();
        
        // 🚨 ATTENTION: S'assurer que les clés 'clientId', 'nomUser', 'contenu' 
        // correspondent EXACTEMENT aux noms attendus par votre Backend Spring Boot (@RequestParam)
        formData.append("clientId", clientId.toString());
        formData.append("nomUser", nomUser);
        formData.append("contenu", contenu);
        
        // 🚨 ATTENTION: S'assurer que la clé 'photo' 
        // correspond EXACTEMENT au nom attendu par votre Backend (@RequestParam("photo"))
        if (photoFile) {
            formData.append("photo", photoFile);
        } 
        
        const url = isEditMode && editingPost 
            ? `${API_POSTS_URL}/${editingPost.idPost}` 
            : API_POSTS_URL;
        
        const method = isEditMode ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                body: formData,
                credentials: 'include',
            });

            if (response.ok) {
                onPostCreated(); 
                setIsOpen(false); // Ferme le modal via l'état local
            } else {
                let errorMsg = `Erreur du serveur (${response.status}).`;
                if (response.status === 404) {
                    errorMsg = `Échec: Endpoint Backend introuvable (404). Vérifiez l'URL: ${url}`;
                } else if (response.status === 403) {
                    errorMsg = "Accès refusé. Vous n'êtes pas autorisé.";
                } else if (response.status === 400) {
                     errorMsg = "Données invalides envoyées au serveur (400 Bad Request).";
                }
                
                // Tenter de lire le message d'erreur du body si possible
                try {
                    const errorText = await response.text();
                    console.error("Erreur détaillée du serveur:", errorText);
                    // Remplacer par un message plus spécifique si disponible
                    if (errorText.length < 200) errorMsg = errorText; 
                } catch {
                    // Ignorer si la lecture échoue
                }
                
                setError(errorMsg);
            }
        } catch (err) {
            setError("Erreur réseau. Impossible de contacter le serveur.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // ----------------------------------------------------------------------
    // RENDU (Utilise Dialog pour gérer l'ouverture/fermeture)
    // ----------------------------------------------------------------------

    const triggerButton = (
        <Button className="flex items-center gap-2">
            <Plus className="w-5 h-5" /> Nouvelle Publication
        </Button>
    );

    const dialogTitle = isEditMode ? "Modifier votre Publication" : "Créer une Nouvelle Publication";
    const submitIcon = isEditMode ? <Edit className="w-5 h-5 mr-2" /> : <Send className="w-5 h-5 mr-2" />;
    const submitText = isEditMode ? "Sauvegarder" : "Publier";
    
    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            {/* Si c'est le mode création, on a besoin du Trigger */}
            {!isEditMode && (
                 <DialogTrigger asChild>
                    {triggerButton}
                 </DialogTrigger>
            )}
           
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="text-primary">{dialogTitle}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                        id="contenu"
                        placeholder="Exprimez-vous ici..."
                        value={contenu}
                        onChange={(e) => setContenu(e.target.value)}
                        rows={4}
                        disabled={loading}
                    />

                    <div className="flex flex-col space-y-2">
                        <label htmlFor="photo" className="text-sm font-medium">
                            Photo (optionnel)
                        </label>
                        <Input
                            id="photo"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            disabled={loading}
                        />
                        {photoFile && <p className="text-xs text-muted-foreground">Fichier sélectionné : {photoFile.name}</p>}
                    </div>
                    
                    {error && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                            <X className="w-4 h-4" /> **Erreur:** {error}
                        </p>
                    )}
                
                    <DialogFooter>
                        <Button 
                            type="submit" 
                            disabled={loading || (contenu.trim() === '' && photoFile === null)}
                            className="w-full"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : submitIcon}
                            {loading ? (isEditMode ? "Sauvegarde..." : "Publication...") : submitText}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default PostModal;