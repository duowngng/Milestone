import { addDays, subDays, differenceInCalendarDays, endOfDay } from "date-fns";
import { Task } from "../../types";

export type DisplayMode = "detailed" | "compact";

export interface Event {
  start: Date;
  end: Date;
  title: string;
  project: any;
  assignee: any;
  status: any;
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
  let originalEnd = new Date(task.dueDate);

  // Adjust the end time if it is exactly at midnight
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

  // For a single day task, return a single detailed event with adjusted end time.
  if (durationDays === 1) {
    events.push(createEvent(task, "detailed", start, end));
    return events;
  }

  let current = start;

  // If the task starts on a Saturday (getDay() === 6), add a compact event for that day.
  if (start.getDay() === 6) {
    events.push(createEvent(task, "compact", start, start));
    current = addDays(start, 1); // Move to the next day for the detailed block.
  }

  // Determine if the adjusted end falls on a Sunday.
  const lastDayIsSunday = end.getDay() === 0;
  // If the task ends on a Sunday, the detailed block should end the day before.
  const middleEnd = lastDayIsSunday ? subDays(end, 1) : end;

  if (current <= middleEnd) {
    events.push(createEvent(task, "detailed", current, middleEnd));
  }

  // If the task ends on a Sunday, add a compact event for that day.
  if (lastDayIsSunday) {
    events.push(createEvent(task, "compact", end, end));
  }

  return events;
};
