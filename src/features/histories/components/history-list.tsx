import React from "react";
import { useGetHistories } from "../api/use-get-history";

import { PageLoader } from "@/components/page-loader";
import { DottedSeparator } from "@/components/dotted-separator";

import { HistoryItem } from "./history-item";

interface HistoryListProps {
  taskId: string;
}

export const HistoryList: React.FC<HistoryListProps> = ({ taskId }) => {
  const { data: histories, isLoading } = useGetHistories({ taskId });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!histories || histories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="bg-muted rounded-lg p-4">
        <p className="text-lg font-semibold">History</p>
        <DottedSeparator className="my-4" />
        {histories.map((history) => (
          <HistoryItem
            key={history.$id}
            fields={history.fields}
            oldValues={history.oldValues}
            newValues={history.newValues}
            editorName={history.editor.name}
            editorEmail={history.editor.email}
            createdAt={history.$createdAt}
          />
        ))}
      </div>
    </div>
  );
};
