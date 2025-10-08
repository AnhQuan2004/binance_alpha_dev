import { memo, useMemo, useEffect } from 'react';
import { useOrderData, OrderData } from '@/hooks/useOrderData';
import { formatTime, formatPrice, formatQuantity } from '@/lib/formatters';
import { AlertCircle } from 'lucide-react';
import { TokenIcon } from './TokenIcon';

interface OrderColumnProps {
  token: string;
  apiUrl: string;
  staggerDelay?: number;
  onDataUpdate?: (data: OrderData[]) => void;
}

function OrderColumnComponent({ token, apiUrl, staggerDelay = 0, onDataUpdate }: OrderColumnProps) {
  const { data, isLoading, error } = useOrderData(apiUrl, staggerDelay);

  // Pass data back to parent component
  useEffect(() => {
    if (data && data.length > 0 && onDataUpdate) {
      onDataUpdate(data);
    }
  }, [data, onDataUpdate]);

  // Calculate price color based on previous price
  const rowsWithColors = useMemo(() => {
    if (!data || data.length === 0) return [];

    return data.map((row, index) => {
      let priceColor = 'text-foreground';
      
      if (index < data.length - 1) {
        const currentPrice = Number(row.p);
        const previousPrice = Number(data[index + 1].p);
        
        if (currentPrice >= previousPrice) {
          priceColor = 'text-price-up';
        } else {
          priceColor = 'text-price-down';
        }
      }

      return { ...row, priceColor };
    });
  }, [data]);

  return (
    <div className="flex flex-col h-full bg-background rounded-lg overflow-hidden font-sans">
      {/* Header */}
      <div className="sticky top-0 z-10">
        <div className="px-4 py-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {token}
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 py-2 text-sm font-medium text-subtle-text border-b border-border/50">
          <div className="flex items-center">
            <span>Thời gian</span>
          </div>
          <div className="text-right">Giá (USDT)</div>
          <div className="text-right">Số lượng ({token})</div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: '600px' }}>
        {isLoading && data.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            Loading...
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 px-4 py-3 bg-destructive/10 text-destructive text-xs">
            <AlertCircle className="w-4 h-4" />
            <span>Error: {error}</span>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
            No trades available
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {rowsWithColors.map((row) => (
              <div
                key={row.a}
                className="grid grid-cols-3 gap-2 px-4 py-2 hover:bg-muted/30 transition-colors text-sm tabular-nums"
              >
                <div className="text-subtle-text font-normal">
                  {formatTime(row.T)}
                </div>
                <div className={`text-right font-medium ${row.priceColor}`}>
                  {formatPrice(row.p)}
                </div>
                <div className="text-right text-foreground font-normal">
                  {formatQuantity(row.q)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const OrderColumn = memo(OrderColumnComponent);
