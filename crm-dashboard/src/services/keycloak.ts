import Keycloak from 'keycloak-js';
import type { AuthUser } from '@/types';

// AICODE-NOTE: Keycloak authentication service
// Configured for Alto IAM Keycloak instance
// Environment variables set in .env file

const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8080',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'master',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'alto-crm',
};

// Singleton Keycloak instance
let keycloakInstance: Keycloak | null = null;
let initPromise: Promise<boolean> | null = null;

export function getKeycloakInstance(): Keycloak {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }
  return keycloakInstance;
}

// AICODE-NOTE: Check for auth callback in URL fragment (Keycloak uses response_mode=fragment)
export function hasAuthCallback(): boolean {
  const hash = window.location.hash;
  return hash.includes('code=') && hash.includes('state=');
}

export async function initKeycloak(): Promise<boolean> {
  // Prevent double initialization (React Strict Mode calls effects twice)
  if (initPromise) {
    console.log('Keycloak init already in progress, returning existing promise');
    return initPromise;
  }

  const keycloak = getKeycloakInstance();
  const authCallback = hasAuthCallback();

  console.log('Keycloak init starting...', {
    url: keycloakConfig.url,
    realm: keycloakConfig.realm,
    clientId: keycloakConfig.clientId,
    currentUrl: window.location.href,
    hasAuthCallback: authCallback,
  });

  initPromise = (async () => {
    try {
      // AICODE-NOTE: keycloak-js will automatically process auth code from URL fragment
      const authenticated = await keycloak.init({
        pkceMethod: 'S256',
        checkLoginIframe: false,
      });

      console.log('Keycloak init result:', {
        authenticated,
        keycloakAuthenticated: keycloak.authenticated,
        token: keycloak.token ? 'present' : 'missing',
        subject: keycloak.subject,
      });

      // Clean up URL after processing auth code
      if (authCallback && authenticated) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Setup token refresh
      if (authenticated) {
        setupTokenRefresh(keycloak);
      }

      return authenticated;
    } catch (error) {
      console.error('Keycloak initialization failed:', error);
      initPromise = null; // Reset so it can be retried
      return false;
    }
  })();

  return initPromise;
}

export function login(): void {
  const keycloak = getKeycloakInstance();
  // AICODE-NOTE: Explicitly set redirectUri to ensure we return to CRM after login
  keycloak.login({
    redirectUri: window.location.origin + '/',
  });
}

export function logout(): void {
  const keycloak = getKeycloakInstance();
  // AICODE-NOTE: Set flag so ProtectedRoute doesn't auto-login after logout
  sessionStorage.setItem('alto_logged_out', 'true');
  keycloak.logout({
    redirectUri: window.location.origin + '/?logged_out=true',
  });
}

// Check if user just logged out (to prevent auto-login loop)
export function hasJustLoggedOut(): boolean {
  const urlParam = new URLSearchParams(window.location.search).get('logged_out');
  const sessionFlag = sessionStorage.getItem('alto_logged_out');
  return urlParam === 'true' || sessionFlag === 'true';
}

// Clear the logout flag (call when user explicitly clicks login)
export function clearLogoutFlag(): void {
  sessionStorage.removeItem('alto_logged_out');
  // Clean up URL
  if (window.location.search.includes('logged_out')) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
}

export function getToken(): string | undefined {
  const keycloak = getKeycloakInstance();
  return keycloak.token;
}

export async function refreshToken(): Promise<boolean> {
  const keycloak = getKeycloakInstance();

  try {
    const refreshed = await keycloak.updateToken(30);
    return refreshed;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
}

export function getUserFromKeycloak(): AuthUser | null {
  const keycloak = getKeycloakInstance();

  if (!keycloak.authenticated || !keycloak.tokenParsed) {
    return null;
  }

  const tokenParsed = keycloak.tokenParsed as {
    sub?: string;
    preferred_username?: string;
    email?: string;
    given_name?: string;
    family_name?: string;
    realm_access?: { roles?: string[] };
    resource_access?: Record<string, { roles?: string[] }>;
    client_prefix?: string | string[];
  };

  // Extract roles from both realm and resource access
  const realmRoles = tokenParsed.realm_access?.roles || [];
  const clientRoles =
    tokenParsed.resource_access?.[keycloakConfig.clientId]?.roles || [];
  const roles = [...new Set([...realmRoles, ...clientRoles])];

  // AICODE-NOTE: Extract client_prefix for realm filtering
  // "*" means super admin (Alto operator) - can see all realms
  // "marriott" means client admin - can only see marriott-* realms
  let clientPrefix: string | undefined;
  if (tokenParsed.client_prefix) {
    clientPrefix = Array.isArray(tokenParsed.client_prefix)
      ? tokenParsed.client_prefix[0]
      : tokenParsed.client_prefix;
  }

  return {
    id: tokenParsed.sub || '',
    username: tokenParsed.preferred_username || '',
    email: tokenParsed.email,
    firstName: tokenParsed.given_name,
    lastName: tokenParsed.family_name,
    roles,
    clientPrefix,
  };
}

// Token refresh scheduler
function setupTokenRefresh(keycloak: Keycloak): void {
  // Refresh token 60 seconds before expiry
  const refreshInterval = setInterval(async () => {
    if (keycloak.authenticated) {
      try {
        await keycloak.updateToken(60);
      } catch (error) {
        console.error('Token refresh failed, logging out:', error);
        clearInterval(refreshInterval);
        logout();
      }
    }
  }, 30000); // Check every 30 seconds

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    clearInterval(refreshInterval);
  });
}

export default {
  getKeycloakInstance,
  initKeycloak,
  login,
  logout,
  getToken,
  refreshToken,
  getUserFromKeycloak,
  hasJustLoggedOut,
  clearLogoutFlag,
};
