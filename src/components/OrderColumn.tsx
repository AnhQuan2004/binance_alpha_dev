import { memo, useMemo } from 'react';
import { useOrderData, OrderData } from '@/hooks/useOrderData';
import { formatTime, formatPrice, formatQuantity } from '@/lib/formatters';
import { AlertCircle } from 'lucide-react';

interface OrderColumnProps {
  token: string;
  apiUrl: string;
  staggerDelay?: number;
}

function OrderColumnComponent({ token, apiUrl, staggerDelay = 0 }: OrderColumnProps) {
  const { data, isLoading, error } = useOrderData(apiUrl, 1000);

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
    <div className="flex flex-col h-full bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-header-bg border-b border-border">
        <div className="px-4 py-3">
          <h2 className="text-sm font-semibold text-foreground">
            Limit Order – {token}
          </h2>
        </div>
        <div className="grid grid-cols-3 gap-2 px-4 py-2 bg-table-header text-xs font-medium text-muted-foreground">
          <div>Time</div>
          <div className="text-right">Price (USDT)</div>
          <div className="text-right">Quantity ({token})</div>
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
                className="grid grid-cols-3 gap-2 px-4 py-2 hover:bg-muted/30 transition-colors text-xs font-mono"
              >
                <div className="text-muted-foreground">
                  {formatTime(row.T)}
                </div>
                <div className={`text-right font-semibold ${row.priceColor}`}>
                  {formatPrice(row.p)}
                </div>
                <div className="text-right text-foreground">
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
