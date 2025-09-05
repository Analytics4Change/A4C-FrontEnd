import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Logger } from '@/utils/logger';
import { mockOAuthResponses } from '@/config/oauth.config';

const log = Logger.getLogger('main');

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'clinician' | 'nurse' | 'viewer';
  provider?: 'local' | 'google' | 'facebook' | 'apple';
  picture?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  loginWithOAuth: (provider: 'google' | 'facebook' | 'apple', oauthData: any) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  
  log.debug('AuthProvider state', { isAuthenticated, user });

  const login = async (username: string, password: string): Promise<boolean> => {
    log.info('Login attempt', { username });
    
    // Mock authentication - accept admin/admin123 or demo/demo123
    if (
      (username === 'admin' && password === 'admin123') ||
      (username === 'demo' && password === 'demo123')
    ) {
      const mockUser: User = {
        id: '1',
        name: username === 'admin' ? 'Admin User' : 'Demo User',
        email: `${username}@a4c-medical.com`,
        role: username === 'admin' ? 'admin' : 'clinician',
        provider: 'local'
      };
      
      log.info('Login successful', { user: mockUser });
      setUser(mockUser);
      setIsAuthenticated(true);
      
      // Store in sessionStorage for page refresh persistence
      sessionStorage.setItem('user', JSON.stringify(mockUser));
      
      return true;
    }
    
    log.warn('Login failed - invalid credentials');
    return false;
  };

  const loginWithOAuth = async (
    provider: 'google' | 'facebook' | 'apple',
    oauthData: any
  ): Promise<boolean> => {
    log.info('OAuth login attempt', { provider });
    
    try {
      // Transform OAuth response to User format
      let user: User;
      
      switch (provider) {
        case 'google':
          user = {
            id: oauthData.sub,
            name: oauthData.name,
            email: oauthData.email,
            role: 'clinician', // Default role for OAuth users
            provider: 'google',
            picture: oauthData.picture
          };
          break;
          
        case 'facebook':
          user = {
            id: oauthData.id,
            name: oauthData.name,
            email: oauthData.email,
            role: 'clinician',
            provider: 'facebook',
            picture: oauthData.picture?.data?.url
          };
          break;
          
        case 'apple':
          user = {
            id: oauthData.sub,
            name: oauthData.name ? 
              `${oauthData.name.firstName} ${oauthData.name.lastName}` : 
              'Apple User',
            email: oauthData.email,
            role: 'clinician',
            provider: 'apple'
          };
          break;
          
        default:
          throw new Error(`Unknown OAuth provider: ${provider}`);
      }
      
      log.info('OAuth login successful', { provider, user });
      setUser(user);
      setIsAuthenticated(true);
      
      // Store in sessionStorage
      sessionStorage.setItem('user', JSON.stringify(user));
      
      return true;
    } catch (error) {
      log.error('OAuth login failed', { provider, error });
      return false;
    }
  };

  const logout = () => {
    log.info('User logout');
    setUser(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('user');
  };

  // Check for existing session on mount
  React.useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, loginWithOAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};