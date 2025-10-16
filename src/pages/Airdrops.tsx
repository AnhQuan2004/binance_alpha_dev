import { useState, useEffect } from 'react';
import { api, Airdrop } from '@/lib/api';
import { Gift, Calendar, History, Loader2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Helper function to format numbers with commas
const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num);
};

const AirdropTable = ({ title, icon, airdrops }: { title: string; icon: React.ReactNode; airdrops: Airdrop[] }) => (
  <div className="mb-10">
    <div className="flex items-center justify-between mb-4">
      <h2 className="flex items-center text-xl font-bold">
        {icon}
        <span className="ml-2">{title}</span>
      </h2>
      <div className="text-sm text-muted-foreground">
        {airdrops.length} {airdrops.length === 1 ? 'airdrop' : 'airdrops'}
      </div>
    </div>
    
    <div className="bg-card border rounded-lg shadow-sm overflow-hidden">
      {airdrops.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="rounded-full bg-muted p-3 mb-3">
            {icon}
          </div>
          <h3 className="text-lg font-medium mb-1">No airdrops found</h3>
          <p className="text-muted-foreground">No {title.toLowerCase()} are currently available</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Project</th>
                <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Points</th>
                <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Amount</th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Time</th>
                <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Phase</th>
                <th className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Raised</th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {airdrops.map((airdrop) => (
                <tr key={airdrop.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-4">
                    <a href={airdrop.x} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
                      <img src="/x.png" alt="X Logo" className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{airdrop.project}</div>
                        {airdrop.alias && <div className="text-sm text-muted-foreground">{airdrop.alias}</div>}
                      </div>
                    </a>
                  </td>
                  <td className="px-4 py-4 text-center font-medium">{formatNumber(airdrop.points)}</td>
                  <td className="px-4 py-4 text-center font-medium">${formatNumber(airdrop.amount)}</td>
                  <td className="px-4 py-4 text-right whitespace-nowrap">
                    <div className="font-medium">{format(new Date(airdrop.time_iso), 'MMM d, yyyy')}</div>
                    <div className="text-xs text-muted-foreground">{format(new Date(airdrop.time_iso), 'h:mm a')}</div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      airdrop.phase.toLowerCase().includes('1') ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" :
                      airdrop.phase.toLowerCase().includes('2') ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" :
                      airdrop.phase.toLowerCase().includes('3') ? "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" :
                      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                    )}>
                      {airdrop.phase}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center font-medium">{airdrop.raised}</td>
                  <td className="px-4 py-4 max-w-[200px]">
                    <a 
                      href={airdrop.source_link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-flex items-center text-primary hover:underline gap-1 truncate"
                    >
                      <span className="truncate">Source</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);

const Airdrops = () => {
  const [todaysAirdrops, setTodaysAirdrops] = useState<Airdrop[]>([]);
  const [upcomingAirdrops, setUpcomingAirdrops] = useState<Airdrop[]>([]);
  const [allAirdrops, setAllAirdrops] = useState<Airdrop[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAirdrops = async () => {
      setIsLoading(true);
      try {
        const [today, upcoming, all] = await Promise.all([
          api.getAirdropsByRange('today'),
          api.getAirdropsByRange('upcoming'),
          api.getAirdropsByRange('all'),
        ]);
        setTodaysAirdrops(today);
        setUpcomingAirdrops(upcoming);
        setAllAirdrops(all);
      } catch (error) {
        toast.error('Failed to fetch airdrops');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAirdrops();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Airdrops</h1>
        <p className="text-muted-foreground">Track upcoming and past token airdrops</p>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Loading airdrops...</span>
        </div>
      ) : (
        <>
          <AirdropTable title="Today's Airdrops" icon={<Gift className="h-5 w-5 text-primary" />} airdrops={todaysAirdrops} />
          <AirdropTable title="Upcoming Airdrops" icon={<Calendar className="h-5 w-5 text-primary" />} airdrops={upcomingAirdrops} />
          <AirdropTable title="Airdrop History" icon={<History className="h-5 w-5 text-primary" />} airdrops={allAirdrops} />
        </>
      )}
    </div>
  );
};

export default Airdrops;
