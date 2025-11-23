// src/types/actions.ts (ou à définir directement dans Confidentiality.tsx)

// Synchronisé avec l'énumération Java ActionType
type ActionType = 'SECURITY_ALERT' | 'PASSWORD_CHANGE' | 'LOGIN_SUCCESS' | 'PROFILE_UPDATE';

interface ClientAction {
    actionId: number;
    actionType: ActionType;
    actionDate: string; // Sera une chaîne ISO 8601 (LocalDateTime.toString())
    details: string;
}