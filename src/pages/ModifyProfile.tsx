import React, { useState, useEffect, useRef } from 'react';
// Importations shadcn/ui
import { Button } from '@/components/ui/button'; 
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
// Icônes
import { User, Loader2, Send, List, Trash2, Edit, X, Plus } from 'lucide-react';

// --- Configuration des APIs ---
const API_AUTH_ME_URL = "http://localhost:9090/api/auth/me";
const API_MY_POSTS_URL = "http://localhost:9090/api/posts/my-posts"; 
const API_POSTS_URL = "http://localhost:9090/api/posts"; 

// --- Types de Données ---
interface UserInfo {
    // Gardé, même si souvent null, pour l'état interne
    clientId: number | null; 
    firstName: string;
}

interface UserPost {
    idPost: number;
    clientId: number; 
    nomUser: string;
    contenu: string;
    date: string; 
    photoPost: string | null; 
}

// ======================================================================
// 🧩 COMPOSANT INTERNE: PostModal (Gestion de la Création et Modification)
// ======================================================================

interface PostModalProps {
    nomUser: string; // Seul le nom est nécessaire pour le formulaire
    onPostCreated: () => void;
    isEditMode?: boolean; 
    editingPost?: UserPost | null; 
    onClose: () => void;
}

const PostModal: React.FC<PostModalProps> = ({ 
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
            setIsOpen(true);
        }
    }, [isEditMode, editingPost]);
    
    const handleClose = (open: boolean) => {
        setIsOpen(open);
        if (!open) {
            onClose(); 
            setContenu('');
            setPhotoFile(null);
            setError('');
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
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
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // La VÉRIFICATION D'AUTHENTIFICATION est désormais gérée par le serveur via la session.
        if (contenu.trim() === '' && photoFile === null && !isEditMode) {
            setError("Veuillez saisir du contenu ou ajouter une photo.");
            return;
        }
        
        setLoading(true);

        const formData = new FormData();
        
        // 🚨 Ne pas envoyer clientId : Le backend le récupère de la session.
        // formData.append("clientId", String(clientId)); // Ligne retirée

        // nomUser est envoyé pour être stocké dans le modèle Post du backend
        formData.append("nomUser", nomUser); 
        formData.append("contenu", contenu);
        
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
                credentials: 'include', // ESSENTIEL pour l'authentification par session
            });

            if (response.ok) {
                onPostCreated(); 
                handleClose(false);
            } else {
                let errorMsg = `Erreur du serveur (${response.status}).`;
                if (response.status === 401 || response.status === 403) {
                     errorMsg = "Accès refusé. Vous n'êtes pas connecté ou autorisé.";
                }
                
                try {
                    const errorText = await response.text();
                    console.error("Erreur détaillée du serveur:", errorText);
                    if (errorText.length < 200) errorMsg = errorText; 
                } catch { /* Ignorer */ }
                
                setError(errorMsg);
            }
        } catch (err) {
            setError("Erreur réseau. Impossible de contacter le serveur.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const dialogTitle = isEditMode ? "Modifier votre Publication" : "Créer une Nouvelle Publication";
    const submitIcon = isEditMode ? <Edit className="w-5 h-5 mr-2" /> : <Send className="w-5 h-5 mr-2" />;
    const submitText = isEditMode ? "Sauvegarder" : "Publier";
    
    const triggerButton = (
        <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90">
            <Plus className="w-5 h-5" /> Nouvelle Publication
        </Button>
    );

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            {!isEditMode && (
                 <DialogTrigger asChild>
                    {triggerButton}
                 </DialogTrigger>
            )}
           
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-primary">{dialogTitle}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div>
                        <label htmlFor="contenu" className="text-sm font-medium mb-2 block">
                            Contenu de la publication
                        </label>
                        <Textarea
                            id="contenu"
                            placeholder="Partagez vos pensées..."
                            value={contenu}
                            onChange={(e) => setContenu(e.target.value)}
                            rows={5}
                            disabled={loading}
                            className="resize-none"
                        />
                    </div>

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
                            className="cursor-pointer"
                        />
                        {(photoFile || (isEditMode && editingPost?.photoPost)) && (
                             <p className="text-xs text-muted-foreground">
                                {photoFile ? `📎 ${photoFile.name}` : '📷 Photo existante'}
                            </p>
                        )}
                    </div>
                    
                    {error && (
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                            <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                <X className="w-4 h-4" /> {error}
                            </p>
                        </div>
                    )}
                
                    <DialogFooter className="gap-2 pt-4">
                         <Button 
                            type="button"
                            variant="outline"
                            onClick={() => handleClose(false)}
                            disabled={loading}
                        >
                            Annuler
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading || (contenu.trim() === '' && photoFile === null && !isEditMode)}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    {isEditMode ? "Sauvegarde..." : "Publication..."}
                                </>
                            ) : (
                                <>
                                    {submitIcon}
                                    {submitText}
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};


// ======================================================================
// 🚀 COMPOSANT PRINCIPAL: ModifyProfile
// ======================================================================

const ModifyProfile: React.FC = () => {
    // La valeur par défaut 'Utilisateur' indique que l'utilisateur n'est pas identifié.
    const [userData, setUserData] = useState<UserInfo>({ clientId: null, firstName: 'Utilisateur' }); 
    const [loading, setLoading] = useState(true);
    const [userPosts, setUserPosts] = useState<UserPost[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    
    const [editingPost, setEditingPost] = useState<UserPost | null>(null); 
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    // ----------------------------------------------------------------------
    // 1. LOGIQUE DE RÉCUPÉRATION (PROFIL & POSTS)
    // ----------------------------------------------------------------------
    
    const fetchUserData = async () => {
        setLoading(true);
        
        try {
            const response = await fetch(API_AUTH_ME_URL, { 
                credentials: 'include', // Essentiel pour envoyer le cookie de session
            });
            
            console.log('🔍 Auth Response Status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Raw API Response:', JSON.stringify(data, null, 2));
                
                // On essaie toujours d'extraire l'ID (au cas où le backend change)
                const rawClientId = data.clientId || data.ClientId || data.client_id || 
                                    data.id || data.userId || data.user_id || null;
                
                const firstName = data.firstName || data.FirstName || data.first_name || 
                                  data.name || data.username || 'Utilisateur';
                
                const realClientId = (rawClientId === 0 || rawClientId) ? Number(rawClientId) : null;
                
                const fetchedUserData = {
                    clientId: realClientId, 
                    firstName: firstName,
                };

                setUserData(fetchedUserData);
                
                // L'utilisateur est considéré comme authentifié si un prénom est retourné (statut 200)
                if (firstName !== 'Utilisateur') {
                    console.log('✅ Client authentifié (par le nom). Chargement des posts via session.');
                    fetchUserPosts(); 
                } else {
                    console.warn('⚠️ Échec de l\'authentification (Nom non trouvé).');
                }
            } else {
                console.error('❌ Failed to fetch user data:', response.status);
                setUserData({ clientId: null, firstName: 'Utilisateur' }); // Déconnexion visuelle
            }
        } catch (error) {
            console.error("🚨 Network error fetching user data:", error);
            setUserData({ clientId: null, firstName: 'Utilisateur' }); // Déconnexion visuelle
        } finally {
            setLoading(false);
        }
    };

    const fetchUserPosts = async () => {
        setPostsLoading(true);
        try {
            // L'API /my-posts se fie au cookie de session pour identifier l'utilisateur
            const response = await fetch(API_MY_POSTS_URL, { credentials: 'include' });
            
            if (response.ok) {
                const data: UserPost[] = await response.json();
                setUserPosts(data);
            } else {
                // Si la session expire, on force la déconnexion visuelle
                if (response.status === 401 || response.status === 403) {
                     console.warn("Session expirée ou utilisateur non autorisé.");
                     setUserData({ clientId: null, firstName: 'Utilisateur' });
                } else {
                     console.error('Failed to fetch user posts:', response.status);
                }
                setUserPosts([]); 
            }
        } catch (error) {
            console.error("Network error fetching user posts:", error);
            setUserPosts([]);
        } finally {
            setPostsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchUserData();
    }, []); 

    // ----------------------------------------------------------------------
    // 2. GESTION DES POSTS (AJOUT/ÉDITION/SUPPRESSION)
    // ----------------------------------------------------------------------

    const handlePostCreatedOrUpdated = () => {
        fetchUserPosts();
        setIsEditModalOpen(false); 
        setEditingPost(null); 
    };
    
    const handleEditPost = (post: UserPost) => {
        setEditingPost(post);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (postId: number) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette publication ?")) {
            return;
        }

        try {
            // L'API DELETE se fie au cookie de session
            const response = await fetch(`${API_POSTS_URL}/${postId}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.status === 204 || response.ok) {
                console.log(`Post ${postId} supprimé avec succès.`);
                fetchUserPosts(); 
            } else if (response.status === 403) {
                alert("Erreur: Vous n'êtes pas autorisé à supprimer ce post.");
            } else {
                console.error('Failed to delete post:', response.status);
                alert("Échec de la suppression du post.");
            }
        } catch (error) {
            console.error("Network error during delete:", error);
            alert("Erreur réseau lors de la suppression.");
        }
    };

    // ----------------------------------------------------------------------
    // 3. RENDU DES POSTS (Méthode inchangée)
    // ----------------------------------------------------------------------

    const renderPostCard = (post: UserPost) => {
        const formattedDate = new Date(post.date).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
        const photoSrc = post.photoPost 
            ? `data:image/jpeg;base64,${post.photoPost}` 
            : null;

        return (
            <Card key={post.idPost} className="bg-card border shadow-sm hover:shadow-md transition-all duration-200">
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
                <CardFooter className="flex justify-end gap-2 pt-0 border-t mt-4 pt-4">
                    <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditPost(post)}
                        className="gap-1"
                    >
                        <Edit className="w-4 h-4" /> Modifier
                    </Button>
                    <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(post.idPost)}
                        className="gap-1"
                    >
                        <Trash2 className="w-4 h-4" /> Supprimer
                    </Button>
                </CardFooter>
            </Card>
        );
    };

    // ----------------------------------------------------------------------
    // 4. RENDU FINAL 
    // ----------------------------------------------------------------------

    // L'utilisateur est authentifié si un prénom a été récupéré
    const isAuthenticated = userData.firstName !== 'Utilisateur';

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-full min-h-[400px] text-primary">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="text-lg">Chargement du profil...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-8 max-w-md">
                    <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 mb-4">Accès Refusé 🔒</h1>
                    <p className="text-lg text-muted-foreground">
                        Vous devez être connecté pour voir et gérer vos publications.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto p-4">
            {/* En-tête et Bouton de Création */}
            <div className="flex items-center justify-between border-b pb-4">
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                    <User className="w-8 h-8 text-primary" /> Mon Activité
                </h1>
                <PostModal 
                    nomUser={userData.firstName} 
                    onPostCreated={handlePostCreatedOrUpdated} 
                    onClose={() => {}} 
                />
            </div>

            {/* Liste des Posts */}
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <List className="w-6 h-6 text-primary" /> 
                        Mes Publications 
                        <span className="text-base text-muted-foreground ml-2">({userPosts.length})</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {postsLoading && (
                        <div className="flex justify-center items-center p-8 text-primary">
                            <Loader2 className="w-6 h-6 animate-spin mr-2" /> 
                            Chargement des publications...
                        </div>
                    )}
                    
                    {!postsLoading && userPosts.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-lg">
                            <p className="text-lg mb-2">📝 Aucune publication pour le moment</p>
                            <p className="text-sm">Créez votre première publication pour commencer !</p>
                        </div>
                    )}

                    {!postsLoading && userPosts.length > 0 && (
                        <div className="space-y-4">
                            {userPosts.map(renderPostCard)}
                        </div>
                    )}
                </CardContent>
            </Card>
            
            {/* Modal d'Édition - Affiché conditionnellement */}
            {isEditModalOpen && editingPost && (
                <PostModal 
                    isEditMode={true}
                    editingPost={editingPost}
                    nomUser={userData.firstName}
                    onPostCreated={handlePostCreatedOrUpdated}
                    onClose={() => { setIsEditModalOpen(false); setEditingPost(null); }} 
                />
            )}
        </div>
    );
};

export default ModifyProfile;