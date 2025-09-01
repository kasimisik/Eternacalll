import { useAuth, useUser } from '@clerk/clerk-react';
import { useMockAuth, useMockUser } from './auth-fallback';
import { useIsClerkEnabled } from '@/components/ClerkProvider';

// Safe auth hooks that properly handle both Clerk and mock scenarios
export function useAuthHook() {
  const isClerkEnabled = useIsClerkEnabled();
  const mockAuth = useMockAuth();
  
  // Always call both hooks to satisfy React hook rules
  let clerkAuth;
  try {
    clerkAuth = useAuth();
  } catch {
    clerkAuth = null;
  }
  
  // Return the appropriate auth based on configuration
  return isClerkEnabled && clerkAuth ? clerkAuth : mockAuth;
}

export function useUserHook() {
  const isClerkEnabled = useIsClerkEnabled();
  const mockUser = useMockUser();
  
  // Always call both hooks to satisfy React hook rules
  let clerkUser;
  try {
    clerkUser = useUser();
  } catch {
    clerkUser = null;
  }
  
  // Return the appropriate user based on configuration
  return isClerkEnabled && clerkUser ? clerkUser : mockUser;
}