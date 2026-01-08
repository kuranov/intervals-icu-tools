import { describe, expect, test } from 'vitest';
import { buildAuthorizationHeader } from '../config';

describe('buildAuthorizationHeader', () => {
  describe('API Key auth', () => {
    test('generates correct Basic auth header', () => {
      const header = buildAuthorizationHeader({
        type: 'apiKey',
        apiKey: 'test-key-123',
      });

      // Should be "Basic " + base64("API_KEY:test-key-123")
      // API_KEY:test-key-123 -> QVBJX0tFWTp0ZXN0LWtleS0xMjM=
      expect(header).toBe('Basic QVBJX0tFWTp0ZXN0LWtleS0xMjM=');
    });

    test('handles special characters in API key', () => {
      const header = buildAuthorizationHeader({
        type: 'apiKey',
        apiKey: 'key-with-special!@#$',
      });

      // Verify it's a valid Basic auth header
      expect(header).toMatch(/^Basic [A-Za-z0-9+/]+=*$/);

      // Decode and verify
      const base64Token = header.replace('Basic ', '');
      const decoded = atob(base64Token);
      expect(decoded).toBe('API_KEY:key-with-special!@#$');
    });

    test('handles empty API key', () => {
      const header = buildAuthorizationHeader({
        type: 'apiKey',
        apiKey: '',
      });

      expect(header).toBe('Basic QVBJX0tFWTo='); // API_KEY: (empty)
    });
  });

  describe('Access Token auth', () => {
    test('generates correct Bearer token header', () => {
      const header = buildAuthorizationHeader({
        type: 'accessToken',
        accessToken: 'my-oauth-token-123',
      });

      expect(header).toBe('Bearer my-oauth-token-123');
    });

    test('handles empty access token', () => {
      const header = buildAuthorizationHeader({
        type: 'accessToken',
        accessToken: '',
      });

      expect(header).toBe('Bearer ');
    });

    test('does not encode access token', () => {
      // Bearer tokens should NOT be base64 encoded
      const token = 'token-with-special-chars!@#$';
      const header = buildAuthorizationHeader({
        type: 'accessToken',
        accessToken: token,
      });

      expect(header).toBe(`Bearer ${token}`);
    });
  });

  describe('Cross-runtime compatibility', () => {
    test('uses btoa() which works in all runtimes', () => {
      // This test verifies btoa() is available (Node 18+, Bun, Deno, browsers)
      const encoded = btoa('test');
      expect(encoded).toBe('dGVzdA==');

      // Verify our function uses it correctly
      const header = buildAuthorizationHeader({
        type: 'apiKey',
        apiKey: 'test',
      });
      expect(header).toMatch(/^Basic [A-Za-z0-9+/]+=*$/);
    });
  });
});
