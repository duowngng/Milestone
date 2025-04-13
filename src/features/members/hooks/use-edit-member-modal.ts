import { useQueryState, parseAsString } from "nuqs";

export const useEditMemberModal = () => {
  const [memberId, setMemberId] = useQueryState("edit-member", parseAsString);

  const open = (id: string) => setMemberId(id);
  const close = () => setMemberId(null);

  return {
    memberId,
    open,
    close,
    setMemberId,
  };
};
