import React from 'react';

// Mock user data for when authentication is not configured
const mockUser = {
  id: 'mock-user-id',
  firstName: 'Demo',
  lastName: 'User',
  fullName: 'Demo User',
  primaryEmailAddress: {
    emailAddress: 'demo@example.com'
  }
};

// Mock Clerk hooks for when authentication is not configured
export const useMockAuth = () => ({
  isSignedIn: false,
  isLoaded: true,
  signOut: () => Promise.resolve()
});

export const useMockUser = () => ({
  user: mockUser
});

export const MockUserButton = () => (
  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-medium">
    DU
  </div>
);