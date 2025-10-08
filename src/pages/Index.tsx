import { OrderColumn } from '@/components/OrderColumn';

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
  return (
    <div className="min-h-screen bg-background p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-1">
          Binance Alpha Limit Orders
        </h1>
        <p className="text-sm text-muted-foreground">
          Real-time order book data • Updates every second
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {TOKENS.map((token) => (
          <OrderColumn
            key={token.name}
            token={token.name}
            apiUrl={token.apiUrl}
            staggerDelay={token.staggerDelay}
          />
        ))}
      </div>
    </div>
  );
};

export default Index;
