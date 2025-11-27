// src/pages/AdminEmailSender.tsx
import React, { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { 
  Send, 
  Mail, 
  User, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Users,
  Search,
  Building,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

interface Client {
  clientId: number;
  firstName: string;
  lastName: string;
  email: string;
  isVerified: boolean;
  isFullyVerified: boolean;
  companiesCount: number;
}

const AdminEmailSender: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [emailData, setEmailData] = useState({
    toEmail: '',
    subject: '',
    content: '',
    type: 'info'
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const BASE_URL = "http://localhost:9090";

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    filterClients();
  }, [clients, searchTerm]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BASE_URL}/api/admin/statistics/users/verification-stats`, {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setClients(data.users);
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des clients:', err);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des clients' });
    } finally {
      setLoading(false);
    }
  };

  const filterClients = () => {
    let filtered = clients;

    if (searchTerm) {
      filtered = filtered.filter(client =>
        client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredClients(filtered);
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setEmailData(prev => ({
      ...prev,
      toEmail: client.email
    }));
  };

  const handleSendEmail = async () => {
    if (!emailData.toEmail || !emailData.subject || !emailData.content) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires' });
      return;
    }

    setSending(true);
    setMessage(null);

    try {
      const response = await fetch(`${BASE_URL}/api/email/send-mail-to`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(emailData)
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        setEmailData({
          toEmail: '',
          subject: '',
          content: '',
          type: 'info'
        });
        setSelectedClient(null);
      } else {
        setMessage({ type: 'error', text: result.message });
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi de l\'email:', err);
      setMessage({ type: 'error', text: 'Erreur lors de l\'envoi de l\'email' });
    } finally {
      setSending(false);
    }
  };

  const emailTemplates = {
    welcome: {
      subject: 'Bienvenue sur MyLb - Votre compte a été activé',
      content: 'Nous sommes ravis de vous accueillir sur MyLb. Votre compte a été activé avec succès et vous pouvez maintenant accéder à toutes les fonctionnalités de notre plateforme.\n\nN\'hésitez pas à explorer nos services et à nous contacter si vous avez des questions.\n\nBien cordialement,\nL\'équipe MyLb'
    },
    verification: {
      subject: 'Action requise - Vérification de votre compte MyLb',
      content: 'Pour finaliser l\'activation de votre compte MyLb, nous avons besoin de vérifier certaines informations.\n\nVeuillez compléter votre profil et soumettre les documents requis pour accéder à l\'ensemble des fonctionnalités.\n\nSi vous avez des questions, notre équipe de support est à votre disposition.\n\nCordialement,\nL\'équipe MyLb'
    },
    update: {
      subject: 'Mise à jour importante - MyLb',
      content: 'Nous vous informons d\'une mise à jour importante de notre plateforme MyLb.\n\nNouveautés :\n• Amélioration de l\'interface utilisateur\n• Nouvelles fonctionnalités de trading\n• Optimisation des performances\n\nCes améliorations visent à vous offrir une meilleure expérience utilisateur.\n\nL\'équipe MyLb'
    }
  };

  const applyTemplate = (templateKey: keyof typeof emailTemplates) => {
    const template = emailTemplates[templateKey];
    setEmailData(prev => ({
      ...prev,
      subject: template.subject,
      content: template.content
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900/20 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <Mail className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Envoi d'Emails Administrateur</h1>
              <p className="text-purple-300">Envoyez des emails aux utilisateurs de la plateforme</p>
            </div>
          </div>
        </div>

        {message && (
          <Alert className={`mb-6 ${
            message.type === 'success' 
              ? 'bg-green-900/50 border-green-700/50' 
              : 'bg-red-900/50 border-red-700/50'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4 text-green-400" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-400" />
            )}
            <AlertDescription className={
              message.type === 'success' ? 'text-green-300' : 'text-red-300'
            }>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Liste des utilisateurs */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Liste des Utilisateurs ({filteredClients.length})
                </CardTitle>
                <CardDescription className="text-purple-300">
                  Sélectionnez un utilisateur pour lui envoyer un email
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Barre de recherche */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un utilisateur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-purple-500/30 text-white focus:border-purple-500"
                  />
                </div>

                {/* Liste des utilisateurs */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {loading ? (
                    [...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-16 bg-gray-700 rounded-lg" />
                    ))
                  ) : filteredClients.length === 0 ? (
                    <div className="text-center py-8 text-purple-400">
                      <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun utilisateur trouvé</p>
                    </div>
                  ) : (
                    filteredClients.map((client) => (
                      <div
                        key={client.clientId}
                        className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                          selectedClient?.clientId === client.clientId
                            ? 'bg-purple-500/20 border-purple-500'
                            : 'bg-gray-700/50 border-purple-500/20 hover:bg-purple-500/10 hover:border-purple-500/50'
                        }`}
                        onClick={() => handleClientSelect(client)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-white text-sm">
                                {client.firstName} {client.lastName}
                              </h3>
                              {client.isFullyVerified && (
                                <Badge className="bg-green-500/20 text-green-400 border-green-400 text-xs">
                                  Vérifié
                                </Badge>
                              )}
                            </div>
                            <p className="text-purple-300 text-xs truncate">{client.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Building className="w-3 h-3 text-purple-400" />
                              <span className="text-purple-400 text-xs">
                                {client.companiesCount} entreprise(s)
                              </span>
                            </div>
                          </div>
                          <Mail className="w-4 h-4 text-purple-400" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Formulaire d'envoi d'email */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Send className="w-5 h-5 text-purple-400" />
                  Composition de l'Email
                </CardTitle>
                <CardDescription className="text-purple-300">
                  {selectedClient 
                    ? `Email à: ${selectedClient.firstName} ${selectedClient.lastName}`
                    : 'Sélectionnez un utilisateur pour composer votre email'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Templates rapides */}
                <div>
                  <Label className="text-purple-300 mb-2 block">Modèles rapides</Label>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                      onClick={() => applyTemplate('welcome')}
                    >
                      🎉 Email de bienvenue
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                      onClick={() => applyTemplate('verification')}
                    >
                      ⚠️ Demande de vérification
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20"
                      onClick={() => applyTemplate('update')}
                    >
                      📢 Mise à jour plateforme
                    </Button>
                  </div>
                </div>

                {/* Destinataire */}
                <div className="space-y-2">
                  <Label htmlFor="toEmail" className="text-purple-300">
                    Destinataire <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="toEmail"
                    placeholder="email@exemple.com"
                    value={emailData.toEmail}
                    onChange={(e) => setEmailData(prev => ({ ...prev, toEmail: e.target.value }))}
                    className="bg-gray-700 border-purple-500/30 text-white focus:border-purple-500"
                    disabled={!!selectedClient}
                  />
                </div>

                {/* Type d'email */}
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-purple-300">Type d'email</Label>
                  <Select value={emailData.type} onValueChange={(value) => setEmailData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger className="bg-gray-700 border-purple-500/30 text-white focus:border-purple-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-purple-500/30">
                      <SelectItem value="info" className="text-white hover:bg-purple-500/20">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-400" />
                          Information générale
                        </div>
                      </SelectItem>
                      <SelectItem value="notification" className="text-white hover:bg-purple-500/20">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-green-400" />
                          Notification
                        </div>
                      </SelectItem>
                      <SelectItem value="alert" className="text-white hover:bg-purple-500/20">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-400" />
                          Alerte importante
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sujet */}
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-purple-300">
                    Sujet <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Sujet de l'email..."
                    value={emailData.subject}
                    onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                    className="bg-gray-700 border-purple-500/30 text-white focus:border-purple-500"
                  />
                </div>

                {/* Contenu */}
                <div className="space-y-2">
                  <Label htmlFor="content" className="text-purple-300">
                    Contenu du message <span className="text-red-400">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="Rédigez votre message ici..."
                    value={emailData.content}
                    onChange={(e) => setEmailData(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-[200px] bg-gray-700 border-purple-500/30 text-white focus:border-purple-500 resize-none"
                  />
                </div>

                {/* Bouton d'envoi */}
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleSendEmail}
                    disabled={sending || !emailData.toEmail || !emailData.subject || !emailData.content}
                    className="bg-purple-600 hover:bg-purple-700 text-white border-0 px-8"
                  >
                    {sending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Envoyer l'Email
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Aperçu de l'email */}
            {emailData.content && (
              <Card className="bg-gray-800/90 backdrop-blur-xl border-purple-500/30 mt-6">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-400" />
                    Aperçu de l'Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 rounded-lg p-4 border border-purple-500/20">
                    <div className="text-sm text-purple-300 space-y-2">
                      <p><strong>À:</strong> {emailData.toEmail}</p>
                      <p><strong>Sujet:</strong> {emailData.subject}</p>
                      <div className="mt-4 p-3 bg-gray-800 rounded border-l-4 border-purple-500">
                        <div className="whitespace-pre-wrap text-white">
                          {emailData.content}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEmailSender;