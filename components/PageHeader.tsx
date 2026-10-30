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
    <header className="flex items-center justify-between gap-3 min-h-16 py-3 px-4 sm:gap-4 sm:px-6 md:px-8 border-b border-ink-200 bg-white/70 backdrop-blur">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
        {subtitle && (
          <p className="text-[13px] leading-snug text-ink-500 sm:-mt-0.5 sm:text-sm">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}
