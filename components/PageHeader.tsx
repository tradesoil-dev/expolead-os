export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <header className="flex items-center justify-between gap-4 min-h-16 py-3 px-6 md:px-8 border-b border-ink-200 bg-white/70 backdrop-blur">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-sm text-ink-500 -mt-0.5">{subtitle}</p>
        )}
      </div>
      {action}
    </header>
  );
}
