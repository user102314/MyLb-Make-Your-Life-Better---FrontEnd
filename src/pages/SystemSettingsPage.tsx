import React, { useState } from 'react';
import { 
  Settings, 
  Shield, 
  Bell, 
  CreditCard, 
  Database, 
  Lock, 
  Globe,
  Mail,
  Users,
  AlertTriangle,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Server,
  Network,
  Clock,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';

const SystemSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    // Sécurité
    twoFactorAuth: true,
    sessionTimeout: 30,
    passwordPolicy: 'strong',
    autoLogout: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    securityAlerts: true,
    marketUpdates: false,
    
    // Transactions
    maxTransactionLimit: 10000,
    dailyLimit: 50000,
    autoApproveSmall: true,
    smallTransactionThreshold: 1000,
    
    // Système
    maintenanceMode: false,
    apiRateLimit: 1000,
    dataRetention: 365,
    backupFrequency: 'daily',
    
    // API & Intégrations
    apiEnabled: true,
    webhookUrl: '',
    marketDataProvider: 'alphavantage',
    
    // Base de données
    dbEncryption: true,
    auditLogs: true,
    performanceMonitoring: true
  });

  const [showApiKey, setShowApiKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulation de sauvegarde
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSaving(false);
  };

  const handleReset = () => {
    setSettings({
      twoFactorAuth: true,
      sessionTimeout: 30,
      passwordPolicy: 'strong',
      autoLogout: true,
      emailNotifications: true,
      pushNotifications: false,
      securityAlerts: true,
      marketUpdates: false,
      maxTransactionLimit: 10000,
      dailyLimit: 50000,
      autoApproveSmall: true,
      smallTransactionThreshold: 1000,
      maintenanceMode: false,
      apiRateLimit: 1000,
      dataRetention: 365,
      backupFrequency: 'daily',
      apiEnabled: true,
      webhookUrl: '',
      marketDataProvider: 'alphavantage',
      dbEncryption: true,
      auditLogs: true,
      performanceMonitoring: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <div className="bg-gray-800 border border-purple-500/20 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Paramètres Système
                </h1>
                <p className="text-gray-400">
                  Configuration et gestion des paramètres de la plateforme financière
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleReset}
              variant="outline"
              className="flex items-center gap-2 bg-gray-800 border-purple-500 text-white hover:bg-purple-500/10 hover:border-purple-400"
            >
              <RefreshCw className="w-4 h-4 text-purple-400" />
              Réinitialiser
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="security" className="space-y-6">
          <TabsList className="bg-gray-800 border border-purple-500/20 p-1">
            <TabsTrigger value="security" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white text-gray-300">
              <Shield className="w-4 h-4 mr-2" />
              Sécurité
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white text-gray-300">
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white text-gray-300">
              <CreditCard className="w-4 h-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="system" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white text-gray-300">
              <Server className="w-4 h-4 mr-2" />
              Système
            </TabsTrigger>
            <TabsTrigger value="api" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-white text-gray-300">
              <Globe className="w-4 h-4 mr-2" />
              API & Intégrations
            </TabsTrigger>
          </TabsList>

          {/* Sécurité */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Lock className="w-5 h-5 text-purple-400" />
                    Authentification
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="2fa" className="text-white">Authentification à deux facteurs</Label>
                      <p className="text-sm text-gray-400">Requis pour tous les utilisateurs</p>
                    </div>
                    <Switch
                      id="2fa"
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => setSettings({...settings, twoFactorAuth: checked})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout" className="text-white">Délai d'expiration de session (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={settings.sessionTimeout}
                      onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
                      className="bg-gray-700 border-purple-500/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordPolicy" className="text-white">Politique de mot de passe</Label>
                    <Select value={settings.passwordPolicy} onValueChange={(value) => setSettings({...settings, passwordPolicy: value})}>
                      <SelectTrigger className="bg-gray-700 border-purple-500/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-purple-500/20 text-white">
                        <SelectItem value="basic">Basique (8 caractères)</SelectItem>
                        <SelectItem value="medium">Moyen (12 caractères + chiffres)</SelectItem>
                        <SelectItem value="strong">Fort (16 caractères + chiffres + symboles)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoLogout" className="text-white">Déconnexion automatique</Label>
                      <p className="text-sm text-gray-400">Déconnecte après inactivité</p>
                    </div>
                    <Switch
                      id="autoLogout"
                      checked={settings.autoLogout}
                      onCheckedChange={(checked) => setSettings({...settings, autoLogout: checked})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="w-5 h-5 text-purple-400" />
                    Sécurité Avancée
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-purple-400" />
                      <span className="font-semibold text-white">Clé API Secrète</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type={showApiKey ? "text" : "password"}
                        value="sk_live_••••••••••••••••••••••••"
                        className="bg-gray-700 border-purple-500/20 text-white font-mono"
                        readOnly
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="bg-gray-700 border-purple-500/20 text-white"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-sm text-gray-400 mt-2">
                      Cette clé donne accès complet à l'API. Gardez-la secrète.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Chiffrement de la base de données</Label>
                      <p className="text-sm text-gray-400">Chiffrement AES-256 activé</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-400">
                      Actif
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Journaux d'audit</Label>
                      <p className="text-sm text-gray-400">Toutes les actions sont journalisées</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-400">
                      Actif
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Mail className="w-5 h-5 text-purple-400" />
                    Notifications Email
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications" className="text-white">Notifications générales</Label>
                      <p className="text-sm text-gray-400">Nouvelles fonctionnalités et mises à jour</p>
                    </div>
                    <Switch
                      id="emailNotifications"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, emailNotifications: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="securityAlerts" className="text-white">Alertes de sécurité</Label>
                      <p className="text-sm text-gray-400">Connexions suspectes et activités</p>
                    </div>
                    <Switch
                      id="securityAlerts"
                      checked={settings.securityAlerts}
                      onCheckedChange={(checked) => setSettings({...settings, securityAlerts: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketUpdates" className="text-white">Mises à jour marché</Label>
                      <p className="text-sm text-gray-400">Analyses et tendances du marché</p>
                    </div>
                    <Switch
                      id="marketUpdates"
                      checked={settings.marketUpdates}
                      onCheckedChange={(checked) => setSettings({...settings, marketUpdates: checked})}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Bell className="w-5 h-5 text-purple-400" />
                    Notifications en Temps Réel
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="pushNotifications" className="text-white">Notifications push</Label>
                      <p className="text-sm text-gray-400">Alertes en temps réel</p>
                    </div>
                    <Switch
                      id="pushNotifications"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => setSettings({...settings, pushNotifications: checked})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Webhook pour notifications</Label>
                    <Input
                      placeholder="https://votre-domaine.com/webhook"
                      className="bg-gray-700 border-purple-500/20 text-white"
                    />
                    <p className="text-sm text-gray-400">
                      URL pour recevoir les notifications en temps réel
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Transactions */}
          <TabsContent value="transactions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <CreditCard className="w-5 h-5 text-purple-400" />
                    Limites de Transaction
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxTransactionLimit" className="text-white">
                      Limite maximale par transaction (€)
                    </Label>
                    <Input
                      id="maxTransactionLimit"
                      type="number"
                      value={settings.maxTransactionLimit}
                      onChange={(e) => setSettings({...settings, maxTransactionLimit: parseInt(e.target.value)})}
                      className="bg-gray-700 border-purple-500/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dailyLimit" className="text-white">
                      Limite quotidienne par utilisateur (€)
                    </Label>
                    <Input
                      id="dailyLimit"
                      type="number"
                      value={settings.dailyLimit}
                      onChange={(e) => setSettings({...settings, dailyLimit: parseInt(e.target.value)})}
                      className="bg-gray-700 border-purple-500/20 text-white"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="autoApproveSmall" className="text-white">Approbation automatique petites transactions</Label>
                      <p className="text-sm text-gray-400">Approuver automatiquement les transactions sous le seuil</p>
                    </div>
                    <Switch
                      id="autoApproveSmall"
                      checked={settings.autoApproveSmall}
                      onCheckedChange={(checked) => setSettings({...settings, autoApproveSmall: checked})}
                    />
                  </div>

                  {settings.autoApproveSmall && (
                    <div className="space-y-2">
                      <Label htmlFor="smallTransactionThreshold" className="text-white">
                        Seuil pour petites transactions (€)
                      </Label>
                      <Input
                        id="smallTransactionThreshold"
                        type="number"
                        value={settings.smallTransactionThreshold}
                        onChange={(e) => setSettings({...settings, smallTransactionThreshold: parseInt(e.target.value)})}
                        className="bg-gray-700 border-purple-500/20 text-white"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Users className="w-5 h-5 text-purple-400" />
                    Validation des Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="font-semibold text-white">Temps de traitement moyen</span>
                    </div>
                    <p className="text-2xl font-bold text-white">2.3 secondes</p>
                    <p className="text-sm text-gray-400">Dernières 24 heures</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-400">Transactions aujourd'hui</p>
                      <p className="text-xl font-bold text-white">1,247</p>
                    </div>
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-400">Taux de réussite</p>
                      <p className="text-xl font-bold text-green-400">99.8%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Système */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Server className="w-5 h-5 text-purple-400" />
                    Maintenance et Performance
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="maintenanceMode" className="text-white">Mode maintenance</Label>
                      <p className="text-sm text-gray-400">Restreint l'accès à la plateforme</p>
                    </div>
                    <Switch
                      id="maintenanceMode"
                      checked={settings.maintenanceMode}
                      onCheckedChange={(checked) => setSettings({...settings, maintenanceMode: checked})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="apiRateLimit" className="text-white">Limite de débit API (req/heure)</Label>
                    <Input
                      id="apiRateLimit"
                      type="number"
                      value={settings.apiRateLimit}
                      onChange={(e) => setSettings({...settings, apiRateLimit: parseInt(e.target.value)})}
                      className="bg-gray-700 border-purple-500/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dataRetention" className="text-white">Rétention des données (jours)</Label>
                    <Input
                      id="dataRetention"
                      type="number"
                      value={settings.dataRetention}
                      onChange={(e) => setSettings({...settings, dataRetention: parseInt(e.target.value)})}
                      className="bg-gray-700 border-purple-500/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency" className="text-white">Fréquence des sauvegardes</Label>
                    <Select value={settings.backupFrequency} onValueChange={(value) => setSettings({...settings, backupFrequency: value})}>
                      <SelectTrigger className="bg-gray-700 border-purple-500/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-purple-500/20 text-white">
                        <SelectItem value="hourly">Horaire</SelectItem>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Database className="w-5 h-5 text-purple-400" />
                    Base de Données
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-white">Statut de la base</Label>
                      <p className="text-sm text-gray-400">Connectivité et performance</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400 border-green-400">
                      Optimale
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Dernière sauvegarde</Label>
                    <p className="text-white">Il y a 2 heures</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white">Taille de la base</Label>
                    <p className="text-white">4.7 GB</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 bg-gray-700 border-purple-500/20 text-white hover:bg-purple-500/10">
                      <Download className="w-4 h-4 mr-2" />
                      Sauvegarder
                    </Button>
                    <Button variant="outline" className="flex-1 bg-gray-700 border-purple-500/20 text-white hover:bg-purple-500/10">
                      <Upload className="w-4 h-4 mr-2" />
                      Restaurer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API & Intégrations */}
          <TabsContent value="api" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Globe className="w-5 h-5 text-purple-400" />
                    Configuration API
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="apiEnabled" className="text-white">API REST activée</Label>
                      <p className="text-sm text-gray-400">Accès aux endpoints API</p>
                    </div>
                    <Switch
                      id="apiEnabled"
                      checked={settings.apiEnabled}
                      onCheckedChange={(checked) => setSettings({...settings, apiEnabled: checked})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="webhookUrl" className="text-white">URL Webhook</Label>
                    <Input
                      id="webhookUrl"
                      placeholder="https://votre-domaine.com/webhook"
                      value={settings.webhookUrl}
                      onChange={(e) => setSettings({...settings, webhookUrl: e.target.value})}
                      className="bg-gray-700 border-purple-500/20 text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="marketDataProvider" className="text-white">Fournisseur de données marché</Label>
                    <Select value={settings.marketDataProvider} onValueChange={(value) => setSettings({...settings, marketDataProvider: value})}>
                      <SelectTrigger className="bg-gray-700 border-purple-500/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-purple-500/20 text-white">
                        <SelectItem value="alphavantage">Alpha Vantage</SelectItem>
                        <SelectItem value="yahoo">Yahoo Finance</SelectItem>
                        <SelectItem value="bloomberg">Bloomberg</SelectItem>
                        <SelectItem value="custom">Personnalisé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-purple-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Network className="w-5 h-5 text-purple-400" />
                    Statistiques API
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-400">Requêtes aujourd'hui</p>
                      <p className="text-xl font-bold text-white">24,891</p>
                    </div>
                    <div className="p-3 bg-gray-700 rounded-lg">
                      <p className="text-sm text-gray-400">Taux d'erreur</p>
                      <p className="text-xl font-bold text-red-400">0.02%</p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4 text-purple-400" />
                      <span className="font-semibold text-white">Documentation API</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-3">
                      Accédez à la documentation complète de l'API
                    </p>
                    <Button variant="outline" className="w-full bg-gray-700 border-purple-500/20 text-white hover:bg-purple-500/10">
                      Voir la documentation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Alertes système */}
        <Alert className="bg-blue-500/10 border-blue-500/20 mt-6">
          <AlertTriangle className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-400">
            Les modifications seront appliquées après redémarrage des services. Une maintenance de 2 minutes est prévue.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default SystemSettingsPage;