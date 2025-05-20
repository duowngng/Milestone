import { useQueryState, parseAsString } from "nuqs";

export const useEditMilestoneModal = () => {
  const [milestoneId, setMilestoneId] = useQueryState(
    "edit-milestone",
    parseAsString
  );

  const open = (id: string) => setMilestoneId(id);
  const close = () => setMilestoneId(null);

  return {
    milestoneId,
    open,
    close,
    setMilestoneId,
  };
};
