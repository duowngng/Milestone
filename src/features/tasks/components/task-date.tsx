import { differenceInDays, format } from "date-fns";

import { cn } from "@/lib/utils";
import { TaskStatus } from "../types";

interface TaskDateProps {
  value: string;
  className?: string;
  status: TaskStatus;
  dateType: "dueDate" | "startDate";
}

export const TaskDate = ({
  value,
  className,
  status,
  dateType,
}: TaskDateProps) => {
  const today = new Date();
  const endDate = new Date(value);
  const diffInDays = differenceInDays(endDate, today);

  let dateStyle = "text-muted-foreground";

  const isStylingNeeded =
    (dateType === "dueDate" && status !== TaskStatus.DONE) ||
    (dateType === "startDate" &&
      (status === TaskStatus.BACKLOG || status === TaskStatus.TODO));

  if (isStylingNeeded) {
    if (diffInDays <= 0) {
      dateStyle = "text-red-500 font-bold";
    } else if (diffInDays <= 3) {
      dateStyle = "text-red-500";
    } else if (diffInDays <= 7) {
      dateStyle = "text-orange-500";
    } else if (diffInDays <= 14) {
      dateStyle = "text-yellow-500";
    }
  }

  return (
    <div className={dateStyle}>
      <span className={cn("truncate", className)}>{format(value, "PP")}</span>
    </div>
  );
};
