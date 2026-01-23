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
import type { AuthState, UserRole } from '@/types';

// AICODE-NOTE: Authentication context for Alto CRM Dashboard
// Wraps Keycloak functionality and provides auth state to components
// Realm = Client architecture: realm determines client access, groups determine site access

interface AuthContextType extends AuthState {
  login: () => void;
  logout: () => void;
  getAccessToken: () => string | null;
  hasRole: (role: UserRole) => boolean;
  // Role checks
  isAltoAdmin: () => boolean;
  isClientAdmin: () => boolean;
  // Access checks
  canAccessClient: (clientName: string) => boolean;
  canAccessSite: (clientName: string, siteName: string) => boolean;
  // Legacy alias
  isSuperAdmin: () => boolean;
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
      console.log('AuthContext: Starting auth initialization...');
      try {
        const authenticated = await initKeycloak();
        console.log('AuthContext: Keycloak init returned:', authenticated);

        if (authenticated) {
          const user = getUserFromKeycloak();
          const token = getToken() || null;
          console.log('AuthContext: User authenticated:', {
            username: user?.username,
            roles: user?.roles,
            clientName: user?.clientName,
            assignedSites: user?.assignedSites,
          });

          setState({
            isAuthenticated: true,
            isLoading: false,
            user,
            token,
          });
        } else {
          console.log('AuthContext: Not authenticated');
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
    (role: UserRole): boolean => {
      if (!state.user) return false;
      return state.user.roles.includes(role);
    },
    [state.user]
  );

  // AICODE-NOTE: Role check helpers for access control
  const isAltoAdmin = useCallback((): boolean => {
    return state.user?.roles.includes('alto-admin') ?? false;
  }, [state.user]);

  const isClientAdmin = useCallback((): boolean => {
    return state.user?.roles.includes('client-admin') ?? false;
  }, [state.user]);

  // AICODE-NOTE: Access control helpers
  // Determine if user can access a specific client's resources
  const canAccessClient = useCallback(
    (clientName: string): boolean => {
      if (!state.user) return false;
      // Alto admin can access all clients
      if (state.user.roles.includes('alto-admin')) return true;
      // Others can only access their assigned client
      return state.user.clientName === clientName;
    },
    [state.user]
  );

  // Determine if user can access a specific site
  const canAccessSite = useCallback(
    (clientName: string, siteName: string): boolean => {
      if (!state.user) return false;
      // Alto admin can access all sites
      if (state.user.roles.includes('alto-admin')) return true;
      // Must be in the correct client first
      if (state.user.clientName !== clientName) return false;
      // Client admin can access all sites in their client
      if (state.user.roles.includes('client-admin')) return true;
      // Operators/viewers can only access assigned sites
      return state.user.assignedSites.includes(siteName);
    },
    [state.user]
  );

  // Legacy alias for backward compatibility
  const isSuperAdmin = isAltoAdmin;

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    getAccessToken,
    hasRole,
    isAltoAdmin,
    isClientAdmin,
    canAccessClient,
    canAccessSite,
    isSuperAdmin,
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
