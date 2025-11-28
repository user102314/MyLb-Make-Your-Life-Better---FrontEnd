# 📊 Résumé des Endpoints - ChatSupport & AdminMessaging

## 🎯 Endpoints REST API

### ChatSupport.tsx

| Méthode | Endpoint | Usage | Ligne |
|---------|----------|-------|-------|
| `GET` | `/api/auth/me` | Récupérer infos utilisateur | 160 |
| `POST` | `/api/email/send-to-support` | Envoyer email au support | 399 |

### AdminMessaging.tsx

| Méthode | Endpoint | Usage | Ligne |
|---------|----------|-------|-------|
| `GET` | `/api/admin/users/complete-details` | Liste des utilisateurs | 181 |
| `GET` | `/api/messages/conversation/admin/{userId}` | Messages d'une conversation | 318, 374 |

---

## 🔌 WebSocket STOMP

### ChatSupport.tsx

| Type | Destination | Usage | Ligne |
|------|-------------|-------|-------|
| **Connexion** | `http://localhost:9090/ws` | Connexion WebSocket | 241 |
| **Subscribe** | `/queue/user/{userId}` | Recevoir messages admin | 262 |
| **Publish** | `/app/message/toAdmin` | Envoyer message à admin | 478, 518 |

### AdminMessaging.tsx

| Type | Destination | Usage | Ligne |
|------|-------------|-------|-------|
| **Connexion** | `http://localhost:9090/ws` | Connexion WebSocket | 111 |
| **Subscribe** | `/queue/admin` | Recevoir messages users | 128 |
| **Subscribe** | `/topic/user.status` | Statut en ligne/hors ligne | 139 |
| **Publish** | `/app/message/fromAdmin` | Envoyer message à user | 422 |

---

## 📦 Format des Messages STOMP

### Message User → Admin
```json
{
  "sendFrom": 123,           // ID utilisateur
  "sendTo": 1,               // ID admin (fixe)
  "message": "Contenu...",
  "date": "2024-01-01T12:00:00.000Z"
}
```

### Message Admin → User
```json
{
  "sendFrom": 1,             // ID admin (fixe)
  "sendTo": 123,            // ID utilisateur
  "message": "Contenu...",
  "date": "2024-01-01T12:00:00.000Z"
}
```

### Message Reçu (WebSocket)
```json
{
  "id": 456,
  "sendFrom": 1,            // ou "senderId"
  "sendTo": 123,            // ou "receiverId"
  "message": "Contenu...",  // ou "content"
  "date": "2024-01-01T12:00:00.000Z",  // ou "timestamp"
  "isRead": false           // optionnel
}
```

---

## ✅ Vérifications Effectuées

### ✅ Formats de données cohérents
- Les messages STOMP utilisent le même format (`sendFrom`, `sendTo`, `message`, `date`)
- Le code gère les variantes de noms (`message`/`content`, `sendFrom`/`senderId`)

### ✅ Gestion des erreurs
- Try-catch blocks présents
- Fallbacks pour données de test
- Messages d'erreur appropriés

### ✅ Authentification
- Tous les appels utilisent `credentials: 'include'`
- Headers `Content-Type` corrects

---

## ⚠️ Points d'Attention

1. **Endpoint `/api/admin/users/complete-details`**
   - Le code gère deux formats de réponse possibles
   - Vérifier le format exact dans le backend

2. **Endpoint `/api/messages/conversation/admin/{userId}`**
   - Utilisé deux fois (lignes 318 et 374)
   - Format attendu: tableau de messages avec `{ id, sendFrom, sendTo, message, date, isRead }`

3. **WebSocket `/topic/user.status`**
   - Optionnel, peut ne pas être implémenté côté backend
   - Le code gère son absence gracieusement

4. **Marquage des messages comme lus**
   - Commenté dans le code (ligne 400)
   - Endpoint suggéré: `PUT /api/messages/mark-as-read/{messageId}`

---

## 🔧 Endpoints Backend Requis

### Contrôleur REST

```java
@RestController
@RequestMapping("/api")
public class MessageController {
    
    // GET /api/messages/conversation/admin/{userId}
    @GetMapping("/messages/conversation/admin/{userId}")
    public ResponseEntity<List<MessageDTO>> getConversation(
        @PathVariable Long userId
    ) { ... }
}
```

### Contrôleur WebSocket

```java
@Controller
public class WebSocketController {
    
    // Destination: /app/message/toAdmin
    @MessageMapping("/message/toAdmin")
    public void handleMessageToAdmin(MessageDTO message) { ... }
    
    // Destination: /app/message/fromAdmin
    @MessageMapping("/message/fromAdmin")
    public void handleMessageFromAdmin(MessageDTO message) { ... }
}
```

### Configuration WebSocket

```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    // Endpoint: /ws
    // Queues: /queue/admin, /queue/user/{userId}
    // Topics: /topic/user.status
}
```

---

## 📝 Notes Finales

- ✅ Tous les endpoints sont correctement utilisés
- ✅ Les formats de données sont cohérents
- ✅ La gestion d'erreur est appropriée
- ⚠️ Vérifier l'implémentation backend pour correspondre aux formats attendus



