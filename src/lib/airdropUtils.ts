import { format } from 'date-fns';
import { Airdrop } from '@/lib/api';

export const hasTimeComponent = (value?: string | null) =>
  Boolean(value && value.includes('T') && value.length > 10);

export const sanitizeTimeString = (time?: string | null): string | null => {
  if (!time) return null;
  const trimmed = time.trim();
  if (!trimmed) return null;
  const [main] = trimmed.split(/[Zz]/)[0].split('+');
  const [base] = main.split('.');
  const segments = base.split(':').map((segment) => segment.padStart(2, '0'));
  const [hour = '00', minute = '00', second = '00'] = segments;
  return `${hour}:${minute}:${second}`;
};

export const getTimestampFromAirdrop = (airdrop: Airdrop): number => {
  if (airdrop.event_date) {
    const sanitizedTime = sanitizeTimeString(airdrop.event_time);
    const dateString = sanitizedTime
      ? `${airdrop.event_date}T${sanitizedTime}`
      : `${airdrop.event_date}`;
    const date = new Date(dateString);
    const ts = date.getTime();
    if (!Number.isNaN(ts)) return ts;
  }

  if (airdrop.time_iso) {
    const date = new Date(airdrop.time_iso);
    const ts = date.getTime();
    if (!Number.isNaN(ts)) return ts;
  }

  return -Infinity;
};

export const getAirdropDateLabel = (airdrop: Airdrop): string => {
  if (airdrop.event_date) {
    const date = new Date(airdrop.event_date);
    if (!Number.isNaN(date.getTime())) {
      return format(date, 'MMM d, yyyy');
    }
    return airdrop.event_date;
  }

  if (airdrop.time_iso) {
    const date = new Date(airdrop.time_iso);
    if (!Number.isNaN(date.getTime())) {
      return format(date, 'MMM d, yyyy');
    }
  }

  return 'TBA';
};

export const getAirdropTimeLabel = (airdrop: Airdrop): string | null => {
  const sanitizedEventTime = sanitizeTimeString(airdrop.event_time);
  if (sanitizedEventTime) {
    const date = new Date(`1970-01-01T${sanitizedEventTime}`);
    if (!Number.isNaN(date.getTime())) {
      return format(date, 'h:mm a');
    }
  }

  // For legacy entries that only store time in time_iso (no event_date provided)
  if (!airdrop.event_date && airdrop.time_iso && hasTimeComponent(airdrop.time_iso)) {
    const date = new Date(airdrop.time_iso);
    if (!Number.isNaN(date.getTime())) {
      return format(date, 'h:mm a');
    }
  }

  return null;
};
