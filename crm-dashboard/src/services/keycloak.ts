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

export function getKeycloakInstance(): Keycloak {
  if (!keycloakInstance) {
    keycloakInstance = new Keycloak(keycloakConfig);
  }
  return keycloakInstance;
}

export async function initKeycloak(): Promise<boolean> {
  const keycloak = getKeycloakInstance();

  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri:
        window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
    });

    // Setup token refresh
    if (authenticated) {
      setupTokenRefresh(keycloak);
    }

    return authenticated;
  } catch (error) {
    console.error('Keycloak initialization failed:', error);
    return false;
  }
}

export function login(): void {
  const keycloak = getKeycloakInstance();
  keycloak.login();
}

export function logout(): void {
  const keycloak = getKeycloakInstance();
  keycloak.logout({
    redirectUri: window.location.origin + '/login',
  });
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
  };

  // Extract roles from both realm and resource access
  const realmRoles = tokenParsed.realm_access?.roles || [];
  const clientRoles =
    tokenParsed.resource_access?.[keycloakConfig.clientId]?.roles || [];
  const roles = [...new Set([...realmRoles, ...clientRoles])];

  return {
    id: tokenParsed.sub || '',
    username: tokenParsed.preferred_username || '',
    email: tokenParsed.email,
    firstName: tokenParsed.given_name,
    lastName: tokenParsed.family_name,
    roles,
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
};
