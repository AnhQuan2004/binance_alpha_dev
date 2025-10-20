import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { api, Airdrop } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/use-theme';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { AlphaInsightsAdmin } from '@/components/AlphaInsightsAdmin';
import { hasTimeComponent, sanitizeTimeString, getAirdropDateLabel, getAirdropTimeLabel } from '@/lib/airdropUtils';

type AirdropInputs = Omit<Airdrop, 'id' | 'deleted'>;
type TokenInputs = {
  name: string;
  apiUrl: string;
  staggerDelay: number;
  multiplier: number;
};

const formatDateOnlyString = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatDateTimeDisplay = (airdrop: Airdrop) => {
  const dateLabel = getAirdropDateLabel(airdrop);
  const timeLabel = getAirdropTimeLabel(airdrop);
  return timeLabel ? `${dateLabel} ${timeLabel}` : dateLabel;
};

const deriveEventDate = (airdrop: Airdrop): string | null => {
  if (airdrop.event_date) return airdrop.event_date;
  if (airdrop.time_iso) {
    const parsed = new Date(airdrop.time_iso);
    if (!Number.isNaN(parsed.getTime())) {
      return formatDateOnlyString(parsed);
    }
  }
  return null;
};

const deriveEventTime = (airdrop: Airdrop): string | null => {
  const sanitizedEventTime = sanitizeTimeString(airdrop.event_time);
  if (sanitizedEventTime) return sanitizedEventTime;

  if (airdrop.time_iso && hasTimeComponent(airdrop.time_iso)) {
    const parsed = new Date(airdrop.time_iso);
    if (!Number.isNaN(parsed.getTime())) {
      const hh = parsed.getHours().toString().padStart(2, '0');
      const mm = parsed.getMinutes().toString().padStart(2, '0');
      const ss = parsed.getSeconds().toString().padStart(2, '0');
      return sanitizeTimeString(`${hh}:${mm}:${ss}`);
    }
  }

  return null;
};

const computeDateFromProps = (eventDate: string | null, timeIso: string | null): Date | undefined => {
  if (eventDate) {
    const parsed = new Date(eventDate);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  if (timeIso) {
    const parsed = new Date(timeIso);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return undefined;
};

const computeIncludeTimeFromProps = (eventTime: string | null, timeIso: string | null): boolean =>
  Boolean(sanitizeTimeString(eventTime) || (timeIso && hasTimeComponent(timeIso)));

const computeDisplayTimeFromProps = (eventTime: string | null, timeIso: string | null): string => {
  const sanitizedEventTime = sanitizeTimeString(eventTime);
  if (sanitizedEventTime) return sanitizedEventTime.slice(0, 5);
  if (timeIso && hasTimeComponent(timeIso)) {
    const date = new Date(timeIso);
    if (!Number.isNaN(date.getTime())) {
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  }
  return '';
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

  const eventDateValue = watch('event_date');
  const eventTimeValue = watch('event_time');
  const eventTimeIsoValue = watch('time_iso');

  const registerAirdropField = (field: keyof AirdropInputs) => {
    if (field === 'points' || field === 'amount') {
      return register(field, { valueAsNumber: true });
    }
    return register(field);
  };

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

  const normalizeNumericField = (value: number | null) =>
    value === null || Number.isNaN(value) ? null : value;

  const normalizeStringField = (value: string | null | undefined) => {
    if (value === undefined || value === null) return null;
    const trimmed = value.trim();
    return trimmed === '' ? null : trimmed;
  };

  const onAirdropSubmit: SubmitHandler<AirdropInputs> = async (data) => {
    const normalizedEventDate = normalizeStringField(data.event_date);
    const normalizedEventTime = normalizeStringField(data.event_time);
    const normalizedIso = normalizeStringField(data.time_iso);

    const payload: AirdropInputs = {
      ...data,
      points: normalizeNumericField(data.points),
      amount: normalizeNumericField(data.amount),
      event_date: normalizedEventDate,
      event_time: normalizedEventTime,
      time_iso: normalizedIso,
    };
    try {
      if (editingAirdrop) {
        const updatedAirdrop = await api.updateAirdrop(editingAirdrop.id!, payload);
        setAllAirdrops(allAirdrops.map(a => a.id === editingAirdrop.id ? updatedAirdrop : a));
        toast.success('Airdrop updated successfully');
      } else {
        const newAirdrop = await api.createAirdrop(payload);
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
    reset({
      ...airdrop,
      points: airdrop.points ?? null,
      amount: airdrop.amount ?? null,
      event_date: deriveEventDate(airdrop),
      event_time: deriveEventTime(airdrop),
      time_iso: normalizeStringField(airdrop.time_iso),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
            {Object.keys(initialAirdropValues)
              .filter(key => !['timezone', 'event_date', 'event_time'].includes(key))
              .map((key) => (
              <div key={key} className="space-y-2">
                <Label htmlFor={key} className="capitalize">{key.replace(/_/g, ' ')}</Label>
                {key === 'time_iso' ? (
                  <DateTimePicker
                    eventDate={eventDateValue}
                    eventTime={eventTimeValue}
                    timeIso={eventTimeIsoValue}
                    onChange={({ eventDate, eventTime, timeIso }) => {
                      setValue('event_date', eventDate);
                      setValue('event_time', eventTime);
                      setValue('time_iso', timeIso);
                    }}
                  />
                ) : ['source_link', 'image_url'].includes(key) ? (
                  <Input id={key} {...register(key as keyof AirdropInputs)} placeholder="https://..." />
                ) : (
                  <Input 
                    id={key} 
                    {...registerAirdropField(key as keyof AirdropInputs)} 
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

      <AirdropTable title="All Airdrops" airdrops={allAirdrops.filter(airdrop => !airdrop.deleted)} onEdit={handleAirdropEdit} onDelete={handleAirdropDelete} />
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
                <td className="px-4 py-3 whitespace-nowrap">{airdrop.points ?? '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{airdrop.amount ?? '—'}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatDateTimeDisplay(airdrop)}</td>
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

const DateTimePicker = ({
  eventDate,
  eventTime,
  timeIso,
  onChange,
}: {
  eventDate: string | null;
  eventTime: string | null;
  timeIso: string | null;
  onChange: (payload: { eventDate: string | null; eventTime: string | null; timeIso: string | null }) => void;
}) => {
  const [date, setDate] = useState<Date | undefined>(() => computeDateFromProps(eventDate, timeIso));
  const [includeTime, setIncludeTime] = useState<boolean>(() => computeIncludeTimeFromProps(eventTime, timeIso));
  const [timeValue, setTimeValue] = useState<string>(() => computeDisplayTimeFromProps(eventTime, timeIso));

  useEffect(() => {
    setDate(computeDateFromProps(eventDate, timeIso));
    setIncludeTime(computeIncludeTimeFromProps(eventTime, timeIso));
    setTimeValue(computeDisplayTimeFromProps(eventTime, timeIso));
  }, [eventDate, eventTime, timeIso]);

  const computeIso = (eventDateString: string | null, sanitizedTime: string | null) => {
    if (!eventDateString) return null;
    const baseTime = sanitizedTime ?? '00:00:00';
    const dateObj = new Date(`${eventDateString}T${baseTime}`);
    const ts = dateObj.getTime();
    return Number.isNaN(ts) ? null : dateObj.toISOString();
  };

  const emitChange = (currentDate: Date | undefined, shouldIncludeTime: boolean, displayTime?: string) => {
    if (!currentDate) {
      onChange({ eventDate: null, eventTime: null, timeIso: null });
      return;
    }

    const eventDateString = formatDateOnlyString(currentDate);
    const rawTime = displayTime ?? timeValue;
    const sanitizedTime = shouldIncludeTime ? sanitizeTimeString((rawTime || '00:00') + ':00') : null;
    const isoString = computeIso(eventDateString, sanitizedTime);

    onChange({
      eventDate: eventDateString,
      eventTime: sanitizedTime,
      timeIso: isoString,
    });
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    const newDate = new Date(selectedDate);
    setDate(newDate);
    emitChange(newDate, includeTime, timeValue || undefined);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    if (!date) return;
    emitChange(date, true, newTime || undefined);
  };

  const handleToggleChange = (checked: boolean) => {
    setIncludeTime(checked);
    if (!date) {
      if (!checked) {
        onChange({ eventDate: null, eventTime: null, timeIso: null });
      }
      return;
    }

    if (!checked) {
      setTimeValue('');
      emitChange(date, false);
    } else {
      const nextTime = timeValue || '00:00';
      setTimeValue(nextTime);
      emitChange(date, true, nextTime);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Switch checked={includeTime} onCheckedChange={handleToggleChange} id="include-time" />
        <label htmlFor="include-time" className="cursor-pointer select-none">
          Chỉ định giờ cụ thể
        </label>
      </div>
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
              {date ? format(date, "PPP") : <span>Chọn ngày</span>}
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
        {includeTime ? (
          <Input
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            className="w-full sm:w-[120px]"
          />
        ) : (
          <div className="flex h-10 w-full sm:w-[120px] items-center rounded-md border border-dashed border-border px-3 text-xs italic text-muted-foreground">
            Thời gian cập nhật sau
          </div>
        )}
      </div>
    </div>
  );
};

const initialAirdropValues: AirdropInputs = {
  project: '',
  alias: '',
  points: null,
  amount: null,
  event_date: null,
  event_time: null,
  time_iso: null,
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
