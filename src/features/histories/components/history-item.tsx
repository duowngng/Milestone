import React, { useState, useEffect, useMemo } from "react";
import { format } from "date-fns";
import { enGB } from "date-fns/locale";
import {
  snakeCaseToTitleCase,
  camelCaseToTitleCase,
  formatRelativeTime,
} from "@/lib/utils";
import { TaskPriority, TaskStatus } from "@/features/tasks/types";

interface HistoryItemProps {
  fields: string[];
  oldValues: Record<string, string | number | TaskStatus | TaskPriority>;
  newValues: Record<string, string | number | TaskStatus | TaskPriority>;
  editorName: string;
  editorEmail: string;
  createdAt: string;
}

const FIELD_LABELS: Record<string, string> = {
  projectId: "Project",
  assigneeId: "Assignee",
};

const formatValue = (
  field: string,
  value: string | number | TaskStatus | TaskPriority
): string => {
  if (value == null || value === "") return "N/A";
  switch (field) {
    case "startDate":
    case "dueDate":
      return format(new Date(value), "P", { locale: enGB });
    case "status":
      return snakeCaseToTitleCase(value as string);
    default:
      return String(value);
  }
};

export const HistoryItem: React.FC<HistoryItemProps> = ({
  fields,
  oldValues,
  newValues,
  editorName,
  editorEmail,
  createdAt,
}) => {
  const [timeDisplay, setTimeDisplay] = useState(() =>
    formatRelativeTime(createdAt)
  );

  useEffect(() => {
    const update = () => setTimeDisplay(formatRelativeTime(createdAt));
    const interval = setInterval(update, 60_000);
    update();
    return () => clearInterval(interval);
  }, [createdAt]);

  const changes = useMemo(
    () =>
      fields.map((field) => {
        const label = FIELD_LABELS[field] || camelCaseToTitleCase(field);

        if (field === "description") {
          return { key: field, label, isDescription: true };
        }

        const dataKey =
          field === "projectId"
            ? "project"
            : field === "assigneeId"
            ? "assignee"
            : field;
        const oldRaw = oldValues[dataKey];
        const newRaw = newValues[dataKey];
        const oldVal = formatValue(field, oldRaw);
        const newVal = formatValue(field, newRaw);
        return { key: field, label, oldVal, newVal, isDescription: false };
      }),
    [fields, oldValues, newValues]
  );

  return (
    <>
      <div className="flex items-center space-x-2">
        <p className="text-sm text-gray-500">
          Edited by
          <span className="font-semibold"> {editorName} </span>({editorEmail})
        </p>
        <div className="w-1 h-1 rounded-full bg-neutral-300" />
        <p className="text-sm font-semibold text-gray-500">{timeDisplay}</p>
      </div>

      <ul className="mt-2 list-disc pl-5 space-y-2">
        {changes.map(({ key, label, oldVal, newVal, isDescription }) => (
          <li key={key} className="text-sm text-gray-600">
            {isDescription ? (
              <>
                <span className="font-semibold">{label}</span> was updated.
              </>
            ) : (
              <>
                <span className="font-semibold">{label}</span> changed from
                <span className="font-medium italic mx-1">{oldVal}</span>
                to
                <span className="font-medium italic mx-1">{newVal}</span>
              </>
            )}
          </li>
        ))}
      </ul>
    </>
  );
};
