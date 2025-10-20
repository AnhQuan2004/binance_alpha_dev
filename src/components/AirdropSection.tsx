import { Airdrop } from '@/lib/api';
import { Loader2, ExternalLink, Gift, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Helper function to format numbers with commas
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

// Helper function to filter out duplicate airdrops, keeping the latest one
const filterLatestAirdrops = (airdrops: Airdrop[]): Airdrop[] => {
  const airdropMap = new Map<string, Airdrop>();
  airdrops.forEach(airdrop => {
    const existing = airdropMap.get(airdrop.project);
    if (!existing || new Date(airdrop.time_iso) > new Date(existing.time_iso)) {
      airdropMap.set(airdrop.project, airdrop);
    }
  });
  return Array.from(airdropMap.values());
};

const AirdropTable = ({ title, icon, airdrops }: { title: string; icon: React.ReactNode; airdrops: Airdrop[] }) => (
  <section className="rounded-3xl border bg-card shadow-sm">
    <header className="flex items-center justify-between border-b px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-xs text-muted-foreground">
            {airdrops.length} {airdrops.length === 1 ? 'airdrop' : 'airdrops'}
          </p>
        </div>
      </div>
    </header>

    <div className="overflow-hidden">
      {airdrops.length === 0 ? (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            {icon}
          </div>
          <h4 className="mt-4 text-base font-medium text-foreground">No airdrops found</h4>
          <p className="mt-1 text-sm text-muted-foreground">
            No {title.toLowerCase()} are currently available
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-5 py-3 text-left font-medium">Project</th>
                <th className="px-5 py-3 text-center font-medium">Icon</th>
                <th className="px-5 py-3 text-center font-medium">Points</th>
                <th className="px-5 py-3 text-center font-medium">Amount</th>
                <th className="px-5 py-3 text-right font-medium">Time</th>
                <th className="px-5 py-3 text-center font-medium">Phase</th>
                <th className="px-5 py-3 text-center font-medium">Raised</th>
                <th className="px-5 py-3 text-left font-medium">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {airdrops.map((airdrop) => (
                <tr
                  key={`${airdrop.id ?? airdrop.project}-${airdrop.time_iso}`}
                  className="transition-colors hover:bg-muted/40"
                >
                  <td className="px-5 py-4">
                    <a
                      href={airdrop.x}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:text-primary"
                    >
                      <img
                        src="/x.png"
                        alt="X"
                        className="h-5 w-5 rounded-full bg-muted p-[2px]"
                      />
                      <div>
                        <p className="font-medium leading-tight">{airdrop.project}</p>
                        {airdrop.alias && (
                          <p className="text-xs text-muted-foreground">{airdrop.alias}</p>
                        )}
                      </div>
                    </a>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <img
                      src={airdrop.image_url}
                      alt={airdrop.project}
                      className="mx-auto h-8 w-8 rounded-full object-cover"
                    />
                  </td>
                  <td className="px-5 py-4 text-center font-semibold">
                    {formatNumber(airdrop.points)}
                  </td>
                  <td className="px-5 py-4 text-center font-semibold">
                    ${formatNumber(airdrop.amount)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <p className="font-medium">
                      {format(new Date(airdrop.time_iso), 'MMM d, yyyy')}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(airdrop.time_iso), 'h:mm a')}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                      airdrop.phase.toLowerCase().includes('1')
                        ? 'bg-blue-500/15 text-blue-300'
                        : airdrop.phase.toLowerCase().includes('2')
                        ? 'bg-purple-500/15 text-purple-300'
                        : airdrop.phase.toLowerCase().includes('3')
                        ? 'bg-amber-500/15 text-amber-300'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {airdrop.phase}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center font-semibold">
                    {airdrop.raised}
                  </td>
                  <td className="px-5 py-4">
                    <a 
                      href={airdrop.source_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <span>Source</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </section>
);

interface AirdropSectionProps {
  todaysAirdrops: Airdrop[];
  upcomingAirdrops: Airdrop[];
  isLoading: boolean;
}

export const AirdropSection = ({ todaysAirdrops, upcomingAirdrops, isLoading }: AirdropSectionProps) => {
  const dedupedToday = filterLatestAirdrops(todaysAirdrops);
  const dedupedUpcoming = filterLatestAirdrops(upcomingAirdrops);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-3xl border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-base font-medium text-muted-foreground">
          Đang tải dữ liệu airdrop...
        </span>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AirdropTable title="Today's Airdrops" icon={<Gift className="h-5 w-5" />} airdrops={dedupedToday} />
      <AirdropTable title="Upcoming Airdrops" icon={<Calendar className="h-5 w-5" />} airdrops={dedupedUpcoming} />
    </div>
  );
};
