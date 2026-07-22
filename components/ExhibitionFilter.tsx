"use client";

import { useRouter, usePathname } from "next/navigation";
import Select from "@/components/Select";

/**
 * Exhibition filter for the opportunities page.
 *
 * Drives a URL search param rather than local state, because the stat cards
 * above the board are rendered on the server. Local state would filter the
 * board while leaving the counts wrong. As a bonus the chosen show survives a
 * refresh and can be bookmarked.
 */
export default function ExhibitionFilter({
  exhibitions,
  value,
}: {
  exhibitions: string[];
  value: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function change(next: string) {
    router.push(next ? `${pathname}?exhibition=${encodeURIComponent(next)}` : pathname);
  }

  return (
    <div className="w-full sm:w-64">
      <Select
        value={value}
        onChange={change}
        options={[
          { value: "", label: "All exhibitions" },
          ...exhibitions.map((name) => ({ value: name, label: name })),
        ]}
      />
    </div>
  );
}
