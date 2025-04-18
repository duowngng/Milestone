import React, { useState, useEffect } from "react";

import { DottedSeparator } from "@/components/dotted-separator";
import { camelCaseToTitleCase, formatRelativeTime } from "@/lib/utils";

interface HistoryItemProps {
  fields: string[];
  oldValues: Record<string, any>;
  newValues: Record<string, any>;
  editorName: string;
  editorEmail: string;
  createdAt: string;
}

export const HistoryItem: React.FC<HistoryItemProps> = ({
  fields,
  oldValues,
  newValues,
  editorName,
  editorEmail,
  createdAt,
}) => {
  const [timeDisplay, setTimeDisplay] = useState(formatRelativeTime(createdAt));

  useEffect(() => {
    setTimeDisplay(formatRelativeTime(createdAt));

    const intervalId = setInterval(() => {
      setTimeDisplay(formatRelativeTime(createdAt));
    }, 60000);

    return () => clearInterval(intervalId);
  }, [createdAt]);

  return (
    <>
      <div className="flex justify-start items-center space-x-2">
        <div>
          <p className="text-sm text-gray-500">
            Edited by
            <span className="font-semibold"> {editorName} </span>({editorEmail})
          </p>
        </div>
        <div className="size-1 rounded-full bg-neutral-300" />
        <p className="text-sm font-semibold text-gray-500"> {timeDisplay}</p>
      </div>
      <div className="mt-2">
        <ul className="space-y-4 list-disc pl-5">
          {fields.map((field, index) => (
            <React.Fragment key={field}>
              <li>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">
                    {camelCaseToTitleCase(field)}
                  </span>{" "}
                  changed from{" "}
                  <span className="italic">{oldValues[field] || "N/A"}</span> to{" "}
                  <span className="italic">{newValues[field] || "N/A"}</span>
                </p>
              </li>
              {index < fields.length - 1 && (
                <DottedSeparator className="my-4" />
              )}
            </React.Fragment>
          ))}
        </ul>
      </div>
    </>
  );
};
