import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '@/lib/api';

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
  spreadBps: number | null;
}

export function useOrderData(tokenName: string, apiUrl: string, staggerDelay = 0): UseOrderDataResult {
  const [data, setData] = useState<OrderData[]>([]);
  const [spreadBps, setSpreadBps] = useState<number | null>(null);
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

      // Calculate spreadBps from the last 10 trades
      if (newData.length > 0) {
        const last10Trades = newData.slice(0, 10);
        const prices = last10Trades.map(t => parseFloat(t.p));
        const maxPrice = Math.max(...prices);
        const minPrice = Math.min(...prices);
        const midPrice = (maxPrice + minPrice) / 2;
        if (midPrice > 0) {
          const spread = ((maxPrice - minPrice) / midPrice) * 10000;
          setSpreadBps(spread);
        }
      }

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
            newTrades.forEach(trade => {
              const time = new Date(trade.T).toISOString();
              const price = parseFloat(trade.p);
              api.saveCoinData(tokenName, time, price).catch(console.error);
            });

            // Update lastSeenId to the highest trade ID
            lastSeenIdRef.current = Math.max(...newData.map((item: OrderData) => item.a));
            
            // Merge and keep sorted by time (T) descending
            const merged = [...newTrades, ...prevData];
            merged.sort((a, b) => b.T - a.T);
            
            // Increase limit to show more data
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

  return { data, isLoading, error, spreadBps };
}
