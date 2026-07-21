"use client";

import Link from "next/link";

type Props = {
  label: string;
  className?: string;
};

export default function LockedButton({ label, className }: Props) {
  return (
    <Link
      href="/upgrade"
      className={className ?? "inline-flex items-center gap-1.5 rounded-lg bg-ink-200 px-3.5 py-2 text-sm font-medium text-ink-400 cursor-not-allowed"}
      title="Your trial has ended — upgrade to continue"
    >
      🔒 {label}
    </Link>
  );
}
