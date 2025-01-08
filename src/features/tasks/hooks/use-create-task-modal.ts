import { useQueryState, parseAsBoolean, parseAsStringEnum } from "nuqs";
import { TaskStatus } from "../types";

interface OpenTaskModalOptions {
  status?: TaskStatus;
  projectId?: string;
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

  const open = (options: OpenTaskModalOptions = {}) => {
    const { status, projectId } = options;

    if (status !== undefined) {
      setInitialStatus(status);
    }
    if (projectId) {
      setInitialProjectId(projectId);
    }
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setInitialStatus(null);
    setInitialProjectId(null);
  };

  return {
    isOpen,
    open,
    close,
    setIsOpen,
    initialStatus,
    initialProjectId,
  };
};
