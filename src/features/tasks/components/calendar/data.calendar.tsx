import { useState } from "react";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import {
  format,
  getDay,
  parse,
  startOfWeek,
  addMonths,
  subMonths,
  parseISO,
  setHours,
} from "date-fns";
import { enUS } from "date-fns/locale";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";

import { Button } from "@/components/ui/button";

import { useConfirm } from "@/hooks/use-confirm";
import { Milestone } from "@/features/milestones/types";
import { useEditMilestoneModal } from "@/features/milestones/hooks/use-edit-milestone-modal";
import { useDeleteMilestone } from "@/features/milestones/api/use-delete-milestone";

import { EventCard } from "./event-card";
import { MilestoneCard } from "./milestone-card";

import { Task } from "../../types";

import { splitTask, Event } from "./splitTask";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./data-calendar.css";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface DataCalendarProps {
  data: Task[];
  milestones?: Milestone[];
  isAdmin?: boolean;
}

interface CustomToolbarProps {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
}
interface MilestoneEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  projectId: string;
  project: {
    name: string;
    imageUrl?: string;
  };
  isMilestone: true;
}

const CustomToolbar = ({ date, onNavigate }: CustomToolbarProps) => {
  return (
    <div className="flex mb-4 gap-x-2 items-center w-full lg:w-auto justify-center lg:justify-start">
      <Button
        onClick={() => onNavigate("PREV")}
        variant="secondary"
        size="icon"
      >
        <ChevronLeftIcon className="size-4" />
      </Button>
      <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center w-full lg:w-auto">
        <CalendarIcon className="size-4 mr-2" />
        <p className="text-sm">{format(date, "MMMM yyyy")}</p>
      </div>
      <Button
        onClick={() => onNavigate("NEXT")}
        variant="secondary"
        size="icon"
      >
        <ChevronRightIcon className="size-4" />
      </Button>
    </div>
  );
};

export const DataCalendar = ({
  data,
  milestones = [],
  isAdmin = false,
}: DataCalendarProps) => {
  const [value, setValue] = useState(
    data.length > 0 ? new Date(data[0].dueDate) : new Date()
  );

  const editMilestone = useEditMilestoneModal();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete milestone",
    "Are you sure you want to delete this milestone?",
    "destructive"
  );

  const { mutate: deleteMilestone } = useDeleteMilestone();

  const handleEditMilestone = (id: string) => {
    editMilestone.open(id);
  };

  const handleDeleteMilestone = async (id: string) => {
    const ok = await confirm();
    if (ok) {
      deleteMilestone({ param: { milestoneId: id } });
    }
  };

  const taskEvents: Event[] = data.flatMap((task) => splitTask(task));

  const milestoneEvents: MilestoneEvent[] = milestones.map((milestone) => {
    const milestoneDate = parseISO(milestone.date);

    const startDate = setHours(milestoneDate, 22);
    const endDate = setHours(milestoneDate, 23);

    return {
      id: milestone.$id,
      title: milestone.name,
      start: startDate,
      end: endDate,
      projectId: milestone.projectId,
      project: milestone.project,
      isMilestone: true,
    };
  });

  const allEvents = [...milestoneEvents, ...taskEvents];

  console.log("allEvents", allEvents);
  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    if (action === "PREV") {
      setValue(subMonths(value, 1));
    } else if (action === "NEXT") {
      setValue(addMonths(value, 1));
    } else if (action === "TODAY") {
      setValue(new Date());
    }
  };

  return (
    <>
      <ConfirmDialog />
      <Calendar
        localizer={localizer}
        date={value}
        events={allEvents}
        views={["month"]}
        defaultView="month"
        toolbar
        showAllEvents
        className="h-full"
        max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
        formats={{
          weekdayFormat: (date, culture, localizer) =>
            localizer?.format(date, "EEE", culture) ?? "",
        }}
        components={{
          eventWrapper: ({ event }) => {
            if ("isMilestone" in event) {
              return (
                <div className="pt-1 mt-1">
                  <MilestoneCard
                    id={event.id}
                    title={event.title}
                    project={event.project}
                    projectId={event.projectId}
                    onEdit={isAdmin ? handleEditMilestone : undefined}
                    onRemove={isAdmin ? handleDeleteMilestone : undefined}
                  />
                </div>
              );
            } else {
              return (
                <EventCard
                  id={event.id}
                  title={event.title}
                  assignee={event.assignee}
                  project={event.project}
                  status={event.status}
                  progress={event.progress}
                  displayMode={event.displayMode}
                />
              );
            }
          },
          toolbar: () => (
            <CustomToolbar date={value} onNavigate={handleNavigate} />
          ),
        }}
      />
    </>
  );
};
