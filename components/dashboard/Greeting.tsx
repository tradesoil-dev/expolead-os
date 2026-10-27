"use client";

import { useEffect, useState } from "react";

// "Good morning, Gladwin" in the viewer's own time zone (the server runs on
// UTC, so the greeting and date are worked out in the browser).
export default function Greeting({ firstName, note }: { firstName: string; note?: React.ReactNode }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const h = now?.getHours() ?? 9;
  const part = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  const date = now?.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

  return (
    <div>
      <h1 className="text-[26px] font-semibold tracking-tight text-ink-900">
        {part}
        {firstName ? `, ${firstName}` : ""}
      </h1>
      <p className="mt-1 text-[13.5px] text-ink-500">
        {date && <>{date}</>}
        {date && note ? " · " : ""}
        {note}
      </p>
    </div>
  );
}
