// components/BellIconWithNotifications.tsx
import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NotificationModal from './NotificationModal';

const BASE_URL = "http://localhost:9090";
const API_NOTIFICATIONS_URL = `${BASE_URL}/api/notifications`;

const BellIconWithNotifications: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fonction pour récupérer le nombre de notifications non lues
  const fetchUnreadCount = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_NOTIFICATIONS_URL}/nombre-non-lues`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.nombreNonLues || 0);
      } else {
        // Fallback: calculer manuellement si l'endpoint spécifique échoue
        await calculateUnreadCount();
      }
    } catch (error) {
      console.error('Erreur lors du chargement du compteur:', error);
      // Fallback en cas d'erreur
      await calculateUnreadCount();
    } finally {
      setLoading(false);
    }
  };

  // Fallback: Récupérer toutes les notifications et calculer manuellement
  const calculateUnreadCount = async () => {
    try {
      const response = await fetch(API_NOTIFICATIONS_URL, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const notifications = await response.json();
        const unreadNotifications = notifications.filter((notif: any) => notif.etat === 0);
        setUnreadCount(unreadNotifications.length);
      }
    } catch (error) {
      console.error('Erreur lors du calcul manuel des notifications non lues:', error);
      setUnreadCount(0);
    }
  };

  // Charger le compteur au montage du composant
  useEffect(() => {
    fetchUnreadCount();
    
    // Recharger le compteur toutes les 30 secondes
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const handleBellClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    // Recharger le compteur après fermeture de la modal
    fetchUnreadCount();
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleBellClick}
        className="relative h-10 w-10 rounded-full hover:bg-accent/50 transition-colors duration-200"
        disabled={loading}
      >
        <Bell className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 min-w-0 p-0 flex items-center justify-center text-xs bg-red-500 animate-pulse-gentle border-2 border-background"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <NotificationModal 
        isOpen={isModalOpen} 
        onClose={handleModalClose} 
      />
    </>
  );
};

export default BellIconWithNotifications;