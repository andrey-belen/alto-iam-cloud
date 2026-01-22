import { logger } from '../lib/logger.js';

// AICODE-NOTE: Keycloak Admin API service
// Provides wrapper methods for managing realms and users

interface KeycloakToken {
  access_token: string;
  expires_at: number;
}

interface KeycloakRealm {
  id: string;
  realm: string;
  displayName?: string;
  enabled: boolean;
}

interface KeycloakUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified: boolean;
  createdTimestamp?: number;
  attributes?: Record<string, string[]>;
}

class KeycloakAdminService {
  private baseUrl: string;
  private adminRealm: string;
  private clientId: string;
  private clientSecret: string;
  private token: KeycloakToken | null = null;

  constructor() {
    this.baseUrl = process.env.KEYCLOAK_URL || 'http://localhost:8080';
    this.adminRealm = process.env.KEYCLOAK_ADMIN_REALM || 'master';
    this.clientId = process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli';
    this.clientSecret = process.env.KEYCLOAK_ADMIN_CLIENT_SECRET || '';
  }

  private async getToken(): Promise<string> {
    // Return cached token if still valid
    if (this.token && Date.now() < this.token.expires_at - 30000) {
      return this.token.access_token;
    }

    const tokenUrl = `${this.baseUrl}/realms/${this.adminRealm}/protocol/openid-connect/token`;

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', this.clientId);
    params.append('client_secret', this.clientSecret);

    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Token request failed: ${response.status} - ${errorText}`);
      }

      const data = (await response.json()) as {
        access_token: string;
        expires_in: number;
      };

      this.token = {
        access_token: data.access_token,
        expires_at: Date.now() + data.expires_in * 1000,
      };

      return this.token.access_token;
    } catch (error) {
      logger.error({ error }, 'Failed to get Keycloak admin token');
      throw error;
    }
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.getToken();

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Keycloak API error: ${response.status} - ${errorText}`);
    }

    // Handle empty responses
    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }

  // ============================================================================
  // Realm Operations
  // ============================================================================

  async getRealms(): Promise<KeycloakRealm[]> {
    return this.request<KeycloakRealm[]>('/admin/realms');
  }

  async getRealm(realmName: string): Promise<KeycloakRealm> {
    return this.request<KeycloakRealm>(`/admin/realms/${realmName}`);
  }

  async getRealmUserCount(realmName: string): Promise<number> {
    const users = await this.request<KeycloakUser[]>(
      `/admin/realms/${realmName}/users?max=1`
    );
    // This is a simplified count - for accurate count, use the count endpoint
    const countResponse = await this.request<number>(
      `/admin/realms/${realmName}/users/count`
    );
    return countResponse;
  }

  // ============================================================================
  // User Operations
  // ============================================================================

  async getUsers(
    realmName: string,
    options: {
      first?: number;
      max?: number;
      search?: string;
    } = {}
  ): Promise<{ users: KeycloakUser[]; total: number }> {
    const params = new URLSearchParams();
    if (options.first !== undefined) params.append('first', options.first.toString());
    if (options.max !== undefined) params.append('max', options.max.toString());
    if (options.search) params.append('search', options.search);

    const users = await this.request<KeycloakUser[]>(
      `/admin/realms/${realmName}/users?${params}`
    );

    const total = await this.request<number>(
      `/admin/realms/${realmName}/users/count${options.search ? `?search=${options.search}` : ''}`
    );

    return { users, total };
  }

  async getUser(realmName: string, userId: string): Promise<KeycloakUser> {
    return this.request<KeycloakUser>(
      `/admin/realms/${realmName}/users/${userId}`
    );
  }

  async createUser(
    realmName: string,
    userData: {
      username: string;
      email?: string;
      firstName?: string;
      lastName?: string;
      enabled?: boolean;
      emailVerified?: boolean;
      credentials?: Array<{ type: string; value: string; temporary?: boolean }>;
    }
  ): Promise<string> {
    const response = await fetch(
      `${this.baseUrl}/admin/realms/${realmName}/users`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${await this.getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create user: ${response.status} - ${errorText}`);
    }

    // Extract user ID from Location header
    const location = response.headers.get('Location');
    const userId = location?.split('/').pop();

    if (!userId) {
      throw new Error('Failed to get created user ID');
    }

    return userId;
  }

  async updateUser(
    realmName: string,
    userId: string,
    userData: Partial<KeycloakUser>
  ): Promise<void> {
    await this.request<void>(`/admin/realms/${realmName}/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(realmName: string, userId: string): Promise<void> {
    await this.request<void>(`/admin/realms/${realmName}/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async enableUser(realmName: string, userId: string): Promise<void> {
    await this.updateUser(realmName, userId, { enabled: true });
  }

  async disableUser(realmName: string, userId: string): Promise<void> {
    await this.updateUser(realmName, userId, { enabled: false });
  }

  async resetUserPassword(
    realmName: string,
    userId: string,
    password: string,
    temporary: boolean = true
  ): Promise<void> {
    await this.request<void>(
      `/admin/realms/${realmName}/users/${userId}/reset-password`,
      {
        method: 'PUT',
        body: JSON.stringify({
          type: 'password',
          value: password,
          temporary,
        }),
      }
    );
  }

  async sendPasswordResetEmail(realmName: string, userId: string): Promise<void> {
    await this.request<void>(
      `/admin/realms/${realmName}/users/${userId}/execute-actions-email`,
      {
        method: 'PUT',
        body: JSON.stringify(['UPDATE_PASSWORD']),
      }
    );
  }

  // AICODE-FIX: Keycloak Admin REST API does NOT support creating custom
  // credential types like 'email-authenticator'. POST to /credentials returns 404.
  // The credential can only be created by the authenticator SPI itself.
  //
  // Current behavior for new users:
  // 1. First login: "Set up Email Authenticator" screen, user clicks Enable
  // 2. Enable click → credential created → user goes to dashboard (no OTP)
  // 3. Subsequent logins: OTP sent to email, OTP input required
  //
  // Future fix: Fork keycloak-2fa-email-authenticator SPI to auto-create
  // credentials and require OTP on first login.
  async createEmailAuthenticatorCredential(
    realmName: string,
    userId: string,
    userEmail: string
  ): Promise<void> {
    logger.warn(
      { realmName, userId, userEmail },
      'Email-authenticator credential cannot be pre-created via REST API. ' +
        'User will see setup screen on first login.'
    );
  }
}

export const keycloakAdmin = new KeycloakAdminService();
export default keycloakAdmin;
