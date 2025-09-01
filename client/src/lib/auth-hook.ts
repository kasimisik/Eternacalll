import { useAuth, useUser } from '@clerk/clerk-react';
import { useMockAuth, useMockUser } from './auth-fallback';
import { CLERK_CONFIG } from './clerk';

// Always call hooks consistently to avoid rules of hooks violations
export function useAuthHook() {
  const clerkAuth = useAuth();
  const mockAuth = useMockAuth();
  
  // Return the appropriate auth based on configuration
  return CLERK_CONFIG.publishableKey ? clerkAuth : mockAuth;
}

export function useUserHook() {
  const clerkUser = useUser();
  const mockUser = useMockUser();
  
  // Return the appropriate user based on configuration
  return CLERK_CONFIG.publishableKey ? clerkUser : mockUser;
}