import { memo, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { Coins } from 'lucide-react';

interface TokenIconProps {
  token: string;
  imageUrl?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

function TokenIconComponent({ token, imageUrl, size = 'md', className }: TokenIconProps) {
  const tokenColor = 'bg-gradient-to-br from-gray-500 to-gray-600';
  const sizeClass = sizeMap[size];

  const candidateSources = useMemo(() => {
    if (!imageUrl) return [] as string[];

    const normalized = imageUrl.trim();
    if (!normalized) return [];

    const [baseUrl, query] = normalized.split('?');
    const extensionMatch = baseUrl.match(/\.([a-zA-Z0-9]+)$/);
    const extension = extensionMatch ? extensionMatch[1].toLowerCase() : null;

    const alternates: string[] = [];
    if (extension === 'jpg' || extension === 'jpeg') {
      alternates.push(`${baseUrl.replace(/\.jpe?g$/i, '.png')}${query ? `?${query}` : ''}`);
      alternates.push(`${baseUrl.replace(/\.jpe?g$/i, '.webp')}${query ? `?${query}` : ''}`);
    }
    if (extension === 'png') {
      alternates.push(`${baseUrl.replace(/\.png$/i, '.jpg')}${query ? `?${query}` : ''}`);
      alternates.push(`${baseUrl.replace(/\.png$/i, '.jpeg')}${query ? `?${query}` : ''}`);
    }
    if (extension === 'webp') {
      alternates.push(`${baseUrl.replace(/\.webp$/i, '.png')}${query ? `?${query}` : ''}`);
      alternates.push(`${baseUrl.replace(/\.webp$/i, '.jpg')}${query ? `?${query}` : ''}`);
    }

    return [normalized, ...alternates];
  }, [imageUrl]);

  const [sourceIndex, setSourceIndex] = useState(0);

  if (candidateSources.length > 0 && sourceIndex < candidateSources.length) {
    return (
      <img
        src={candidateSources[sourceIndex]}
        alt={token}
        referrerPolicy="no-referrer"
        loading="lazy"
        className={cn('rounded-full object-cover', sizeClass, className)}
        onError={() => setSourceIndex((prev) => prev + 1)}
      />
    );
  }

  // Get the first letter of the token name
  const letter = token.charAt(0);

  return (
    <div 
      className={cn(
        'rounded-full flex items-center justify-center text-white font-bold',
        tokenColor,
        sizeClass,
        className
      )}
    >
      {letter}
    </div>
  );
}

export const TokenIcon = memo(TokenIconComponent);
