import {
  useQueryState,
  parseAsBoolean,
  parseAsStringEnum,
  parseAsIsoDateTime,
} from "nuqs";
import { TaskStatus } from "../types";

interface OpenTaskModalOptions {
  status?: TaskStatus;
  projectId?: string;
  startDate?: Date;
}

export const useCreateTaskModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-task",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );
  const [initialStatus, setInitialStatus] = useQueryState(
    "status",
    parseAsStringEnum(Object.values(TaskStatus))
  );
  const [initialProjectId, setInitialProjectId] = useQueryState("projectId");

  const [initialStartDate, setInitialStartDate] = useQueryState(
    "initialStartDate",
    parseAsIsoDateTime
  );

  const open = (options: OpenTaskModalOptions = {}) => {
    const { status, projectId, startDate } = options;

    if (status !== undefined) {
      setInitialStatus(status);
    }
    if (projectId) {
      setInitialProjectId(projectId);
    }
    if (startDate) {
      setInitialStartDate(startDate);
    }
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setInitialStatus(null);
    setInitialProjectId(null);
    setInitialStartDate(null);
  };

  return {
    isOpen,
    open,
    close,
    setIsOpen,
    initialStatus,
    initialProjectId,
    initialStartDate,
  };
};
