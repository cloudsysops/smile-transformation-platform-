"use client";

export type ProgressStatus = "active" | "completed" | "cancelled";

type Props = Readonly<{
  stageLabel: string;
  status?: ProgressStatus | null;
}>;

export default function TreatmentStageBadge({ stageLabel, status }: Props) {
  const statusStyle =
    status === "completed"
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : status === "cancelled"
        ? "bg-zinc-100 text-zinc-600 border-zinc-200"
        : "bg-sky-100 text-sky-800 border-sky-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle}`}
    >
      {stageLabel}
    </span>
  );
}
