import { memo, useMemo, useEffect } from 'react';
import { useOrderData, OrderData } from '@/hooks/useOrderData';
import { formatTime, formatPrice, formatQuantity } from '@/lib/formatters';
import { getPointFromVolume } from '@/lib/volume-ladder';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AlertCircle } from 'lucide-react';

interface OrderColumnProps {
  token: string;
  apiUrl: string;
  staggerDelay?: number;
  onDataUpdate?: (data: OrderData[]) => void;
  multiplier?: number;
}

function OrderColumnComponent({ token, apiUrl, staggerDelay = 0, onDataUpdate, multiplier }: OrderColumnProps) {
  const { data, isLoading, error, spreadBps } = useOrderData(token, apiUrl, staggerDelay);

  const stability = useMemo(() => {
    if (spreadBps === null) return null;
    if (spreadBps <= 1) return { level: 'Rất ổn định', color: 'text-green-400' };
    if (spreadBps <= 5) return { level: 'Ổn định vừa', color: 'text-yellow-400' };
    if (spreadBps <= 15) return { level: 'Biến động nhẹ', color: 'text-orange-400' };
    return { level: 'Dao động cao / Illiquid', color: 'text-red-400' };
  }, [spreadBps]);

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
    <div className="flex flex-col h-[760px] bg-card rounded-lg overflow-hidden font-sans border border-border">
      {/* Header */}
      <div className="sticky top-0 z-10">
        <div className="px-4 py-3 h-[60px] flex items-center">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-foreground">
                {token}
              </h2>
              {multiplier && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <span className="text-yellow-400 font-bold text-sm">
                        (x{multiplier})
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Volume for this token is multiplied by {multiplier}.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {stability && (
              <div className="flex items-center">
                <span className={`mr-2 text-xs ${stability.color}`}>●</span>
                <span className="text-xs text-subtle-text">{stability.level} ({spreadBps?.toFixed(2)} bps)</span>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 px-4 py-2 text-base font-medium text-subtle-text border-b border-border">
          <div className="flex items-center">
            <span>Thời gian</span>
          </div>
          <div className="text-right">Giá (USDT)</div>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto h-[650px]">
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
          <div className="divide-y divide-border">
            <TooltipProvider>
              {rowsWithColors.map((row) => {
                const volume = parseFloat(row.p) * parseFloat(row.q);
                const point = getPointFromVolume(volume);
                const tooltipContent = point
                  ? `≈ Volume $${volume.toFixed(
                      2
                    )} @ Point ${point}`
                  : `Volume $${volume.toFixed(2)}`;

                return (
                  <Tooltip key={row.a}>
                    <TooltipTrigger asChild>
                      <div className="grid grid-cols-2 gap-2 px-4 py-1 hover:bg-muted/30 transition-colors">
                        <div className="text-subtle-text font-normal tabular-nums text-sm">
                          {formatTime(row.T)}
                        </div>
                        <div
                          className={`text-right font-medium tabular-nums text-base ${row.priceColor}`}
                        >
                          {formatPrice(row.p)}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tooltipContent}</p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </TooltipProvider>
          </div>
        )}
      </div>
    </div>
  );
}

export const OrderColumn = memo(OrderColumnComponent);
