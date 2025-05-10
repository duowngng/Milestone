import { useQueryState, parseAsString } from "nuqs";

export const useEditProjectMemberModal = () => {
  const [memberId, setMemberId] = useQueryState(
    "edit-project-member",
    parseAsString
  );

  const open = (id: string) => setMemberId(id);
  const close = () => setMemberId(null);

  return {
    memberId,
    open,
    close,
    setMemberId,
  };
};
