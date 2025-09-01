import React from 'react';

// Mock Clerk hooks for when authentication is not configured
export const useMockAuth = () => ({
  isSignedIn: false,
  isLoaded: true,
  signOut: () => Promise.resolve()
});

export const useMockUser = () => ({
  user: null
});

export const MockUserButton = () => (
  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
    U
  </div>
);