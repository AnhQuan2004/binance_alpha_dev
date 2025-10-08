import { useState, useEffect } from 'react';
import { OrderColumn } from '@/components/OrderColumn';
import { Header } from '@/components/Header';
import { MobileOrderTabs } from '@/components/MobileOrderTabs';
import { OrderData } from '@/hooks/useOrderData';

const TOKENS = [
  {
    name: 'AOP',
    apiUrl: 'https://www.binance.com/bapi/defi/v1/public/alpha-trade/agg-trades?limit=40&symbol=ALPHA_382USDT',
    staggerDelay: 0,
  },
  {
    name: 'ZEUS',
    apiUrl: 'https://www.binance.com/bapi/defi/v1/public/alpha-trade/agg-trades?limit=40&symbol=ALPHA_372USDT',
    staggerDelay: 200,
  },
  {
    name: 'ALEO',
    apiUrl: 'https://www.binance.com/bapi/defi/v1/public/alpha-trade/agg-trades?limit=40&symbol=ALPHA_373USDT',
    staggerDelay: 400,
  },
  {
    name: 'PINGPONG',
    apiUrl: 'https://www.binance.com/bapi/defi/v1/public/alpha-trade/agg-trades?limit=40&symbol=ALPHA_368USDT',
    staggerDelay: 600,
  },
  {
    name: 'NUMI',
    apiUrl: 'https://www.binance.com/bapi/defi/v1/public/alpha-trade/agg-trades?limit=40&symbol=ALPHA_387USDT',
    staggerDelay: 800,
  },
];

const Index = () => {
  const [tokenData, setTokenData] = useState<{[key: string]: OrderData[]}>({});

  // Callback function to receive data from OrderColumn components
  const handleDataUpdate = (token: string, data: OrderData[]) => {
    setTokenData(prev => ({
      ...prev,
      [token]: data
    }));
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <Header 
        title="Binance Alpha Limit Orders"
        subtitle="Real-time order book data • Updates every second"
      />

      {/* Desktop View */}
      <div className="hidden lg:grid grid-cols-3 xl:grid-cols-5 gap-4">
        {TOKENS.map((token) => (
          <OrderColumn
            key={token.name}
            token={token.name}
            apiUrl={token.apiUrl}
            staggerDelay={token.staggerDelay}
            onDataUpdate={(data) => handleDataUpdate(token.name, data)}
          />
        ))}
      </div>

      {/* Mobile/Tablet View */}
      <MobileOrderTabs tokens={TOKENS.map(t => t.name)}>
        {TOKENS.map((token) => (
          <OrderColumn
            key={token.name}
            token={token.name}
            apiUrl={token.apiUrl}
            staggerDelay={token.staggerDelay}
            onDataUpdate={(data) => handleDataUpdate(token.name, data)}
          />
        ))}
      </MobileOrderTabs>
    </div>
  );
};

export default Index;
