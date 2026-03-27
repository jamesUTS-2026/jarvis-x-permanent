import { describe, it, expect } from 'vitest';
import { generateLiveKitToken, getLiveKitUrl, getLiveKitApiKey, getLiveKitApiSecret } from './livekit';

describe('LiveKit Integration', () => {
  it('should generate valid LiveKit token', async () => {
    const token = await generateLiveKitToken(
      'test-room',
      'test-user',
      getLiveKitApiKey(),
      getLiveKitApiSecret()
    );

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(0);
    // JWT tokens have 3 parts separated by dots
    expect(token.split('.').length).toBe(3);
  });

  it('should return valid LiveKit URL', () => {
    const url = getLiveKitUrl();
    expect(url).toBeDefined();
    expect(typeof url).toBe('string');
    expect(url.length).toBeGreaterThan(0);
    expect(url).toMatch(/^wss?:\/\//);
  });

  it('should return API key', () => {
    const key = getLiveKitApiKey();
    expect(key).toBeDefined();
    expect(typeof key).toBe('string');
    expect(key.length).toBeGreaterThan(0);
  });

  it('should return API secret', () => {
    const secret = getLiveKitApiSecret();
    expect(secret).toBeDefined();
    expect(typeof secret).toBe('string');
    expect(secret.length).toBeGreaterThan(0);
  });
});
