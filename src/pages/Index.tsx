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
import { Check, ChevronsUpDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { AlphaInsightsTable } from "@/components/AlphaInsightsTable";
import { AirdropSection } from "@/components/AirdropSection";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Index = () => {
  const [tokenData, setTokenData] = useState<{[key: string]: OrderData[]}>({});
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        const fetchedTokens = await api.getTokens();
        setTokens(fetchedTokens);
        setSelectedTokens(fetchedTokens.slice(0, 5).map((t: any) => t.name));
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

      {/* Airdrop Section */}
      <AirdropSection />

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
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="ml-2">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="max-w-xs">
                <strong>How to use the Order Book:</strong>
                <br />
                - Each column represents a token's order book.
                <br />
                - Green prices indicate a price increase.
                <br />
                - Red prices indicate a price decrease.
                <br />
                - Hover over a trade to see the volume.
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
      

      
      {/* Alpha Insights Table */}
      <AlphaInsightsTable />
    </div>
  );
};

export default Index;
