const API_BASE_URL = 'https://gfiresearch.dev/api';

export interface Airdrop {
  id?: string;
  project: string;
  alias: string;
  points: number;
  amount: number;
  time_iso: string;
  timezone: string;
  phase: string;
  x: string;
  raised: number;
  source_link: string;
  deleted?: boolean;
}

export const api = {
  createAirdrop: async (airdrop: Omit<Airdrop, 'id' | 'deleted'>): Promise<Airdrop> => {
    const response = await fetch(`${API_BASE_URL}/airdrops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(airdrop),
    });
    if (!response.ok) throw new Error('Failed to create airdrop');
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
};
