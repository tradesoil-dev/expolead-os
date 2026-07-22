import { notFound } from "next/navigation";
import NextFollowUpForm from "@/components/NextFollowUpForm";
import CompleteFollowUpButton from "@/components/CompleteFollowUpButton";
import { getOpportunity, getOpportunityFollowUps, getOpportunityStatusHistory } from "@/lib/data";
import AddOpportunityFollowUp from "@/components/AddOpportunityFollowUp";
import OpportunityNotesEditor from "@/components/OpportunityNotesEditor";
import {
  OpportunityStatusEditor,
  OpportunityPriorityEditor,
  OpportunityTextFieldEditor,
  OpportunityUnitEditor,
} from "@/components/OpportunityFieldEditor";
import { opportunityStatusLabel } from "@/lib/types";
import { getQuantityUnit } from "@/lib/quantity-unit";
import { getCurrency } from "@/lib/currency";

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const opportunity = await getOpportunity(id);
  const followUps = await getOpportunityFollowUps(id);
  const statusHistory = await getOpportunityStatusHistory(id);
  const workspaceUnit = await getQuantityUnit();
  const currency = await getCurrency();

  if (!opportunity) notFound();

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-3">
        <a
          href="/opportunities"
          className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
        >
          ← Back to Opportunities
        </a>

        <h1 className="text-xl font-semibold">{opportunity.name}</h1>
        <p className="text-sm text-gray-500">
          Opportunity information and follow-up history
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 text-sm md:grid-cols-5">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-gray-500 mb-1">Status</p>
          <OpportunityStatusEditor
            opportunityId={opportunity.id}
            current={opportunity.status}
          />
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-gray-500 mb-1">Priority</p>
          <OpportunityPriorityEditor
            opportunityId={opportunity.id}
            current={opportunity.priority}
          />
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-gray-500 mb-1">Quantity</p>
          <OpportunityTextFieldEditor
            opportunityId={opportunity.id}
            field="quantity"
            current={opportunity.quantity}
          />
          <p className="text-xs text-gray-500 mb-1 mt-3">Unit</p>
          <OpportunityUnitEditor
            opportunityId={opportunity.id}
            current={opportunity.quantity_unit}
            workspaceDefault={workspaceUnit}
          />
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-gray-500 mb-1">Destination</p>
          <OpportunityTextFieldEditor
            opportunityId={opportunity.id}
            field="destination_market"
            current={opportunity.destination_market}
          />
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-gray-500 mb-1">Deal value ({currency})</p>
          <OpportunityTextFieldEditor
            opportunityId={opportunity.id}
            field="deal_value"
            current={opportunity.deal_value === null || opportunity.deal_value === undefined ? "" : String(opportunity.deal_value)}
          />
          <p className="mt-1 text-[11px] text-gray-400">Optional. Counts toward this show&rsquo;s return once won.</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs text-gray-500">Booth</p>
          <p className="font-semibold">{opportunity.booth || "-"}</p>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <OpportunityNotesEditor
          opportunityId={opportunity.id}
          initialNotes={opportunity.notes}
        />
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="font-semibold mb-4">Status History</h2>

        {statusHistory.length === 0 ? (
          <p className="text-sm text-gray-500">No status changes recorded yet.</p>
        ) : (
          <ul className="space-y-2">
            {statusHistory.map((entry) => (
              <li key={entry.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {new Date(entry.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="font-medium">{opportunityStatusLabel(entry.status)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-xl border bg-white p-6">
        <NextFollowUpForm
          opportunityId={opportunity.id}
          initialDate={opportunity.next_follow_up_date}
          initialNote={opportunity.next_follow_up_note}
        />
{opportunity.next_follow_up_date && !opportunity.next_follow_up_completed && (
  <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold text-emerald-800">
        Upcoming Reminder
      </h3>

      <CompleteFollowUpButton opportunityId={opportunity.id} />
    </div>

    <div className="mt-3 space-y-2 text-sm">
      <p>
        <span className="font-medium">📅 Date:</span>{" "}
        {new Date(opportunity.next_follow_up_date).toLocaleDateString()}
      </p>

      <p>
        <span className="font-medium">📝 Reminder:</span>{" "}
        {opportunity.next_follow_up_note || "-"}
      </p>
    </div>
  </div>
)}


        <h2 className="mb-4 mt-8 font-semibold">Follow-up Timeline</h2>

        <AddOpportunityFollowUp opportunityId={opportunity.id} />

        <div className="mt-4 space-y-3">
          {followUps.length === 0 ? (
            <p className="text-sm text-gray-500">
              No follow-up activities recorded yet.
            </p>
          ) : (
            followUps.map((followUp) => (
              <div
                key={followUp.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-4"
              >
                <p className="text-sm">{followUp.note}</p>
                <p className="mt-2 text-xs text-gray-500">
                  {new Date(followUp.created_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}