# Vérification des Endpoints - ChatSupport et AdminMessaging

## 📋 Résumé des Endpoints Utilisés

### 🔵 ChatSupport.tsx

#### REST API Endpoints:
1. **GET** `/api/auth/me`
   - **Usage**: Récupération des informations de l'utilisateur connecté
   - **Ligne**: 160
   - **Réponse attendue**: `{ clientId, firstName, lastName, email, ... }`
   - **Status**: ✅ Utilisé correctement

2. **POST** `/api/email/send-to-support`
   - **Usage**: Envoi d'email au support technique
   - **Ligne**: 399
   - **Body**: `{ subject, content, userEmail, userName }`
   - **Réponse attendue**: `{ success: boolean, message: string }`
   - **Status**: ✅ Utilisé correctement

#### WebSocket STOMP:
1. **Connexion**: `http://localhost:9090/ws`
   - **Ligne**: 241
   - **Status**: ✅ Configuré

2. **Subscription**: `/queue/user/{userId}`
   - **Usage**: Recevoir les messages de l'admin
   - **Ligne**: 262
   - **Status**: ✅ Utilisé correctement

3. **Publish**: `/app/message/toAdmin`
   - **Usage**: Envoyer un message à l'admin
   - **Lignes**: 478, 518
   - **Body Format**: `{ sendFrom: number, sendTo: number, message: string, date: string }`
   - **Status**: ✅ Utilisé correctement

---

### 🟢 AdminMessaging.tsx

#### REST API Endpoints:
1. **GET** `/api/admin/users/complete-details`
   - **Usage**: Récupération de la liste complète des utilisateurs
   - **Ligne**: 181
   - **Réponse attendue**: `{ success: boolean, users: User[] }` ou `User[]`
   - **Status**: ✅ Utilisé avec fallback

2. **GET** `/api/messages/conversation/admin/{userId}`
   - **Usage**: Récupération des messages d'une conversation avec un utilisateur
   - **Lignes**: 318, 374
   - **Réponse attendue**: `Message[]` avec format `{ id, sendFrom, sendTo, message, date, isRead }`
   - **Status**: ✅ Utilisé correctement

#### WebSocket STOMP:
1. **Connexion**: `http://localhost:9090/ws`
   - **Ligne**: 111
   - **Status**: ✅ Configuré

2. **Subscription**: `/queue/admin`
   - **Usage**: Recevoir les messages des utilisateurs
   - **Ligne**: 128
   - **Status**: ✅ Utilisé correctement

3. **Subscription**: `/topic/user.status`
   - **Usage**: Recevoir les notifications de changement de statut (en ligne/hors ligne)
   - **Ligne**: 139
   - **Status**: ⚠️ Optionnel (peut ne pas être implémenté côté backend)

4. **Publish**: `/app/message/fromAdmin`
   - **Usage**: Envoyer un message depuis l'admin à un utilisateur
   - **Ligne**: 422
   - **Body Format**: `{ sendFrom: number, sendTo: number, message: string, date: string }`
   - **Status**: ✅ Utilisé correctement

---

## ✅ Vérifications Effectuées

### 1. Format des Messages STOMP
- **ChatSupport → Admin**: Format cohérent ✅
  ```json
  {
    "sendFrom": userId,
    "sendTo": 1,
    "message": "contenu",
    "date": "ISO string"
  }
  ```

- **Admin → User**: Format cohérent ✅
  ```json
  {
    "sendFrom": adminId,
    "sendTo": userId,
    "message": "contenu",
    "date": "ISO string"
  }
  ```

### 2. Endpoints REST
- Tous les endpoints utilisent `credentials: 'include'` pour les cookies ✅
- Les headers `Content-Type: application/json` sont présents ✅
- Les URLs sont cohérentes (toutes sur `localhost:9090`) ✅

### 3. Gestion des Erreurs
- Try-catch blocks présents ✅
- Messages d'erreur appropriés ✅
- Fallbacks pour les données de test ✅

---

## 🔍 Points à Vérifier dans le Backend Spring

### Endpoints REST à Implémenter:

1. **GET** `/api/auth/me`
   - Doit retourner les infos de l'utilisateur connecté
   - Format: `{ clientId, firstName, lastName, email, ... }`

2. **POST** `/api/email/send-to-support`
   - Doit accepter: `{ subject, content, userEmail, userName }`
   - Doit retourner: `{ success: boolean, message: string }`

3. **GET** `/api/admin/users/complete-details`
   - Doit retourner: `{ success: boolean, users: User[] }` ou directement `User[]`
   - Nécessite authentification admin

4. **GET** `/api/messages/conversation/admin/{userId}`
   - Doit retourner la liste des messages entre l'admin et l'utilisateur
   - Format: `[{ id, sendFrom, sendTo, message, date, isRead }, ...]`
   - Nécessite authentification admin

### WebSocket STOMP à Configurer:

1. **Endpoint WebSocket**: `/ws`
   - Configuration SockJS + STOMP

2. **Destinations STOMP**:
   - `/app/message/toAdmin` - Pour recevoir les messages des users vers admin
   - `/app/message/fromAdmin` - Pour recevoir les messages de l'admin vers users
   - `/queue/admin` - Queue pour l'admin (messages entrants)
   - `/queue/user/{userId}` - Queue pour chaque utilisateur (messages de l'admin)
   - `/topic/user.status` - Topic pour les changements de statut (optionnel)

### Format des Entités Message (Backend):

Le backend doit gérer des messages avec cette structure:
```java
{
  id: Long,
  sendFrom: Long,      // ID de l'expéditeur
  sendTo: Long,        // ID du destinataire
  message: String,    // Contenu du message
  date: String,        // ISO 8601 date string
  isRead: Boolean     // Optionnel
}
```

---

## ⚠️ Recommandations

1. **Endpoint de Conversations Admin**:
   - Actuellement, `AdminMessaging` itère sur tous les utilisateurs pour charger les conversations
   - **Suggestion**: Créer un endpoint `/api/messages/conversations/admin` qui retourne directement toutes les conversations avec métadonnées

2. **Marquage des Messages comme Lus**:
   - Un endpoint `PUT /api/messages/mark-as-read/{messageId}` serait utile
   - Actuellement commenté dans le code (ligne 400 de AdminMessaging.tsx)

3. **Gestion des Erreurs**:
   - Vérifier que le backend retourne des codes HTTP appropriés
   - Vérifier que les messages d'erreur sont cohérents

4. **Sécurité**:
   - Vérifier que tous les endpoints admin nécessitent l'authentification
   - Vérifier que les utilisateurs ne peuvent accéder qu'à leurs propres messages

---

## 📝 Notes

- Le code frontend gère bien les cas où les endpoints ne sont pas disponibles (fallbacks)
- Les formats de données sont cohérents entre les deux pages
- La gestion WebSocket est correctement implémentée avec reconnexion automatique



