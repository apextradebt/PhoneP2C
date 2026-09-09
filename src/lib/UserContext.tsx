import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import type { User } from '@/types/user';

const url = import.meta.env.VITE_API_URL;

interface UserContextType {
  userData: User | null;
  loading: boolean;
  refreshUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, getAccessTokenSilently, user: auth0User } = useAuth0();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchUserData = async () => {
    if (!isAuthenticated || !auth0User) {
      setUserData(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = await getAccessTokenSilently();

      const response = await fetch(`${url}/api/users/me?email=${encodeURIComponent(auth0User.email || '')}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data);
      } else {
        console.error('Failed to fetch user data:', await response.text());
        setUserData(null);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [isAuthenticated, auth0User, getAccessTokenSilently]);

  return (
    <UserContext.Provider value={{ userData, loading, refreshUserData: fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
