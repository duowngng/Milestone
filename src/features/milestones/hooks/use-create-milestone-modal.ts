import { useQueryState, parseAsBoolean, parseAsIsoDateTime } from "nuqs";

interface OpenMilestoneModalOptions {
  date?: Date;
}

export const useCreateMilestoneModal = () => {
  const [isOpen, setIsOpen] = useQueryState(
    "create-milestone",
    parseAsBoolean.withDefault(false).withOptions({ clearOnDefault: true })
  );
  const [initialDate, setInitialDate] = useQueryState(
    "initialDate",
    parseAsIsoDateTime
  );

  const open = (options: OpenMilestoneModalOptions = {}) => {
    const { date } = options;

    if (date) {
      setInitialDate(date);
    }
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setInitialDate(null);
  };

  return {
    isOpen,
    open,
    close,
    setIsOpen,
    initialDate,
  };
};
