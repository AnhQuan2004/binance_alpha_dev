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

type Inputs = Omit<Airdrop, 'id' | 'deleted'>;

const Admin = () => {
  // We're not forcing theme changes anymore, let the user control it
  const { theme } = useTheme();

  const { register, handleSubmit, reset, setValue, watch } = useForm<Inputs>({
    defaultValues: initialValues,
  });
  const [allAirdrops, setAllAirdrops] = useState<Airdrop[]>([]);
  const [deletedAirdrops, setDeletedAirdrops] = useState<Airdrop[]>([]);
  const [editingAirdrop, setEditingAirdrop] = useState<Airdrop | null>(null);

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

  useEffect(() => {
    fetchAirdrops();
  }, []);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      if (editingAirdrop) {
        await api.updateAirdrop(editingAirdrop.id!, data);
        toast.success('Airdrop updated successfully');
      } else {
        await api.createAirdrop(data);
        toast.success('Airdrop created successfully');
      }
      reset();
      setEditingAirdrop(null);
      fetchAirdrops();
    } catch (error) {
      toast.error('Failed to save airdrop');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAirdrop(id);
      toast.success('Airdrop deleted successfully');
      fetchAirdrops();
    } catch (error) {
      toast.error('Failed to delete airdrop');
    }
  };

  const handleEdit = (airdrop: Airdrop) => {
    setEditingAirdrop(airdrop);
    reset(airdrop);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 border-b pb-2">Admin Panel</h1>
      <div className="bg-card rounded-lg border p-4 md:p-6 mb-8 shadow-sm">
        <h2 className="text-xl font-semibold mb-4">{editingAirdrop ? 'Edit' : 'Create'} Airdrop</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.keys(initialValues).filter(key => key !== 'timezone').map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize">{key.replace(/_/g, ' ')}</Label>
                {key === 'time_iso' ? (
                  <DateTimePicker
                    value={watch('time_iso')}
                    onChange={(date) => setValue('time_iso', date)}
                  />
                ) : key === 'source_link' ? (
                  <Input id={key} {...register(key as keyof Inputs)} placeholder="https://..." />
                ) : (
                  <Input 
                    id={key} 
                    {...register(key as keyof Inputs)} 
                    type={['points', 'amount', 'raised'].includes(key) ? 'number' : 'text'} 
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
                onClick={() => { setEditingAirdrop(null); reset(initialValues); }}
                className="min-w-[120px]"
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </div>

      <AirdropTable title="All Airdrops" airdrops={allAirdrops} onEdit={handleEdit} onDelete={handleDelete} />
      <AirdropTable title="Deleted Airdrops" airdrops={deletedAirdrops} />
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
            {(onEdit || onDelete) && (
              <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {airdrops.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-4 py-6 text-center text-muted-foreground">
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

const initialValues: Inputs = {
  project: '',
  alias: '',
  points: 0,
  amount: 0,
  time_iso: new Date().toISOString(),
  timezone: 'Asia/Ho_Chi_Minh',
  phase: '',
  x: '',
  raised: 0,
  source_link: '',
};

export default Admin;
