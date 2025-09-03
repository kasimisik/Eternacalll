// Simple authentication fallback when Clerk fails
import { useState, useEffect } from 'react';

export interface SimpleUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// Simple in-memory user storage (for demo purposes)
let users: SimpleUser[] = [];
let currentUser: SimpleUser | null = null;

export const useSimpleAuth = () => {
  const [user, setUser] = useState<SimpleUser | null>(currentUser);
  const [isLoaded, setIsLoaded] = useState(true);

  const signUp = async (userData: {
    emailAddress: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    try {
      // Check if user already exists
      const existingUser = users.find(u => u.email === userData.emailAddress);
      if (existingUser) {
        throw new Error('Bu e-posta adresi zaten kullanılıyor');
      }

      // Create new user
      const newUser: SimpleUser = {
        id: `user_${Date.now()}`,
        email: userData.emailAddress,
        firstName: userData.firstName,
        lastName: userData.lastName,
      };

      users.push(newUser);
      currentUser = newUser;
      setUser(newUser);

      // Try to save to backend
      try {
        const response = await fetch('/api/users/simple-create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userData.emailAddress,
            firstName: userData.firstName,
            lastName: userData.lastName,
          }),
        });
        
        if (response.ok) {
          const dbUser = await response.json();
          newUser.id = dbUser.id;
        }
      } catch (err) {
        console.warn('Failed to save to backend, using local storage:', err);
      }

      return { status: 'complete', user: newUser };
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (credentials: { identifier: string; password: string }) => {
    try {
      // Simple authentication - just check if user exists
      const existingUser = users.find(u => u.email === credentials.identifier);
      if (!existingUser) {
        // Try to find user from backend
        try {
          const response = await fetch(`/api/users/simple-find?email=${encodeURIComponent(credentials.identifier)}`);
          if (response.ok) {
            const dbUser = await response.json();
            const foundUser: SimpleUser = {
              id: dbUser.id,
              email: dbUser.email,
              firstName: dbUser.firstName || 'User',
              lastName: dbUser.lastName || '',
            };
            users.push(foundUser);
            currentUser = foundUser;
            setUser(foundUser);
            return { status: 'complete', user: foundUser };
          }
        } catch (err) {
          console.warn('Backend lookup failed:', err);
        }
        
        throw new Error('Kullanıcı bulunamadı. Lütfen önce kayıt olun.');
      }

      currentUser = existingUser;
      setUser(existingUser);
      return { status: 'complete', user: existingUser };
    } catch (error) {
      throw error;
    }
  };

  const signOut = () => {
    currentUser = null;
    setUser(null);
  };

  return {
    user,
    isLoaded,
    signUp,
    signIn,
    signOut,
  };
};