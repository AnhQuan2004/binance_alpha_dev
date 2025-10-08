import { useState, useEffect, useCallback, useRef } from 'react';

export interface OrderData {
  a: number; // Aggregate trade ID
  p: string; // Price
  q: string; // Quantity
  T: number; // Trade time
  m: boolean; // Is buyer maker
}

interface UseOrderDataResult {
  data: OrderData[];
  isLoading: boolean;
  error: string | null;
}

export function useOrderData(apiUrl: string, pollInterval = 1000): UseOrderDataResult {
  const [data, setData] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const intervalRef = useRef<number | null>(null);
  const isVisibleRef = useRef(true);

  const fetchData = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const response = await fetch(apiUrl, {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();
      const newData = result.data || [];

      // Only update if data has changed (compare first trade ID)
      setData((prevData) => {
        if (prevData.length === 0 || newData.length === 0) {
          return newData;
        }
        if (prevData[0]?.a !== newData[0]?.a) {
          return newData;
        }
        return prevData;
      });

      setError(null);
      setIsLoading(false);
      retryCountRef.current = 0;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }

      console.error('Fetch error:', err);
      setError(err.message || 'Failed to fetch');
      setIsLoading(false);

      // Exponential backoff: 1s → 2s → 4s → 8s (max 15s)
      retryCountRef.current += 1;
      const backoffDelay = Math.min(1000 * Math.pow(2, retryCountRef.current), 15000);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      intervalRef.current = window.setTimeout(() => {
        fetchData();
      }, backoffDelay);
    }
  }, [apiUrl]);

  useEffect(() => {
    // Handle visibility change
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden;
      
      if (isVisibleRef.current) {
        // Tab became visible - fetch immediately
        fetchData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial fetch
    fetchData();

    // Set up polling
    intervalRef.current = window.setInterval(() => {
      const currentInterval = isVisibleRef.current ? pollInterval : 5000;
      fetchData();
    }, isVisibleRef.current ? pollInterval : 5000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchData, pollInterval]);

  return { data, isLoading, error };
}
