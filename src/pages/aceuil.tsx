import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Importations shadcn/ui
import { Button } from '@/components/ui/button'; 
import { Card, CardContent, CardHeader } from '@/components/ui/card';
// Icônes
import { User, Loader2, Plus } from 'lucide-react';

// --- Configuration des APIs ---
const API_POSTS_URL = "http://localhost:9090/api/posts"; 

// --- Types de Données ---
interface UserPost {
    idPost: number;
    clientId: number; 
    nomUser: string;
    contenu: string;
    date: string; 
    photoPost: string | null; 
}

// ======================================================================
// 🚀 COMPOSANT PRINCIPAL: Accueil
// ======================================================================

const Accueil: React.FC = () => {
    const navigate = useNavigate();
    const [allPosts, setAllPosts] = useState<UserPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Récupérer tous les posts
    const fetchAllPosts = async () => {
        setLoading(true);
        setError('');
        
        try {
            const response = await fetch(API_POSTS_URL, {
                credentials: 'include',
            });
            
            if (response.ok) {
                const data: UserPost[] = await response.json();
                setAllPosts(data);
            } else {
                setError('Erreur lors du chargement des publications');
                console.error('Failed to fetch posts:', response.status);
            }
        } catch (err) {
            setError('Erreur réseau. Impossible de charger les publications.');
            console.error("Network error fetching posts:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllPosts();
    }, []);

    // Navigation vers la page de création de post
    const handleNavigateToCreatePost = () => {
        navigate('/Editprofile');
    };

    // Rendu d'une carte de post
    const renderPostCard = (post: UserPost) => {
        const formattedDate = new Date(post.date).toLocaleDateString('fr-FR', {
            day: 'numeric', 
            month: 'short', 
            year: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit'
        });
        
        const photoSrc = post.photoPost 
            ? `data:image/jpeg;base64,${post.photoPost}` 
            : null;

        return (
            <Card key={post.idPost} className="bg-card border shadow-sm hover:shadow-md transition-all duration-200 mb-4">
                <CardHeader className="flex flex-row items-start justify-between pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <div className="font-semibold text-foreground">{post.nomUser}</div>
                            <div className="text-xs text-muted-foreground">{formattedDate}</div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                    <p className="text-foreground whitespace-pre-wrap leading-relaxed">{post.contenu}</p>
                    
                    {photoSrc && (
                        <div className="mt-3 rounded-lg overflow-hidden border">
                            <img 
                                src={photoSrc} 
                                alt={`Image du post ${post.idPost}`} 
                                className="w-full h-auto max-h-96 object-cover"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-4">
            {/* En-tête et Bouton de Création */}
            <div className="flex items-center justify-between border-b pb-4">
                <h1 className="text-3xl font-bold text-foreground">
                    Fil d'Actualité
                </h1>
                <Button 
                    onClick={handleNavigateToCreatePost}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90"
                >
                    <Plus className="w-5 h-5" /> Nouvelle Publication
                </Button>
            </div>

            {/* Liste de tous les Posts */}
            <div className="space-y-4">
                {loading && (
                    <div className="flex justify-center items-center p-8 text-primary">
                        <Loader2 className="w-8 h-8 animate-spin mr-3" /> 
                        <span className="text-lg">Chargement des publications...</span>
                    </div>
                )}
                
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
                        <Button 
                            onClick={fetchAllPosts}
                            variant="outline" 
                            className="mt-2"
                        >
                            Réessayer
                        </Button>
                    </div>
                )}

                {!loading && !error && allPosts.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                        <p className="text-lg mb-2">📝 Aucune publication pour le moment</p>
                        <p className="text-sm">Soyez le premier à publier quelque chose !</p>
                    </div>
                )}

                {!loading && !error && allPosts.length > 0 && (
                    <div>
                        <p className="text-sm text-muted-foreground mb-4">
                            {allPosts.length} publication{allPosts.length > 1 ? 's' : ''} au total
                        </p>
                        <div className="space-y-4">
                            {allPosts.map(renderPostCard)}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Accueil;