import type { ReactNode } from 'react';
import { VolumeLadder } from './VolumeLadder';

interface HeaderProps {
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
}

export function Header({ title, subtitle, rightContent }: HeaderProps) {
  return (
    <header className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-1">{title}</h2>
        {subtitle && (
          <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      <div className="flex w-full flex-col items-stretch justify-end gap-3 sm:w-auto sm:flex-row sm:items-center">
        <VolumeLadder />
        {rightContent && (
          <div className="flex justify-end sm:justify-start">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
}
