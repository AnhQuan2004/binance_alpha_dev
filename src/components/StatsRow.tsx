import { useCallback, useMemo } from "react";
import { StatCard } from "./StatCard";
import { Activity, TrendingUp, LineChart, BarChart3 } from "lucide-react";
import { OrderData } from "@/hooks/useOrderData";

interface StatsRowProps {
  tokenData: {
    [key: string]: OrderData[];
  };
}

export function StatsRow({ tokenData }: StatsRowProps) {
  const calculateTotalVolume = useCallback(() => {
    let total = 0;
    Object.values(tokenData).forEach(orders => {
      orders.forEach(order => {
        total += Number(order.p) * Number(order.q);
      });
    });
    return total;
  }, [tokenData]);

  const calculateTotalTrades = useCallback(() => {
    let total = 0;
    Object.values(tokenData).forEach(orders => {
      total += orders.length;
    });
    return total;
  }, [tokenData]);

  const calculateAveragePrice = useCallback(() => {
    let totalPrice = 0;
    let count = 0;
    
    Object.values(tokenData).forEach(orders => {
      orders.forEach(order => {
        totalPrice += Number(order.p);
        count++;
      });
    });
    
    return count > 0 ? totalPrice / count : 0;
  }, [tokenData]);

  const calculatePriceChange = useCallback(() => {
    let totalChange = 0;
    let tokenCount = 0;
    
    Object.entries(tokenData).forEach(([_, orders]) => {
      if (orders.length >= 2) {
        const newest = Number(orders[0].p);
        const oldest = Number(orders[orders.length - 1].p);
        const change = ((newest - oldest) / oldest) * 100;
        totalChange += change;
        tokenCount++;
      }
    });
    
    return tokenCount > 0 ? totalChange / tokenCount : 0;
  }, [tokenData]);

  const stats = useMemo(() => {
    const totalVolume = calculateTotalVolume();
    const totalTrades = calculateTotalTrades();
    const avgPrice = calculateAveragePrice();
    const priceChange = calculatePriceChange();

    return [
      {
        title: "Total Volume (USDT)",
        value: totalVolume.toLocaleString("en-US", { maximumFractionDigits: 2 }),
        trend: "neutral" as const,
        icon: <BarChart3 className="h-5 w-5" />
      },
      {
        title: "Total Trades",
        value: totalTrades,
        trend: "neutral" as const,
        icon: <Activity className="h-5 w-5" />
      },
      {
        title: "Avg Price (USDT)",
        value: avgPrice.toFixed(8),
        trend: "neutral" as const,
        icon: <LineChart className="h-5 w-5" />
      },
      {
        title: "Price Change",
        value: `${priceChange.toFixed(2)}%`,
        trend: priceChange > 0 ? "up" as const : priceChange < 0 ? "down" as const : "neutral" as const,
        icon: <TrendingUp className="h-5 w-5" />
      }
    ];
  }, [calculateTotalVolume, calculateTotalTrades, calculateAveragePrice, calculatePriceChange]);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          trend={stat.trend}
          icon={stat.icon}
          className="p-0"
        />
      ))}
    </div>
  );
}
