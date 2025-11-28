import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Send, Bot, User, Loader2, ArrowLeft, MessageCircle, Phone, Shield, Clock, HelpCircle, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'bot' | 'admin';
    timestamp: Date;
    senderId?: number;
    receiverId?: number;
}

interface UserInfo {
    clientId: number;
    firstName: string;
    lastName: string;
    email: string;
}

// Base de connaissances
const knowledgeBase: { [key: string]: string } = {
    "comment acheter des stocks": `Pour acheter des stocks sur MyLb :

📈 **Processus d'achat :**
1. Connectez-vous à votre compte
2. Accédez à la section "Marché"
3. Recherchez l'action souhaitée
4. Cliquez sur "Acheter"
5. Entrez le nombre d'actions
6. Confirmez la transaction

💡 **Conseils :**
• Vérifiez les frais de transaction
• Consultez les analyses de marché
• Définissez des limites d'achat`,

    "comment vendre mes actions": `Pour vendre vos actions sur MyLb :

💰 **Processus de vente :**
1. Allez dans votre portefeuille
2. Sélectionnez l'action à vendre
3. Cliquez sur "Vendre"
4. Choisissez le type d'ordre
5. Entrez la quantité
6. Confirmez la vente

📊 **Types d'ordres :**
• Ordre au marché (immédiat)
• Ordre limité (prix spécifique)
• Ordre stop (seuil de protection)`,

    "comment vérifier mon solde": `Pour vérifier votre solde MyLb :

🏦 **Options disponibles :**
1. **Tableau de bord :** Solde principal visible
2. **Portefeuille :** Détail des investissements
3. **Historique :** Toutes les transactions
4. **Relevés :** Export mensuel disponible

🔍 **Accès rapide :**
• Cliquez sur votre profil
• Section "Solde et Portefeuille"
• Temps réel mis à jour`,

    "problème avec ma transaction": `En cas de problème de transaction :

🚨 **Vérifications immédiates :**
1. Statut de la transaction
2. Solde suffisant
3. Connexion internet
4. Heures de marché

🛠️ **Solutions :**
• Actualisez la page
• Vérifiez l'historique
• Contactez le support si bloqué

⏱️ **Délais :**
• Transactions : 2-3 heures
• Virements : 24-48 heures`,

    "comment créer une entreprise": `Pour créer une entreprise sur MyLb :

🏢 **Processus de création :**
1. Rendez-vous dans "Entreprises"
2. Cliquez sur "Créer une entreprise"
3. Remplissez les informations
4. Téléchargez les documents
5. Validation sous 48h

📋 **Documents requis :**
• Statuts de l'entreprise
• Kbis de moins de 3 mois
• Pièce d'identité des dirigeants
• Justificatif de domicile`,

    "contacter le support": `Pour contacter notre support :

📞 **Options de contact :**
• **Chat en direct** (disponible maintenant)
• **Email :** support@mylb.fr
• **Téléphone :** 01 23 45 67 89
• **Centre d'aide :** Documentation complète

🕒 **Horaires :**
• Lun-Ven : 8h-20h
• Sam : 9h-18h
• Urgences : 24h/24`
};

const ChatSupport: React.FC = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: 'Bonjour ! Je suis votre assistant virtuel MyLb. Comment puis-je vous aider aujourd\'hui ?',
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isHumanSupport, setIsHumanSupport] = useState(false);
    const [showHumanSupportAlert, setShowHumanSupportAlert] = useState(false);
    const [humanSupportRequested, setHumanSupportRequested] = useState(false);
    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [emailForm, setEmailForm] = useState({
        subject: '',
        content: '',
        userEmail: '',
        userName: ''
    });
    const [isSendingEmail, setIsSendingEmail] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [stompClient, setStompClient] = useState<Client | null>(null);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Récupérer l'ID utilisateur depuis la session
    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                setIsCheckingAuth(true);
                console.log('🔄 Tentative de récupération des infos utilisateur...');

                const response = await fetch('http://localhost:9090/api/auth/me', {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    const userData = await response.json();
                    console.log('✅ Utilisateur connecté:', userData);

                    // Vérifier la structure de la réponse
                    const clientId = userData.clientId || userData.id;

                    if (clientId) {
                        setUserId(clientId);
                        setUserInfo({
                            clientId: clientId,
                            firstName: userData.firstName || 'Utilisateur',
                            lastName: userData.lastName || 'MyLb',
                            email: userData.email || `user${clientId}@mylb.fr`
                        });

                        setEmailForm(prev => ({
                            ...prev,
                            userEmail: userData.email || `user${clientId}@mylb.fr`,
                            userName: `${userData.firstName || 'Utilisateur'} ${userData.lastName || 'MyLb'}`
                        }));

                        // Connecter WebSocket une fois l'user ID disponible
                        connectWebSocket();
                    } else {
                        console.error('❌ Client ID non trouvé dans la réponse:', userData);
                        handleWebSocketError('Impossible de récupérer votre identifiant. Veuillez vous reconnecter.');
                    }
                } else {
                    console.error('❌ Utilisateur non authentifié - Statut:', response.status);
                    handleWebSocketError('Vous devez être connecté pour utiliser le support. Veuillez vous connecter.');
                }
            } catch (error) {
                console.error('❌ Erreur récupération utilisateur:', error);
                handleWebSocketError('Erreur de connexion au serveur. Veuillez réessayer.');
            } finally {
                setIsCheckingAuth(false);
            }
        };

        fetchUserInfo();
    }, []);

    const generateMessageId = () => {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    };

    // Fonction pour charger la conversation existante depuis l'API
    const loadConversation = useCallback(async () => {
        if (!userId) return;

        try {
            console.log('🔄 Chargement de la conversation avec l\'admin pour l\'utilisateur:', userId);
            const response = await fetch(
                `http://localhost:9090/api/messages/conversation/admin/${userId}`,
                { credentials: 'include' }
            );

            if (response.ok) {
                const messageDTOs = await response.json();
                console.log('✅ Messages chargés depuis l\'API:', messageDTOs.length);

                // Convertir les messages du backend au format frontend
                const loadedMessages: Message[] = messageDTOs.map((msg: any) => {
                    const isFromAdmin = (msg.sendFrom === 2 || msg.senderId === 2); // Admin ID = 2
                    return {
                        id: msg.id ? msg.id.toString() : generateMessageId(),
                        content: msg.message || msg.content,
                        sender: isFromAdmin ? 'admin' : 'user',
                        timestamp: new Date(msg.date || msg.timestamp || Date.now()),
                        senderId: msg.sendFrom || msg.senderId,
                        receiverId: msg.sendTo || msg.receiverId
                    };
                });

                // Trier par date (plus ancien en premier)
                loadedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

                // Remplacer les messages existants par ceux chargés (sauf le message de bienvenue du bot)
                setMessages(prev => {
                    const welcomeMessage = prev.find(m => m.sender === 'bot' && m.id === '1');
                    return welcomeMessage ? [welcomeMessage, ...loadedMessages] : loadedMessages;
                });
            } else {
                console.warn('⚠️ Impossible de charger la conversation, statut:', response.status);
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement de la conversation:', error);
        }
    }, [userId]);

    // Déplacer connectWebSocket en dehors du useEffect pour éviter les dépendances circulaires
    const connectWebSocket = useCallback(() => {
        if (!userId) {
            console.log('⏳ User ID non disponible, report de la connexion WebSocket');
            return;
        }

        try {
            console.log('🔄 Tentative de connexion WebSocket pour user:', userId);

            // Utiliser SockJS au lieu de WebSocket natif
            const socket = new SockJS('http://localhost:9090/ws');
            const client = new Client({
                webSocketFactory: () => socket,
                debug: (str) => {
                    if (str.includes('ERROR') || str.includes('error')) {
                        console.error('STOMP Error:', str);
                    } else {
                        console.log('STOMP Debug:', str);
                    }
                },
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            client.onConnect = async (frame) => {
                console.log('✅ Utilisateur connecté via STOMP:', frame);
                setIsConnected(true);

                // S'abonner à la queue spécifique de l'utilisateur pour recevoir les messages de l'admin
                // CORRECTION: Utilisation de /queue/user/{userId} au lieu de /user/queue/messages
                client.subscribe(`/queue/user/${userId}`, (message) => {
                    try {
                        console.log('📨 Message reçu de l\'admin:', message.body);
                        const messageData = JSON.parse(message.body);
                        handleIncomingMessage(messageData);
                    } catch (error) {
                        console.error('❌ Erreur parsing message STOMP:', error);
                    }
                });

                // Charger la conversation existante depuis l'API
                await loadConversation();

                // Afficher message de confirmation
                const connectedMessage: Message = {
                    id: generateMessageId(),
                    content: `🔗 **Connexion établie avec le serveur**

✅ Votre connexion au support est maintenant active.
👨‍💼 Vous pouvez commencer à discuter avec notre équipe.`,
                    sender: 'admin',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, connectedMessage]);
            };

            client.onStompError = (frame) => {
                console.error('❌ Erreur STOMP:', frame.headers['message']);
                handleWebSocketError('Erreur de connexion STOMP: ' + frame.headers['message']);
                setIsConnected(false);
            };

            client.onWebSocketError = (event) => {
                console.error('❌ Erreur WebSocket:', event);
                handleWebSocketError('Erreur de connexion WebSocket');
                setIsConnected(false);
            };

            client.onDisconnect = () => {
                console.log('🔌 Déconnecté du serveur STOMP');
                setIsConnected(false);
            };

            client.activate();
            setStompClient(client);

        } catch (error) {
            console.error('❌ Erreur initialisation STOMP:', error);
            handleWebSocketError('Impossible de se connecter au serveur de chat: ' + error);
        }
    }, [userId, userInfo, loadConversation]);

    // Nettoyer la connexion
    useEffect(() => {
        return () => {
            if (stompClient) {
                console.log('🧹 Nettoyage connexion WebSocket');
                stompClient.deactivate();
            }
        };
    }, [stompClient]);

    // Scroll vers le bas quand de nouveaux messages arrivent
    useEffect(() => {
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
    }, [messages]);

    // Afficher l'alerte pour le support humain après 3 messages
    useEffect(() => {
        if (messages.length >= 4 && !humanSupportRequested && !isHumanSupport) {
            setShowHumanSupportAlert(true);
        }
    }, [messages.length, humanSupportRequested, isHumanSupport]);

    const handleIncomingMessage = (messageData: any) => {
        console.log('📨 Traitement message entrant:', messageData);

        // CORRECTION: Adaptation au format du backend (Message entity)
        // Le backend renvoie un objet Message avec { id, sendFrom, sendTo, message, date }
        const content = messageData.message || messageData.content;
        const senderId = messageData.sendFrom || messageData.senderId;

        // Vérifier que le message vient de l'admin (ID = 2) et n'est pas déjà dans la liste
        if (content && senderId && senderId === 2) { // Admin ID = 2
            const messageId = messageData.id ? messageData.id.toString() : generateMessageId();
            
            // Vérifier si le message n'existe pas déjà
            setMessages(prev => {
                const exists = prev.some(m => m.id === messageId);
                if (exists) {
                    console.log('⚠️ Message déjà présent, ignoré:', messageId);
                    return prev;
                }

                const newMessage: Message = {
                    id: messageId,
                    content: content,
                    sender: 'admin',
                    timestamp: new Date(messageData.date || messageData.timestamp || Date.now()),
                    senderId: senderId,
                    receiverId: messageData.sendTo || messageData.receiverId
                };

                return [...prev, newMessage];
            });
            setIsLoading(false);
        }
    };

    const handleWebSocketError = (error: string) => {
        console.error('❌ Erreur WebSocket:', error);

        const errorMessage: Message = {
            id: generateMessageId(),
            content: `❌ **Erreur de connexion**

${error}

🔄 **Veuillez réessayer ou contacter le support par email.**`,
            sender: 'bot',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, errorMessage]);
        setIsLoading(false);
    };

    const getAutomaticResponse = (userMessage: string): string | null => {
        const normalizedMessage = userMessage.toLowerCase().trim();

        for (const [question, response] of Object.entries(knowledgeBase)) {
            const normalizedQuestion = question.toLowerCase();
            if (normalizedMessage === normalizedQuestion ||
                normalizedMessage.includes(normalizedQuestion) ||
                normalizedQuestion.includes(normalizedMessage)) {
                return response;
            }
        }

        return null;
    };

    const sendSupportEmail = async (emailData: any) => {
        try {
            setIsSendingEmail(true);

            const response = await fetch('http://localhost:9090/api/email/send-to-support', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(emailData),
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                return { success: true, message: result.message };
            } else {
                throw new Error(result.message || 'Erreur inconnue du serveur');
            }

        } catch (error) {
            console.error('Erreur envoi email:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Erreur de connexion au serveur'
            };
        } finally {
            setIsSendingEmail(false);
        }
    };

    const connectToHumanSupport = async () => {
        console.log('🎯 Demande de connexion au support humain');

        if (!userId) {
            console.error('❌ User ID manquant');
            handleWebSocketError('Utilisateur non identifié - veuillez rafraîchir la page');
            return;
        }

        setIsHumanSupport(true);
        setHumanSupportRequested(true);
        setShowHumanSupportAlert(false);

        const humanSupportMessage: Message = {
            id: generateMessageId(),
            content: `✅ **Connexion établie avec notre support humain !**

👨‍💼 **Un conseiller MyLb spécialisé vous répondra dans les plus brefs délais.**

⏱️ **Temps d'attente estimé :** 2-3 minutes

📋 **Pour nous aider à vous assister rapidement :**
• Votre numéro de compte : #${userId}
• Une description détaillée du problème
• Les messages d'erreur éventuels
• La date et l'heure de l'incident

💡 **Pendant l'attente :**
Vous pouvez décrire votre problème en détail, notre expert le lira dès la prise en charge.`,
            sender: 'admin',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, humanSupportMessage]);

        // Notifier l'admin de la demande de support
        if (stompClient && isConnected) {
            // CORRECTION: Format du message pour le backend
                const supportRequest = {
                sendFrom: userId,
                sendTo: 2, // ID admin (corrigé: était 1, maintenant 2)
                message: `🆘 Nouvelle demande de support humain de ${userInfo ? userInfo.firstName + ' ' + userInfo.lastName : 'Utilisateur MyLb'} (Email: ${userInfo?.email || 'N/A'})`,
                date: new Date().toISOString()
            };

            console.log('📤 Notification à l\'admin:', supportRequest);
            stompClient.publish({
                destination: '/app/message/toAdmin',
                body: JSON.stringify(supportRequest)
            });
        } else {
            console.log('⚠️ STOMP client pas connecté, tentative de reconnexion...');
            connectWebSocket();
        }
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() || isLoading) return;

        // Vérifier que l'utilisateur est authentifié
        if (!userId) {
            console.error('❌ User ID manquant - impossible d\'envoyer le message');
            handleWebSocketError('Vous devez être connecté pour envoyer un message. Veuillez vous reconnecter.');
            return;
        }

        const userMessage = inputMessage.trim();
        setInputMessage('');

        // Ajouter le message de l'utilisateur
        const userMessageObj: Message = {
            id: generateMessageId(),
            content: userMessage,
            sender: 'user',
            timestamp: new Date(),
            senderId: userId
        };

        setMessages(prev => [...prev, userMessageObj]);
        setIsLoading(true);

        try {
            if (isHumanSupport && stompClient && isConnected) {
                // En mode support humain - envoyer via STOMP
                // Utilisation de l'ID réel du client (pas d'ID de test)
                const backendMessage = {
                    sendFrom: userId,  // ID réel du client
                    sendTo: 2, // ID admin (corrigé: était 1, maintenant 2)
                    message: userMessage,
                    date: new Date().toISOString()
                };

                console.log('📤 Envoi message à l\'admin:', backendMessage);
                stompClient.publish({
                    destination: '/app/message/toAdmin',
                    body: JSON.stringify(backendMessage)
                });

                // En mode support humain, pas de message automatique - on attend la réponse de l'admin
                setIsLoading(false);

            } else {
                // Mode assistant IA
                const automaticResponse = getAutomaticResponse(userMessage);

                let botResponse: string;

                if (automaticResponse) {
                    botResponse = automaticResponse;
                } else {
                    botResponse = `🤖 **Assistant MyLb**

Je comprends que vous avez besoin d'aide avec : "${userMessage}"

Malheureusement, je n'ai pas d'information spécifique sur ce sujet dans ma base de connaissances.

🛟 **Je vous recommande de :**
• Contacter notre support humain pour une assistance personnalisée
• Envoyer un email détaillé à notre équipe technique
• Consulter notre centre d'aide en ligne

Souhaitez-vous que je vous mette en relation avec un expert ?`;
                }

                const botMessageObj: Message = {
                    id: generateMessageId(),
                    content: botResponse,
                    sender: 'bot',
                    timestamp: new Date()
                };

                setMessages(prev => [...prev, botMessageObj]);
                setIsLoading(false);
            }
        } catch (error) {
            console.error('Erreur générale:', error);
            const errorMessageObj: Message = {
                id: generateMessageId(),
                content: `❌ **Désolé, je rencontre une difficulté technique**

🔄 **Solutions immédiates :**
• Réessayez dans quelques instants
• Utilisez le **support humain** pour une aide personnalisée
• Envoyez-nous un email détaillé

📧 **Contact :** support@mylb.fr
📞 **Téléphone :** 01 23 45 67 89

Nous nous excusons pour la gêne occasionnée.`,
                sender: 'bot',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessageObj]);
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleOpenEmailDialog = () => {
        const lastUserMessage = [...messages].reverse().find(msg => msg.sender === 'user');
        setEmailForm(prev => ({
            ...prev,
            subject: lastUserMessage ? `Support: ${lastUserMessage.content.substring(0, 50)}...` : 'Demande de support',
            content: lastUserMessage ? `Problème: ${lastUserMessage.content}\n\nDescription détaillée : ` : ''
        }));
        setShowEmailDialog(true);
    };

    const handleSendEmail = async () => {
        if (!emailForm.subject.trim() || !emailForm.content.trim() || !emailForm.userEmail.trim()) {
            return;
        }

        const result = await sendSupportEmail(emailForm);

        if (result.success) {
            const confirmationMessage: Message = {
                id: generateMessageId(),
                content: `✅ **Votre email a été envoyé avec succès !**

📧 **Détails de l'envoi :**
• Sujet: ${emailForm.subject}
• Destinataire: support@mylb.fr
• Email de réponse: ${emailForm.userEmail}

💌 **Prochaines étapes :**
Notre équipe vous répondra dans les 24 heures à l'adresse ${emailForm.userEmail}.

Merci pour votre patience !`,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, confirmationMessage]);
            setShowEmailDialog(false);
        } else {
            const errorMessage: Message = {
                id: generateMessageId(),
                content: `❌ **Échec de l'envoi de l'email**

Détail: ${result.message}

🔄 **Veuillez réessayer ou :**
• Contactez-nous directement à support@mylb.fr
• Appelez le 01 23 45 67 89`,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, errorMessage]);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSenderBadge = (sender: 'user' | 'bot' | 'admin') => {
        switch (sender) {
            case 'bot':
                return <Badge variant="secondary" className="bg-blue-500 text-white text-xs">IA</Badge>;
            case 'admin':
                return <Badge variant="secondary" className="bg-green-500 text-white text-xs">Support</Badge>;
            default:
                return null;
        }
    };

    const getSenderIcon = (sender: 'user' | 'bot' | 'admin') => {
        switch (sender) {
            case 'bot':
                return <Bot className="w-4 h-4 text-blue-500" />;
            case 'admin':
                return <User className="w-4 h-4 text-green-500" />;
            case 'user':
                return <User className="w-4 h-4 text-white" />;
        }
    };

    const suggestedQuestions = [
        "Comment acheter des stocks ?",
        "Comment vendre mes actions ?",
        "Comment vérifier mon solde ?",
        "Problème avec ma transaction",
        "Comment créer une entreprise ?",
        "Contacter le support"
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900/20 p-4 sm:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        onClick={() => navigate(-1)}
                        variant="outline"
                        className="mb-4 border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Retour
                    </Button>

                    <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30 shadow-xl">
                        <CardHeader className="text-center">
                            <CardTitle className="text-2xl font-bold text-white flex items-center justify-center gap-2">
                                <MessageCircle className="w-6 h-6 text-purple-400" />
                                Support MyLb
                            </CardTitle>
                            <CardDescription className="text-purple-300">
                                {isHumanSupport
                                    ? `🔗 Connecté au support humain ${isConnected ? '✅' : '🔄'} - Temps d'attente : 2-3 min`
                                    : `🤖 Assistant IA ${isConnected ? '✅' : '🔄'} - Disponible 24h/24`}
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar - Questions suggérées */}
                    <div className="lg:col-span-1 space-y-4">
                        <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                                    <HelpCircle className="w-4 h-4 text-blue-400" />
                                    Questions fréquentes
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {suggestedQuestions.map((question, index) => (
                                    <Button
                                        key={index}
                                        variant="outline"
                                        className="w-full justify-start text-xs h-auto py-2 px-3 text-left border-purple-500/30 text-purple-300 hover:bg-purple-500/20 hover:border-purple-500 transition-colors"
                                        onClick={() => setInputMessage(question)}
                                        disabled={isHumanSupport || isLoading}
                                    >
                                        {question}
                                    </Button>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Support Humain */}
                        <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-green-400" />
                                    Support Humain
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <div className={`w-2 h-2 rounded-full ${isConnected && userId ? 'bg-green-400 animate-pulse' :
                                            userId ? 'bg-yellow-400' : 'bg-red-400'
                                        }`}></div>
                                    <span className={
                                        isConnected && userId ? 'text-green-400' :
                                            userId ? 'text-yellow-400' : 'text-red-400'
                                    }>
                                        {isCheckingAuth ? 'Vérification...' :
                                            isConnected && userId ? 'Connecté et prêt' :
                                                userId ? 'Prêt à se connecter' : 'Chargement...'}
                                    </span>
                                </div>
                                <p className="text-xs text-purple-300">
                                    {userId
                                        ? 'Discutez en direct avec notre équipe de support'
                                        : 'Chargement de votre profil...'
                                    }
                                </p>
                                <Button
                                    onClick={connectToHumanSupport}
                                    disabled={isHumanSupport || isLoading || !userId || isCheckingAuth}
                                    className={`w-full ${isHumanSupport
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-green-600 hover:bg-green-700'
                                        } text-white transition-colors`}
                                    size="sm"
                                >
                                    {isCheckingAuth ? (
                                        <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Chargement...
                                        </>
                                    ) : isHumanSupport ? (
                                        <>
                                            <Shield className="w-4 h-4 mr-2" />
                                            En conversation
                                        </>
                                    ) : !userId ? (
                                        <>
                                            <User className="w-4 h-4 mr-2" />
                                            Patientez...
                                        </>
                                    ) : (
                                        <>
                                            <Phone className="w-4 h-4 mr-2" />
                                            Parler à un expert
                                        </>
                                    )}
                                </Button>

                                {/* Debug info */}
                                {process.env.NODE_ENV === 'development' && (
                                    <div className="mt-2 p-2 bg-gray-700/50 rounded text-xs">
                                        <div className="text-purple-300">Debug:</div>
                                        <div className="text-green-400">UserID: {userId || 'null'}</div>
                                        <div className="text-blue-400">Connecté: {isConnected ? 'Oui' : 'Non'}</div>
                                        <div className="text-yellow-400">STOMP: {stompClient ? 'Activé' : 'Désactivé'}</div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Email Support */}
                        <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30">
                            <CardHeader>
                                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-orange-400" />
                                    Email de Support
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2 text-sm text-orange-400">
                                    <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                                    Disponible 24h/24
                                </div>
                                <p className="text-xs text-purple-300">
                                    Pour les demandes détaillées nécessitant une réponse écrite
                                </p>
                                <Button
                                    onClick={handleOpenEmailDialog}
                                    disabled={isLoading}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white transition-colors"
                                    size="sm"
                                >
                                    <Mail className="w-4 h-4 mr-2" />
                                    Envoyer un email
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Informations de statut */}
                        <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex items-center gap-2 text-sm text-green-400">
                                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
                                    {isHumanSupport ? 'Support Humain Actif' : 'Assistant IA Actif'}
                                </div>
                                <p className="text-xs text-purple-300">
                                    {isHumanSupport
                                        ? '👨‍💼 Expert MyLb en ligne'
                                        : '🤖 Réponses instantanées 24h/24'}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-blue-400">
                                    <Mail className="w-3 h-3" />
                                    support@mylb.fr
                                </div>
                                {userId && (
                                    <div className="flex items-center gap-2 text-xs text-purple-400">
                                        <User className="w-3 h-3" />
                                        ID: #{userId}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Zone de chat principale */}
                    <div className="lg:col-span-3">
                        <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30 shadow-xl h-[600px] flex flex-col">
                            <CardHeader className="pb-4 border-b border-purple-500/30">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full animate-pulse ${isHumanSupport ? 'bg-green-400' : 'bg-blue-400'
                                        }`}></div>
                                    <div>
                                        <CardTitle className="text-white text-lg">
                                            {isHumanSupport ? '👨‍💼 Support Humain MyLb' : '🤖 Assistant MyLb'}
                                        </CardTitle>
                                        <CardDescription className="text-purple-300">
                                            {isHumanSupport
                                                ? `Expert disponible ${isConnected ? '✅' : '🔄'} - Temps de réponse : 2-3 min`
                                                : `⚡ Réponse instantanée ${isConnected ? '✅' : '🔄'}`}
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary" className="ml-auto bg-purple-500/20 text-purple-400 border-purple-500/30">
                                        {isHumanSupport ? '👥 Support Humain' : '🤖 Assistant IA'}
                                    </Badge>
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 p-0">
                                <ScrollArea
                                    ref={scrollAreaRef}
                                    className="h-[400px] p-4"
                                >
                                    <div className="space-y-4">
                                        {messages.map((message) => (
                                            <div
                                                key={message.id}
                                                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div
                                                    className={`max-w-[85%] rounded-2xl p-4 ${message.sender === 'user'
                                                            ? 'bg-purple-600 text-white rounded-br-none'
                                                            : message.sender === 'admin'
                                                                ? 'bg-green-500/20 border border-green-500/30 text-white rounded-bl-none'
                                                                : 'bg-blue-500/10 border border-blue-500/20 text-white rounded-bl-none'
                                                        }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        {message.sender !== 'user' && (
                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === 'admin'
                                                                    ? 'bg-green-500/20'
                                                                    : 'bg-blue-500/20'
                                                                }`}>
                                                                {getSenderIcon(message.sender)}
                                                            </div>
                                                        )}
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-xs font-semibold">
                                                                    {message.sender === 'user'
                                                                        ? 'Vous'
                                                                        : message.sender === 'admin'
                                                                            ? 'Conseiller MyLb'
                                                                            : 'Assistant MyLb'}
                                                                </span>
                                                                {getSenderBadge(message.sender)}
                                                                <span className="text-xs opacity-70">
                                                                    {formatTime(message.timestamp)}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                                                        </div>
                                                        {message.sender === 'user' && (
                                                            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
                                                                <User className="w-4 h-4 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {isLoading && (
                                            <div className="flex justify-start">
                                                <div className={`max-w-[85%] rounded-2xl p-4 ${isHumanSupport
                                                        ? 'bg-green-500/20 border border-green-500/30'
                                                        : 'bg-blue-500/10 border border-blue-500/20'
                                                    } text-white rounded-bl-none`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isHumanSupport ? 'bg-green-500/20' : 'bg-blue-500/20'
                                                            }`}>
                                                            {isHumanSupport
                                                                ? <User className="w-4 h-4 text-green-400" />
                                                                : <Bot className="w-4 h-4 text-blue-400" />
                                                            }
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                                                            <span className="text-sm">
                                                                {isHumanSupport ? 'Conseiller écrit...' : 'Assistant réfléchit...'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>

                            {/* Alerte pour le support humain */}
                            {showHumanSupportAlert && !isHumanSupport && (
                                <div className="px-4 pt-2">
                                    <Alert className="bg-blue-500/20 border-blue-500/50">
                                        <Clock className="w-4 h-4 text-blue-400" />
                                        <AlertDescription className="text-sm text-blue-300">
                                            Besoin d'une aide plus personnalisée ?{' '}
                                            <Button
                                                variant="link"
                                                className="p-0 h-auto text-blue-400 font-semibold hover:text-blue-300"
                                                onClick={connectToHumanSupport}
                                            >
                                                Parler à un expert humain
                                            </Button>
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            )}

                            <CardFooter className="pt-4 border-t border-purple-500/30">
                                <div className="flex gap-2 w-full">
                                    <Input
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder={
                                            isHumanSupport
                                                ? "Décrivez votre problème à notre expert..."
                                                : "Posez votre question sur MyLb..."
                                        }
                                        className="flex-1 bg-gray-700 border-purple-500/30 text-white focus:border-purple-500"
                                        disabled={isLoading}
                                    />
                                    <Button
                                        onClick={handleSendMessage}
                                        disabled={!inputMessage.trim() || isLoading}
                                        className="bg-purple-600 hover:bg-purple-700 text-white transition-colors shrink-0 border-0"
                                        size="icon"
                                    >
                                        {isLoading ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Send className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardFooter>
                        </Card>

                        {/* Conseils */}
                        <div className="mt-4 text-center">
                            <p className="text-sm text-purple-300">
                                {isHumanSupport
                                    ? "💡 Notre équipe est là pour vous aider - soyez précis dans votre description"
                                    : "💡 Conseil : Posez des questions spécifiques ou envoyez un email pour les problèmes complexes"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Dialog pour l'envoi d'email */}
            <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                <DialogContent className="sm:max-w-[600px] bg-gray-800 border-purple-500/30">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <Mail className="w-5 h-5 text-orange-400" />
                            Envoyer un email au support
                        </DialogTitle>
                        <DialogDescription className="text-purple-300">
                            Votre message sera envoyé à notre équipe de support qui vous répondra dans les 24 heures.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subject" className="text-right text-purple-300">
                                Sujet *
                            </Label>
                            <Input
                                id="subject"
                                value={emailForm.subject}
                                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                                className="col-span-3 bg-gray-700 border-purple-500/30 text-white focus:border-purple-500"
                                placeholder="Décrivez brièvement votre problème"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="userEmail" className="text-right text-purple-300">
                                Votre email *
                            </Label>
                            <Input
                                id="userEmail"
                                type="email"
                                value={emailForm.userEmail}
                                onChange={(e) => setEmailForm(prev => ({ ...prev, userEmail: e.target.value }))}
                                className="col-span-3 bg-gray-700 border-purple-500/30 text-white focus:border-purple-500"
                                placeholder="votre@email.com"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="userName" className="text-right text-purple-300">
                                Votre nom
                            </Label>
                            <Input
                                id="userName"
                                value={emailForm.userName}
                                onChange={(e) => setEmailForm(prev => ({ ...prev, userName: e.target.value }))}
                                className="col-span-3 bg-gray-700 border-purple-500/30 text-white focus:border-purple-500"
                                placeholder="Votre nom et prénom"
                            />
                        </div>

                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="content" className="text-right pt-2 text-purple-300">
                                Message *
                            </Label>
                            <Textarea
                                id="content"
                                value={emailForm.content}
                                onChange={(e) => setEmailForm(prev => ({ ...prev, content: e.target.value }))}
                                className="col-span-3 min-h-[150px] bg-gray-700 border-purple-500/30 text-white focus:border-purple-500"
                                placeholder="Décrivez votre problème en détail..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowEmailDialog(false)}
                            disabled={isSendingEmail}
                            className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSendEmail}
                            disabled={isSendingEmail || !emailForm.subject || !emailForm.content || !emailForm.userEmail}
                            className="bg-orange-600 hover:bg-orange-700 text-white border-0"
                        >
                            {isSendingEmail ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Envoyer l'email
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ChatSupport;
