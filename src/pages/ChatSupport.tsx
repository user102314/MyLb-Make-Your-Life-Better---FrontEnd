// src/pages/ChatSupport.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Bot, User, Loader2, ArrowLeft, MessageCircle, Phone, Shield, Clock, HelpCircle, Mail, X } from 'lucide-react';
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
  sender: 'user' | 'bot' | 'human';
  timestamp: Date;
}

// Base de connaissances étendue avec réponses automatiques
const knowledgeBase: { [key: string]: string } = {
  "comment acheter des stocks": `Pour acheter des stocks sur MyLb :

📈 **Processus d'achat complet :**
1. **Connexion** → Accédez à votre compte MyLb
2. **Navigation** → Section "Marché" ou "Bourse"
3. **Recherche** → Trouvez l'entreprise souhaitée
4. **Sélection** → Cliquez sur "Acheter"
5. **Quantité** → Entrez le nombre d'actions
6. **Validation** → Confirmez la transaction

💡 **Fonctions avancées :**
• Achat rapide pour actions populaires
• Ordres limites pour prix spécifiques
• Alertes de prix personnalisées`,

  "comment vendre mes actions": `Pour vendre vos actions sur MyLb :

💰 **Processus de vente détaillé :**
1. **Portefeuille** → Accédez à vos investissements
2. **Sélection** → Choisissez les actions à vendre
3. **Option vente** → Cliquez sur "Vendre"
4. **Quantité** → Sélectionnez le nombre d'actions
5. **Confirmation** → Validez la transaction

⚡ **Avantages :**
• Exécution instantanée
• Frais transparents
• Solde crédité immédiatement`,

  "comment vérifier mon solde": `Pour vérifier votre solde MyLb :

🏦 **Multiples méthodes disponibles :**

**Tableau de bord principal :**
• Solde total affiché en haut
• Détail par type d'actif
• Évolution sur 24h

**Section Portefeuille :**
• Détail complet des investissements
• Répartition par secteur
• Performance historique`,

  "problème avec ma transaction": `En cas de problème de transaction :

🔧 **Guide de dépannage complet :**

**Vérifications immédiates :**
1. Connexion internet stable
2. Solde suffisant disponible
3. Heures de marché (9h-17h30)
4. Statut du compte vérifié

**Étapes de résolution :**
1. Consultez l'historique des transactions
2. Vérifiez les emails de confirmation
3. Redémarrez l'application
4. Contactez le support si nécessaire`,

  "comment créer une entreprise": `Pour créer une entreprise sur MyLb :

🏢 **Processus de création étape par étape :**

**1. Préparation :**
• Documents d'identité
• Justificatif de domicile
• Statuts de l'entreprise
• KBIS existant (si applicable)

**2. Enregistrement :**
• Rendez-vous dans "Mon Entreprise"
• Cliquez sur "Créer une entreprise"
• Remplissez le formulaire en ligne
• Téléchargez les documents

**3. Validation :**
• Vérification par notre équipe
• Activation sous 48h
• Notification par email`,

  "contacter support": `Options de contact support :

📞 **Support téléphonique :**
• Numéro : 01 23 45 67 89
• Horaires : Lun-Ven 8h-20h
• Urgences : 24h/24

📧 **Email :**
• support@mylb.fr
• Réponse sous 4h
• Pièces jointes acceptées

💬 **Chat en direct :**
• Disponible sur l'application
• Temps d'attente : < 5min
• Historique conservé`
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
  const [apiError, setApiError] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    content: '',
    userEmail: '',
    userName: ''
  });
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
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
    
    const cleanMessage = normalizedMessage.replace('?', '').trim();
    for (const [question, response] of Object.entries(knowledgeBase)) {
      const cleanQuestion = question.toLowerCase().replace('?', '').trim();
      if (cleanMessage === cleanQuestion || 
          cleanMessage.includes(cleanQuestion) ||
          cleanQuestion.includes(cleanMessage)) {
        return response;
      }
    }
    
    return null;
  };

  // Fonction pour envoyer un email au support
  // Dans ChatSupport.tsx, modifiez la fonction sendSupportEmail :

const sendSupportEmail = async (emailData: any) => {
  try {
    setIsSendingEmail(true);
    
    // URL complète avec le bon port 9090
    const baseUrl = 'http://localhost:9090'; // Port Spring Boot corrigé
    
    // Essayer d'abord l'endpoint authentifié
    let response = await fetch(`${baseUrl}/api/email/send-to-support`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
      credentials: 'include'
    });

    // Si non authentifié (401), utiliser l'endpoint public
    if (response.status === 401) {
      console.log('Utilisateur non authentifié, utilisation de l endpoint public');
      response = await fetch(`${baseUrl}/api/email/public/support-request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: emailData.subject,
          content: emailData.content,
          userEmail: emailData.userEmail,
          userName: emailData.userName || 'Utilisateur MyLb'
        })
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    
    if (result.success) {
      return { success: true, message: result.message };
    } else {
      throw new Error(result.message || 'Erreur inconnue du serveur');
    }

  } catch (error) {
    console.error('Erreur détaillée envoi email:', error);
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Erreur de connexion au serveur' 
    };
  } finally {
    setIsSendingEmail(false);
  }
};

  const connectToHumanSupport = () => {
    setIsHumanSupport(true);
    setHumanSupportRequested(true);
    setShowHumanSupportAlert(false);
    
    const humanSupportMessage: Message = {
      id: generateMessageId(),
      content: `✅ **Connexion établie avec notre support humain !**

👨‍💼 **Un conseiller MyLb spécialisé vous répondra dans les plus brefs délais.**

⏱️ **Temps d'attente estimé :** 2-3 minutes

📋 **Pour nous aider à vous assister rapidement :**
• Votre numéro de compte MyLb
• Une description détaillée du problème
• Les messages d'erreur éventuels
• La date et l'heure de l'incident

💡 **Pendant l'attente :**
Vous pouvez décrire votre problème en détail, notre expert le lira dès la prise en charge.`,
      sender: 'human',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, humanSupportMessage]);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Ajouter le message de l'utilisateur
    const userMessageObj: Message = {
      id: generateMessageId(),
      content: userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessageObj]);
    setIsLoading(true);

    try {
      if (isHumanSupport) {
        // En mode support humain - simuler une réponse humaine après un délai
        setTimeout(() => {
          const humanResponse: Message = {
            id: generateMessageId(),
            content: `👋 **Bonjour, je suis Marc, votre conseiller MyLb.**

Merci pour votre message. Je consulte actuellement votre dossier et vous répondrai dans quelques instants.

🔍 **Pour accélérer le traitement :**
Pourriez-vous me préciser :
• Votre numéro de compte (commençant par MLB)
• La nature exacte du problème
• Depuis combien de temps cela dure
• Les étapes déjà essayées

Je reste à votre disposition pour toute information complémentaire.`,
            sender: 'human',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, humanResponse]);
          setIsLoading(false);
        }, 3000);
      } else {
        // Mode assistant IA
        const automaticResponse = getAutomaticResponse(userMessage);
        
        let botResponse: string;
        
        if (automaticResponse) {
          botResponse = automaticResponse;
        } else {
          // Réponse par défaut pour les questions non reconnues
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

📧 **Contact :** mylbmakeyoulifebetter@gmail.com
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
    // Pré-remplir le sujet avec le dernier message de l'utilisateur
    const lastUserMessage = [...messages].reverse().find(msg => msg.sender === 'user');
    setEmailForm({
      subject: lastUserMessage ? `Support: ${lastUserMessage.content.substring(0, 50)}...` : 'Demande de support',
      content: lastUserMessage ? `Problème: ${lastUserMessage.content}\n\nDescription détaillée : ` : '',
      userEmail: '',
      userName: ''
    });
    setShowEmailDialog(true);
  };

  const handleSendEmail = async () => {
    if (!emailForm.subject.trim() || !emailForm.content.trim() || !emailForm.userEmail.trim()) {
      return;
    }

    const result = await sendSupportEmail(emailForm);
    
    if (result.success) {
      // Ajouter un message de confirmation dans le chat
      const confirmationMessage: Message = {
        id: generateMessageId(),
        content: `✅ **Votre email a été envoyé avec succès !**

📧 **Détails de l'envoi :**
• Sujet: ${emailForm.subject}
• Destinataire: mylbmakeyoulifebetter@gmail.com
• Email de réponse: ${emailForm.userEmail}

💌 **Prochaines étapes :**
Notre équipe vous répondra dans les 24 heures à l'adresse ${emailForm.userEmail}.

Merci pour votre patience !`,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, confirmationMessage]);
      setShowEmailDialog(false);
      setEmailForm({ subject: '', content: '', userEmail: '', userName: '' });
    } else {
      // Message d'erreur
      const errorMessage: Message = {
        id: generateMessageId(),
        content: `❌ **Échec de l'envoi de l'email**

Détail: ${result.message}

🔄 **Veuillez réessayer ou :**
• Contactez-nous directement à mylbmakeyoulifebetter@gmail.com
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

  const getSenderBadge = (sender: 'user' | 'bot' | 'human') => {
    switch (sender) {
      case 'bot':
        return <Badge variant="secondary" className="bg-blue-500 text-white text-xs">IA</Badge>;
      case 'human':
        return <Badge variant="secondary" className="bg-green-500 text-white text-xs">Support Humain</Badge>;
      default:
        return null;
    }
  };

  const getSenderIcon = (sender: 'user' | 'bot' | 'human') => {
    switch (sender) {
      case 'bot':
        return <Bot className="w-4 h-4 text-blue-500" />;
      case 'human':
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button 
            onClick={() => navigate(-1)}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          
          <Card className="bg-card border-border/50 shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                Support MyLb
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {isHumanSupport 
                  ? "🔗 Connecté au support humain - Temps d'attente : 2-3 min" 
                  : "🤖 Assistant IA - Disponible 24h/24"}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Questions suggérées */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-500" />
                  Questions fréquentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-xs h-auto py-2 px-3 text-left hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => setInputMessage(question)}
                    disabled={isHumanSupport || isLoading}
                  >
                    {question}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Support Humain */}
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-500" />
                  Support Humain
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  Disponible maintenant
                </div>
                <p className="text-xs text-muted-foreground">
                  Pour les problèmes complexes nécessitant une assistance personnalisée
                </p>
                <Button
                  onClick={connectToHumanSupport}
                  disabled={isHumanSupport || isLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white transition-colors"
                  size="sm"
                >
                  {isHumanSupport ? (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Déjà connecté
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
                      Parler à un expert
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Email Support */}
            <Card className="bg-card border-border/50">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4 text-orange-500" />
                  Email de Support
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-orange-400">
                  <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
                  Disponible 24h/24
                </div>
                <p className="text-xs text-muted-foreground">
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
            <Card className="bg-card border-border/50">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm text-green-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  {isHumanSupport ? 'Support Humain Actif' : 'Assistant IA Actif'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isHumanSupport 
                    ? '👨‍💼 Expert MyLb en ligne' 
                    : '🤖 Réponses instantanées 24h/24'}
                </p>
                <div className="flex items-center gap-2 text-xs text-blue-400">
                  <Mail className="w-3 h-3" />
                  support@mylb.fr
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Zone de chat principale */}
          <div className="lg:col-span-3">
            <Card className="bg-card border-border/50 shadow-xl h-[600px] flex flex-col">
              <CardHeader className="pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full animate-pulse ${
                    isHumanSupport ? 'bg-green-400' : 'bg-blue-400'
                  }`}></div>
                  <div>
                    <CardTitle className="text-foreground text-lg">
                      {isHumanSupport ? '👨‍💼 Support Humain MyLb' : '🤖 Assistant MyLb'}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {isHumanSupport 
                        ? 'Expert disponible - Temps de réponse : 2-3 min' 
                        : '⚡ Réponse instantanée'}
                    </CardDescription>
                  </div>
                  <Badge variant="secondary" className="ml-auto">
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
                          className={`max-w-[85%] rounded-2xl p-4 ${
                            message.sender === 'user'
                              ? 'bg-primary text-primary-foreground rounded-br-none'
                              : message.sender === 'human'
                              ? 'bg-green-500/20 border border-green-500/30 text-foreground rounded-bl-none'
                              : 'bg-blue-500/10 border border-blue-500/20 text-foreground rounded-bl-none'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {message.sender !== 'user' && (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                message.sender === 'human' 
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
                                    : message.sender === 'human'
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
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-primary-foreground" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className={`max-w-[85%] rounded-2xl p-4 ${
                          isHumanSupport 
                            ? 'bg-green-500/20 border border-green-500/30' 
                            : 'bg-blue-500/10 border border-blue-500/20'
                        } text-foreground rounded-bl-none`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              isHumanSupport ? 'bg-green-500/20' : 'bg-blue-500/20'
                            }`}>
                              {isHumanSupport 
                                ? <User className="w-4 h-4 text-green-500" />
                                : <Bot className="w-4 h-4 text-blue-500" />
                              }
                            </div>
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-primary" />
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
                    <Clock className="w-4 h-4 text-blue-500" />
                    <AlertDescription className="text-sm">
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

              <CardFooter className="pt-4 border-t border-border/50">
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
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-primary hover:bg-primary/90 transition-colors shrink-0"
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
              <p className="text-sm text-muted-foreground">
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
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-orange-500" />
              Envoyer un email au support
            </DialogTitle>
            <DialogDescription>
              Votre message sera envoyé à notre équipe de support qui vous répondra dans les 24 heures.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="subject" className="text-right">
                Sujet *
              </Label>
              <Input
                id="subject"
                value={emailForm.subject}
                onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                className="col-span-3"
                placeholder="Décrivez brièvement votre problème"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userEmail" className="text-right">
                Votre email *
              </Label>
              <Input
                id="userEmail"
                type="email"
                value={emailForm.userEmail}
                onChange={(e) => setEmailForm(prev => ({ ...prev, userEmail: e.target.value }))}
                className="col-span-3"
                placeholder="votre@email.com"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="userName" className="text-right">
                Votre nom
              </Label>
              <Input
                id="userName"
                value={emailForm.userName}
                onChange={(e) => setEmailForm(prev => ({ ...prev, userName: e.target.value }))}
                className="col-span-3"
                placeholder="Votre nom et prénom"
              />
            </div>

            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="content" className="text-right pt-2">
                Message *
              </Label>
              <Textarea
                id="content"
                value={emailForm.content}
                onChange={(e) => setEmailForm(prev => ({ ...prev, content: e.target.value }))}
                className="col-span-3 min-h-[150px]"
                placeholder="Décrivez votre problème en détail..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEmailDialog(false)}
              disabled={isSendingEmail}
            >
              Annuler
            </Button>
            <Button 
              onClick={handleSendEmail}
              disabled={isSendingEmail || !emailForm.subject || !emailForm.content || !emailForm.userEmail}
              className="bg-orange-600 hover:bg-orange-700"
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