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

export function useOrderData(apiUrl: string, staggerDelay = 0): UseOrderDataResult {
  const [data, setData] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  const lastSeenIdRef = useRef<number | null>(null);
  const initialLoadRef = useRef(true);

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
      
      // Sort by trade time descending (newest first)
      newData.sort((a: OrderData, b: OrderData) => b.T - a.T);

      setData((prevData) => {
        // First load or no previous data
        if (prevData.length === 0 || initialLoadRef.current) {
          if (newData.length > 0) {
            lastSeenIdRef.current = Math.max(...newData.map((item: OrderData) => item.a));
            initialLoadRef.current = false;
          }
          return newData;
        }
        
        // Merge strategy: add only new trades (with a > lastSeenId)
        if (newData.length > 0) {
          const lastId = lastSeenIdRef.current || 0;
          const newTrades = newData.filter((item: OrderData) => item.a > lastId);
          
          if (newTrades.length > 0) {
            // Update lastSeenId to the highest trade ID
            lastSeenIdRef.current = Math.max(...newData.map((item: OrderData) => item.a));
            
            // Merge and keep sorted by time (T) descending
            const merged = [...newTrades, ...prevData];
            merged.sort((a, b) => b.T - a.T);
            
            // Limit to 40 items to match API limit
            return merged.slice(0, 40);
          }
        }
        
        return prevData;
      });

      setError(null);
      setIsLoading(false);
      retryCountRef.current = 0;
      
      // Schedule next fetch with normal interval (1s)
      scheduleNextFetch(1000);
      
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
      
      scheduleNextFetch(backoffDelay);
    }
  }, [apiUrl]);

  // Schedule next fetch with delay
  const scheduleNextFetch = useCallback((delay: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = window.setTimeout(() => {
      fetchData();
    }, delay);
  }, [fetchData]);

  useEffect(() => {
    // Initial fetch with stagger delay
    const initialTimeout = setTimeout(() => {
      fetchData();
    }, staggerDelay);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      clearTimeout(initialTimeout);
    };
  }, [fetchData, scheduleNextFetch, staggerDelay]);

  return { data, isLoading, error };
}