interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-foreground mb-1">{title}</h1>
        {subtitle && (
          <p className="text-xs md:text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
    </header>
  );
}
