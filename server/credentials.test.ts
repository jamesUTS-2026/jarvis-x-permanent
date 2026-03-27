import { describe, it, expect } from 'vitest';

describe('Credentials Validation', () => {
  it('should have OPENAI_API_KEY set', () => {
    const key = process.env.OPENAI_API_KEY;
    expect(key).toBeDefined();
    expect(key).toMatch(/^sk-/);
  });

  it('should have LIVEKIT_URL set', () => {
    const url = process.env.LIVEKIT_URL;
    expect(url).toBeDefined();
    expect(url).toMatch(/^wss?:\/\//);
  });

  it('should have LIVEKIT_API_KEY set', () => {
    const key = process.env.LIVEKIT_API_KEY;
    expect(key).toBeDefined();
    expect(key?.length).toBeGreaterThan(0);
  });

  it('should have LIVEKIT_API_SECRET set', () => {
    const secret = process.env.LIVEKIT_API_SECRET;
    expect(secret).toBeDefined();
    expect(secret?.length).toBeGreaterThan(0);
  });

  it('should validate OpenAI API key format', () => {
    const key = process.env.OPENAI_API_KEY;
    // OpenAI keys start with sk- and are long strings
    expect(key).toMatch(/^sk-[a-zA-Z0-9-]+$/);
    expect(key!.length).toBeGreaterThan(20);
  });

  it('should validate LiveKit credentials format', () => {
    const url = process.env.LIVEKIT_URL;
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    expect(url).toMatch(/devhole/); // LiveKit URL contains project name
    expect(apiKey).toBeTruthy();
    expect(apiSecret).toBeTruthy();
    expect(apiSecret!.length).toBeGreaterThan(30); // Secrets are typically long
  });
});
