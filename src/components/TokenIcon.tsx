import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Coins } from 'lucide-react';

interface TokenIconProps {
  token: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
};

function TokenIconComponent({ token, size = 'md', className }: TokenIconProps) {
  const tokenColor = 'bg-gradient-to-br from-gray-500 to-gray-600';
  const sizeClass = sizeMap[size];
  
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
