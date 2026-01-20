// AICODE-NOTE: Test helper utilities for MFA Email OTP integration tests
// Provides common test setup and assertion helpers

import axios, { AxiosInstance } from 'axios';
import { z } from 'zod';
import testUsersData from '../fixtures/test-users.json';
import { OTP_PATTERN } from '../fixtures/constants';

/**
 * Test user fixture type
 */
export interface TestUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  emailVerified: boolean;
  enabled: boolean;
  description: string;
}

/**
 * Get test users from fixtures
 */
export function getTestUsers(): TestUser[] {
  return testUsersData.users as TestUser[];
}

/**
 * Get a specific test user by ID
 */
export function getTestUser(userId: string): TestUser | undefined {
  return getTestUsers().find(u => u.id === userId);
}

/**
 * Get test constants from fixtures
 */
export function getTestConstants(): typeof testUsersData.constants {
  return testUsersData.constants;
}

/**
 * Create HTTP client for Keycloak API calls
 */
export function createHttpClient(baseUrl: string): AxiosInstance {
  return axios.create({
    baseURL: baseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

/**
 * Schema for OAuth token response
 */
export const TokenResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
});

export type TokenResponse = z.infer<typeof TokenResponseSchema>;

/**
 * Validate OTP code format
 */
export function isValidOtpFormat(code: string): boolean {
  return OTP_PATTERN.test(code);
}

/**
 * Generate random OTP for negative testing
 */
export function generateRandomOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate invalid OTP (wrong format)
 */
export function generateInvalidOtp(): string {
  const invalidFormats = [
    '12345',      // Too short
    '1234567',    // Too long
    'abcdef',     // Letters
    '12-34-56',   // With dashes
    '12 34 56',   // With spaces
  ];
  return invalidFormats[Math.floor(Math.random() * invalidFormats.length)];
}

/**
 * Sleep utility for timing tests
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Measure execution time of an async function
 */
export async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; durationMs: number }> {
  const start = Date.now();
  const result = await fn();
  const durationMs = Date.now() - start;
  return { result, durationMs };
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: { maxAttempts?: number; delayMs?: number; backoffMultiplier?: number } = {}
): Promise<T> {
  const { maxAttempts = 3, delayMs = 1000, backoffMultiplier = 2 } = options;

  let lastError: Error | undefined;
  let currentDelay = delayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxAttempts) {
        await sleep(currentDelay);
        currentDelay *= backoffMultiplier;
      }
    }
  }

  throw lastError;
}

/**
 * Assert that an async operation completes within timeout
 */
export async function assertCompletesWithin<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  message?: string
): Promise<T> {
  const { result, durationMs } = await measureTime(fn);

  if (durationMs > timeoutMs) {
    throw new Error(
      message ?? `Operation took ${durationMs}ms, expected < ${timeoutMs}ms`
    );
  }

  return result;
}
