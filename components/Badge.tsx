import {
  PRIORITY_STYLES,
  STATUS_STYLES,
  INTEREST_STYLES,
  priorityLabel,
  statusLabel,
  interestLabel,
  type Priority,
  type FollowUpStatus,
  type InterestType,
} from "@/lib/types";

const base =
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

export function PriorityBadge({ priority }: { priority: Priority }) {
  return <span className={`${base} ${PRIORITY_STYLES[priority]}`}>{priorityLabel(priority)}</span>;
}

export function StatusBadge({ status }: { status: FollowUpStatus }) {
  return <span className={`${base} ${STATUS_STYLES[status]}`}>{statusLabel(status)}</span>;
}

export function InterestBadge({ interest }: { interest: InterestType }) {
  return <span className={`${base} ${INTEREST_STYLES[interest]}`}>{interestLabel(interest)}</span>;
}
