// components/NotificationModal.tsx
import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  BellOff, 
  CheckCircle, 
  Trash2, 
  RefreshCw,
  MessageSquare,
  Calendar,
  User,
  CheckCheck,
  Clock,
  X,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Notification {
  idNotification: number;
  sujet: string;
  description: string;
  dateCreation: string;
  etat: number;
  idClient: number;
  statut: string;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

const BASE_URL = "http://localhost:9090";
const API_NOTIFICATIONS_URL = `${BASE_URL}/api/notifications`;

const NotificationModal: React.FC<NotificationModalProps> = ({ 
  isOpen, 
  onClose,
  onUnreadCountChange 
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState('non-lues');

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

  // Calculer le nombre de notifications non lues
  const calculateUnreadCount = (notificationsList: Notification[] = notifications) => {
    const count = notificationsList.filter(notif => notif.etat === 0).length;
    setUnreadCount(count);
    
    // Notifier le composant parent du changement
    if (onUnreadCountChange) {
      onUnreadCountChange(count);
    }
    
    return count;
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
        calculateUnreadCount(notificationsData);
        applyFilter(activeTab, notificationsData);
      } else {
        setNotifications([]);
        calculateUnreadCount([]);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur de chargement des notifications.';
      setError(errorMessage);
      setNotifications([]);
      calculateUnreadCount([]);
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
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

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
      await fetchData(); // Recharger les données pour mettre à jour le compteur
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
      await fetchData(); // Recharger les données pour mettre à jour le compteur
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
      await fetchData(); // Recharger les données pour mettre à jour le compteur
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
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
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffMinutes < 1) return 'À l\'instant';
    if (diffHours < 1) return `Il y a ${diffMinutes} min`;
    if (diffDays === 0) return 'Aujourd\'hui';
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string): string => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationIcon = (sujet: string) => {
    if (sujet.includes('Bienvenue')) return <User className="w-4 h-4" />;
    if (sujet.includes('Achat') || sujet.includes('Vente')) return <CheckCircle className="w-4 h-4" />;
    if (sujet.includes('Dépôt')) return <CheckCheck className="w-4 h-4" />;
    return <MessageSquare className="w-4 h-4" />;
  };

  const getNotificationColor = (sujet: string) => {
    if (sujet.includes('Bienvenue')) return 'text-blue-500 bg-blue-100';
    if (sujet.includes('Achat')) return 'text-green-500 bg-green-100';
    if (sujet.includes('Vente')) return 'text-orange-500 bg-orange-100';
    if (sujet.includes('Dépôt')) return 'text-purple-500 bg-purple-100';
    return 'text-gray-500 bg-gray-100';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 gap-0 max-w-2xl max-h-[80vh] overflow-hidden bg-white">
        <DialogHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <Bell className="w-5 h-5" />
              Notifications
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 bg-red-500 text-white">
                  {unreadCount} non lue(s)
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchData}
                disabled={processing || loading}
                className="h-8 w-8 p-0"
              >
                <RefreshCw className={`w-4 h-4 ${processing || loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="non-lues" className="flex items-center gap-1 text-xs">
                Non lues
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="lues" className="text-xs">
                Lues ({notifications.length - unreadCount})
              </TabsTrigger>
              <TabsTrigger value="toutes" className="text-xs">
                Toutes ({notifications.length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </DialogHeader>

        {/* Actions rapides */}
        <div className="px-4 py-2 border-b bg-gray-50 flex justify-between items-center">
          <span className="text-sm text-gray-600">
            {filteredNotifications.length} notification(s)
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            disabled={processing || unreadCount === 0}
            className="h-8 text-xs text-blue-600 hover:text-blue-700"
          >
            <CheckCheck className="w-3 h-3 mr-1" />
            Tout marquer comme lu
          </Button>
        </div>

        {/* Liste des notifications */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-sm text-gray-600">Chargement...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500 text-sm">
              {error}
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <BellOff className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p className="text-gray-500 text-sm">
                {activeTab === 'non-lues' 
                  ? 'Aucune notification non lue' 
                  : 'Aucune notification trouvée'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.idNotification}
                  className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                    notification.etat === 0 ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.idNotification)}
                >
                  <div className="flex gap-3">
                    <div className={`flex-shrink-0 p-2 rounded-full ${getNotificationColor(notification.sujet)}`}>
                      {getNotificationIcon(notification.sujet)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h4 className={`font-medium text-sm ${
                          notification.etat === 0 ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.sujet}
                        </h4>
                        {notification.etat === 0 && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1 ml-2" />
                        )}
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                        {notification.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                          <span>{formatDate(notification.dateCreation)}</span>
                          <span>•</span>
                          <span>{formatTime(notification.dateCreation)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.idNotification);
                            }}
                            disabled={processing}
                            className="h-6 w-6 p-0 hover:bg-red-100 hover:text-red-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                          {notification.etat === 1 && (
                            <Eye className="w-3 h-3 text-green-500" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationModal;