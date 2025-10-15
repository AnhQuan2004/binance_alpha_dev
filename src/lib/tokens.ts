const API_BASE_URL = 'https://gfiresearch.dev/api';

export interface Token {
  name: string;
  apiUrl: string;
  staggerDelay: number;
  multiplier: number;
}

export const tokensApi = {
  saveTokens: async (tokens: Token[]): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokens),
    });
    if (!response.ok) throw new Error('Failed to save tokens');
  },
};
