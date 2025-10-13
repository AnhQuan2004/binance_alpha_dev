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
    multiplier: 4,
  },
  {
    name: 'ZEUS',
    apiUrl: 'https://www.binance.com/bapi/defi/v1/public/alpha-trade/agg-trades?limit=40&symbol=ALPHA_372USDT',
    staggerDelay: 200,
    multiplier: 4,
  },
  {
    name: 'ALEO',
    apiUrl: 'https://www.binance.com/bapi/defi/v1/public/alpha-trade/agg-trades?limit=40&symbol=ALPHA_373USDT',
    staggerDelay: 400,
    multiplier: 4,
  },
  {
    name: 'BTG',
    apiUrl: 'https://www.binance.com/bapi/defi/v1/public/alpha-trade/agg-trades?limit=40&symbol=ALPHA_406USDT',
    staggerDelay: 600,
    multiplier: 4,
  },
  {
    name: 'NUMI',
    apiUrl: 'https://www.binance.com/bapi/defi/v1/public/alpha-trade/agg-trades?limit=40&symbol=ALPHA_387USDT',
    staggerDelay: 800,
    multiplier: 4,
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
      <div className="hidden lg:grid grid-cols-3 xl:grid-cols-5 gap-4 auto-rows-fr">
        {TOKENS.map((token) => (
          <OrderColumn
            key={token.name}
            token={token.name}
            apiUrl={token.apiUrl}
            multiplier={token.multiplier}
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
            multiplier={token.multiplier}
            staggerDelay={token.staggerDelay}
            onDataUpdate={(data) => handleDataUpdate(token.name, data)}
          />
        ))}
      </MobileOrderTabs>
      

      
      {/* Articles section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Bài viết mới nhất</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a 
            href="https://gfiresearch.net/zama-fhe-la-gi" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-background rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2 text-foreground">ZAMA là gì? Giao thức FHE giúp bảo mật thông tin trên blockchain</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="mr-2">🔗</span>
              <span className="truncate">gfiresearch.net/zama-fhe-la-gi</span>
            </div>
          </a>
          
          <a 
            href="https://gfiresearch.net/toi-uu-co-hoi-hyperliquid" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-background rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2 text-foreground">Tối ưu hóa cơ hội đầu tư trên hệ sinh thái Hyperliquid</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="mr-2">🔗</span>
              <span className="truncate">gfiresearch.net/toi-uu-co-hoi-hyperliquid</span>
            </div>
          </a>
          
          <a 
            href="https://gfiresearch.net/hieu-ro-ve-proof-of-liquidity-o-berachain" 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-background rounded-lg p-4 border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold mb-2 text-foreground">Hiểu rõ cách hoạt động của Proof of Liquidity</h3>
            <div className="flex items-center text-sm text-muted-foreground">
              <span className="mr-2">🔗</span>
              <span className="truncate">gfiresearch.net/hieu-ro-ve-proof-of-liquidity-o-berachain</span>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Index;
