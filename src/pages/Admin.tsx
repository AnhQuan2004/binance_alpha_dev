import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { api, Airdrop } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AlphaInsightsAdmin } from '@/components/AlphaInsightsAdmin';

type AirdropInputs = Omit<Airdrop, 'id' | 'deleted'>;
type TokenInputs = {
  name: string;
  apiUrl: string;
  staggerDelay: number;
  multiplier: number;
};

const Admin = () => {
  // We're not forcing theme changes anymore, let the user control it
  const { theme } = useTheme();

  const { register, handleSubmit, reset, setValue, watch } = useForm<AirdropInputs>({
    defaultValues: initialAirdropValues,
  });
  const { register: registerToken, handleSubmit: handleSubmitToken, reset: resetToken, setValue: setTokenValue } = useForm<TokenInputs>({
    defaultValues: initialTokenValues,
  });
  const [allAirdrops, setAllAirdrops] = useState<Airdrop[]>([]);
  const [deletedAirdrops, setDeletedAirdrops] = useState<Airdrop[]>([]);
  const [editingAirdrop, setEditingAirdrop] = useState<Airdrop | null>(null);
  const [allTokens, setAllTokens] = useState<any[]>([]);
  const [editingToken, setEditingToken] = useState<any | null>(null);

  const fetchAirdrops = async () => {
    try {
      const [all, deleted] = await Promise.all([
        api.getAllAirdrops(),
        api.getDeletedAirdrops(),
      ]);
      setAllAirdrops(all);
      setDeletedAirdrops(deleted);
    } catch (error) {
      toast.error('Failed to fetch airdrops');
    }
  };

  const fetchTokens = async () => {
    try {
      const tokens = await api.getTokens();
      setAllTokens(tokens);
    } catch (error) {
      toast.error('Failed to fetch tokens');
    }
  };

  useEffect(() => {
    fetchAirdrops();
    fetchTokens();
  }, []);

  const onAirdropSubmit: SubmitHandler<AirdropInputs> = async (data) => {
    try {
      if (editingAirdrop) {
        const updatedAirdrop = await api.updateAirdrop(editingAirdrop.id!, data);
        setAllAirdrops(allAirdrops.map(a => a.id === editingAirdrop.id ? updatedAirdrop : a));
        toast.success('Airdrop updated successfully');
      } else {
        const newAirdrop = await api.createAirdrop(data);
        setAllAirdrops([...allAirdrops, newAirdrop]);
        toast.success('Airdrop created successfully');
      }
      reset(initialAirdropValues);
      setEditingAirdrop(null);
    } catch (error) {
      toast.error('Failed to save airdrop');
      fetchAirdrops(); // Fallback to refetching on error
    }
  };

  const onTokenSubmit: SubmitHandler<TokenInputs> = async (data) => {
    try {
      if (editingToken) {
        await api.updateToken(editingToken.id!, data);
        toast.success('Token updated successfully');
      } else {
        await api.createToken(data);
        toast.success('Token created successfully');
      }
      resetToken();
      setEditingToken(null);
      fetchTokens();
    } catch (error) {
      toast.error('Failed to save token');
    }
  };

  const handleAirdropDelete = async (id: string) => {
    try {
      await api.deleteAirdrop(id);
      toast.success('Airdrop deleted successfully');
      fetchAirdrops();
    } catch (error) {
      toast.error('Failed to delete airdrop');
    }
  };

  const handleTokenDelete = async (id: string) => {
    try {
      await api.deleteToken(id);
      toast.success('Token deleted successfully');
      fetchTokens();
    } catch (error) {
      toast.error('Failed to delete token');
    }
  };

  const handleAirdropEdit = (airdrop: Airdrop) => {
    setEditingAirdrop(airdrop);
    reset(airdrop);
  };

  const handleTokenEdit = (token: any) => {
    setEditingToken(token);
    resetToken(token);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 border-b pb-2">Admin Panel</h1>
      <div className="bg-card rounded-lg border p-4 md:p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{editingAirdrop ? 'Edit' : 'Create'} Airdrop</h2>
        <form onSubmit={handleSubmit(onAirdropSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(initialAirdropValues).filter(key => key !== 'timezone').map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize">{key.replace(/_/g, ' ')}</Label>
                {key === 'time_iso' ? (
                  <DateTimePicker
                    value={watch('time_iso')}
                    onChange={(date) => setValue('time_iso', date)}
                  />
                ) : ['source_link', 'image_url'].includes(key) ? (
                  <Input id={key} {...register(key as keyof AirdropInputs)} placeholder="https://..." />
                ) : (
                  <Input 
                    id={key} 
                    {...register(key as keyof AirdropInputs)} 
                    type={['points', 'amount'].includes(key) ? 'number' : 'text'} 
                    placeholder={key === 'project' ? 'Project name' : ''} 
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" className="min-w-[120px]">
              {editingAirdrop ? 'Update' : 'Create'} Airdrop
            </Button>
            {editingAirdrop && (
              <Button 
                variant="outline" 
                onClick={() => { setEditingAirdrop(null); reset(initialAirdropValues); }}
                className="min-w-[120px]"
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-card rounded-lg border p-4 md:p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{editingToken ? 'Edit' : 'Create'} Token</h2>
        <form onSubmit={handleSubmitToken(onTokenSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(initialTokenValues).map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize">{key.replace(/_/g, ' ')}</Label>
                <Input 
                  id={key} 
                  {...registerToken(key as keyof TokenInputs)} 
                  type={['staggerDelay', 'multiplier'].includes(key) ? 'number' : 'text'} 
                  placeholder={key.replace(/_/g, ' ')} 
                />
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button type="submit" className="min-w-[120px]">
              {editingToken ? 'Update' : 'Create'} Token
            </Button>
            {editingToken && (
              <Button 
                variant="outline" 
                onClick={() => { setEditingToken(null); resetToken(initialTokenValues); }}
                className="min-w-[120px]"
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </div>

      <AirdropTable title="All Airdrops" airdrops={allAirdrops} onEdit={handleAirdropEdit} onDelete={handleAirdropDelete} />
      <AirdropTable title="Deleted Airdrops" airdrops={deletedAirdrops} />
      <TokenTable title="All Tokens" tokens={allTokens} onEdit={handleTokenEdit} onDelete={handleTokenDelete} />
      <AlphaInsightsAdmin />
    </div>
  );
};

const AirdropTable = ({ airdrops, title, onEdit, onDelete }: { airdrops: Airdrop[], title: string, onEdit?: (airdrop: Airdrop) => void, onDelete?: (id: string) => void }) => (
  <div className="mb-8 bg-card rounded-lg border shadow-sm overflow-hidden">
    <div className="p-4 border-b">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{airdrops.length} airdrops found</p>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50 border-b">
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Project</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Points</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Amount</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Time</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Phase</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">X</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Raised</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Source</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Image</th>
            {(onEdit || onDelete) && (
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {airdrops.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-4 py-6 text-center text-muted-foreground">
                No airdrops found
              </td>
            </tr>
          ) : (
            airdrops.map((airdrop) => (
              <tr key={airdrop.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-medium">{airdrop.project}</td>
                <td className="px-4 py-3 whitespace-nowrap">{airdrop.points}</td>
                <td className="px-4 py-3 whitespace-nowrap">{airdrop.amount}</td>
                <td className="px-4 py-3 whitespace-nowrap">{new Date(airdrop.time_iso).toLocaleString()}</td>
                <td className="px-4 py-3 whitespace-nowrap">{airdrop.phase}</td>
                <td className="px-4 py-3 whitespace-nowrap">{airdrop.x}</td>
                <td className="px-4 py-3 whitespace-nowrap">{airdrop.raised}</td>
                <td className="px-4 py-3 max-w-[200px] truncate">
                  <a 
                    href={airdrop.source_link} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline"
                  >
                    {airdrop.source_link}
                  </a>
                </td>
                <td className="px-4 py-3 max-w-[200px] truncate">
                  <a 
                    href={airdrop.image_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline"
                  >
                    {airdrop.image_url}
                  </a>
                </td>
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {onEdit && (
                        <Button size="sm" variant="outline" onClick={() => onEdit(airdrop)}>
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button size="sm" variant="destructive" onClick={() => onDelete(airdrop.id!)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const TokenTable = ({ tokens, title, onEdit, onDelete }: { tokens: any[], title: string, onEdit?: (token: any) => void, onDelete?: (id: string) => void }) => (
  <div className="mb-8 bg-card rounded-lg border shadow-sm overflow-hidden">
    <div className="p-4 border-b">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="text-sm text-muted-foreground mt-1">{tokens.length} tokens found</p>
    </div>
    
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-muted/50 border-b">
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Name</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">API URL</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Stagger Delay</th>
            <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Multiplier</th>
            {(onEdit || onDelete) && (
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tokens.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                No tokens found
              </td>
            </tr>
          ) : (
            tokens.map((token) => (
              <tr key={token.id} className="hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-medium">{token.name}</td>
                <td className="px-4 py-3 max-w-[200px] truncate">{token.apiUrl}</td>
                <td className="px-4 py-3 whitespace-nowrap">{token.staggerDelay}</td>
                <td className="px-4 py-3 whitespace-nowrap">{token.multiplier}</td>
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {onEdit && (
                        <Button size="sm" variant="outline" onClick={() => onEdit(token)}>
                          Edit
                        </Button>
                      )}
                      {onDelete && (
                        <Button size="sm" variant="destructive" onClick={() => onDelete(token.id!)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </div>
);

const DateTimePicker = ({ value, onChange }: { value: string, onChange: (date: string) => void }) => {
  const [date, setDate] = useState<Date | undefined>(value ? new Date(value) : undefined);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    const newDate = date ? new Date(date) : new Date();
    newDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
    setDate(newDate);
    onChange(newDate.toISOString());
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = e.target.value.split(':');
    const newDate = date ? new Date(date) : new Date();
    newDate.setHours(parseInt(hours), parseInt(minutes));
    setDate(newDate);
    onChange(newDate.toISOString());
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-full sm:w-[200px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        value={date ? format(date, 'HH:mm') : ''}
        onChange={handleTimeChange}
        className="w-full sm:w-[120px]"
      />
    </div>
  );
};

const initialAirdropValues: AirdropInputs = {
  project: '',
  alias: '',
  points: 0,
  amount: 0,
  time_iso: new Date().toISOString(),
  timezone: 'Asia/Ho_Chi_Minh',
  phase: '',
  x: '',
  raised: '',
  source_link: '',
  image_url: '',
};

const initialTokenValues: TokenInputs = {
  name: '',
  apiUrl: '',
  staggerDelay: 0,
  multiplier: 0,
};

export default Admin;
