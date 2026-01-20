// AICODE-NOTE: Keycloak Admin Client wrapper for MFA integration tests
// Provides authenticated access to Keycloak Admin REST API

import KcAdminClient from '@keycloak/keycloak-admin-client';
import { z } from 'zod';

/**
 * Environment configuration schema
 * KC_ADMIN_PASSWORD is optional for infrastructure-only tests
 */
const EnvSchema = z.object({
  TEST_KEYCLOAK_URL: z.string().url().default('http://localhost:8080'),
  TEST_REALM: z.string().default('alto-test'),
  KC_ADMIN_USER: z.string().default('admin'),
  KC_ADMIN_PASSWORD: z.string().optional(),
});

export type TestEnvConfig = z.infer<typeof EnvSchema>;

/**
 * Check if Keycloak integration is enabled (has admin password)
 */
export function isKeycloakIntegrationEnabled(): boolean {
  return !!process.env.KC_ADMIN_PASSWORD;
}

/**
 * Parse and validate environment configuration
 */
export function getTestEnvConfig(): TestEnvConfig {
  const result = EnvSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Invalid test environment: ${result.error.message}`);
  }
  return result.data;
}

/**
 * Creates authenticated Keycloak Admin Client
 * Throws if KC_ADMIN_PASSWORD is not set
 */
export async function createKeycloakAdminClient(): Promise<KcAdminClient> {
  const config = getTestEnvConfig();

  if (!config.KC_ADMIN_PASSWORD) {
    throw new Error('KC_ADMIN_PASSWORD is required for Keycloak integration tests');
  }

  const kcAdminClient = new KcAdminClient({
    baseUrl: config.TEST_KEYCLOAK_URL,
    realmName: 'master',
  });

  await kcAdminClient.auth({
    username: config.KC_ADMIN_USER,
    password: config.KC_ADMIN_PASSWORD,
    grantType: 'password',
    clientId: 'admin-cli',
  });

  return kcAdminClient;
}

/**
 * Switch admin client to target realm
 */
export function setTargetRealm(client: KcAdminClient, realmId: string): void {
  client.setConfig({
    realmName: realmId,
  });
}

/**
 * Health check for Keycloak availability
 */
export async function checkKeycloakHealth(baseUrl: string): Promise<boolean> {
  try {
    const response = await fetch(`${baseUrl}/health/ready`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Wait for Keycloak to be ready with timeout
 * Returns false if Keycloak is not available (non-blocking for infrastructure tests)
 */
export async function waitForKeycloak(
  baseUrl: string,
  timeoutMs: number = 60000
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await checkKeycloakHealth(baseUrl)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return false;
}
