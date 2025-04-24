import { addDays, subDays, differenceInCalendarDays, endOfDay } from "date-fns";
import { Task, TaskStatus } from "../../types";
import { Project } from "@/features/projects/types";
import { Member } from "@/features/members/types";

export type DisplayMode = "detailed" | "compact";

export interface Event {
  start: Date;
  end: Date;
  title: string;
  project: Project;
  assignee: Member;
  status: TaskStatus;
  id: string;
  progress: number;
  displayMode: DisplayMode;
}

const createEvent = (
  task: Task,
  displayMode: DisplayMode,
  startDate: Date,
  endDate: Date
): Event => ({
  start: startDate,
  end: endDate,
  title: task.name,
  project: task.project,
  assignee: task.assignee,
  status: task.status,
  id: task.$id,
  progress: task.progress,
  displayMode,
});

export const splitTask = (task: Task): Event[] => {
  const start = new Date(task.startDate);
  const originalEnd = new Date(task.dueDate);

  let end = originalEnd;
  if (
    originalEnd.getHours() === 0 &&
    originalEnd.getMinutes() === 0 &&
    originalEnd.getSeconds() === 0 &&
    originalEnd.getMilliseconds() === 0
  ) {
    end = endOfDay(originalEnd);
  }

  const durationDays = differenceInCalendarDays(end, start) + 1;
  const events: Event[] = [];

  if (durationDays === 1) {
    events.push(createEvent(task, "detailed", start, end));
    return events;
  }

  let current = start;

  if (start.getDay() === 6) {
    events.push(createEvent(task, "compact", start, start));
    current = addDays(start, 1);
  }

  const lastDayIsSunday = end.getDay() === 0;
  const middleEnd = lastDayIsSunday ? subDays(end, 1) : end;

  if (current <= middleEnd) {
    events.push(createEvent(task, "detailed", current, middleEnd));
  }

  if (lastDayIsSunday) {
    events.push(createEvent(task, "compact", end, end));
  }

  return events;
};
