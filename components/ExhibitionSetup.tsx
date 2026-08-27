"use client";

import { useState } from "react";
import ExhibitionRoleEditor from "@/components/ExhibitionRoleEditor";
import ExhibitionPrep from "@/components/ExhibitionPrep";
import type { AttendingAs } from "@/lib/types";

// Holds the attending mode so the prep checklist reacts the moment you pick
// Visiting or Exhibiting, before you hit Save on the role card.
export default function ExhibitionSetup({
  exhibitionId,
  current,
  initialCompleted,
  firstName,
}: {
  exhibitionId: string;
  current: {
    attending_as: AttendingAs;
    own_hall: string | null;
    own_booth_number: string | null;
    own_stand_location: string | null;
  };
  initialCompleted: string[];
  firstName: string;
}) {
  const [attendingAs, setAttendingAs] = useState<AttendingAs>(current.attending_as ?? "visiting");

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ExhibitionRoleEditor
        exhibitionId={exhibitionId}
        current={current}
        onAttendingChange={setAttendingAs}
      />
      <ExhibitionPrep
        exhibitionId={exhibitionId}
        attendingAs={attendingAs}
        initialCompleted={initialCompleted}
        firstName={firstName}
      />
    </div>
  );
}
