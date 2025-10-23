const API_BASE_URL = 'https://gfiresearch.dev/api';

export interface Airdrop {
  id?: string;
  project: string;
  alias: string;
  points: number | null;
  amount: number | null;
  event_date: string | null;
  event_time: string | null;
  time_iso: string | null;
  timezone: string;
  phase: string;
  x: string;
  raised: string;
  source_link: string;
  image_url: string;
  news?: string;
  deleted?: boolean;
}

export const api = {
  createAirdrop: async (airdrop: Omit<Airdrop, 'id' | 'deleted'>): Promise<Airdrop> => {
    const response = await fetch(`${API_BASE_URL}/airdrops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(airdrop),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('API Error Response:', response.status, errorData);
      throw new Error(`Failed to create airdrop: ${response.status} ${errorData}`);
    }
    
    return response.json();
  },

  updateAirdrop: async (id: string, updates: Partial<Airdrop>): Promise<Airdrop> => {
    const response = await fetch(`${API_BASE_URL}/airdrops/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update airdrop');
    return response.json();
  },

  deleteAirdrop: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/airdrops/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete airdrop');
  },

  getAllAirdrops: async (): Promise<Airdrop[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/airdrops`);
    if (!response.ok) throw new Error('Failed to fetch all airdrops');
    return response.json();
  },

  getAirdropsByRange: async (range: 'today' | 'upcoming' | 'all'): Promise<Airdrop[]> => {
    const response = await fetch(`${API_BASE_URL}/airdrops?range=${range}`);
    if (!response.ok) throw new Error(`Failed to fetch ${range} airdrops`);
    const data = await response.json();
    return data.items || data;
  },

  getDeletedAirdrops: async (): Promise<Airdrop[]> => {
    const response = await fetch(`${API_BASE_URL}/admin/airdrops/deleted`);
    if (!response.ok) throw new Error('Failed to fetch deleted airdrops');
    return response.json();
  },

  saveCoinData: async (coinId: string, time: string, price: number): Promise<void> => {
    // Disabled temporarily
  },

  getTokens: async (): Promise<any[]> => {
    const response = await fetch(`https://gfiresearch.dev/api/tokens`);
    if (!response.ok) throw new Error('Failed to fetch tokens');
    return response.json();
  },

  createToken: async (token: any): Promise<any> => {
    const response = await fetch(`https://gfiresearch.dev/api/tokens`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token),
    });
    if (!response.ok) throw new Error('Failed to create token');
    return response.json();
  },

  updateToken: async (id: string, updates: any): Promise<any> => {
    const response = await fetch(`https://gfiresearch.dev/api/tokens/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update token');
    return response.json();
  },

  deleteToken: async (id: string): Promise<void> => {
    const response = await fetch(`https://gfiresearch.dev/api/tokens/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete token');
  },

  createAlphaInsight: async (insight: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/alpha-insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(insight),
    });
    if (!response.ok) throw new Error('Failed to create alpha insight');
    return response.json();
  },

  getAllAlphaInsights: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/alpha-insights`);
    if (!response.ok) throw new Error('Failed to fetch alpha insights');
    return response.json();
  },

  updateAlphaInsight: async (id: string, updates: any): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/alpha-insights/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!response.ok) throw new Error('Failed to update alpha insight');
    return response.json();
  },

  deleteAlphaInsight: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/alpha-insights/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete alpha insight');
  },
};
