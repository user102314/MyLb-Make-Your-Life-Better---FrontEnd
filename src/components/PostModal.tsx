import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { ImagePlus, Loader2, Send } from 'lucide-react';

// URL du contrôleur Spring pour la création de post
const API_POST_URL = "http://localhost:9090/api/posts";

interface PostModalProps {
    // Infos du Backend (obtenues via /api/auth/me)
    clientId: number | null;
    nomUser: string;
    onPostCreated: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ clientId, nomUser, onPostCreated }) => {
    const [contenu, setContenu] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0]);
        } else {
            setPhoto(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatusMessage({ type: null, message: '' });

        if (clientId === null) {
            setStatusMessage({ type: 'error', message: 'User not authenticated (Client ID missing).' });
            return;
        }
        if (!contenu.trim() && photo === null) {
            setStatusMessage({ type: 'error', message: 'Post cannot be empty.' });
            return;
        }

        setLoading(true);

        const formData = new FormData();
        // Les noms des champs DOIVENT correspondre exactement à ceux attendus par le @RequestParam du contrôleur Spring !
        formData.append('clientId', String(clientId));
        formData.append('nomUser', nomUser);
        formData.append('contenu', contenu.trim());
        if (photo) {
            formData.append('photo', photo); // 'photo' est le nom du paramètre dans le contrôleur Spring
        }

        try {
            const response = await fetch(API_POST_URL, {
                method: 'POST',
                body: formData,
                credentials: 'include', // Important pour l'authentification par session
            });

            if (response.ok) {
                setStatusMessage({ type: 'success', message: 'Post created successfully! 🚀' });
                setContenu('');
                setPhoto(null);
                if(fileInputRef.current) fileInputRef.current.value = '';
                onPostCreated(); // Callback pour rafraîchir la liste des posts

            } else {
                const errorData = await response.json();
                const errorMessage = errorData.message || `Server error (${response.status}).`;
                setStatusMessage({ type: 'error', message: `Failed: ${errorMessage}` });
            }
        } catch (error) {
            console.error("Network or API error:", error);
            setStatusMessage({ type: 'error', message: 'Network error. Could not reach API.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base shadow-lg shadow-primary/30">
                    <ImagePlus className="w-5 h-5 mr-2" />
                    Créer un Post
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card text-foreground border-border/50">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-primary flex items-center gap-2">
                        <Send className="w-5 h-5" /> Nouveau Post
                    </DialogTitle>
                </DialogHeader>
                
                {statusMessage.type && (
                    <div className={`p-3 rounded-lg text-sm font-medium ${
                        statusMessage.type === 'success' 
                        ? 'bg-green-600/20 text-green-300 border border-green-700/50' 
                        : 'bg-red-600/20 text-red-300 border border-red-700/50'
                    }`}>
                        {statusMessage.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="contenu" className="text-foreground">Contenu du Post</Label>
                        <Textarea
                            id="contenu"
                            placeholder="Partagez vos pensées..."
                            value={contenu}
                            onChange={(e) => setContenu(e.target.value)}
                            disabled={loading}
                            className="bg-background/50 border-border/50 min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="photo" className="text-foreground flex items-center gap-2">
                            Photo (Optionnel)
                            {photo && <span className="text-xs text-primary/70">({photo.name})</span>}
                        </Label>
                        <Input
                            id="photo"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            ref={fileInputRef}
                            disabled={loading}
                            className="bg-background/50 border-border/50"
                        />
                    </div>
                    
                    <Button 
                        type="submit" 
                        className="w-full py-6 bg-primary hover:bg-primary/90 font-bold"
                        disabled={loading || (!contenu.trim() && photo === null)}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Publication...
                            </>
                        ) : (
                            <>
                                Publier le Post <Send className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default PostModal;