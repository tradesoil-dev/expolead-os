"use client";

import Link from "next/link";

type Props = {
  isExpired: boolean;
  isWarning: boolean;
  daysLeft: number;
};

export default function TrialBanner({ isExpired, isWarning, daysLeft }: Props) {
  if (!isExpired && !isWarning) return null;

  if (isExpired) {
    return (
      <div className="flex items-center justify-between gap-4 bg-rose-600 px-4 py-2.5 text-sm text-white">
        <p className="font-medium">
          Your 14-day trial has ended. You can still view and edit everything you captured.
        </p>
        <Link
          href="/upgrade"
          className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
        >
          Upgrade Now
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-amber-500 px-4 py-2.5 text-sm text-white">
      <p className="font-medium">
        {daysLeft === 1
          ? "Last day of your free trial."
          : `${daysLeft} days left in your free trial.`}
      </p>
      <Link
        href="/upgrade"
        className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-sm font-semibold text-amber-600 hover:bg-amber-50 transition-colors"
      >
        View Plans
      </Link>
    </div>
  );
}
