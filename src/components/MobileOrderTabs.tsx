import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TokenIcon } from "./TokenIcon";
import { cn } from "@/lib/utils";

interface MobileOrderTabsProps {
  tokens: string[];
  children: React.ReactNode[];
  className?: string;
}

export function MobileOrderTabs({ tokens, children, className }: MobileOrderTabsProps) {
  const [activeTab, setActiveTab] = useState(tokens[0]);

  return (
    <Tabs 
      defaultValue={tokens[0]} 
      className={cn("w-full block lg:hidden", className)}
      onValueChange={setActiveTab}
    >
      <TabsList className="w-full h-auto flex overflow-x-auto py-1 bg-card border border-border rounded-lg mb-4">
        {tokens.map((token) => (
          <TabsTrigger 
            key={token} 
            value={token}
            className="flex items-center space-x-2 py-2 px-3"
          >
            <TokenIcon token={token} size="sm" />
            <span>{token}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {tokens.map((token, index) => (
        <TabsContent 
          key={token} 
          value={token}
          className={cn(
            "mt-0",
            activeTab === token ? "block" : "hidden"
          )}
        >
          {children[index]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
