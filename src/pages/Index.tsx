import { useState, useEffect, useMemo } from 'react';
import { OrderColumn } from '@/components/OrderColumn';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { api, Airdrop } from '@/lib/api';
import { toast } from 'sonner';
import { MobileOrderTabs } from '@/components/MobileOrderTabs';
import { OrderData } from '@/hooks/useOrderData';
import { Link } from 'react-router-dom';
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
import { Check, ChevronsUpDown, ArrowRight, BarChart3, Phone, Mail, Facebook, Youtube, Send, Gamepad2, Music, X as XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { AlphaInsightsTable } from "@/components/AlphaInsightsTable";
import { AirdropSection } from "@/components/AirdropSection";

const filterLatestAirdrops = (airdrops: Airdrop[]): Airdrop[] => {
  const airdropMap = new Map<string, Airdrop>();
  airdrops.forEach((airdrop) => {
    const existing = airdropMap.get(airdrop.project);
    if (!existing || new Date(airdrop.time_iso) > new Date(existing.time_iso)) {
      airdropMap.set(airdrop.project, airdrop);
    }
  });
  return Array.from(airdropMap.values());
};

const getMostRecentDate = (airdrops: Airdrop[]): Date | null => {
  if (!airdrops.length) return null;
  return airdrops.reduce((latest, current) => {
    const currentDate = new Date(current.time_iso);
    return currentDate > latest ? currentDate : latest;
  }, new Date(airdrops[0].time_iso));
};

const MetricCard = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string | number;
  helper?: string;
}) => (
  <div className="rounded-2xl border border-white/10 bg-background/40 p-4 shadow-sm backdrop-blur">
    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
      {label}
    </p>
    <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
    {helper && <p className="mt-1 text-xs text-muted-foreground">{helper}</p>}
  </div>
);

const Index = () => {
  const [tokenData, setTokenData] = useState<{[key: string]: OrderData[]}>({});
  const [tokens, setTokens] = useState<any[]>([]);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [todaysAirdrops, setTodaysAirdrops] = useState<Airdrop[]>([]);
  const [upcomingAirdrops, setUpcomingAirdrops] = useState<Airdrop[]>([]);
  const [historicalAirdrops, setHistoricalAirdrops] = useState<Airdrop[]>([]);
  const [isLoadingAirdrops, setIsLoadingAirdrops] = useState<boolean>(true);

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

  useEffect(() => {
    const fetchAirdrops = async () => {
      setIsLoadingAirdrops(true);
      try {
        const [today, upcoming, history] = await Promise.all([
          api.getAirdropsByRange('today'),
          api.getAirdropsByRange('upcoming'),
          api.getAirdropsByRange('all'),
        ]);
        setTodaysAirdrops(today);
        setUpcomingAirdrops(upcoming);
        setHistoricalAirdrops(history);
      } catch (error) {
        toast.error('Failed to fetch airdrops');
      } finally {
        setIsLoadingAirdrops(false);
      }
    };

    fetchAirdrops();
  }, []);

  const filteredTokens = tokens.filter(token => selectedTokens.includes(token.name));

  // Callback function to receive data from OrderColumn components
  const handleDataUpdate = (token: string, data: OrderData[]) => {
    setTokenData(prev => ({
      ...prev,
      [token]: data
    }));
  };

  const dedupedToday = useMemo(() => filterLatestAirdrops(todaysAirdrops), [todaysAirdrops]);
  const dedupedUpcoming = useMemo(() => filterLatestAirdrops(upcomingAirdrops), [upcomingAirdrops]);
  const dedupedHistorical = useMemo(
    () => filterLatestAirdrops(historicalAirdrops),
    [historicalAirdrops],
  );

  const latestUpdate = useMemo(
    () => getMostRecentDate([...dedupedToday, ...dedupedUpcoming, ...dedupedHistorical]),
    [dedupedToday, dedupedUpcoming, dedupedHistorical],
  );

  const socialLinks = useMemo(
    () => [
      {
        name: 'X (Twitter)',
        url: 'https://x.com/GfiResearch',
        Icon: XIcon,
      },
      {
        name: 'Facebook',
        url: 'https://www.facebook.com/gfiresearch',
        Icon: Facebook,
      },
      {
        name: 'YouTube',
        url: 'https://www.youtube.com/@GFIResearch',
        Icon: Youtube,
      },
      {
        name: 'TikTok',
        url: 'https://www.tiktok.com/@gfiresearch',
        Icon: Music,
      },
      {
        name: 'Discord',
        url: 'https://discord.com/invite/DhYw3cgU7U',
        Icon: Gamepad2,
      },
      {
        name: 'Telegram',
        url: 'https://t.me/gfi_research_Channel',
        Icon: Send,
      },
    ],
    [],
  );

  const heroMetrics = useMemo(
    () => [
      {
        label: "Today's Airdrops",
        value: isLoadingAirdrops ? '—' : dedupedToday.length,
        helper: 'Cơ hội đang diễn ra trên Binance Alpha',
      },
      {
        label: 'Upcoming Airdrops',
        value: isLoadingAirdrops ? '—' : dedupedUpcoming.length,
        helper: 'Lịch mở đăng ký sắp tới',
      },
      {
        label: 'Last Updated',
        value: latestUpdate ? `${latestUpdate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • ${latestUpdate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}` : '—',
        helper: latestUpdate ? 'Cập nhật theo thời gian thực' : 'Chờ dữ liệu mới',
      },
    ],
    [dedupedToday.length, dedupedUpcoming.length, latestUpdate, isLoadingAirdrops],
  );

  const handleScrollToMarketWatch = () => {
    const section = document.getElementById('market-watch');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const tokenFilterControl = (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-[220px] justify-between sm:w-[240px]"
        >
          Filter Tokens
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0">
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
                    );
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
  );

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-primary/10 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-4 py-12 md:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-primary">
              Alpha Overview
            </p>
            <h1 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">
              GFI Research — Binance Alpha Dashboard
            </h1>
            <p className="mt-4 text-base text-muted-foreground md:text-lg">
              Tổng quan chuyên sâu về airdrop, điểm thưởng và dữ liệu giao dịch real-time từ Binance Alpha. Khai thác insight định lượng để đưa ra quyết định nhanh hơn.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link to="/airdrops" className="inline-flex items-center gap-2">
                  Khám phá Airdrops
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" onClick={handleScrollToMarketWatch} className="inline-flex items-center gap-2">
                Xem Market Watch
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid w-full gap-4 sm:grid-cols-3 lg:w-auto">
            {heroMetrics.map((metric) => (
              <MetricCard
                key={metric.label}
                label={metric.label}
                value={metric.value}
                helper={metric.helper}
              />
            ))}
          </div>
        </div>
      </section>

      <main className="mx-auto flex max-w-7xl flex-col gap-16 px-4 py-12 md:px-8">
        <section className="space-y-6">
          <header>
            <h2 className="text-2xl font-semibold text-foreground">Alpha Activities</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Theo dõi airdrop, points và hoạt động trên Binance Alpha.
            </p>
          </header>
          <AirdropSection
            todaysAirdrops={todaysAirdrops}
            upcomingAirdrops={upcomingAirdrops}
            isLoading={isLoadingAirdrops}
          />
        </section>

        <section id="market-watch" className="space-y-6">
          <Header 
            title="Binance Alpha Limit Orders"
            subtitle="Real-time order book data • Updates every second"
            rightContent={tokenFilterControl}
          />
          <div className="mt-2">
            <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4 text-xs md:text-sm text-muted-foreground shadow-sm backdrop-blur">
              <h3 className="font-semibold text-primary uppercase tracking-[0.2em] text-[10px] md:text-xs">
                Tips trade
              </h3>
              <ul className="mt-2 space-y-1 text-foreground/80">
                <li>• Chia nhỏ lệnh thay vì all-in: giúp tận dụng multiplier nhiều lần và tránh trượt giá.</li>
                <li>• Trade trong khung giờ có volume cao (thường là 19h–23h VN) để tăng khả năng khớp và giảm spread.</li>
                <li>• Ưu tiên cặp có thanh khoản cao / ít biến động mạnh, giúp giữ ổn định IL và tận dụng x4 hiệu quả.</li>
                <li>• Sử dụng “reverse” khi thấy chênh lệch bid–ask lớn, để đảo chiều nhanh mà không bị delay khớp.</li>
                <li>• Đặt limit thay vì market khi signal ổn định → tiết kiệm phí &amp; tránh slippage.</li>
                <li>• Theo dõi phí giao dịch (fee tier) – người dùng volume lớn có thể được giảm phí hoặc thưởng thêm points.</li>
              </ul>
            </div>
          </div>

          <div className="hidden auto-rows-fr grid-cols-3 gap-4 pt-4 lg:grid xl:grid-cols-5">
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
        </section>

        <AlphaInsightsTable
          introText="Danh sách dự án DeFi được đội ngũ GFI Research phân tích gần đây."
        />
      </main>

      <footer className="border-t border-border/60 bg-background/95">
        <div className="mx-auto max-w-7xl px-4 py-12 text-sm text-muted-foreground md:px-8">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <img
                  src="/logo.png"
                  alt="GFI Research logo"
                  className="h-10 w-auto"
                />
                <div>
                  <p className="text-base font-semibold text-foreground">
                    GFI Research
                  </p>
                  <p>Empowering the Binance Alpha community with data-driven insights.</p>
                </div>
              </div>

              <nav className="flex flex-wrap gap-3 text-foreground/80">
                <a
                  href="https://gfiresearch.net/about-us"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  About
                </a>
                <span className="text-muted-foreground/50">/</span>
                <a
                  href="https://gfiresearch.net/terms-of-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  Research Policy
                </a>
              </nav>

              <p className="text-xs text-muted-foreground/80">
                Data sourced from Binance Alpha API &amp; GFI internal analytics.
              </p>
            </div>

            <div className="space-y-4 text-foreground">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Thông tin liên hệ
              </p>
              <div className="flex flex-col gap-3 text-sm">
                <span className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href="tel:+84873005958" className="hover:text-primary">
                    +(84)287 300 5958
                  </a>
                </span>
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href="mailto:contact@gfiresearch.net" className="hover:text-primary">
                    contact@gfiresearch.net
                  </a>
                </span>
              </div>
            </div>

            <div className="space-y-4 text-foreground">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Kết nối
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3">
                {socialLinks.map(({ name, url, Icon }) => (
                  <a
                    key={name}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-muted/20 text-foreground transition hover:border-primary hover:bg-primary/10 hover:text-primary"
                    aria-label={name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
