import { useState, useEffect } from 'react';
import { OrderColumn } from '@/components/OrderColumn';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { MobileOrderTabs } from '@/components/MobileOrderTabs';
import { OrderData } from '@/hooks/useOrderData';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"

const Index = () => {
  const [tokenData, setTokenData] = useState<{[key: string]: OrderData[]}>({});
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const fetchedTokens = await api.getTokens();
        setTokens(fetchedTokens);
        setSelectedTokens(fetchedTokens.map((t: any) => t.name));
      } catch (error) {
        toast.error('Failed to fetch tokens');
      }
    };

    fetchTokens();
  }, []);

  const filteredTokens = tokens.filter(token => selectedTokens.includes(token.name));

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

      <div className="my-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className="w-[280px] justify-between"
            >
              Filter Tokens
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0">
            <Command>
              <CommandInput placeholder="Search tokens..." />
              <CommandList>
                <CommandEmpty>No tokens found.</CommandEmpty>
                <CommandGroup>
                  {tokens.map((token) => (
                    <CommandItem
                      key={token.name}
                      value={token.name}
                      onSelect={(currentValue) => {
                        setSelectedTokens(
                          selectedTokens.includes(currentValue)
                            ? selectedTokens.filter((t) => t !== currentValue)
                            : [...selectedTokens, currentValue]
                        )
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedTokens.includes(token.name)
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                      {token.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Desktop View */}
      <div className="hidden lg:grid grid-cols-3 xl:grid-cols-5 gap-4 auto-rows-fr pt-4">
        {filteredTokens.map((token) => (
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
      <MobileOrderTabs tokens={filteredTokens.map(t => t.name)}>
        {filteredTokens.map((token) => (
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
        <h2 className="text-xl font-bold mb-4">Alpha Insights</h2>
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
