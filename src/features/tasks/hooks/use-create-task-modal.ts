import { useQueryState, parseAsBoolean, parseAsStringEnum } from "nuqs";
import { TaskStatus } from "../types";

export const useCreateTaskModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-task",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );
  const [initialStatus, setInitialStatus] = useQueryState(
    "status",
    parseAsStringEnum(Object.values(TaskStatus))
  );

  const open = (status?: TaskStatus) => {
    if (status !== undefined) {
      setInitialStatus(status);
    }
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setInitialStatus(null);
  };

  return {
    isOpen,
    open,
    close,
    setIsOpen,
    initialStatus,
  };
};
