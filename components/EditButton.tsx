import Link from "next/link";

// The single, consistent Edit button used across the app. Renders as a link
// when given href, or a button when given onClick.
const CLS =
  "inline-flex items-center gap-1.5 rounded-lg border border-ink-200 px-2.5 py-1 text-xs font-semibold text-ink-600 transition-colors hover:bg-ink-50 hover:text-ink-900";

function PencilIcon() {
  return (
    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export default function EditButton({
  onClick,
  href,
  label = "Edit",
}: {
  onClick?: () => void;
  href?: string;
  label?: string;
}) {
  if (href) {
    return (
      <Link href={href} className={CLS}>
        <PencilIcon />
        {label}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={CLS}>
      <PencilIcon />
      {label}
    </button>
  );
}
