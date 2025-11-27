import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  Filter, 
  Trash2, 
  RefreshCw,
  ArrowLeft,
  MessageSquare,
  Calendar,
  User,
  CheckCheck,
  Clock,
  Info 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger, 
  DialogClose
} from '@/components/ui/dialog';

// Configuration de l'API
const BASE_URL = "http://localhost:9090";
const API_NOTIFICATIONS_URL = `${BASE_URL}/api/notifications`;
const API_AUTH_CHECK_URL = `${BASE_URL}/api/client/name`;

interface Notification {
  idNotification: number;
  sujet: string;
  description: string;
  dateCreation: string;
  etat: number;
  idClient: number;
  statut: string;
}

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [processing, setProcessing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('non-lues');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fonction utilitaire pour les appels API
  const apiCall = async <T,>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T | null> => {
    try {
      const fetchOptions: RequestInit = {
        credentials: 'include',
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers as Record<string, string> || {}),
        },
      };

      const response = await fetch(url, fetchOptions);
      
      if (!response.ok) {
        if (response.status === 401) {
          navigate('/login', { replace: true });
          throw new Error('Session expirée. Veuillez vous reconnecter.');
        }

        const errorBody = await response.text();
        let errorMessage = `Erreur ${response.status}`;
        
        if (errorBody) {
          try {
            const jsonError = JSON.parse(errorBody);
            errorMessage = jsonError.error || jsonError.message || errorMessage;
          } catch {
            errorMessage = errorBody.length > 100 ? errorMessage : errorBody;
          }
        }
        throw new Error(errorMessage); 
      }

      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null as T;
      }

      return await response.json();
    } catch (err) {
      console.error(`API Error [${url}]:`, err);
      if (err instanceof Error) throw err;
      throw new Error('Erreur de connexion inconnue.');
    }
  };

  // Chargement des données
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Charger toutes les notifications
      const notificationsData = await apiCall<Notification[]>(API_NOTIFICATIONS_URL);
      if (notificationsData) {
        setNotifications(notificationsData);
        applyFilter(activeTab, notificationsData);
      }

      // Charger le nombre de notifications non lues
      const unreadData = await apiCall<{ nombreNonLues: number }>(`${API_NOTIFICATIONS_URL}/nombre-non-lues`);
      if (unreadData) {
        setUnreadCount(unreadData.nombreNonLues);
      } else {
        setUnreadCount(notificationsData?.filter(n => n.etat === 0).length || 0);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement des notifications.';
      setError(errorMessage);
      // Ne pas rediriger ici, c'est déjà fait dans apiCall si c'est une erreur 401
    } finally {
      setLoading(false);
    }
  };

  // Appliquer le filtre
  const applyFilter = (tab: string, notificationsList: Notification[] = notifications) => {
    let filtered: Notification[] = [];

    switch (tab) {
      case 'non-lues':
        filtered = notificationsList.filter(notif => notif.etat === 0);
        break;
      case 'lues':
        filtered = notificationsList.filter(notif => notif.etat === 1);
        break;
      case 'toutes':
        filtered = notificationsList;
        break;
      default:
        filtered = notificationsList.filter(notif => notif.etat === 0);
    }

    filtered.sort((a, b) => new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime());
    setFilteredNotifications(filtered);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilter(activeTab);
  }, [activeTab, notifications]);

  // Marquer une notification comme lue
  const markAsRead = async (idNotification: number) => {
    setProcessing(true);
    try {
      await apiCall<Notification>(`${API_NOTIFICATIONS_URL}/${idNotification}/marquer-lue`, {
        method: 'PUT'
      });
      setSuccessMessage('Notification marquée comme lue.');
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du marquage';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    setProcessing(true);
    try {
      await apiCall<{ message: string; status: string }>(`${API_NOTIFICATIONS_URL}/marquer-toutes-lues`, {
        method: 'PUT'
      });
      setSuccessMessage('Toutes les notifications ont été marquées comme lues.');
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du marquage global';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Supprimer une notification
  const deleteNotification = async (idNotification: number) => {
    setProcessing(true);
    try {
      await apiCall<{ message: string; status: string }>(`${API_NOTIFICATIONS_URL}/${idNotification}`, {
        method: 'DELETE'
      });
      setSuccessMessage('Notification supprimée avec succès.');
      setShowDetails(false);
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Nettoyer les notifications anciennes
  const cleanupOldNotifications = async () => {
    setProcessing(true);
    try {
      await apiCall<{ message: string; status: string; count: number }>(`${API_NOTIFICATIONS_URL}/nettoyer`, {
        method: 'DELETE'
      });
      setSuccessMessage('Nettoyage des notifications anciennes effectué avec succès.');
      await fetchData();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du nettoyage';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  // Fonctions utilitaires de formatage
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffDays === 0) {
      if (diffHours < 1) return 'À l\'instant';
      return 'Aujourd\'hui';
    } else if (diffDays === 1) {
      return 'Hier';
    } else if (diffDays < 7) {
      return `Il y a ${diffDays} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (sujet: string) => {
    if (sujet.includes('Bienvenue')) return <User className="w-5 h-5" />;
    if (sujet.includes('Achat') || sujet.includes('Vente')) return <CheckCircle className="w-5 h-5" />;
    if (sujet.includes('Dépôt')) return <CheckCheck className="w-5 h-5" />;
    return <MessageSquare className="w-5 h-5" />;
  };

  const getNotificationColor = (sujet: string) => {
    if (sujet.includes('Bienvenue')) return 'text-blue-400 bg-blue-500/20';
    if (sujet.includes('Achat')) return 'text-green-400 bg-green-500/20';
    if (sujet.includes('Vente')) return 'text-orange-400 bg-orange-500/20';
    if (sujet.includes('Dépôt')) return 'text-purple-400 bg-purple-500/20';
    return 'text-gray-400 bg-gray-500/20';
  };

  // Gestion des messages temporaires
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Chargement de vos notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au Tableau de Bord
            </Button>
            <div>
              <h1 className="text-3xl font-extrabold text-white">Mes Notifications</h1>
              <p className="text-slate-400 mt-1">Restez informé de vos activités et mises à jour importantes.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="bg-red-600 text-white font-semibold animate-pulse">
                {unreadCount} non lue(s)
              </Badge>
            )}
            <Button
              variant="outline"
              onClick={fetchData}
              disabled={processing}
              className="border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Messages d'alerte */}
        {error && (
          <Alert variant="destructive" className="mb-6 bg-red-900/30 border-red-700">
            <Info className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription className="text-red-300">{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="mb-6 bg-green-900/30 border-green-700">
            <CheckCircle className="h-4 w-4 text-green-400" />
            <AlertTitle className="text-green-400">Succès</AlertTitle>
            <AlertDescription className="text-green-300">{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Actions */}
          <div className="space-y-6">
            {/* Statistiques */}
            <Card className="bg-slate-800 border-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-xl">
                  <Bell className="w-5 h-5 text-purple-400" />
                  Aperçu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                  <span className="text-slate-300 font-medium">Notifications Totales</span>
                  <span className="text-white font-extrabold text-lg">{notifications.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Non lues</span>
                  <span className="text-red-400 font-extrabold text-lg">{unreadCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium">Lues</span>
                  <span className="text-green-400 font-extrabold text-lg">{notifications.length - unreadCount}</span>
                </div>
              </CardContent>
            </Card>

            {/* Actions Rapides */}
            <Card className="bg-slate-800 border-slate-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2 text-xl">
                  <Filter className="w-5 h-5 text-purple-400" />
                  Actions Rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={markAllAsRead}
                  disabled={processing || unreadCount === 0}
                  className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700/50 transition-colors disabled:opacity-50"
                >
                  <CheckCheck className="w-4 h-4 mr-2 text-green-400" />
                  Tout marquer comme lu
                </Button>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-red-700 text-red-400 hover:bg-red-700 hover:text-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Nettoyer les anciennes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-800 border-slate-700 text-white shadow-2xl">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-bold">Nettoyer les notifications</DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Êtes-vous certain de vouloir supprimer toutes les notifications de plus de 30 jours ? Cette action est irréversible.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row sm:justify-end gap-2">
                      <DialogClose asChild>
                        <Button
                          variant="outline"
                          className="border-slate-600 text-slate-300 hover:bg-slate-700/50"
                        >
                          Annuler
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button
                          onClick={cleanupOldNotifications}
                          disabled={processing}
                          className="bg-red-600 hover:bg-red-700 transition-colors"
                        >
                          {processing ? 'Nettoyage en cours...' : 'Confirmer et Nettoyer'}
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800 border-slate-700 shadow-2xl">
              <CardHeader className="p-4 sm:p-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 bg-slate-700 p-1">
                    <TabsTrigger value="non-lues" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                      <Bell className="w-4 h-4" />
                      Non lues
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs bg-red-600">
                          {unreadCount}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="lues" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                      <BellOff className="w-4 h-4" />
                      Lues
                    </TabsTrigger>
                    <TabsTrigger value="toutes" className="flex items-center gap-2 data-[state=active]:bg-purple-600 data-[state=active]:text-white">
                      <Filter className="w-4 h-4" />
                      Toutes
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 mx-auto mb-4 text-slate-600/50" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {activeTab === 'non-lues' ? 'Aucune notification non lue' : 
                       activeTab === 'lues' ? 'Historique de lecture vide' : 'Liste de notifications vide'}
                    </h3>
                    <p className="text-slate-400">
                      {activeTab === 'non-lues' 
                        ? 'Félicitations, vous êtes à jour sur toutes vos notifications !' 
                        : 'Aucune notification correspondant à ce filtre n\'a été trouvée.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.idNotification}
                        className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                          notification.etat === 0 
                            ? 'bg-slate-700/50 border-purple-600/50 hover:bg-slate-700/70 shadow-md' 
                            : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70'
                        }`}
                        onClick={() => {
                          setSelectedNotification(notification);
                          setShowDetails(true);
                          if (notification.etat === 0) {
                            markAsRead(notification.idNotification);
                          }
                        }}
                      >
                        <div className={`flex-shrink-0 p-3 rounded-full ${getNotificationColor(notification.sujet)}`}>
                          {getNotificationIcon(notification.sujet)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-bold ${
                                notification.etat === 0 ? 'text-white' : 'text-slate-300'
                              } text-base`}>
                                {notification.sujet}
                              </h4>
                              {notification.etat === 0 && (
                                <Badge variant="secondary" className="bg-blue-600 text-white text-xs font-semibold">
                                  Nouveau
                                </Badge>
                              )}
                            </div>
                            
                            <div className="flex-shrink-0 hidden sm:block">
                              {notification.etat === 1 && (
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              )}
                            </div>
                          </div>
                          
                          <p className="text-slate-400 text-sm mb-2 line-clamp-2">
                            {notification.description}
                          </p>
                          
                          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-400">{formatDate(notification.dateCreation)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-slate-500" />
                              <span className="text-slate-400">{formatTime(notification.dateCreation)}</span>
                            </div>
                            <Badge className={`h-5 px-2 text-xs font-semibold ${
                              notification.etat === 0 ? 'bg-red-600/30 text-red-400 border border-red-600' : 'bg-green-600/30 text-green-400 border border-green-600'
                            }`}
                              variant="outline"
                            >
                              {notification.statut}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Dialog des détails de notification */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg shadow-2xl">
          {selectedNotification && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3 text-xl font-bold">
                  <div className={`flex-shrink-0 p-3 rounded-full ${getNotificationColor(selectedNotification.sujet)}`}>
                    {getNotificationIcon(selectedNotification.sujet)}
                  </div>
                  {selectedNotification.sujet}
                </DialogTitle>
                <DialogDescription className="text-slate-400 mt-2">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Créé le {formatDate(selectedNotification.dateCreation)} à {formatTime(selectedNotification.dateCreation)}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-4 border-t border-b border-slate-700/70">
                <div>
                  <p className="text-slate-300 font-semibold mb-2 flex items-center gap-1">
                    <MessageSquare className="w-4 h-4 text-purple-400" /> Description Complète
                  </p>
                  <div className="text-white bg-slate-700/50 p-4 rounded-lg border border-slate-700 shadow-inner max-h-48 overflow-y-auto">
                    {selectedNotification.description}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 font-medium mb-1">Statut de lecture</p>
                    <Badge className={`h-6 px-3 text-sm font-semibold ${
                      selectedNotification.etat === 0 ? 'bg-red-600/30 text-red-400 border border-red-600' : 'bg-green-600/30 text-green-400 border border-green-600'
                    }`}
                      variant="outline"
                    >
                      {selectedNotification.statut}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium mb-1">ID de Référence</p>
                    <p className="text-white font-mono text-base bg-slate-700/50 inline-block px-2 py-1 rounded">#{selectedNotification.idNotification}</p>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex gap-2">
                <Button
                  onClick={() => deleteNotification(selectedNotification.idNotification)}
                  disabled={processing}
                  variant="outline"
                  className="border-red-700 text-red-400 hover:bg-red-700 hover:text-white"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Supprimer
                </Button>
                <DialogClose asChild>
                  <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700/50">
                    Fermer
                  </Button>
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .custom-scrollbar::-webkit-scrollbar {
              width: 8px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: #334155;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: #64748b;
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: #94a3b8;
            }
          `
        }}
      />
    </div>
  );
};

export default Notifications; 