// Hook exports organized by type

// API hooks
export { useAuth } from './api/useAuth';
export { useNextAuth } from './useNextAuth';
export { useAvailableUsers } from './api/useAvailableUsers';
export { useDogs } from './api/useDogs';
export { useAvailablePuppies } from './api/useAvailablePuppies';
export { useMatchedPuppies } from './api/useMatchedPuppies';
// Messaging hooks are now imported from shared package
export { useMessages, useMessaging, useMessage } from '@homeforpup/shared-messaging';
export { useFavorites, useFavoriteStatus, useBulkFavoriteStatus } from './api/useFavorites';
export { useBreeds, useAllBreeds } from './api/useBreeds';
export { useProfileViews } from './api/useProfileViews';
export { useKennels } from './useKennels';
export { useUserData } from './useUserData';
export { useWebSocket } from './useWebSocket';
export { useWebSocketMessages } from './useWebSocketMessages';

// UI hooks - useMessage is now imported from shared package
