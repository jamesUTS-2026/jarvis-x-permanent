import { describe, it, expect } from 'vitest';

describe('OpenAI TTS Integration', () => {
  it('should validate OpenAI API key is configured', async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    expect(apiKey).toBeDefined();
    expect(apiKey).toBeTruthy();
    expect(apiKey?.length).toBeGreaterThan(0);
  });

  it('should have valid OpenAI API key format', async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    // OpenAI API keys start with 'sk-'
    expect(apiKey).toMatch(/^sk-/);
  });

  it('should test TTS endpoint connectivity', async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    try {
      // Test with a simple request to OpenAI API
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('data');
      expect(Array.isArray(data.data)).toBe(true);
    } catch (error) {
      throw new Error(`OpenAI API validation failed: ${error}`);
    }
  });
});
