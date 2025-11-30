import React, { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import {
    Search,
    Send,
    User,
    Building,
    Clock,
    Mail,
    MessageCircle,
    Users,
    Phone,
    Video,
    Paperclip,
    MoreVertical,
    LogOut,
    Bell,
    Settings,
    Shield,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Conversation {
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    userAvatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    isOnline: boolean;
    status: 'active' | 'pending' | 'resolved';
    company?: string;
    lastActivity: string;
}

interface Message {
    id: number;
    content: string;
    sender: 'user' | 'admin';
    timestamp: string;
    isRead: boolean;
    type: 'text' | 'file' | 'image';
    senderId?: number;
    receiverId?: number;
}

interface User {
    clientId: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isVerified: boolean;
    usagePurpose?: string;
    cinNumber?: string;
    phoneNumber?: string;
    age?: number;
    hasIdentityDocuments?: boolean;
    isFullyVerified?: boolean;
}

const AdminMessaging: React.FC = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [adminId, setAdminId] = useState<number>(2); // ID admin corrigé: était 1, maintenant 2
    const [error, setError] = useState<string | null>(null);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [onlineUsers, setOnlineUsers] = useState<Set<number>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Connexion WebSocket
    useEffect(() => {
        connectWebSocket();
        loadAllUsers();

        return () => {
            if (stompClient) {
                stompClient.deactivate();
            }
        };
    }, []);

    // Recharger les conversations quand les utilisateurs sont chargés
    useEffect(() => {
        if (allUsers.length > 0) {
            loadConversations();
        }
    }, [allUsers]);

    const connectWebSocket = () => {
        try {
            const socket = new SockJS('http://localhost:9090/ws');
            const client = new Client({
                webSocketFactory: () => socket,
                debug: (str) => {
                    // console.log('STOMP Debug:', str);
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            client.onConnect = (frame) => {
                console.log('✅ Admin connecté via STOMP:', frame);
                setIsConnected(true);
                setError(null);

                // S'abonner à la queue admin spécifique
                client.subscribe('/queue/admin', (message) => {
                    try {
                        console.log('📨 Message reçu sur /queue/admin:', message.body);
                        const messageData = JSON.parse(message.body);
                        handleIncomingMessage(messageData);
                    } catch (error) {
                        console.error('Erreur parsing message STOMP:', error);
                    }
                });

                // S'abonner aux notifications de connexion/déconnexion (si implémenté)
                client.subscribe('/topic/user.status', (message) => {
                    try {
                        const statusData = JSON.parse(message.body);
                        handleUserStatusChange(statusData);
                    } catch (error) {
                        console.error('Erreur parsing status:', error);
                    }
                });

                client.activate();
            };

            client.onStompError = (frame) => {
                console.error('❌ Erreur STOMP:', frame.headers['message']);
                setError('Erreur de connexion STOMP: ' + frame.headers['message']);
                setIsConnected(false);
            };

            client.onWebSocketError = (event) => {
                console.error('❌ Erreur WebSocket:', event);
                setError('Erreur WebSocket');
                setIsConnected(false);
            };

            client.onDisconnect = () => {
                console.log('🔌 Déconnecté STOMP');
                setIsConnected(false);
            };

            client.activate();
            setStompClient(client);

        } catch (error) {
            console.error('Erreur initialisation STOMP:', error);
            setError('Impossible de se connecter au serveur de chat');
        }
    };

    const loadAllUsers = async () => {
        try {
            // Essayer de charger les utilisateurs depuis l'API admin
            // Note: Assurez-vous que cet endpoint existe ou utilisez un mock si nécessaire
            const response = await fetch('http://localhost:9090/api/admin/users/complete-details', {
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setAllUsers(data.users);
                } else if (Array.isArray(data)) {
                    // Fallback si l'API retourne directement un tableau
                    setAllUsers(data);
                }
            } else {
                console.warn('Impossible de charger les utilisateurs, utilisation de données factices pour le test');
                // Mock data pour le développement si l'API échoue
                setAllUsers([
                    { clientId: 2, firstName: 'Jean', lastName: 'Dupont', email: 'jean@test.com', role: 'USER', isVerified: true },
                    { clientId: 3, firstName: 'Marie', lastName: 'Martin', email: 'marie@test.com', role: 'USER', isVerified: true }
                ]);
            }
        } catch (error) {
            console.error('Erreur chargement utilisateurs:', error);
        }
    };

    const handleIncomingMessage = (messageData: any) => {
        // Adapter le format du backend (sendFrom, message) au format frontend
        const senderId = messageData.sendFrom || messageData.senderId;
        const content = messageData.message || messageData.content;

        if (content && senderId && senderId !== adminId) {
            const adaptedMessage = {
                ...messageData,
                senderId: senderId,
                content: content,
                timestamp: messageData.date || messageData.timestamp || new Date().toISOString()
            };
            handleNewMessage(adaptedMessage);
        }
    };

    const handleUserStatusChange = (statusData: any) => {
        if (statusData.userId && statusData.isOnline !== undefined) {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                if (statusData.isOnline) {
                    newSet.add(statusData.userId);
                } else {
                    newSet.delete(statusData.userId);
                }
                return newSet;
            });

            // Mettre à jour le statut dans les conversations
            setConversations(prev =>
                prev.map(conv =>
                    conv.userId === statusData.userId
                        ? {
                            ...conv,
                            isOnline: statusData.isOnline,
                            lastActivity: statusData.isOnline ? 'En ligne' : 'Hors ligne'
                        }
                        : conv
                )
            );
        }
    };

    const handleNewMessage = (messageData: any) => {
        const newMessage: Message = {
            id: messageData.id || Date.now(),
            content: messageData.content,
            sender: 'user',
            timestamp: new Date(messageData.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            isRead: false,
            type: 'text',
            senderId: messageData.senderId,
            receiverId: adminId
        };

        // Ajouter le message à la liste si c'est la conversation sélectionnée
        if (selectedConversation?.userId === messageData.senderId) {
            setMessages(prev => [...prev, newMessage]);
        }

        // Mettre à jour ou créer la conversation
        setConversations(prev => {
            const existingConv = prev.find(conv => conv.userId === messageData.senderId);

            if (existingConv) {
                return prev.map(conv =>
                    conv.userId === messageData.senderId
                        ? {
                            ...conv,
                            lastMessage: messageData.content,
                            lastMessageTime: newMessage.timestamp,
                            unreadCount: conv.userId === selectedConversation?.userId ? 0 : conv.unreadCount + 1,
                            isOnline: true,
                            lastActivity: 'À l\'instant'
                        }
                        : conv
                ).sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime());
            } else {
                // Nouvelle conversation - trouver l'utilisateur dans allUsers
                const user = allUsers.find(u => u.clientId === messageData.senderId);
                const newConversation: Conversation = {
                    id: messageData.senderId,
                    userId: messageData.senderId,
                    userName: user ? `${user.firstName} ${user.lastName}` : `Utilisateur ${messageData.senderId}`,
                    userEmail: user?.email || 'email@inconnu.com',
                    lastMessage: messageData.content,
                    lastMessageTime: newMessage.timestamp,
                    unreadCount: 1,
                    isOnline: true,
                    status: 'active',
                    lastActivity: 'À l\'instant',
                    company: user?.usagePurpose || 'MyLb User'
                };

                return [newConversation, ...prev];
            }
        });
    };

    const loadConversations = async () => {
        if (allUsers.length === 0) return;

        setIsLoading(true);
        try {
            // Pour chaque utilisateur, charger sa conversation avec l'admin
            // Note: Idéalement, le backend devrait fournir un endpoint pour "toutes les conversations de l'admin"
            // Mais ici on itère sur les utilisateurs connus

            const conversationsPromises = allUsers.map(async (user) => {
                try {
                    // Utiliser l'endpoint correct du backend: /api/messages/conversation/admin/{userId}
                    const messagesResponse = await fetch(
                        `http://localhost:9090/api/messages/conversation/admin/${user.clientId}`,
                        { credentials: 'include' }
                    );

                    if (messagesResponse.ok) {
                        const conversationMessages = await messagesResponse.json();

                        if (conversationMessages.length > 0) {
                            const lastMsg = conversationMessages[conversationMessages.length - 1];
                            const unreadCount = conversationMessages.filter((msg: any) =>
                                (msg.sendFrom === user.clientId || msg.senderId === user.clientId) && !msg.isRead
                            ).length;

                            return {
                                id: user.clientId,
                                userId: user.clientId,
                                userName: `${user.firstName} ${user.lastName}`,
                                userEmail: user.email,
                                lastMessage: lastMsg.message || lastMsg.content,
                                lastMessageTime: new Date(lastMsg.date || lastMsg.timestamp).toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }),
                                unreadCount,
                                isOnline: onlineUsers.has(user.clientId),
                                status: 'active' as const,
                                company: user.usagePurpose || 'MyLb User',
                                lastActivity: onlineUsers.has(user.clientId) ? 'En ligne' : 'Hors ligne'
                            };
                        }
                    }
                } catch (error) {
                    console.error(`Erreur chargement conversation ${user.clientId}:`, error);
                }
                return null;
            });

            const results = await Promise.all(conversationsPromises);
            const activeConversations = results.filter(Boolean) as Conversation[];

            setConversations(activeConversations.sort((a, b) =>
                new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime()
            ));

        } catch (error) {
            console.error('Erreur chargement conversations:', error);
            setError('Erreur lors du chargement des conversations');
        } finally {
            setIsLoading(false);
        }
    };

    const loadMessages = async (userId: number) => {
        try {
            // Endpoint correct: /api/messages/conversation/admin/{userId}
            const response = await fetch(
                `http://localhost:9090/api/messages/conversation/admin/${userId}`,
                { credentials: 'include' }
            );

            if (response.ok) {
                const messageDTOs = await response.json();
                console.log('📥 Messages reçus depuis l\'API:', messageDTOs);
                console.log('🔍 Admin ID utilisé pour comparaison:', adminId);
                
                const formattedMessages: Message[] = messageDTOs.map((msg: any) => {
                    // Convertir en nombre pour comparaison correcte
                    const sendFromNum = Number(msg.sendFrom || msg.senderId);
                    const isFromAdmin = sendFromNum === adminId;
                    
                    console.log(`📨 Message ID ${msg.id}: sendFrom=${sendFromNum}, adminId=${adminId}, isFromAdmin=${isFromAdmin}`);
                    
                    return {
                        id: msg.id,
                        content: msg.message || msg.content,
                        sender: isFromAdmin ? 'admin' : 'user',
                        timestamp: new Date(msg.date || msg.timestamp).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit'
                        }),
                        isRead: msg.isRead || false,
                        type: 'text',
                        senderId: sendFromNum,
                        receiverId: Number(msg.sendTo || msg.receiverId)
                    };
                });

                // Trier les messages par date (plus ancien en premier)
                formattedMessages.sort((a, b) => {
                    const dateA = new Date(messageDTOs.find((m: any) => m.id === a.id)?.date || 0);
                    const dateB = new Date(messageDTOs.find((m: any) => m.id === b.id)?.date || 0);
                    return dateA.getTime() - dateB.getTime();
                });

                console.log('✅ Messages formatés et triés:', formattedMessages);
                setMessages(formattedMessages);
            } else {
                console.error('❌ Erreur lors du chargement des messages, statut:', response.status);
                setMessages([]);
            }

            // Marquer comme lu (si implémenté côté backend)
            // markMessagesAsRead(userId);
        } catch (error) {
            console.error('Erreur chargement messages:', error);
            setMessages([]);
        }
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !selectedConversation || !stompClient || !isConnected) return;

        // Format attendu par le backend (Message entity)
        const backendMessage = {
            sendFrom: adminId,
            sendTo: selectedConversation.userId,
            message: newMessage,
            date: new Date().toISOString()
        };

        console.log('📤 Envoi message:', backendMessage);

        // Envoyer via STOMP à /app/message/fromAdmin
        stompClient.publish({
            destination: '/app/message/fromAdmin',
            body: JSON.stringify(backendMessage)
        });

        // Ajouter le message localement
        const newMsg: Message = {
            id: Date.now(),
            content: newMessage,
            sender: 'admin',
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            isRead: true,
            type: 'text',
            senderId: adminId,
            receiverId: selectedConversation.userId
        };

        setMessages(prev => [...prev, newMsg]);
        setNewMessage('');

        // Mettre à jour la conversation
        setConversations(prev =>
            prev.map(conv =>
                conv.userId === selectedConversation.userId
                    ? {
                        ...conv,
                        lastMessage: newMessage,
                        lastMessageTime: newMsg.timestamp,
                        unreadCount: 0
                    }
                    : conv
            ).sort((a, b) => new Date(b.lastMessageTime || 0).getTime() - new Date(a.lastMessageTime || 0).getTime())
        );
    };

    const handleSelectConversation = (conversation: Conversation) => {
        setSelectedConversation(conversation);
        loadMessages(conversation.userId);

        // Reset unread count
        setConversations(prev =>
            prev.map(conv =>
                conv.userId === conversation.userId ? { ...conv, unreadCount: 0 } : conv
            )
        );
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const refreshConversations = () => {
        setIsLoading(true);
        loadAllUsers();
        // loadConversations sera appelé via useEffect quand allUsers change
    };

    // Scroll vers le bas des messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const filteredConversations = conversations.filter(conv => {
        const matchesSearch = conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.company?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500/20 text-green-400 border-green-400';
            case 'pending':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-400';
            case 'resolved':
                return 'bg-blue-500/20 text-blue-400 border-blue-400';
            default:
                return 'bg-gray-500/20 text-gray-400 border-gray-400';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'active':
                return 'Actif';
            case 'pending':
                return 'En attente';
            case 'resolved':
                return 'Résolu';
            default:
                return status;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900/20">
            {/* Header */}
            <header className="bg-gray-800/90 backdrop-blur-xl border-b border-purple-500/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-500/30">
                                <MessageCircle className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Centre de Messagerie Admin</h1>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                                    <p className="text-sm text-purple-300">
                                        {isConnected ? 'Connecté' : 'Déconnecté'} - {conversations.length} utilisateurs
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                onClick={refreshConversations}
                                variant="outline"
                                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                                disabled={isLoading}
                            >
                                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                                Actualiser
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                                        <Settings className="w-4 h-4 mr-2" />
                                        Paramètres
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="bg-gray-800 border-purple-500/30">
                                    <DropdownMenuItem className="text-white hover:bg-purple-500/20">
                                        <User className="w-4 h-4 mr-2" />
                                        Mon profil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-400 hover:bg-red-500/20">
                                        <LogOut className="w-4 h-4 mr-2" />
                                        Déconnexion
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto p-4 sm:p-6">
                {error && (
                    <Alert className="bg-red-900/50 border-red-700/50 mb-6">
                        <AlertDescription className="text-red-300">{error}</AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
                    {/* Sidebar des conversations */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30">
                            <CardHeader>
                                <CardTitle className="text-white text-lg">Conversations</CardTitle>
                                <div className="space-y-3">
                                    {/* Barre de recherche */}
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                                        <Input
                                            placeholder="Rechercher..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 bg-gray-700 border-purple-500/30 text-white focus:border-purple-500"
                                        />
                                    </div>

                                    {/* Filtres */}
                                    <div className="flex gap-2">
                                        <Button
                                            variant={statusFilter === 'all' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setStatusFilter('all')}
                                            className={statusFilter === 'all' ? 'bg-purple-600 hover:bg-purple-700' : 'border-purple-500/30 text-purple-300 hover:bg-purple-500/20'}
                                        >
                                            Tous
                                        </Button>
                                        <Button
                                            variant={statusFilter === 'active' ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setStatusFilter('active')}
                                            className={statusFilter === 'active' ? 'bg-green-600 hover:bg-green-700' : 'border-green-500/30 text-green-300 hover:bg-green-500/20'}
                                        >
                                            Actifs
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Liste des conversations */}
                        <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30 flex-1">
                            <CardContent className="p-0">
                                <ScrollArea className="h-[500px]">
                                    <div className="space-y-1 p-2">
                                        {isLoading ? (
                                            <div className="text-center py-8 text-purple-400">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
                                                <p>Chargement des conversations...</p>
                                            </div>
                                        ) : filteredConversations.length === 0 ? (
                                            <div className="text-center py-8 text-purple-400">
                                                <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <p>Aucune conversation</p>
                                            </div>
                                        ) : (
                                            filteredConversations.map((conversation) => (
                                                <div
                                                    key={conversation.id}
                                                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedConversation?.userId === conversation.userId
                                                            ? 'bg-purple-500/20 border border-purple-500'
                                                            : 'bg-gray-700/50 border border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/50'
                                                        }`}
                                                    onClick={() => handleSelectConversation(conversation)}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className="relative">
                                                            <Avatar className="w-10 h-10">
                                                                <AvatarFallback className="bg-purple-500/20 text-purple-400">
                                                                    {conversation.userName.split(' ').map(n => n[0]).join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {conversation.isOnline && (
                                                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-gray-800 rounded-full"></div>
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <h3 className="font-semibold text-white text-sm truncate">
                                                                    {conversation.userName}
                                                                </h3>
                                                                <span className="text-xs text-purple-400">
                                                                    {conversation.lastMessageTime}
                                                                </span>
                                                            </div>

                                                            <p className="text-xs text-purple-300 truncate mb-1">
                                                                {conversation.lastMessage}
                                                            </p>

                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Badge className={`text-xs border ${getStatusColor(conversation.status)}`}>
                                                                        {getStatusText(conversation.status)}
                                                                    </Badge>
                                                                    {conversation.company && (
                                                                        <div className="flex items-center gap-1">
                                                                            <Building className="w-3 h-3 text-purple-400" />
                                                                            <span className="text-xs text-purple-400 truncate max-w-[80px]">
                                                                                {conversation.company}
                                                                            </span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {conversation.unreadCount > 0 && (
                                                                    <Badge className="bg-red-500 text-white text-xs">
                                                                        {conversation.unreadCount}
                                                                    </Badge>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-1 mt-1">
                                                                <Clock className="w-3 h-3 text-purple-500" />
                                                                <span className="text-xs text-purple-500">
                                                                    {conversation.lastActivity}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        {/* Statistiques */}
                        <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30">
                            <CardContent className="p-4">
                                <div className="grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-green-400">
                                            {conversations.filter(c => c.isOnline).length}
                                        </div>
                                        <div className="text-xs text-purple-300">En ligne</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-yellow-400">
                                            {conversations.reduce((acc, conv) => acc + conv.unreadCount, 0)}
                                        </div>
                                        <div className="text-xs text-purple-300">Non lus</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Zone de messagerie principale */}
                    <div className="lg:col-span-3">
                        {selectedConversation ? (
                            <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30 h-full flex flex-col">
                                {/* En-tête de conversation */}
                                <CardHeader className="border-b border-purple-500/30 pb-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Avatar className="w-12 h-12">
                                                    <AvatarFallback className="bg-purple-500/20 text-purple-400 text-lg">
                                                        {selectedConversation.userName.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {selectedConversation.isOnline && (
                                                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-gray-800 rounded-full"></div>
                                                )}
                                            </div>
                                            <div>
                                                <CardTitle className="text-white flex items-center gap-2">
                                                    {selectedConversation.userName}
                                                    <Badge className={getStatusColor(selectedConversation.status)}>
                                                        {getStatusText(selectedConversation.status)}
                                                    </Badge>
                                                </CardTitle>
                                                <CardDescription className="text-purple-300 flex items-center gap-2">
                                                    <Mail className="w-3 h-3" />
                                                    {selectedConversation.userEmail}
                                                    {selectedConversation.company && (
                                                        <>
                                                            <span className="mx-1">•</span>
                                                            <Building className="w-3 h-3" />
                                                            {selectedConversation.company}
                                                        </>
                                                    )}
                                                </CardDescription>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="icon" className="text-purple-300 hover:bg-purple-500/20">
                                                <Phone className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-purple-300 hover:bg-purple-500/20">
                                                <Video className="w-4 h-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="text-purple-300 hover:bg-purple-500/20">
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent className="bg-gray-800 border-purple-500/30">
                                                    <DropdownMenuItem className="text-white hover:bg-purple-500/20">
                                                        Voir le profil
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-white hover:bg-purple-500/20">
                                                        Marquer comme résolu
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-red-400 hover:bg-red-500/20">
                                                        Bloquer l'utilisateur
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardHeader>

                                {/* Messages */}
                                <CardContent className="flex-1 p-0 overflow-hidden">
                                    <ScrollArea className="h-full p-4">
                                        <div className="space-y-4">
                                            {messages.map((message) => (
                                                <div
                                                    key={message.id}
                                                    className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-[70%] rounded-2xl p-4 ${message.sender === 'admin'
                                                                ? 'bg-purple-600 text-white rounded-br-none'
                                                                : 'bg-gray-700 text-white rounded-bl-none'
                                                            }`}
                                                    >
                                                        <p className="text-sm">{message.content}</p>
                                                        <div className={`flex items-center gap-1 mt-1 text-xs ${message.sender === 'admin' ? 'text-purple-200' : 'text-gray-400'
                                                            }`}>
                                                            <span>{message.timestamp}</span>
                                                            {message.sender === 'admin' && (
                                                                <span>{message.isRead ? '• Lu' : '• Envoyé'}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <div ref={messagesEndRef} />
                                        </div>
                                    </ScrollArea>
                                </CardContent>

                                {/* Zone de saisie */}
                                <CardFooter className="p-4 border-t border-purple-500/30 bg-gray-800/50">
                                    <div className="flex items-end gap-2 w-full">
                                        <Button variant="ghost" size="icon" className="text-purple-300 hover:bg-purple-500/20">
                                            <Paperclip className="w-4 h-4" />
                                        </Button>
                                        <div className="flex-1">
                                            <Textarea
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Écrivez votre message..."
                                                className="min-h-[40px] max-h-[120px] bg-gray-700 border-purple-500/30 text-white focus:border-purple-500 resize-none"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleSendMessage}
                                            disabled={!newMessage.trim()}
                                            className="bg-purple-600 hover:bg-purple-700 text-white"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </CardFooter>
                            </Card>
                        ) : (
                            <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30 h-full flex items-center justify-center">
                                <div className="text-center text-purple-300">
                                    <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h2 className="text-xl font-semibold mb-2">Sélectionnez une conversation</h2>
                                    <p className="text-sm opacity-70">
                                        Choisissez un utilisateur dans la liste pour commencer à discuter
                                    </p>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminMessaging;
