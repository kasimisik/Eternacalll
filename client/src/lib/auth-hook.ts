import { useMockAuth, useMockUser } from './auth-fallback';
import { CLERK_CONFIG } from './clerk';

// For now, always use mock auth since Clerk is not configured
// When CLERK_CONFIG.publishableKey is properly set, this can be updated to use real Clerk hooks
export function useAuthHook() {
  return useMockAuth();
}

export function useUserHook() {
  return useMockUser();
}