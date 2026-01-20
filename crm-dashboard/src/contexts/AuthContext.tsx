import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  initKeycloak,
  login as keycloakLogin,
  logout as keycloakLogout,
  getToken,
  getUserFromKeycloak,
} from '@/services/keycloak';
import type { AuthState } from '@/types';

// AICODE-NOTE: Authentication context for Alto CRM Dashboard
// Wraps Keycloak functionality and provides auth state to components

interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  getAccessToken: () => string | null;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const authenticated = await initKeycloak();

        if (authenticated) {
          const user = getUserFromKeycloak();
          const token = getToken() || null;

          setState({
            isAuthenticated: true,
            isLoading: false,
            user,
            token,
          });
        } else {
          setState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            token: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null,
        });
      }
    };

    initAuth();
  }, []);

  const login = useCallback(() => {
    keycloakLogin();
  }, []);

  const logout = useCallback(() => {
    keycloakLogout();
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
    });
  }, []);

  const getAccessToken = useCallback((): string | null => {
    return getToken() || null;
  }, []);

  const hasRole = useCallback(
    (role: string): boolean => {
      if (!state.user) return false;
      return state.user.roles.includes(role);
    },
    [state.user]
  );

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    getAccessToken,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
